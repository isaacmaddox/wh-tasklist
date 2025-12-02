from datetime import datetime
from uuid import uuid4
from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy_serializer import SerializerMixin
from app.db import db
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Task(db.Model, SerializerMixin):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=str(uuid4()))
    name: Mapped[str]
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    due_date: Mapped[datetime] = mapped_column(DateTime)

    list_id: Mapped[int] = mapped_column(ForeignKey("lists.id"), nullable=False)
    list = relationship("List", back_populates="tasks")
