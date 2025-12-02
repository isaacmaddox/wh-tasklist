from datetime import datetime
from uuid import uuid4
from sqlalchemy import DateTime, String
from sqlalchemy_serializer import SerializerMixin
from app.db import db
from sqlalchemy.orm import Mapped, mapped_column, relationship


class List(db.Model, SerializerMixin):
    __tablename__ = "lists"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=str(uuid4()))
    name: Mapped[str]
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

    tasks = relationship("Task", back_populates="list", cascade="all, delete-orphan")
