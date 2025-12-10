from flask import Blueprint, request, jsonify
from app.db import get_db

business_bp = Blueprint("business_bp", __name__)

@business_bp.get("/")
def list_business():
    db = get_db()
    rows = db.execute("SELECT * FROM Business").fetchall()
    return jsonify([dict(r) for r in rows])

@business_bp.route("/checkBusiness", methods=["POST"])
def check_business():
    data = request.get_json()
    business_name = data.get("businessName")
    customer_service_number = data.get("customerServiceNumber")

    if not business_name or not customer_service_number:
        return jsonify({"exists": False, "error": "Missing required fields"}), 400

    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            "SELECT * FROM Business WHERE BusinessName = ? AND Phone = ?",
            (business_name, customer_service_number),
        )
        result = cursor.fetchone()

        if result:
            return jsonify({"exists": True}), 200
        else:
            return jsonify({"exists": False}), 200

    except Exception as e:
        print("Database error:", e)
        return jsonify({"exists": False, "error": "Server error"}), 500


@business_bp.get("/list")
def list_businesses():
    db = get_db()
    rows = db.execute("SELECT BusinessID, BusinessName FROM Business").fetchall()

    return jsonify({
        "success": True,
        "businesses": [dict(r) for r in rows]
    })


@business_bp.get("/search")
def search_business():
    query = request.args.get("query", "").strip()

    if len(query) < 2:
        return jsonify({"success": True, "businesses": []})

    db = get_db()
    rows = db.execute("""
        SELECT BusinessID, BusinessName, BusinessEmail 
        FROM Business
        WHERE BusinessName LIKE ?
        LIMIT 20
    """, (f"%{query}%",)).fetchall()

    return jsonify({
        "success": True,
        "businesses": [dict(row) for row in rows]
    })
