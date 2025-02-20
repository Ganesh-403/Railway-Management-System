from flask import Flask, render_template, request, redirect, url_for, session
from flask_mysqldb import MySQL
import MySQLdb.cursors
from datetime import datetime,time
import calendar
from flask_mail import Mail,Message

SESSION_TYPE = 'memcache'

app = Flask(__name__,template_folder="Templates")
mail = Mail(app)

app.secret_key = 'super secret key'
app.config['SESSION_TYPE'] = 'filesystem'

app.config['MAIL_SERVER']='smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = 'chsiddu2002@gmail.com'
app.config['MAIL_PASSWORD'] = '****'              #Security code - google (password)
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
mail = Mail(app)

import mysql.connector

connection=mysql.connector.connect(host="localhost",user="root",password="Put ur passsword here",database="Railway")
cursor=connection.cursor(buffered=True)

@app.route("/")
def homepage():
    return render_template("home.html")

@app.route("/t&c")
def tandc():
    return render_template("t&c.html")

@app.route("/privacypolicy")
def privacy():
    return render_template("privacypolicy.html")

@app.route("/register1")
def register1():
    return render_template("registration1.html")

@app.route("/register2",methods=["post"])
def register2():
    username=request.form["username"]
    password=request.form["password"]
    securityquestion=request.form["securityquestion"]
    securityanswer=request.form["securityanswer"]

    session['registername'] = username

    cursor.execute("SELECT ID FROM Userdetails WHERE ID='{}'".format(username))
    validate=cursor.fetchall()

    if len(validate)==0:
        cursor.execute("""INSERT INTO Userdetails(ID,Password,Securityquestion,Securityanswer) VALUES('{}','{}','{}','{}')""".format(username,password,securityquestion,securityanswer))
        connection.commit()
        return render_template('registration2.html')
    if len(validate)>0:
        return render_template('registration1.html',validuserid="(User Id already present)")    

@app.route("/register3",methods=["post"])
def register3():
    username=session.get('registername',None)
    fname=request.form["fname"]
    mname=request.form["mname"]
    lname=request.form["lname"]
    occupation=request.form["occupation"]
    dob=request.form["DOB"]
    martialstatus=request.form["martialstatus"]
    country=request.form["country"]
    sex=request.form["sex"]
    email=request.form["email"]
    mobileno=request.form["mobileno"]
    cursor.execute("""UPDATE Userdetails SET Firstname='{}',Middlename='{}',Lastname='{}',Occupation='{}',DOB='{}',Martialstatus='{}',Nationality='{}',Gender='{}',Email='{}',Mobile='{}' where ID='{}'""".format(fname,mname,lname,occupation,dob,martialstatus,country,sex,email,mobileno,username))
    connection.commit()
    return render_template('registration3.html')

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/login1",methods=["post"])
def login1():
    cursor.execute("Select * from station")
    z=cursor.fetchall()
    username=request.form.get("username")
    password=request.form.get("password")
    session['ID'] = username

    cursor.execute("SELECT * FROM Userdetails WHERE ID = '{}' and Password = '{}'".format(username,password))
    validate=cursor.fetchall()

    cursor.execute("SELECT * FROM Userdetails WHERE ID = '{}'".format(username))
    validate1=cursor.fetchall()

    if len(validate)>0:
        return render_template('search.html',z=z)
    elif len(validate1)>0:
        return render_template('login.html',validpassword="(Password incorrect)")
    else:
        return render_template('login.html',validuserid="(Wrong credentials)")

@app.route('/register',methods=["post"])
def register():
    username=session.get('registername',None)
    fno=request.form["fno"]
    lane=request.form["lane"]
    area=request.form["area"]
    state=request.form["state"]
    pincode=request.form["pincode"]
    city=request.form["city"]
    cursor.execute("""UPDATE Userdetails SET Flatno='{}',Street='{}',Locality='{}',State='{}',Pincode='{}',City='{}' where ID='{}'""".format(fno,lane,area,state,pincode,city,username))
    connection.commit()
    return render_template('home.html')

@app.route('/selecttrains')
def Text():
    cursor.execute("Select * from station")
    z=cursor.fetchall()
    return render_template('search.html',z=z)

@app.route('/runningstatus')
def runningstatus():
    return render_template("runningstatus.html")

