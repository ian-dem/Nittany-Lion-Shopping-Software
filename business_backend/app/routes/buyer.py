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
    new_password = data.get("password")

    if not old_email:
        return jsonify({"error": "oldEmail is required"}), 400

    try:
        cur = db.cursor()

        # ---------------------------------------
        # 1. Buyer 
        # ---------------------------------------
        cur.execute("""
            UPDATE Buyer
            SET BuyerEmail = ?, FName = ?, LName = ?
            WHERE BuyerEmail = ?
        """, (new_email, new_fname, new_lname, old_email))

        # ---------------------------------------
        # 2. Seller
        # ---------------------------------------
        cur.execute("""
            UPDATE Seller
            SET UserEmail = ?
            WHERE UserEmail = ?
        """, (new_email, old_email))

        # ---------------------------------------
        # 3. Business
        # ---------------------------------------
        cur.execute("""
            UPDATE Business
            SET BusinessEmail = ?
            WHERE BusinessEmail = ?
        """, (new_email, old_email))

        # ---------------------------------------
        # 4. Credit Cards
        # ---------------------------------------
        cur.execute("""
            UPDATE Credit_Cards
            SET owner_email = ?
            WHERE owner_email = ?
        """, (new_email, old_email))

        # ---------------------------------------
        # 5. Help Desk
        # ---------------------------------------
        cur.execute("""
            UPDATE Help_Desk
            SET HelpDeskEmail = ?
            WHERE HelpDeskEmail = ?
        """, (new_email, old_email))

        # ---------------------------------------
        # 6. Ticket (UserEmail)
        # ---------------------------------------
        cur.execute("""
            UPDATE Ticket
            SET UserEmail = ?
            WHERE UserEmail = ?
        """, (new_email, old_email))

        # Ticket (HelpDeskEmail)
        cur.execute("""
            UPDATE Ticket
            SET HelpDeskEmail = ?
            WHERE HelpDeskEmail = ?
        """, (new_email, old_email))

        # ---------------------------------------
        # 7. Transactions (FK to Buyer)
        # ---------------------------------------
        cur.execute("""
            UPDATE Transactions
            SET BuyerEmail = ?
            WHERE BuyerEmail = ?
        """, (new_email, old_email))

        # ---------------------------------------
        # 8. Review (FK to Buyer)
        # ---------------------------------------
        cur.execute("""
            UPDATE Review
            SET BuyerEmail = ?
            WHERE BuyerEmail = ?
        """, (new_email, old_email))

        # ---------------------------------------
        # 9. Registered_User (PARENT - update LAST)
        # ---------------------------------------
        if new_password:
            cur.execute("""
                UPDATE Registered_User
                SET Email = ?, Password = ?
                WHERE Email = ?
            """, (new_email, new_password, old_email))
        else:
            cur.execute("""
                UPDATE Registered_User
                SET Email = ?
                WHERE Email = ?
            """, (new_email, old_email))

        db.commit()

        return jsonify({"message": "Account updated successfully"})

    except sqlite3.IntegrityError as e:
        db.rollback()
        return jsonify({"error": str(e)}), 400

