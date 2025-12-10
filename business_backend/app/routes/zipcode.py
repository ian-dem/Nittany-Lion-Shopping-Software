from flask import Blueprint, jsonify, request
from app.db import get_db

zipcode_bp = Blueprint("zipcode", __name__)

@zipcode_bp.get("/")
def list_zipcode():
    db = get_db()
    rows = db.execute("SELECT * FROM Zipcode_Info").fetchall()
    return jsonify([dict(r) for r in rows])

@zipcode_bp.get("/lookup/<int:zipcode>")
def lookup_zipcode(zipcode):
    db = get_db()

    row = db.execute(
        "SELECT city, state FROM Zipcode_Info WHERE zipcode = ?",
        (zipcode,)
    ).fetchone()

    if row:
        return jsonify({
            "success": True,
            "zipcode": zipcode,
            "city": row["city"],
            "state": row["state"]
        })

    # ZIP not found
    return jsonify({
        "success": False,
        "message": "Zipcode not found"
    })