@app.route('/runningstatus1',methods=["post"])
def runningstatus1():
    Trainno = request.form['running']
    Date = request.form['Date']
    Date1=Date.replace("-",":")
    Date=Date.split("-")
    a=int(Date[0])
    b=int(Date[1])
    c=int(Date[2])
    d = datetime(a,b,c).weekday()
    lst = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    day=lst[d]
    c=datetime.now()
    time=c.strftime("%H:%M:%S")
    date=c.strftime("%Y:%m:%d")
    date_format = "%Y:%m:%d"
    a = datetime.strptime(Date1, date_format)
    b = datetime.strptime(date, date_format)
    delta=b-a
    difference=delta.days
    cursor.execute("select * from traindetails where {}=1 and trainno='{}'".format(day,Trainno))
    x=cursor.fetchall()
    if len(x)>0 and date==Date1:
        cursor.execute("select Depttime from route where trainno='{}' and stopnumber=1".format(Trainno))
        m=cursor.fetchall()
        time1=m[0][0]
        cursor.execute("select Deptstation,Depttime,Arrivalstation,Arrivaltime from route where trainno='{}' and depttime<='{}' and arrivaltime>='{}' and depttime>='{}'".format(Trainno,time,time,time1))
        z=cursor.fetchall()
        cursor.execute("select Startstation from traindetails where trainno='{}' and starttime>'{}'".format(Trainno,time))
        y=cursor.fetchall()
        cursor.execute("select Endstation from traindetails where trainno='{}' and endtime<'{}'".format(Trainno,time))
        x=cursor.fetchall()
        if len(z)>0:
            return render_template("runningstatus.html",status=z)
        elif len(y)>0:
            return render_template("runningstatus.html",notrunning="Train didn't start yet.")
        elif len(x)>0:
            return render_template("runningstatus.html",notrunning="Train completed its journey.")
    elif len(x)>0 and date>Date1:
        print(time)
        cursor.execute("select Deptstation,Depttime,Deptday,Arrivalstation,Arrivaltime,Arrivalday from route where trainno='{}' and depttime<='{}' and arrivaltime>='{}' ".format(Trainno,time,time))
        z=cursor.fetchall()
        print(z)
        if (z==[]):
            return render_template("runningstatus.html",notrunning="Train completed its journey.")
        elif (z[0][5]-1>=difference and (z[0][5]-z[0][2])>=0):
            return render_template("runningstatus.html",status1=z)   
        else:  
            return render_template("runningstatus.html",notrunning="Train completed its journey.")   
    elif len(x)>0 and date<Date1:  
        return render_template("runningstatus.html",notrunning="The day didn't arrive.")     
    else:
        return render_template("runningstatus.html",notrunning="Train is not running on this day.")

