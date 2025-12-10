from flask import Blueprint, request, jsonify
from app.db import get_db
import sqlite3

buyer_bp = Blueprint("buyer_table", __name__)

@buyer_bp.get("/")
def list_buyer():
    db = get_db()
    rows = db.execute("SELECT * FROM Buyer").fetchall()
    return jsonify([dict(r) for r in rows])



@buyer_bp.put("/update")
def update_buyer():
    db = get_db()
    data = request.json

    old_email = data.get("oldEmail")
    new_email = data.get("email")
    new_fname = data.get("firstName")
    new_lname = data.get("lastName")
    new_password = data.get("password")  # optional

    if not old_email:
        return jsonify({"error": "oldEmail is required"}), 400

    try:
        cur = db.cursor()

        # 1. Update Registered_User table
        if new_email:
            cur.execute("""
                UPDATE Registered_User
                SET Email = ?, Password = COALESCE(?, Password)
                WHERE Email = ?
            """, (new_email, new_password, old_email))
        else:
            cur.execute("""
                UPDATE Registered_User
                SET Password = COALESCE(?, Password)
                WHERE Email = ?
            """, (new_password, old_email))

        # 2. Update Buyer table
        cur.execute("""
            UPDATE Buyer
            SET BuyerEmail = ?, FName = ?, LName = ?
            WHERE BuyerEmail = ?
        """, (new_email, new_fname, new_lname, old_email))

        db.commit()
        return jsonify({"message": "Account updated successfully"})

    except sqlite3.IntegrityError as e:
        return jsonify({"error": str(e)}), 400
