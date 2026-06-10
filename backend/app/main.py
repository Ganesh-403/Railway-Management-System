from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, time, date, timedelta
from typing import List

from .database import engine, get_db, Base
from . import models, schemas, auth, config

app = FastAPI(title="Railway Management System API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# --- JWT Auth Dependency ---
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    payload = auth.decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload

def get_current_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Admin privileges required"
        )
    return current_user


# --- Helper Function for Emailing ---
def send_booking_email(recipient: str, body: str):
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    if not config.MAIL_USERNAME or not config.MAIL_PASSWORD:
        print("SMTP Credentials not configured. Printing email content:")
        print(body)
        return

    msg = MIMEMultipart()
    msg['From'] = config.MAIL_USERNAME
    msg['To'] = recipient
    msg['Subject'] = "Railway Ticket Booking Confirmation"
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP_SSL(config.MAIL_SERVER, config.MAIL_PORT)
        server.login(config.MAIL_USERNAME, config.MAIL_PASSWORD)
        server.sendmail(config.MAIL_USERNAME, recipient, msg.as_string())
        server.close()
        print(f"Email successfully sent to {recipient}")
    except Exception as e:
        print(f"Failed to send email to {recipient}: {e}")


# --- Authentication Endpoints ---

@app.get("/api/stations")
def get_stations(db: Session = Depends(get_db)):
    return db.query(models.Station).all()


@app.post("/api/check-username")
def check_username(payload: schemas.UserRegister1, db: Session = Depends(get_db)):
    existing = db.query(models.Userdetails).filter(models.Userdetails.ID == payload.username).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    return {"status": "available"}


