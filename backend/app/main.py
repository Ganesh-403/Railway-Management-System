from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, time, date, timedelta
from typing import List

from .database import engine, get_db, Base
from . import models, schemas, auth, config

app = FastAPI(title="Railway Management System API")

# Configure CORS for communication with the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables if they do not exist
Base.metadata.create_all(bind=engine)


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


# --- Endpoints ---

@app.get("/api/stations")
def get_stations(db: Session = Depends(get_db)):
    stations = db.query(models.Station).all()
    return stations


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
    # Check duplicate
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

    return {
        "status": "success",
        "user": {
            "username": user.ID,
            "email": user.Email,
            "firstName": user.Firstname,
            "lastName": user.Lastname
        }
    }


@app.post("/api/admin/login")
def login_admin(payload: schemas.AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(models.Admin).filter(models.Admin.UserID == payload.username).first()
    if not admin:
        raise HTTPException(status_code=400, detail="Wrong credentials")
    
    # Check legacy plain text / hashed pass
    if admin.Password != payload.password:
         raise HTTPException(status_code=400, detail="Password incorrect")

    return {
        "status": "success",
        "username": admin.UserID
    }


@app.post("/api/search")
def search_trains(payload: schemas.TrainSearchRequest, db: Session = Depends(get_db)):
    start_code = payload.Startstation.split("-")[0]
    end_code = payload.Endstation.split("-")[0]
    
    # Date processing to find weekday
    try:
        search_date = datetime.strptime(payload.Date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

    weekday_idx = search_date.weekday()
    weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    day_name = weekdays[weekday_idx]

    # Find trains running on that day and passing through start and end stations
    # SQL: Find trains with a route starting at start_code and ending at end_code
    # Join Route starting and Route ending on the same train number
    start_routes = db.query(models.Route.Trainno).filter(models.Route.Deptstation == start_code).subquery()
    end_routes = db.query(models.Route.Trainno).filter(models.Route.Arrivalstation == end_code).subquery()
    
    # Intersect train numbers
    common_trains_q = db.query(start_routes.c.Trainno).join(
        end_routes, start_routes.c.Trainno == end_routes.c.Trainno
    ).all()
    common_train_nos = [t[0] for t in common_trains_q]

    results = []
    for train_no in common_train_nos:
        # Check if train runs on this weekday
        train = db.query(models.Traindetails).filter(
            models.Traindetails.Trainno == train_no,
            getattr(models.Traindetails, day_name) == True
        ).first()
        if not train:
            continue

        # Get stop numbers
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
            # If no seat availability was released for this date yet
            continue

        # Get routing IDs to aggregate segment prices
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

        results.append({
            "trainno": train.Trainno,
            "trainname": train.Trainname,
            "date": str(search_date),
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
    category: str,  # "SL", "3A", "2A", "1A", "CC"
    seats: int,     # Current seats available
    type: str,      # "General", "Tatkal"
    date: str,
    startstation: str,
    endstation: str,
    payload: schemas.TicketBookingRequest,
    username: str,  # User ID
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    try:
        travel_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

    # Fetch user details
    user = db.query(models.Userdetails).filter(models.Userdetails.ID == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch train details
    train = db.query(models.Traindetails).filter(models.Traindetails.Trainno == trainno).first()
    if not train:
        raise HTTPException(status_code=404, detail="Train not found")

    # Compute next PNR number
    max_pnr = db.query(func.max(models.Ticket.PNR)).scalar()
    pnr = (max_pnr or 0) + 1

    # Base price calculation
    total_price = price * payload.tickets

    # Save passengers and generate seat allocation
    passenger_ids = []
    assigned_seats = []
    current_avail_seats = seats

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
        assigned_seats.append(current_avail_seats)
        current_avail_seats -= 1

    # Route timings and day details for food computation
    routes = db.query(models.Route).filter(
        models.Route.Trainno == trainno,
        models.Route.Deptstation.in_([startstation, endstation]) | 
        models.Route.Arrivalstation.in_([startstation, endstation])
    ).all()

    depttime_raw = time(0, 0, 0)
    deptday = 1
    arrivaltime_raw = time(0, 0, 0)
    arrivalday = 1

    # Securely retrieve departure and arrival details
    start_route = next((r for r in routes if r.Deptstation == startstation), None)
    end_route = next((r for r in routes if r.Arrivalstation == endstation), None)

    if start_route:
        depttime_raw = start_route.Depttime
        deptday = start_route.Deptday
    if end_route:
        arrivaltime_raw = end_route.Arrivaltime
        arrivalday = end_route.Arrivalday

    def to_time(t):
        if isinstance(t, time):
            return t
        if hasattr(t, 'total_seconds'):
            return (datetime.min + t).time()
        return t

    depttime = to_time(depttime_raw)
    arrivaltime = to_time(arrivaltime_raw)

    # Food pricing calculation
    train_cat = db.query(models.Traincategory).filter(models.Traincategory.Category == train.Traincategory).first()
    foodtype_serv = train_cat.Foodservicetype if train_cat else "Normal"
    food_serv = db.query(models.Foodservice).filter(models.Foodservice.Foodservicetype == foodtype_serv).first()

    if food_serv:
        bf = time(hour=8, minute=30)
        lunch = time(hour=13, minute=0)
        snack = time(hour=17, minute=0)
        dinner = time(hour=20, minute=30)

        for passenger in payload.passengers:
            if passenger.foodtype in ["Veg", "NVeg"]:
                fp = 0
                if passenger.foodtype == "Veg":
                    f_bf, f_lh, f_sk, f_dn = food_serv.BVegprice, food_serv.LVegprice, food_serv.Snacks, food_serv.DVegprice
                else:
                    f_bf, f_lh, f_sk, f_dn = food_serv.BNVegprice, food_serv.LNVegprice, food_serv.Snacks, food_serv.DNVegprice

                if deptday == arrivalday:
                    if depttime < bf and arrivaltime > bf: fp += f_bf
                    if depttime < lunch and arrivaltime > lunch: fp += f_lh
                    if depttime < snack and arrivaltime > snack: fp += f_sk
                    if depttime < dinner and arrivaltime > dinner: fp += f_dn
                elif deptday == arrivalday - 1:
                    if depttime < bf: fp += f_bf
                    if depttime < lunch: fp += f_lh
                    if depttime < snack: fp += f_sk
                    if depttime < dinner: fp += f_dn
                    if arrivaltime > bf: fp += f_bf
                    if arrivaltime > lunch: fp += f_lh
                    if arrivaltime > snack: fp += f_sk
                    if arrivaltime > dinner: fp += f_dn
                elif deptday <= arrivalday - 2:
                    fp += f_bf + f_lh + f_sk + f_dn
                    if depttime < bf: fp += f_bf
                    if depttime < lunch: fp += f_lh
                    if depttime < snack: fp += f_sk
                    if depttime < dinner: fp += f_dn
                    if arrivaltime > bf: fp += f_bf
                    if arrivaltime > lunch: fp += f_lh
                    if arrivaltime > snack: fp += f_sk
                    if arrivaltime > dinner: fp += f_dn
                
                total_price += fp

    # Update available seats in DB
    if type == "General":
        avail_table = models.Generalseatavailability
    else:
        avail_table = models.Tatkalseatavailability

    col_name = {
        "CC": "CCseats", "3A": "AC3_seats", "2A": "AC2_seats", "1A": "AC1_seats", "SL": "SLseats"
    }.get(category, "SLseats")

    db.query(avail_table).filter(
        avail_table.Trainno == trainno,
        avail_table.Date == travel_date
    ).update({col_name: current_avail_seats})
    db.commit()

    # Create Ticket rows
    for i in range(payload.tickets):
        ticket = models.Ticket(
            PNR=pnr,
            PassengerID=passenger_ids[i],
            ID=username,
            Category=category,
            Bookingtype=type,
            Trainno=trainno,
            Status="CNF",
            Seat=assigned_seats[i],
            Boarding=startstation,
            Boardingtime=depttime,
            Destination=endstation,
            Arrivaltime=arrivaltime,
            Date=travel_date,
            Price=total_price
        )
        db.add(ticket)
    db.commit()

    # Async email trigger
    msg_body = f"Hello {user.Firstname},\n\nThis is confirmation of your booking.\n\nPNR: {pnr}\nTrain No: {trainno}\nTrain Name: {train.Trainname}\nJourney Date: {date}\nNo of tickets: {payload.tickets}\nTotal Price: INR {total_price}\nFrom: {startstation} To: {endstation}\nStatus: Confirmed\n\nThank you for choosing RailExp!"
    background_tasks.add_task(send_booking_email, user.Email, msg_body)

    return {
        "pnr": pnr,
        "trainno": trainno,
        "trainname": train.Trainname,
        "date": str(travel_date),
        "total_price": total_price,
        "start": startstation,
        "end": endstation,
        "seats": assigned_seats
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
def cancel_ticket(payload: schemas.PNRStatusRequest, username: str, db: Session = Depends(get_db)):
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

    # Update tickets to cancelled
    db.query(models.Ticket).filter(models.Ticket.PNR == payload.PNR).update({models.Ticket.Status: "CXL"})

    # Increment available seats
    category = t0.Category
    trainno = t0.Trainno
    travel_date = t0.Date
    n_seats = len(tickets)

    avail_table = models.Generalseatavailability
    col_name = {
        "CC": "CCseats", "3A": "AC3_seats", "2A": "AC2_seats", "1A": "AC1_seats", "SL": "SLseats"
    }.get(category, "SLseats")

    # Fetch current seats and increment
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
        # Same day check
        first_stop = db.query(models.Route).filter(models.Route.Trainno == train.Trainno, models.Route.Stopnumber == 1).first()
        if not first_stop:
            return {"status": "error", "message": "Route details not found."}

        time1 = first_stop.Depttime
        
        # Get crossed station
        z = db.query(models.Route).filter(
            models.Route.Trainno == train.Trainno,
            models.Route.Depttime <= time_now,
            models.Route.Arrivaltime >= time_now,
            models.Route.Depttime >= time1
        ).first()

        # Check future departure
        y = db.query(models.Traindetails).filter(
            models.Traindetails.Trainno == train.Trainno,
            models.Traindetails.Starttime > time_now
        ).first()

        # Check past journey
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
        # Passed date check
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
        # Future date check
        return {"status": "future", "message": "The day didn't arrive."}


@app.post("/api/admin/release")
def admin_release_seats(
    trainno: int,
    date_str: str,
    type: str,  # "General", "Tatkal"
    db: Session = Depends(get_db)
):
    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

    weekday_idx = target_date.weekday()
    weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    day_name = weekdays[weekday_idx]

    # Verify if train operates on this day
    train = db.query(models.Traindetails).filter(
        models.Traindetails.Trainno == trainno,
        getattr(models.Traindetails, day_name) == True
    ).first()

    if not train:
        raise HTTPException(status_code=400, detail="Train doesn't run on this day")

    # Select seed seats from template date 2021-10-24 (which is standard seed in legacy schema)
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

    # Insert new seat records for target date
    # Delete existing if any to avoid duplicates
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
