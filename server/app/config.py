import os
from dotenv import load_dotenv

load_dotenv()

class AppConfig:
    SECRET_KEY = os.getenv("APP_SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = os.getenv("APP_DATABASE_URI")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class DevConfig(AppConfig):
    ENV = "development"
    DEBUG = True