@app.post("/api/register")
def register_user(
    step1: schemas.UserRegister1,
    step2: schemas.UserRegister2,
    step3: schemas.UserRegister3,
    db: Session = Depends(get_db)
):
    existing = db.query(models.Userdetails).filter(models.Userdetails.ID == step1.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_pw = auth.get_password_hash(step1.password)
    dob_date = datetime.strptime(step2.DOB, "%Y-%m-%d").date()

    user = models.Userdetails(
        ID=step1.username,
        Password=hashed_pw,
        Securityquestion=step1.securityquestion,
        Securityanswer=step1.securityanswer,
        Firstname=step2.fname,
        Middlename=step2.mname,
        Lastname=step2.lname,
        Occupation=step2.occupation,
        DOB=dob_date,
        Martialstatus=step2.martialstatus,
        Nationality=step2.country,
        Gender=step2.sex,
        Email=step2.email,
        Mobile=step2.mobileno,
        Flatno=step3.fno,
        Street=step3.lane,
        Locality=step3.area,
        State=step3.state,
        Pincode=step3.pincode,
        City=step3.city
    )
    db.add(user)
    db.commit()
    return {"status": "success", "message": "User registered successfully"}


@app.post("/api/login")
def login_user(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.Userdetails).filter(models.Userdetails.ID == payload.username).first()
    if not user:
        raise HTTPException(status_code=400, detail="Wrong credentials")
    
    if not auth.verify_password(payload.password, user.Password):
        raise HTTPException(status_code=400, detail="Password incorrect")

    token = auth.create_access_token({"sub": user.ID, "role": "user"})
    return {
        "status": "success",
        "user": {
            "username": user.ID,
            "email": user.Email,
            "firstName": user.Firstname,
            "lastName": user.Lastname,
            "token": token
        }
    }


@app.post("/api/admin/login")
def login_admin(payload: schemas.AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(models.Admin).filter(models.Admin.UserID == payload.username).first()
    if not admin:
        raise HTTPException(status_code=400, detail="Wrong credentials")
    
    if admin.Password != payload.password:
         raise HTTPException(status_code=400, detail="Password incorrect")

    token = auth.create_access_token({"sub": admin.UserID, "role": "admin"})
    return {
        "status": "success",
        "username": admin.UserID,
        "token": token
    }


# --- Train & Ticket Endpoints ---

@app.post("/api/search")
def search_trains(payload: schemas.TrainSearchRequest, db: Session = Depends(get_db)):
    start_code = payload.Startstation.split("-")[0]
    end_code = payload.Endstation.split("-")[0]
    
    try:
        search_date = datetime.strptime(payload.Date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

    weekday_idx = search_date.weekday()
    weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    day_name = weekdays[weekday_idx]

    start_routes = db.query(models.Route.Trainno).filter(models.Route.Deptstation == start_code).subquery()
    end_routes = db.query(models.Route.Trainno).filter(models.Route.Arrivalstation == end_code).subquery()
    
    common_trains_q = db.query(start_routes.c.Trainno).join(
        end_routes, start_routes.c.Trainno == end_routes.c.Trainno
    ).all()
    common_train_nos = [t[0] for t in common_trains_q]

    results = []
    for train_no in common_train_nos:
        train = db.query(models.Traindetails).filter(
            models.Traindetails.Trainno == train_no,
            getattr(models.Traindetails, day_name) == True
        ).first()
        if not train:
            continue

        start_route = db.query(models.Route).filter(models.Route.Trainno == train_no, models.Route.Deptstation == start_code).first()
        end_route = db.query(models.Route).filter(models.Route.Trainno == train_no, models.Route.Arrivalstation == end_code).first()
        
        if not start_route or not end_route or start_route.Stopnumber > end_route.Stopnumber:
            continue

        # Get seat availability for this date
        if payload.category == "General":
            avail = db.query(models.Generalseatavailability).filter(
                models.Generalseatavailability.Trainno == train_no,
                models.Generalseatavailability.Date == search_date
            ).first()
        else:
            avail = db.query(models.Tatkalseatavailability).filter(
                models.Tatkalseatavailability.Trainno == train_no,
                models.Tatkalseatavailability.Date == search_date
            ).first()

        if not avail:
            continue

        route_ids_q = db.query(models.Route.RouteID).filter(
            models.Route.Trainno == train_no,
            models.Route.Stopnumber >= start_route.Stopnumber,
            models.Route.Stopnumber <= end_route.Stopnumber
        ).all()
        r_ids = [r[0] for r in route_ids_q]

        if payload.category == "General":
            prices = db.query(
                func.sum(models.Generalrouteprices.SLprice),
                func.sum(models.Generalrouteprices.AC3_price),
                func.sum(models.Generalrouteprices.AC2_price),
                func.sum(models.Generalrouteprices.AC1_price),
                func.sum(models.Generalrouteprices.CCprice)
            ).filter(models.Generalrouteprices.RouteID.in_(r_ids)).first()
        else:
            prices = db.query(
                func.sum(models.Tatkalrouteprices.SLprice),
                func.sum(models.Tatkalrouteprices.AC3_price),
                func.sum(models.Tatkalrouteprices.AC2_price),
                func.sum(models.Tatkalrouteprices.AC1_price),
                func.sum(models.Tatkalrouteprices.CCprice)
            ).filter(models.Tatkalrouteprices.RouteID.in_(r_ids)).first()

        # Gather occupied seat numbers on this train segment for visual dashboard
        occupied_seats_q = db.query(models.Ticket.Seat).filter(
            models.Ticket.Trainno == train_no,
            models.Ticket.Date == search_date,
            models.Ticket.Status == "CNF"
        ).all()
        occupied_seats = [s[0] for s in occupied_seats_q]

        results.append({
            "trainno": train.Trainno,
            "trainname": train.Trainname,
            "date": str(search_date),
            "occupied_seats": occupied_seats,
            "SL": {"seats": avail.SLseats, "wl": avail.SLWL, "price": prices[0] or 0},
            "AC3": {"seats": avail.AC3_seats, "wl": avail.AC3_WL, "price": prices[1] or 0},
            "AC2": {"seats": avail.AC2_seats, "wl": avail.AC2_WL, "price": prices[2] or 0},
            "AC1": {"seats": avail.AC1_seats, "wl": avail.AC1_WL, "price": prices[3] or 0},
            "CC": {"seats": avail.CCseats, "wl": avail.CCWL, "price": prices[4] or 0},
        })

    return results


@app.post("/api/book")
def book_ticket(
    trainno: int,
    price: int,
    category: str,
    seats: int,
    type: str,
    date: str,
    startstation: str,
    endstation: str,
    payload: schemas.TicketBookingRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    username = current_user.get("sub")
    try:
        travel_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

    if len(payload.seats) != payload.tickets:
        raise HTTPException(status_code=400, detail="Selected seats length must match ticket count")

    # Fetch details
    user = db.query(models.Userdetails).filter(models.Userdetails.ID == username).first()
    train = db.query(models.Traindetails).filter(models.Traindetails.Trainno == trainno).first()

    # Validate seat occupancy for selected numbers
    for seat in payload.seats:
        occupied = db.query(models.Ticket).filter(
            models.Ticket.Trainno == trainno,
            models.Ticket.Date == travel_date,
            models.Ticket.Seat == seat,
            models.Ticket.Status == "CNF"
        ).first()
        if occupied:
            raise HTTPException(status_code=400, detail=f"Seat {seat} is already occupied.")

    # Generate PNR
    max_pnr = db.query(func.max(models.Ticket.PNR)).scalar()
    pnr = (max_pnr or 0) + 1

    # Base price
    total_price = price * payload.tickets

    # Add itemized catering menu surcharges
    food_prices = {"Veg Thali": 120, "Non-Veg Thali": 150, "Snack Box": 40, "Beverage": 20}
    
    passenger_ids = []
    for passenger in payload.passengers:
        p_detail = models.Passengerdetails(
            ID=username,
            Name=passenger.name,
            Gender=passenger.gender,
            Foodtype=passenger.foodtype,
            Age=passenger.age
        )
        db.add(p_detail)
        db.commit()
        db.refresh(p_detail)
        
        passenger_ids.append(p_detail.PassengerID)
        
        # Add food surcharge
        if passenger.foodtype in food_prices:
            total_price += food_prices[passenger.foodtype]

    # Query route timing
    routes = db.query(models.Route).filter(
        models.Route.Trainno == trainno,
        models.Route.Deptstation.in_([startstation, endstation]) | 
        models.Route.Arrivalstation.in_([startstation, endstation])
    ).all()

    depttime_raw = time(0, 0, 0)
    arrivaltime_raw = time(0, 0, 0)

    start_route = next((r for r in routes if r.Deptstation == startstation), None)
    end_route = next((r for r in routes if r.Arrivalstation == endstation), None)

    if start_route:
        depttime_raw = start_route.Depttime
    if end_route:
        arrivaltime_raw = end_route.Arrivaltime

    def to_time(t):
        if isinstance(t, time):
            return t
        if hasattr(t, 'total_seconds'):
            return (datetime.min + t).time()
        return t

    depttime = to_time(depttime_raw)
    arrivaltime = to_time(arrivaltime_raw)

    # Decrement available seats in db
    if type == "General":
        avail_table = models.Generalseatavailability
    else:
        avail_table = models.Tatkalseatavailability

    col_name = {
        "CC": "CCseats", "3A": "AC3_seats", "2A": "AC2_seats", "1A": "AC1_seats", "SL": "SLseats"
    }.get(category, "SLseats")

    # Fetch current and subtract
    avail = db.query(avail_table).filter(
        avail_table.Trainno == trainno,
        avail_table.Date == travel_date
    ).first()
    new_avail = max(0, (getattr(avail, col_name) if avail else seats) - payload.tickets)

    db.query(avail_table).filter(
        avail_table.Trainno == trainno,
        avail_table.Date == travel_date
    ).update({col_name: new_avail})
    db.commit()

    # Create Tickets
    for i in range(payload.tickets):
        ticket = models.Ticket(
            PNR=pnr,
            PassengerID=passenger_ids[i],
            ID=username,
            Category=category,
            Bookingtype=type,
            Trainno=trainno,
            Status="CNF",
            Seat=payload.seats[i],
            Boarding=startstation,
            Boardingtime=depttime,
            Destination=endstation,
            Arrivaltime=arrivaltime,
            Date=travel_date,
            Price=total_price
        )
        db.add(ticket)
    db.commit()

    msg_body = f"Hello {user.Firstname},\n\nThis is confirmation of your RailExp booking.\n\nPNR: {pnr}\nTrain: {train.Trainname} ({trainno})\nDate: {date}\nClass: {category}\nSelected Seats: {payload.seats}\nTotal Price: INR {total_price}\nFrom: {startstation} To: {endstation}\nStatus: Confirmed\n\nEnjoy your journey!"
    background_tasks.add_task(send_booking_email, user.Email, msg_body)

    return {
        "pnr": pnr,
        "trainno": trainno,
        "trainname": train.Trainname,
        "date": str(travel_date),
        "total_price": total_price,
        "start": startstation,
        "end": endstation,
        "seats": payload.seats
    }


@app.post("/api/pnr")
def get_pnr_status(payload: schemas.PNRStatusRequest, db: Session = Depends(get_db)):
    tickets = db.query(models.Ticket).filter(models.Ticket.PNR == payload.PNR).all()
    if not tickets:
        raise HTTPException(status_code=404, detail="PNR not found")

    passenger_details = []
    for t in tickets:
        pass_info = db.query(models.Passengerdetails).filter(models.Passengerdetails.PassengerID == t.PassengerID).first()
        passenger_details.append({
            "name": pass_info.Name if pass_info else "Unknown",
            "age": pass_info.Age if pass_info else 0,
            "gender": pass_info.Gender if pass_info else "Unknown",
            "seat": t.Seat,
            "status": t.Status
        })

    t0 = tickets[0]
    train = db.query(models.Traindetails).filter(models.Traindetails.Trainno == t0.Trainno).first()

    return {
        "pnr": t0.PNR,
        "trainno": t0.Trainno,
        "trainname": train.Trainname if train else "Unknown",
        "boarding": t0.Boarding,
        "destination": t0.Destination,
        "date": str(t0.Date),
        "category": t0.Category,
        "type": t0.Bookingtype,
        "price": t0.Price,
        "passengers": passenger_details
    }


@app.post("/api/cancel")
def cancel_ticket(
    payload: schemas.PNRStatusRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    username = current_user.get("sub")
    tickets = db.query(models.Ticket).filter(models.Ticket.PNR == payload.PNR).all()
    if not tickets:
        raise HTTPException(status_code=404, detail="PNR not found")

    t0 = tickets[0]
    if t0.ID != username:
        raise HTTPException(status_code=403, detail="The ticket is not booked from your account")

    if t0.Bookingtype == "Tatkal":
        raise HTTPException(status_code=400, detail="Cancellation not allowed for Tatkal tickets")

    if t0.Status == "CXL":
        return {"status": "success", "message": "Ticket is already cancelled"}

    # Update status
    db.query(models.Ticket).filter(models.Ticket.PNR == payload.PNR).update({models.Ticket.Status: "CXL"})

    category = t0.Category
    trainno = t0.Trainno
    travel_date = t0.Date
    n_seats = len(tickets)

    # Reclaim seats in db
    avail_table = models.Generalseatavailability
    col_name = {
        "CC": "CCseats", "3A": "AC3_seats", "2A": "AC2_seats", "1A": "AC1_seats", "SL": "SLseats"
    }.get(category, "SLseats")

    avail = db.query(avail_table).filter(
        avail_table.Trainno == trainno,
        avail_table.Date == travel_date
    ).first()
    
    if avail:
        current_seats = getattr(avail, col_name) + n_seats
        db.query(avail_table).filter(
            avail_table.Trainno == trainno,
            avail_table.Date == travel_date
        ).update({col_name: current_seats})

    db.commit()
    return {"status": "success", "message": "Successfully Cancelled"}


@app.post("/api/runningstatus")
def check_running_status(payload: schemas.RunningStatusRequest, db: Session = Depends(get_db)):
    try:
        query_date = datetime.strptime(payload.Date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

    weekday_idx = query_date.weekday()
    weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    day_name = weekdays[weekday_idx]

    train = db.query(models.Traindetails).filter(
        models.Traindetails.Trainno == payload.running,
        getattr(models.Traindetails, day_name) == True
    ).first()

    if not train:
        return {"status": "not_running", "message": "Train is not running on this day."}

    c_now = datetime.now()
    time_now = c_now.time()
    date_now = c_now.date()

    delta = date_now - query_date
    difference = delta.days

    if date_now == query_date:
        first_stop = db.query(models.Route).filter(models.Route.Trainno == train.Trainno, models.Route.Stopnumber == 1).first()
        if not first_stop:
            return {"status": "error", "message": "Route details not found."}

        time1 = first_stop.Depttime
        
        z = db.query(models.Route).filter(
            models.Route.Trainno == train.Trainno,
            models.Route.Depttime <= time_now,
            models.Route.Arrivaltime >= time_now,
            models.Route.Depttime >= time1
        ).first()

        y = db.query(models.Traindetails).filter(
            models.Traindetails.Trainno == train.Trainno,
            models.Traindetails.Starttime > time_now
        ).first()

        x = db.query(models.Traindetails).filter(
            models.Traindetails.Trainno == train.Trainno,
            models.Traindetails.Endtime < time_now
        ).first()

        if z:
            return {
                "status": "running",
                "crossed": z.Deptstation,
                "arriving": z.Arrivalstation,
                "arrival_time": str(z.Arrivaltime)
            }
        elif y:
            return {"status": "not_started", "message": f"Train didn't start yet. Start station: {train.Startstation}"}
        elif x:
            return {"status": "completed", "message": "Train completed its journey."}
        else:
            return {"status": "unknown", "message": "Status unknown for current time context."}

    elif date_now > query_date:
        z = db.query(models.Route).filter(
            models.Route.Trainno == train.Trainno,
            models.Route.Depttime <= time_now,
            models.Route.Arrivaltime >= time_now
        ).first()

        if not z:
            return {"status": "completed", "message": "Train completed its journey."}
        elif (z.Arrivalday - 1 >= difference and z.Arrivalday - z.Deptday >= 0):
            return {
                "status": "running",
                "crossed": z.Deptstation,
                "arriving": z.Arrivalstation,
                "arrival_time": str(z.Arrivaltime)
            }
        else:
            return {"status": "completed", "message": "Train completed its journey."}
            
    else:
        return {"status": "future", "message": "The day didn't arrive."}


# --- Admin Protected Operations ---

@app.post("/api/admin/release")
def admin_release_seats(
    trainno: int,
    date_str: str,
    type: str,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

    weekday_idx = target_date.weekday()
    weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    day_name = weekdays[weekday_idx]

    train = db.query(models.Traindetails).filter(
        models.Traindetails.Trainno == trainno,
        getattr(models.Traindetails, day_name) == True
    ).first()

    if not train:
        raise HTTPException(status_code=400, detail="Train doesn't run on this day")

    seed_date = datetime.strptime("2021:10:24", "%Y:%m:%d").date()
    
    if type == "General":
        avail_table = models.Generalseatavailability
    else:
        avail_table = models.Tatkalseatavailability

    seed_seats = db.query(avail_table).filter(
        avail_table.Trainno == trainno,
        avail_table.Date == seed_date
    ).all()

    if not seed_seats:
        raise HTTPException(status_code=404, detail="Seed seat templates not found for this train")

    db.query(avail_table).filter(
        avail_table.Trainno == trainno,
        avail_table.Date == target_date
    ).delete()

    for seed in seed_seats:
        new_avail = avail_table(
            RouteID=seed.RouteID,
            Trainno=seed.Trainno,
            Date=target_date,
            SLseats=seed.SLseats,
            SLCF=seed.SLCF,
            SLWL=seed.SLWL,
            SLRAC=seed.SLRAC,
            AC3_seats=seed.AC3_seats,
            AC3_CF=seed.AC3_CF,
            AC3_WL=seed.AC3_WL,
            AC3_RAC=seed.AC3_RAC,
            AC2_seats=seed.AC2_seats,
            AC2_CF=seed.AC2_CF,
            AC2_WL=seed.AC2_WL,
            AC2_RAC=seed.AC2_RAC,
            AC1_seats=seed.AC1_seats,
            AC1_CF=seed.AC1_CF,
            AC1_WL=seed.AC1_WL,
            AC1_RAC=seed.AC1_RAC,
            CCseats=seed.CCseats,
            CCCF=seed.CCCF,
            CCWL=seed.CCWL,
            CCRAC=seed.CCRAC
        )
        db.add(new_avail)

    db.commit()
    return {"status": "success", "message": f"Successfully released {type} tickets"}


@app.get("/api/admin/analytics")
def get_admin_analytics(
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # Daily Revenue
    revenue_data = db.query(
        models.Ticket.Date,
        func.sum(models.Ticket.Price)
    ).filter(models.Ticket.Status != "CXL").group_by(models.Ticket.Date).order_by(models.Ticket.Date).all()
    revenue_timeline = [{"date": str(r[0]), "revenue": r[1]} for r in revenue_data]

    # Booking counts per train
    train_data = db.query(
        models.Ticket.Trainno,
        func.count(models.Ticket.PNR)
    ).filter(models.Ticket.Status != "CXL").group_by(models.Ticket.Trainno).all()
    train_bookings = [{"train": f"Train {t[0]}", "bookings": t[1]} for t in train_data]

    # Booking quota distribution
    quota_data = db.query(
        models.Ticket.Bookingtype,
        func.count(models.Ticket.PNR)
    ).filter(models.Ticket.Status != "CXL").group_by(models.Ticket.Bookingtype).all()
    quota_breakdown = [{"name": q[0], "value": q[1]} for q in quota_data]

    # Dining distribution
    dining_data = db.query(
        models.Passengerdetails.Foodtype,
        func.count(models.Passengerdetails.PassengerID)
    ).group_by(models.Passengerdetails.Foodtype).all()
    dining_breakdown = [{"name": d[0], "value": d[1]} for d in dining_data]

    return {
        "revenue": revenue_timeline,
        "trains": train_bookings,
        "quotas": quota_breakdown,
        "dining": dining_breakdown
    }


# --- Admin CRUD Operations ---

@app.get("/api/admin/trains")
def admin_get_trains(
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(models.Traindetails).all()


@app.post("/api/admin/trains")
def admin_create_train(
    payload: schemas.TrainCreate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(models.Traindetails).filter(models.Traindetails.Trainno == payload.Trainno).first()
    if existing:
        raise HTTPException(status_code=400, detail="Train number already exists")

    # Time parsing
    try:
        stime = datetime.strptime(payload.Starttime, "%H:%M:%S").time()
        etime = datetime.strptime(payload.Endtime, "%H:%M:%S").time()
    except ValueError:
        raise HTTPException(status_code=400, detail="Times must be in HH:MM:SS format")

    train = models.Traindetails(
        Trainno=payload.Trainno,
        Trainname=payload.Trainname,
        Traincategory=payload.Traincategory,
        Startstation=payload.Startstation,
        Starttime=stime,
        Endstation=payload.Endstation,
        Endtime=etime,
        Totalhalts=payload.Totalhalts,
        Monday=payload.Monday,
        Tuesday=payload.Tuesday,
        Wednesday=payload.Wednesday,
        Thursday=payload.Thursday,
        Friday=payload.Friday,
        Saturday=payload.Saturday,
        Sunday=payload.Sunday
    )
    db.add(train)
    db.commit()
    return {"status": "success", "message": "Train created successfully"}


@app.put("/api/admin/trains/{trainno}")
def admin_update_train(
    trainno: int,
    payload: schemas.TrainCreate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    train = db.query(models.Traindetails).filter(models.Traindetails.Trainno == trainno).first()
    if not train:
        raise HTTPException(status_code=404, detail="Train not found")

    try:
        stime = datetime.strptime(payload.Starttime, "%H:%M:%S").time()
        etime = datetime.strptime(payload.Endtime, "%H:%M:%S").time()
    except ValueError:
         raise HTTPException(status_code=400, detail="Times must be in HH:MM:SS format")

    train.Trainname = payload.Trainname
    train.Traincategory = payload.Traincategory
    train.Startstation = payload.Startstation
    train.Starttime = stime
    train.Endstation = payload.Endstation
    train.Endtime = etime
    train.Totalhalts = payload.Totalhalts
    train.Monday = payload.Monday
    train.Tuesday = payload.Tuesday
    train.Wednesday = payload.Wednesday
    train.Thursday = payload.Thursday
    train.Friday = payload.Friday
    train.Saturday = payload.Saturday
    train.Sunday = payload.Sunday

    db.commit()
    return {"status": "success", "message": "Train updated successfully"}


@app.delete("/api/admin/trains/{trainno}")
def admin_delete_train(
    trainno: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    train = db.query(models.Traindetails).filter(models.Traindetails.Trainno == trainno).first()
    if not train:
        raise HTTPException(status_code=404, detail="Train not found")

    db.delete(train)
    db.commit()
    return {"status": "success", "message": "Train deleted successfully"}


@app.post("/api/admin/routes")
def admin_create_route(
    payload: schemas.RouteCreate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    try:
        dtime = datetime.strptime(payload.Depttime, "%H:%M:%S").time()
        atime = datetime.strptime(payload.Arrivaltime, "%H:%M:%S").time()
    except ValueError:
         raise HTTPException(status_code=400, detail="Times must be in HH:MM:SS format")

    route_stop = models.Route(
        RouteID=payload.RouteID,
        Trainno=payload.Trainno,
        Deptstation=payload.Deptstation,
        Depttime=dtime,
        Deptday=payload.Deptday,
        Arrivalstation=payload.Arrivalstation,
        Arrivaltime=atime,
        Arrivalday=payload.Arrivalday,
        Stopnumber=payload.Stopnumber
    )
    db.add(route_stop)
    db.commit()
    return {"status": "success", "message": "Route stop created successfully"}