@app.route('/search',methods=['GET', 'POST'])
def search():
    if request.method == 'POST' and 'Startstation' in request.form and 'Endstation' in request.form:
        cursor.execute("Select * from station")
        stations=cursor.fetchall()
        Startstation = request.form['Startstation']
        Endstation = request.form['Endstation']
        Category = request.form['category']
        Date = request.form['Date']
        x=Startstation.split("-")
        Startstation=x[0]
        y=Endstation.split("-")
        Endstation=y[0]
        cursor.execute("SELECT Trainno from Route where Deptstation='{}'".format(Startstation))
        a=cursor.fetchall()
        cursor.execute("SELECT Trainno from Route where Arrivalstation='{}'".format(Endstation))
        b=cursor.fetchall()
        z=[]
        y=[]
        c = []
        for i in a:
            for j in b:
                if i==j:
                    i=i[0]
                    z.append(i)

        session['startstation'] = Startstation
        session['endstation'] = Endstation
        session['date'] = Date
        session['type'] = Category

        if Category=="General":
                x = []
                r = []
                w = []
                s = []
                t = []
                o = []
                for i in z:
                        cursor.execute("SELECT Traindetails.Trainno,Trainname,Date,SLseats,SLWL,3Aseats,3AWL,2Aseats,2AWL,1Aseats,1AWL,CCseats,CCWL FROM Traindetails INNER JOIN Generalseatavailability ON Traindetails.Trainno = Generalseatavailability.Trainno WHERE Traindetails.Trainno ='{}' and Generalseatavailability.date='{}'".format(i,Date))
                        y.append(cursor.fetchall())
                        cursor.execute("SELECT Trainno FROM Traindetails WHERE Trainno = '{}'".format(i))
                        s = cursor.fetchall()
                        cursor.execute("SELECT Trainname FROM Traindetails WHERE Trainno = '{}'".format(i))
                        d = cursor.fetchall()
                        session['trainname'] = d[0][0]
                        cursor.execute("SELECT Stopnumber FROM Route WHERE Trainno = '{}' AND Deptstation = '{}'".format(s[0][0],Startstation))
                        p = cursor.fetchall()
                        cursor.execute("SELECT Stopnumber FROM Route WHERE Trainno = '{}' AND Arrivalstation = '{}'".format(s[0][0],Endstation))
                        q = cursor.fetchall()
                        c=[]
                        for j in range(p[0][0],q[0][0] + 1):
                            cursor.execute("SELECT RouteID FROM Route WHERE Trainno = '{}' AND Stopnumber = '{}'".format(s[0][0],j))
                            c.append(cursor.fetchall())
                        k = []
                        for i in range(len(c)):
                            cursor.execute("SELECT SLprice FROM Generalrouteprices WHERE RouteID = '{}'".format(c[i][0][0]))
                            k.append(cursor.fetchall())
                        sum = 0
                        for i in range(len(k)):
                            sum += k[i][0][0]
                        x.append(sum)
                        sum = 0
                        k = []
                        for i in range(len(c)):
                            cursor.execute("SELECT 3Aprice FROM Generalrouteprices WHERE RouteID = '{}'".format(c[i][0][0]))
                            k.append(cursor.fetchall())
                        sum1 = 0
                        for i in range(len(k)):
                            sum1 += k[i][0][0]
                        r.append(sum1)
                        sum1 = 0
                        k = []
                        for i in range(len(c)):
                            cursor.execute("SELECT 2Aprice FROM Generalrouteprices WHERE RouteID = '{}'".format(c[i][0][0]))
                            k.append(cursor.fetchall())
                        sum2 = 0
                        for i in range(len(k)):
                            sum2 += k[i][0][0]
                        w.append(sum2)
                        sum2 = 0
                        k = []
                        for i in range(len(c)):
                            cursor.execute("SELECT 1Aprice FROM Generalrouteprices WHERE RouteID = '{}'".format(c[i][0][0]))
                            k.append(cursor.fetchall())
                        sum3 = 0
                        for i in range(len(k)):
                            sum3 += k[i][0][0]
                        o.append(sum3)
                        k = []
                        sum3 = 0
                        for i in range(len(c)):
                            cursor.execute("SELECT CCprice FROM Generalrouteprices WHERE RouteID = '{}'".format(c[i][0][0]))
                            k.append(cursor.fetchall())
                        sum4 = 0
                        for i in range(len(k)):
                            sum4 += k[i][0][0]
                        t.append(sum4)
                        sum4 = 0

                print(y)

                if (y==[[]] or y==[]):
                    return render_template("search.html",z=stations,msg="There is no train running on this date between these stations.")
                
                else:
                    return render_template("search.html",c = y,z=stations,x=x,r=r,w=w,o=o,t=t)

        elif Category=="Tatkal":
                x = []
                r = []
                w = []
                s = []
                t = []
                o = []
                for i in z:
                        cursor.execute("SELECT Traindetails.Trainno,Trainname,Date,SLseats,SLWL,3Aseats,3AWL,2Aseats,2AWL,1Aseats,1AWL,CCseats,CCWL FROM Traindetails INNER JOIN Tatkalseatavailability ON Traindetails.Trainno = Tatkalseatavailability.Trainno WHERE Traindetails.Trainno ='{}'".format(i))
                        y.append(cursor.fetchall())
                        session['CCseats'] = y[0][0][11]
                        cursor.execute("SELECT Trainno FROM Traindetails WHERE Trainno = '{}'".format(i))
                        s = cursor.fetchall()
                        cursor.execute("SELECT Trainname FROM Traindetails WHERE Trainno = '{}'".format(i))
                        d = cursor.fetchall()
                        session['trainname'] = d[0][0]
                        cursor.execute("SELECT Stopnumber FROM Route WHERE Trainno = '{}' AND Deptstation = '{}'".format(s[0][0],Startstation))
                        p = cursor.fetchall()
                        cursor.execute("SELECT Stopnumber FROM Route WHERE Trainno = '{}' AND Arrivalstation = '{}'".format(s[0][0],Endstation))
                        q = cursor.fetchall()
                        c=[]
                        for j in range(p[0][0],q[0][0] + 1):
                            cursor.execute("SELECT RouteID FROM Route WHERE Trainno = '{}' AND Stopnumber = '{}'".format(s[0][0],j))
                            c.append(cursor.fetchall())
                        k = []
                        for i in range(len(c)):
                            cursor.execute("SELECT SLprice FROM Tatkalrouteprices WHERE RouteID = '{}'".format(c[i][0][0]))
                            k.append(cursor.fetchall())
                        sum = 0
                        for i in range(len(k)):
                            sum += k[i][0][0]
                        x.append(sum)
                        sum = 0
                        k = []
                        for i in range(len(c)):
                            cursor.execute("SELECT 3Aprice FROM Tatkalrouteprices WHERE RouteID = '{}'".format(c[i][0][0]))
                            k.append(cursor.fetchall())
                        sum1 = 0
                        for i in range(len(k)):
                            sum1 += k[i][0][0]
                        r.append(sum1)
                        sum1 = 0
                        k = []
                        for i in range(len(c)):
                            cursor.execute("SELECT 2Aprice FROM Tatkalrouteprices WHERE RouteID = '{}'".format(c[i][0][0]))
                            k.append(cursor.fetchall())
                        sum2 = 0
                        for i in range(len(k)):
                            sum2 += k[i][0][0]
                        w.append(sum2)
                        sum2 = 0
                        k = []
                        for i in range(len(c)):
                            cursor.execute("SELECT 1Aprice FROM Tatkalrouteprices WHERE RouteID = '{}'".format(c[i][0][0]))
                            k.append(cursor.fetchall())
                        sum3 = 0
                        for i in range(len(k)):
                            sum3 += k[i][0][0]
                        o.append(sum3)
                        k = []
                        sum3 = 0
                        for i in range(len(c)):
                            cursor.execute("SELECT CCprice FROM Tatkalrouteprices WHERE RouteID = '{}'".format(c[i][0][0]))
                            k.append(cursor.fetchall())
                        sum4 = 0
                        for i in range(len(k)):
                            sum4 += k[i][0][0]
                        t.append(sum4)
                        sum4 = 0

                if (y==[[]] or y==[]):
                    return render_template("search.html",z=stations,msg="There is no train running on this date between these stations.")
                else:
                    return render_template("search.html",c = y,z=stations,x=x,r=r,w=w,o=o,t=t)

