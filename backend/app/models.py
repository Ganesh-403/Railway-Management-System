from sqlalchemy import Column, Integer, String, Date, Time, Boolean, ForeignKey, BigInteger, PrimaryKeyConstraint
from sqlalchemy.orm import relationship
from .database import Base

class Admin(Base):
    __tablename__ = "Admin"
    UserID = Column(String(100), primary_key=True)
    Password = Column(String(100))

class Userdetails(Base):
    __tablename__ = "Userdetails"
    ID = Column(String(100), primary_key=True)
    Firstname = Column(String(100))
    Middlename = Column(String(100))
    Lastname = Column(String(100))
    Password = Column(String(200))
    Securityquestion = Column(String(200))
    Securityanswer = Column(String(300))
    DOB = Column(Date)
    Occupation = Column(String(100))
    Martialstatus = Column(String(20))
    Nationality = Column(String(100))
    Gender = Column(String(20))
    Email = Column(String(200))
    Mobile = Column(BigInteger)
    Flatno = Column(String(50))
    Street = Column(String(100))
    Locality = Column(String(100))
    State = Column(String(100))
    Pincode = Column(BigInteger)
    City = Column(String(100))

class Passengerdetails(Base):
    __tablename__ = "Passengerdetails"
    PassengerID = Column(Integer, primary_key=True, autoincrement=True, unique=True)
    ID = Column(String(100), ForeignKey("Userdetails.ID"))
    Name = Column(String(200))
    Gender = Column(String(20))
    Foodtype = Column(String(20))
    Age = Column(Integer)

class Station(Base):
    __tablename__ = "Station"
    Stationcode = Column(String(10), primary_key=True)
    Stationname = Column(String(200))

class Foodservice(Base):
    __tablename__ = "Foodservice"
    Foodservicetype = Column(String(100), primary_key=True)
    Included = Column(Boolean)
    BVegprice = Column(Integer)
    BNVegprice = Column(Integer)
    LVegprice = Column(Integer)
    LNVegprice = Column(Integer)
    Snacks = Column(Integer)
    DVegprice = Column(Integer)
    DNVegprice = Column(Integer)

class Traincategory(Base):
    __tablename__ = "Traincategory"
    Category = Column(String(100), primary_key=True)
    SLcompartments = Column(Integer)
    SLseats = Column(Integer)
    AC3_compartments = Column("3Acompartments", Integer)
    AC3_seats = Column("3Aseats", Integer)
    AC2_compartments = Column("2Acompartments", Integer)
    AC2_seats = Column("2Aseats", Integer)
    AC1_compartments = Column("1Acompartments", Integer)
    AC1_seats = Column("1Aseats", Integer)
    CCcompartments = Column(Integer)
    CCseats = Column(Integer)
    Totalseats = Column(Integer)
    Foodservicetype = Column(String(100), ForeignKey("Foodservice.Foodservicetype"))

class Traindetails(Base):
    __tablename__ = "Traindetails"
    Trainno = Column(Integer, primary_key=True)
    Trainname = Column(String(100))
    Traincategory = Column(String(50), ForeignKey("Traincategory.Category"))
    Startstation = Column(String(10), ForeignKey("Station.Stationcode"))
    Starttime = Column(Time)
    Endstation = Column(String(10), ForeignKey("Station.Stationcode"))
    Endtime = Column(Time)
    Totalhalts = Column(Integer)
    Monday = Column(Boolean)
    Tuesday = Column(Boolean)
    Wednesday = Column(Boolean)
    Thursday = Column(Boolean)
    Friday = Column(Boolean)
    Saturday = Column(Boolean)
    Sunday = Column(Boolean)

class Route(Base):
    __tablename__ = "Route"
    __table_args__ = (
        PrimaryKeyConstraint("RouteID", "Trainno"),
    )
    RouteID = Column(BigInteger)
    Trainno = Column(Integer, ForeignKey("Traindetails.Trainno", ondelete="CASCADE"))
    Deptstation = Column(String(10), ForeignKey("Station.Stationcode", ondelete="CASCADE"))
    Depttime = Column(Time)
    Deptday = Column(Integer)
    Arrivalstation = Column(String(10), ForeignKey("Station.Stationcode", ondelete="CASCADE"))
    Arrivaltime = Column(Time)
    Arrivalday = Column(Integer)
    Stopnumber = Column(Integer)

