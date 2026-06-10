from pydantic import BaseModel, EmailStr
from datetime import date, time
from typing import List, Optional

class AdminLogin(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserRegister1(BaseModel):
    username: str
    password: str
    securityquestion: str
    securityanswer: str

class UserRegister2(BaseModel):
    fname: str
    mname: Optional[str] = ""
    lname: str
    occupation: str
    DOB: str  # YYYY-MM-DD
    martialstatus: str
    country: str
    sex: str
    email: EmailStr
    mobileno: int

class UserRegister3(BaseModel):
    fno: str
    lane: str
    area: str
    state: str
    pincode: int
    city: str

class TrainSearchRequest(BaseModel):
    Startstation: str
    Endstation: str
    Date: str
    category: str

class PassengerInput(BaseModel):
    name: str
    gender: str
    foodtype: str # "No", "Veg Thali", "Non-Veg Thali", "Snack Box", "Beverage"
    age: int

class TicketBookingRequest(BaseModel):
    tickets: int
    passengers: List[PassengerInput]
    seats: List[int] # Selected seat coordinates from 1 to 40

class PNRStatusRequest(BaseModel):
    PNR: int

class RunningStatusRequest(BaseModel):
    running: int
    Date: str

# Admin CRUD Schemas
class TrainCreate(BaseModel):
    Trainno: int
    Trainname: str
    Traincategory: str
    Startstation: str
    Starttime: str # "HH:MM:SS"
    Endstation: str
    Endtime: str # "HH:MM:SS"
    Totalhalts: int
    Monday: bool
    Tuesday: bool
    Wednesday: bool
    Thursday: bool
    Friday: bool
    Saturday: bool
    Sunday: bool

class RouteCreate(BaseModel):
    RouteID: int
    Trainno: int
    Deptstation: str
    Depttime: str # "HH:MM:SS"
    Deptday: int
    Arrivalstation: str
    Arrivaltime: str # "HH:MM:SS"
    Arrivalday: int
    Stopnumber: int
