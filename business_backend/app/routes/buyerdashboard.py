from flask import Blueprint, jsonify, request
from ..db import get_db

buyer_dashboard_bp = Blueprint("buyer_dashboard_bp", __name__)


# ---------------------------------------------------
# 1. Get Buyer Profile
# ---------------------------------------------------
@buyer_dashboard_bp.get("/buyer/<email>")
def get_buyer(email):
    db = get_db()
    row = db.execute("""
        SELECT 
            b.BuyerEmail AS email,
            b.FName,
            b.LName,
            b.RegistrationDate,
            a.street_num,
            a.streetname,
            z.city,
            z.state,
            z.zipcode
        FROM Buyer b
        JOIN Address a ON b.address_id = a.address_id
        JOIN Zipcode_Info z ON a.zipcode = z.zipcode
        WHERE b.BuyerEmail = ?
    """, (email,)).fetchone()

    return jsonify(dict(row)) if row else ({"error": "Buyer not found"}, 404)


# ---------------------------------------------------
# 2. Get Buyer Orders
# ---------------------------------------------------
@buyer_dashboard_bp.get("/buyer/orders/<email>")
def get_orders(email):
    db = get_db()
    rows = db.execute("""
        SELECT 
            o.OrderID,
            o.Quantity,
            o.DateCreated,
            p.Name AS ProductName,
            t.Status
        FROM Orders o
        JOIN Product p ON o.ProductID = p.ProductID
        JOIN Transactions t ON o.TransactionID = t.TransactionID
        WHERE t.BuyerEmail = ?
        ORDER BY o.DateCreated DESC;
    """, (email,)).fetchall()

    return jsonify([dict(row) for row in rows])


# ---------------------------------------------------
# 3. Recommended Products (simple version: top sellers)
# ---------------------------------------------------
@buyer_dashboard_bp.get("/buyer/recommended")
def get_recommended():
    db = get_db()
    rows = db.execute("""
        SELECT 
            p.ProductID,
            p.Name,
            p.Price,
            p.BusinessID
        FROM Product p
        ORDER BY RANDOM()
        LIMIT 10;
    """).fetchall()

    return jsonify([dict(row) for row in rows])


# ---------------------------------------------------
# 4. Product Search
# ---------------------------------------------------
@buyer_dashboard_bp.get("/products/search")
def search_products():
    q = request.args.get("q", "")
    db = get_db()

    rows = db.execute("""
        SELECT ProductID, Name, Price, BusinessID
        FROM Product
        WHERE Name LIKE ?
        ORDER BY Name ASC
        LIMIT 25;
    """, (f"%{q}%",)).fetchall()

    return jsonify([dict(row) for row in rows])



@buyer_dashboard_bp.route("/checkout", methods=["POST"])
def checkout():
    data = request.get_json()
    buyer_email = data.get("buyerEmail")
    cart = data.get("cart")  # dictionary keyed by ProductID
    card = data.get("card")  # card form submission

    if not buyer_email or not cart:
        return jsonify({"success": False, "message": "Missing data"}), 400

    db = get_db()
    cursor = db.cursor()

    try:
        # ----------------------------------------------------
        # 1. Save or update credit card info
        # ----------------------------------------------------
        cursor.execute("SELECT * FROM Credit_Cards WHERE credit_card_num = ?", 
                       (card["credit_card_num"],))
        existing = cursor.fetchone()

        if existing:
            cursor.execute("""
                UPDATE Credit_Cards 
                SET card_type=?, expire_month=?, expire_year=?, security_code=?
                WHERE credit_card_num=?
            """, (
                card["card_type"], card["expire_month"], card["expire_year"],
                card["security_code"], card["credit_card_num"]
            ))
        else:
            cursor.execute("""
                INSERT INTO Credit_Cards (credit_card_num, card_type, expire_month, expire_year, 
                security_code, owner_email)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                card["credit_card_num"], card["card_type"], card["expire_month"],
                card["expire_year"], card["security_code"], buyer_email
            ))

        # ----------------------------------------------------
        # 2. Create a transaction
        # ----------------------------------------------------
        total = 0
        for item in cart.values():
            total += item["Price"] * item["Quantity"]

        cursor.execute("""
            INSERT INTO Transactions (Transaction_Date, Total, BuyerEmail, Status)
            VALUES (datetime('now'), ?, ?, 'Completed')
        """, (total, buyer_email))
        transaction_id = cursor.lastrowid

        # ----------------------------------------------------
        # 3. Create order entries + update business balances
        # ----------------------------------------------------
        for item in cart.values():
            cursor.execute("""
                INSERT INTO Orders (Quantity, DateCreated, ProductID, TransactionID)
                VALUES (?, datetime('now'), ?, ?)
            """, (item["Quantity"], item["ProductID"], transaction_id))

            # Update the business account balance
            cursor.execute(
                "UPDATE Business SET AccountBalance = AccountBalance + ? WHERE BusinessID = ?",
                (item["Price"] * item["Quantity"], item["BusinessID"])
            )

            # Decrease inventory
            cursor.execute(
                "UPDATE Product SET Quantity = Quantity - ? WHERE ProductID = ?",
                (item["Quantity"], item["ProductID"])
            )

        db.commit()

        return jsonify({
            "success": True,
            "message": "Checkout successful",
            "transaction_id": transaction_id
        })

    except Exception as e:
        print("Checkout error:", e)
        db.rollback()
        return jsonify({"success": False, "message": "Server error"}), 500


@buyer_dashboard_bp.get("/card/<email>")
def get_card(email):
    db = get_db()
    card = db.execute(
        "SELECT * FROM Credit_Cards WHERE owner_email = ?", (email,)
    ).fetchone()

    if card is None:
        return jsonify({"success": False, "card": None}), 200

    return jsonify({
        "success": True,
        "card": dict(card)
    }), 200