@app.route("/npass/<trainno>/<price>/<category>/<seats>")
def npass(trainno,price,category,seats):
    session['trainno'] = trainno
    session['price']= price
    session['category']=category
    session['seats']=seats
    return render_template('passengers.html')

@app.route("/npass1",methods=["post"])
def npass1():
    c=request.form["tickets"]
    session['ticketno'] = c
    c=int(c)
    trainno = session.get('trainno',int)
    trainno=int(float(trainno))
    cursor.execute("""select Traincategory from traindetails where trainno='{}'""".format(trainno))
    z=cursor.fetchall()
    cursor.execute("""select Foodservicetype from traincategory where category='{}'""".format(z[0][0]))
    x=cursor.fetchall()
    session["food"]=x[0][0]
    return render_template('npass.html',c=c,k=x[0][0])

@app.route("/passengers", methods = ['GET','POST'])
def passengers():
        trainno = session.get('trainno',int)
        trainno=int(float(trainno))
        price= session.get('price',int)
        price=int(float(price))
        ticketno= session.get('ticketno',int)
        ticketno=int(ticketno)
        foodtype= session.get('food',str)
        startstation = session.get('startstation',None)
        endstation = session.get('endstation',None)
        date = session.get('date',None)
        trainname = session.get('trainname',None)
        category = session.get('category',None)
        seats = session.get('seats',None)
        type = session.get('type',None)
        ID = session.get('ID',None)

        if category == "CC":
            Nseats = int(seats)
        elif category == "3A":
            Nseats = int(seats)
        elif category == "2A":
            Nseats = int(seats)
        elif category == "1A":
            Nseats = int(seats)
        elif category == "SL":
            Nseats = int(seats)
        price=price*(ticketno)

        k=request.form["tickets"]
        people = int(k)
        name_l = []
        age_l = []
        sex_l = []
        food_l= []
        tno = []
        seatno = []
        for p in range(people):
            tno.append(p+1)
            x=""
            y=""
            z=""
            t=""
            x="name"+str(p)
            y="age"+str(p)
            z="sex"+str(p)
            t="food"+str(p)
            name = request.form[x]
            name_l.append(name)
            age  = request.form[y]
            age_l.append(age)
            sex  = request.form[z]
            sex_l.append(sex)
            food  = request.form[t]
            food_l.append(food)
            seats = int(seats)
            seatno.append(seats)
            seats = seats - 1
        cursor.execute("""select * from foodservice where foodservicetype='{}'""".format(foodtype))
        h=cursor.fetchall()

        bf = time(hour=8,minute=30,second=0)
        lunch = time(hour=13,minute=0,second=0)
        snack = time(hour=17,minute=0,second=0)
        dinner = time(hour=20,minute=30,second=0)

        for i in range(len(food_l)):
            if food_l[i]=="Veg":
                cursor.execute("""select * from route where trainno='{}' and (Deptstation='{}' or Arrivalstation='{}')""".format(trainno,startstation,endstation))
                m=cursor.fetchall()
                print(m)
                depttime=m[0][3]
                deptday=m[0][4]
                arrivaltime=m[1][6]
                arrivalday=m[1][7]

                depttime = (datetime.min + depttime).time()
                arrivaltime = (datetime.min + arrivaltime).time()

                if (deptday==arrivalday):
                    if (depttime<bf and arrivaltime>bf):
                        price=price+h[0][2]
                    if (depttime<lunch and arrivaltime>lunch):
                        price=price+h[0][4]
                    if (depttime<snack and arrivaltime>snack):
                        price=price+h[0][6]
                    if (depttime<dinner and arrivaltime>dinner):
                        price=price+h[0][7]
                elif (deptday==arrivalday-1):
                    if (depttime<bf):
                        price=price+h[0][2]
                    if (depttime<lunch):
                        price=price+h[0][4]
                    if (depttime<snack):
                        price=price+h[0][6]
                    if (depttime<dinner):
                        price=price+h[0][7]
                    if (arrivaltime>bf):
                        price=price+h[0][2]
                    if (arrivaltime>lunch):
                        price=price+h[0][4]
                    if (arrivaltime>snack):
                        price=price+h[0][6]
                    if (arrivaltime>dinner):
                        price=price+h[0][7]
                elif (deptday==arrivalday-2):
                    price=price+h[0][2]+h[0][4]+h[0][6]+h[0][7]
                    if (depttime<bf):
                        price=price+h[0][2]
                    if (depttime<lunch):
                        price=price+h[0][4]
                    if (depttime<snack):
                        price=price+h[0][6]
                    if (depttime<dinner):
                        price=price+h[0][7]
                    if (arrivaltime>bf):
                        price=price+h[0][2]
                    if (arrivaltime>lunch):
                        price=price+h[0][4]
                    if (arrivaltime>snack):
                        price=price+h[0][6]
                    if (arrivaltime>dinner):
                        price=price+h[0][7]

            if food_l[i]=="NVeg":
                cursor.execute("""select * from route where trainno='{}' and (Deptstation='{}' or Arrivalstation='{}')""".format(trainno,startstation,endstation))
                m=cursor.fetchall()
                depttime=m[0][3]
                deptday=m[0][4]
                arrivaltime=m[1][6]
                arrivalday=m[1][7]

                depttime = (datetime.min + depttime).time()
                arrivaltime = (datetime.min + arrivaltime).time()

                if (deptday==arrivalday):
                    if (depttime<bf and arrivaltime>bf):
                        price=price+h[0][3]
                    if (depttime<lunch and arrivaltime>lunch):
                        price=price+h[0][5]
                    if (depttime<snack and arrivaltime>snack):
                        price=price+h[0][6]
                    if (depttime<dinner and arrivaltime>dinner):
                        price=price+h[0][8]
                elif (deptday==arrivalday-1):
                    if (depttime<bf):
                        price=price+h[0][3]
                    if (depttime<lunch):
                        price=price+h[0][5]
                    if (depttime<snack):
                        price=price+h[0][6]
                    if (depttime<dinner):
                        price=price+h[0][8]
                    if (arrivaltime>bf):
                        price=price+h[0][3]
                    if (arrivaltime>lunch):
                        price=price+h[0][5]
                    if (arrivaltime>snack):
                        price=price+h[0][6]
                    if (arrivaltime>dinner):
                        price=price+h[0][8]
                elif (deptday==arrivalday-2):
                    price=price+h[0][3]+h[0][5]+h[0][6]+h[0][8]
                    if (depttime<bf):
                        price=price+h[0][3]
                    if (depttime<lunch):
                        price=price+h[0][5]
                    if (depttime<snack):
                        price=price+h[0][6]
                    if (depttime<dinner):
                        price=price+h[0][8]
                    if (arrivaltime>bf):
                        price=price+h[0][3]
                    if (arrivaltime>lunch):
                        price=price+h[0][5]
                    if (arrivaltime>snack):
                        price=price+h[0][6]
                    if (arrivaltime>dinner):
                        price=price+h[0][8]
        
        seats=[]
        id=[]

        cursor.execute("""select PNR from ticket""")
        n=cursor.fetchall()
        z=len(n)

        if (z==0):
            PNR=1
        else:
            PNR=(n[z-1][0])
            PNR=PNR+1

        for i in range(people):
            cursor.execute("""INSERT INTO Passengerdetails(Id,Name,Gender,Foodtype,Age) VALUES('{}','{}','{}','{}','{}')""".format(ID,name_l[i],sex_l[i],food_l[i],age_l[i]))
            connection.commit()
            cursor.execute("""select passengerId from passengerdetails where passengerid = (select max(passengerid) from passengerdetails where Id='{}')""".format(ID))
            f=cursor.fetchone()
            id.append(f[0])
            seats.append(Nseats)
            Nseats=Nseats-1
        if type == "General" and category == "CC":
            cursor.execute("""UPDATE Generalseatavailability SET CCseats = '{}' where trainno='{}' and date='{}'""".format(Nseats,trainno,date))
            connection.commit()
        if type == "General" and category == "3A":
            cursor.execute("""UPDATE Generalseatavailability SET 3Aseats = '{}' where trainno='{}' and date='{}'""".format(Nseats,trainno,date))
            connection.commit()
        if type == "General" and category == "2A":
            cursor.execute("""UPDATE Generalseatavailability SET 2Aseats = '{}' where trainno='{}' and date='{}'""".format(Nseats,trainno,date))
            connection.commit()
        if type == "General" and category == "SL":
            cursor.execute("""UPDATE Generalseatavailability SET SLseats = '{}' where trainno='{}' and date='{}'""".format(Nseats,trainno,date))
            connection.commit()
        if type == "General" and category == "1A":
            cursor.execute("""UPDATE Generalseatavailability SET 1Aseats = '{}' where trainno='{}' and date='{}'""".format(Nseats,trainno,date))
            connection.commit()
        if type == "Tatkal" and category == "CC":
            cursor.execute("""UPDATE Tatkalseatavailability SET CCseats = '{}' where trainno='{}' and date='{}'""".format(Nseats,trainno,date))
            connection.commit()
        if type == "Tatkal" and category == "3A":
            cursor.execute("""UPDATE Tatkalseatavailability SET 3Aseats = '{}' where trainno='{}' and date='{}'""".format(Nseats,trainno,date))
            connection.commit()
        if type == "Tatkal" and category == "2A":
            cursor.execute("""UPDATE Tatkalseatavailability SET 2Aseats = '{}' where trainno='{}' and date='{}'""".format(Nseats,trainno,date))
            connection.commit()
        if type == "Tatkal" and category == "SL":
            cursor.execute("""UPDATE Tatkalseatavailability SET SLseats = '{}' where trainno='{}' and date='{}'""".format(Nseats,trainno,date))
            connection.commit()
        if type == "Tatkal" and category == "1A":
            cursor.execute("""UPDATE Tatkalseatavailability SET 1Aseats = '{}' where trainno='{}' and date='{}'""".format(Nseats,trainno,date))
            connection.commit()
        for i in range(len(seats)):
            cursor.execute("""Insert into ticket values ('{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}')""".format(PNR,id[i],ID,category,type,trainno,"CNF",seats[i],startstation,depttime,endstation,arrivaltime,date,price))
            connection.commit()
        
        cursor.execute("""select * from userdetails where ID='{}'""".format(ID))
        n=cursor.fetchall()

        email=n[0][12]

        msg = Message('Hello',sender ='chsiddu2002@gmail.com',recipients = [email])
        msg.body = "This is a confirmation for you booking and kindly find the ticket. PNR =" + str(PNR) + ". Train number =" + str(trainno) +". Train name = " + trainname + ". Date of journey = " + str(date) +". Number of tickets = "  + str(ticketno) + ". Price = "+ str(price) + ". Start station = "+ startstation+ ". End station = "+ endstation+"."
        mail.send(msg)

        return render_template("ticket.html",PNR=PNR,c=people,tno = tno,name = name_l,age = age_l,sex = sex_l,food=food_l,trainno = trainno,startstation = startstation,endstation = endstation,date = date,trainname = trainname,Nseats = Nseats,seatno = seatno,price = price)

