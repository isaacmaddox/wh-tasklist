from typing import Any
from flask import Blueprint, flash, jsonify, redirect, render_template, request, url_for

from app import db
from app.features.list.model import List


list_bp = Blueprint("list", __name__, url_prefix="/l")


@list_bp.post("/")
def create_list():
    data: dict[str, Any] = request.get_json()
    new_list_name: str = data.get("name", "").strip()

    if new_list_name == "":
        return jsonify({"status": "error", "error": "Please enter a list name"}), 400

    new_list = List(name=new_list_name)

    db.session.add(new_list)
    db.session.commit()

    return jsonify(
        {
            "status": "success",
            "data": new_list.to_dict(),
        }
    ), 201


@list_bp.get("/<string:list_id>")
def get_list(list_id: str):
    list = db.session.get(List, list_id)

    if list is None:
        return jsonify({"status": "error", "error": "Not found"}), 404

    return jsonify(
        {
            "status": "success",
            "data": list.to_dict(),
        }
    )
