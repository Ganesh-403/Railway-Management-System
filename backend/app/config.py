import os
from dotenv import load_dotenv

# Find the directory of this file and locate the backend root
app_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(app_dir)
env_path = os.path.join(backend_dir, ".env")

load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:Ganesh%40123@localhost:3306/Railway")
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-for-development")
MAIL_USERNAME = os.getenv("MAIL_USERNAME", "")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "")
MAIL_FROM = os.getenv("MAIL_FROM", "")
MAIL_PORT = int(os.getenv("MAIL_PORT", "465"))
MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
