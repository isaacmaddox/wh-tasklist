from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from app.config import AppConfig
from app.db import db
from app.features.list.routes import list_bp
from app.features.task.routes import task_bp


def create_app(config_class: AppConfig | None = None):
    load_dotenv()

    app = Flask(__name__)
    app.config.from_object(config_class or "app.config.DevConfig")

    CORS(app)

    db.init_app(app)

    app.register_blueprint(list_bp)
    app.register_blueprint(task_bp)

    if app.config["ENV"] == "development":
        with app.app_context():
            # db.drop_all()
            db.create_all()

    return app