@app.route("/adminlogin")
def adminlogin():
    return render_template("adminlogin.html")

@app.route("/login2",methods=["post"])
def login2():
    username=request.form.get("username")
    password=request.form.get("password")

    cursor.execute("SELECT * FROM Admin WHERE UserID = '{}' and Password = '{}'".format(username,password))
    validate=cursor.fetchall()

    cursor.execute("SELECT * FROM Admin WHERE UserID = '{}'".format(username))
    validate1=cursor.fetchall()

    if len(validate)>0:
        return render_template("adminrights.html")
    elif len(validate1)>0:
        return render_template('adminlogin.html',validpassword="(Password incorrect)")
    else:
        return render_template('adminlogin.html',validuserid="(Wrong credentials)")

@app.route("/releaseg")
def releaseg():
    cursor.execute("Select Trainno from Traindetails")
    z=cursor.fetchall()
    return render_template("releaseg.html",z=z)

@app.route("/releasegtickets",methods=["post"])
def releasegtickets():
    cursor.execute("Select Trainno from Traindetails")
    z=cursor.fetchall()
    trainno=request.form["trainno"]
    Date2=request.form["Date"]
    Date1=Date2.replace("-",":")
    Date=Date2.split("-")
    a=int(Date[0])
    b=int(Date[1])
    c=int(Date[2])
    d = datetime(a,b,c).weekday()
    lst = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    day=lst[d]
    cursor.execute("select * from traindetails where {}=1 and trainno='{}'".format(day,trainno))
    run=cursor.fetchall()
    if (len(run)>0):
        cursor.execute("""select * from Generalseatavailability where trainno='{}' and date='2021:10:24'""".format(trainno))
        x=cursor.fetchall()
        x=list(x)
        for i in range(len(x)):
            x[i]=list(x[i])
            x[i][2]=Date2
        for i in range(len(x)):
            x[i]=tuple(x[i])
        x=tuple(x)
        for i in range(len(x)):
            cursor.execute("""Insert into Generalseatavailability values('{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}')""".format(x[i][0],x[i][1],x[i][2],x[i][3],x[i][4],x[i][5],x[i][6],x[i][7],x[i][8],x[i][9],x[i][10],x[i][11],x[i][12],x[i][13],x[i][14],x[i][15],x[i][16],x[i][17],x[i][18],x[i][19],x[i][20],x[i][21],x[i][22]))
            connection.commit()
        return render_template("releaseg.html",k="Successfully released",z=z)
    else:
        return render_template("releaseg.html",k="Train doesn't run on this day",z=z)

