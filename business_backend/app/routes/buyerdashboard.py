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
            p.Price
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
        SELECT ProductID, Name, Price
        FROM Product
        WHERE Name LIKE ?
        ORDER BY Name ASC
        LIMIT 25;
    """, (f"%{q}%",)).fetchall()

    return jsonify([dict(row) for row in rows])



