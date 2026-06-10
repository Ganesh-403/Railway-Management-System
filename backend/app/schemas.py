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
    DOB: str  # YYYY-MM-DD format
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
    foodtype: str
    age: int

class TicketBookingRequest(BaseModel):
    tickets: int
    passengers: List[PassengerInput]

class PNRStatusRequest(BaseModel):
    PNR: int

class RunningStatusRequest(BaseModel):
    running: int
    Date: str