@app.route("/releaset")
def releaset():
    cursor.execute("Select Trainno from Traindetails")
    z=cursor.fetchall()
    return render_template("releaset.html",z=z)

@app.route("/releasettickets",methods=["post"])
def releasettickets():
    cursor.execute("Select Trainno from Traindetails")
    z=cursor.fetchall()
    trainno=request.form["trainno"]
    Date2=request.form["Date"]
    Date1=Date2.replace("-",":")
    Date=Date2.split("-")
    a=int(Date[0])
    b=int(Date[1])
    c=int(Date[2])
    d = datetime(a,b,c).weekday()
    lst = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    day=lst[d]
    cursor.execute("select * from traindetails where {}=1 and trainno='{}'".format(day,trainno))
    run=cursor.fetchall()
    if (len(run)>0):
        cursor.execute("""select * from Tatkalseatavailability where trainno='{}' and date='2021:10:24'""".format(trainno))
        x=cursor.fetchall()
        x=list(x)
        for i in range(len(x)):
            x[i]=list(x[i])
            x[i][2]=Date2
        for i in range(len(x)):
            x[i]=tuple(x[i])
        x=tuple(x)
        for i in range(len(x)):
            cursor.execute("""Insert into Tatkalseatavailability values('{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}')""".format(x[i][0],x[i][1],x[i][2],x[i][3],x[i][4],x[i][5],x[i][6],x[i][7],x[i][8],x[i][9],x[i][10],x[i][11],x[i][12],x[i][13],x[i][14],x[i][15],x[i][16],x[i][17],x[i][18],x[i][19],x[i][20],x[i][21],x[i][22]))
            connection.commit()
        return render_template("releaset.html",k="Successfully released",z=z)
    else:
        return render_template("releaset.html",k="Train doesn't run on this day",z=z)
        