class Generalrouteprices(Base):
    __tablename__ = "Generalrouteprices"
    RouteID = Column(BigInteger, primary_key=True)
    SLprice = Column(Integer)
    AC3_price = Column("3Aprice", Integer)
    AC2_price = Column("2Aprice", Integer)
    AC1_price = Column("1Aprice", Integer)
    CCprice = Column(Integer)

class Tatkalrouteprices(Base):
    __tablename__ = "Tatkalrouteprices"
    RouteID = Column(BigInteger, primary_key=True)
    SLprice = Column(Integer)
    AC3_price = Column("3Aprice", Integer)
    AC2_price = Column("2Aprice", Integer)
    AC1_price = Column("1Aprice", Integer)
    CCprice = Column(Integer)

class Generalseatavailability(Base):
    __tablename__ = "Generalseatavailability"
    __table_args__ = (
        PrimaryKeyConstraint("RouteID", "Trainno", "Date"),
    )
    RouteID = Column(BigInteger, ForeignKey("Route.RouteID", ondelete="CASCADE"))
    Trainno = Column(Integer, ForeignKey("Route.Trainno", ondelete="CASCADE"))
    Date = Column(Date)
    
    SLseats = Column(Integer)
    SLCF = Column(Integer)
    SLWL = Column(Integer)
    SLRAC = Column(Integer)
    
    AC3_seats = Column("3Aseats", Integer)
    AC3_CF = Column("3ACF", Integer)
    AC3_WL = Column("3AWL", Integer)
    AC3_RAC = Column("3ARAC", Integer)
    
    AC2_seats = Column("2Aseats", Integer)
    AC2_CF = Column("2ACF", Integer)
    AC2_WL = Column("2AWL", Integer)
    AC2_RAC = Column("2ARAC", Integer)
    
    AC1_seats = Column("1Aseats", Integer)
    AC1_CF = Column("1ACF", Integer)
    AC1_WL = Column("1AWL", Integer)
    AC1_RAC = Column("1ARAC", Integer)
    
    CCseats = Column(Integer)
    CCCF = Column(Integer)
    CCWL = Column(Integer)
    CCRAC = Column(Integer)

class Tatkalseatavailability(Base):
    __tablename__ = "Tatkalseatavailability"
    __table_args__ = (
        PrimaryKeyConstraint("RouteID", "Trainno", "Date"),
    )
    RouteID = Column(BigInteger, ForeignKey("Route.RouteID", ondelete="CASCADE"))
    Trainno = Column(Integer, ForeignKey("Route.Trainno", ondelete="CASCADE"))
    Date = Column(Date)
    
    SLseats = Column(Integer)
    SLCF = Column(Integer)
    SLWL = Column(Integer)
    SLRAC = Column(Integer)
    
    AC3_seats = Column("3Aseats", Integer)
    AC3_CF = Column("3ACF", Integer)
    AC3_WL = Column("3AWL", Integer)
    AC3_RAC = Column("3ARAC", Integer)
    
    AC2_seats = Column("2Aseats", Integer)
    AC2_CF = Column("2ACF", Integer)
    AC2_WL = Column("2AWL", Integer)
    AC2_RAC = Column("2ARAC", Integer)
    
    AC1_seats = Column("1Aseats", Integer)
    AC1_CF = Column("1ACF", Integer)
    AC1_WL = Column("1AWL", Integer)
    AC1_RAC = Column("1ARAC", Integer)
    
    CCseats = Column(Integer)
    CCCF = Column(Integer)
    CCWL = Column(Integer)
    CCRAC = Column(Integer)

class Ticket(Base):
    __tablename__ = "Ticket"
    __table_args__ = (
        PrimaryKeyConstraint("PNR", "PassengerID"),
    )
    PNR = Column(BigInteger)
    PassengerID = Column(Integer, ForeignKey("Passengerdetails.PassengerID"))
    ID = Column(String(100), ForeignKey("Userdetails.ID"))
    Category = Column(String(100))
    Bookingtype = Column(String(100))
    Trainno = Column(Integer, ForeignKey("Traindetails.Trainno"))
    Status = Column(String(25))
    Seat = Column(Integer)
    Boarding = Column(String(10), ForeignKey("Station.Stationcode"))
    Boardingtime = Column(Time)
    Destination = Column(String(10), ForeignKey("Station.Stationcode"))
    Arrivaltime = Column(Time)
    Date = Column(Date)
    Price = Column(Integer)
