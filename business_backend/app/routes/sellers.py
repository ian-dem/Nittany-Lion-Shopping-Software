from flask import Blueprint, jsonify
from app.db import get_db

sellers_bp = Blueprint("seller", __name__)

@sellers_bp.get("/")
def list_seller():
    db = get_db()
    rows = db.execute("SELECT * FROM Seller").fetchall()
    return jsonify([dict(r) for r in rows])

@sellers_bp.route("/<email>", methods=["GET"])
def get_seller_by_email(email):
    db = get_db()
    row = db.execute(
        "SELECT BusinessID, UserEmail FROM Seller WHERE UserEmail = ?",
        (email,)
    ).fetchone()
    if not row:
        return jsonify({"error": "Seller not found"}), 404
    return jsonify(dict(row))