@app.route("/pnr")
def pnr():
    return render_template("pnr.html")

@app.route("/pnr1",methods = ['POST'])
def pnr1():
    PNR = request.form['PNR']
    session['PNR'] = PNR
    ID=session.get('ID',None)
    cursor.execute("SELECT * from Ticket WHERE PNR = '{}'".format(PNR))
    q = cursor.fetchall()
    nseats = len(q)
    session['nseats'] = nseats
    Trainno = q[0][5]
    Boardingstation = q[0][8]
    Arrivalstation = q[0][10]
    Date = q[0][12]
    category = q[0][3]
    type = q[0][4]

    Date=Date.strftime("%Y:%m:%d")

    cursor.execute("""select * from ticket where PNR='{}' and ID='{}'""".format(PNR,ID))
    z=cursor.fetchall()

    session['category'] = category
    session['type'] = type
    session['Trainno'] = Trainno 
    session['Date'] = Date
    
    if (len(z)>0):
        return render_template("cancel.html",PNR = PNR,nseats = nseats,Trainno = Trainno,b = Boardingstation,a = Arrivalstation,Date = Date)
    else:
        return render_template("pnr.html",msg="The ticket is not booked from your account.")

@app.route("/cancel")
def cancel():
        PNR = session.get('PNR',None)
        nseats = session.get('nseats',None)
        category = session.get('category',None)
        type = session.get('type',None)
        Trainno = session.get('Trainno',None)
        Date = session.get('Date',None)
       
        cursor.execute("UPDATE Ticket SET Status = '{}' WHERE PNR = '{}'".format("CXL",PNR))
        connection.commit()
        if type == "Tatkal":
            msg = "Cancellation not allowed"
        if type == "General" and category == "CC":
            cursor.execute("SELECT CCseats from Generalseatavailability where trainno='{}' and date='{}'".format(Trainno,Date))
            Nseats = cursor.fetchall()
            Nseats = Nseats[0][0] + nseats
            cursor.execute("""UPDATE Generalseatavailability SET CCseats = '{}' where trainno='{}' and date='{}'""".format(Nseats,Trainno,Date))
            connection.commit()
            msg="Successfully Cancelled"
        if type == "General" and category == "3A":
            cursor.execute("SELECT 3Aseats from Generalseatavailability  where trainno='{}' and date='{}'".format(Trainno,Date))
            Nseats = cursor.fetchall()
            Nseats = Nseats[0][0] + nseats
            cursor.execute("""UPDATE Generalseatavailability SET 3Aseats = '{}' where trainno='{}' and date='{}'""".format(Nseats,Trainno,Date))
            connection.commit()
            msg="Successfully Cancelled"
        if type == "General" and category == "2A":
            cursor.execute("SELECT 2Aseats from Generalseatavailability where trainno='{}' and date='{}'".format(Trainno,Date))
            Nseats = cursor.fetchall()
            Nseats = Nseats[0][0] + nseats
            cursor.execute("""UPDATE Generalseatavailability SET 2Aseats = '{}' where trainno='{}' and date='{}'""".format(Nseats,Trainno,Date))
            connection.commit()
            msg="Successfully Cancelled"
        if type == "General" and category == "SL":
            cursor.execute("SELECT SLseats from Generalseatavailability where trainno='{}' and date='{}'".format(Trainno,Date))
            Nseats = cursor.fetchall()
            Nseats = Nseats[0][0] + nseats
            cursor.execute("""UPDATE Generalseatavailability SET SLseats = '{}' where trainno='{}' and date='{}'""".format(Nseats,Trainno,Date))
            connection.commit()
            msg="Successfully Cancelled"
        if type == "General" and category == "1A":
            cursor.execute("SELECT 1Aseats from Generalseatavailability where trainno='{}' and date='{}'".format(Trainno,Date))
            Nseats = cursor.fetchall()
            Nseats = Nseats[0][0] + nseats
            cursor.execute("""UPDATE Generalseatavailability SET 1Aseats = '{}' where trainno='{}' and date='{}'""".format(Nseats,Trainno,Date))
            connection.commit()
            msg="Successfully Cancelled"
        return render_template("pnr.html",msg=msg)
        
if __name__ == "__main__":
    app.run(debug=True)
