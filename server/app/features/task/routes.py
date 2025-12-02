from datetime import date
from flask import Blueprint, redirect, request, url_for
from sqlalchemy import select

from app.db import db
from app.features.list.model import List
from app.features.task.model import Task


task_bp = Blueprint("task", __name__, url_prefix="/<string:list_id>/t")


@task_bp.route("/", methods=["POST"])
def make_task(list_id: str):
    list = db.session.get(List, list_id)

    if list is None:
        return "List not found"

    name = request.form.get("task_name", "").strip()
    due_date_str = request.form.get("task_due_date", "").strip()
    due_date: date

    try:
        if name == "":
            return "Please enter valid data"

        due_date = date.strptime(due_date_str, "%Y-%m-%dT%H:%M")
    except Exception:
        return "Please enter valid data"

    new_task = Task(list_id=list.id, name=name, due_date=due_date)

    db.session.add(new_task)
    db.session.commit()

    return redirect(url_for("list.list_page", list_id=list.id))


@task_bp.route("/<string:task_id>/", methods=["DELETE"])
def delete_task(list_id: str, task_id: str):
    task = db.session.execute(
        select(Task).filter_by(id=task_id, list_id=list_id)
    ).scalar_one_or_none()

    if task is None:
        return "No task found"

    db.session.delete(task)
    db.session.commit()

    return "OK", 200
