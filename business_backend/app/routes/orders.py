from flask import Blueprint, jsonify
from app.db import get_db

orders_bp = Blueprint("orders", __name__)

@orders_bp.get("/")
def list_orders():
    db = get_db()
    rows = db.execute("SELECT * FROM Orders").fetchall()
    return jsonify([dict(r) for r in rows])

@orders_bp.route("/seller/<email>", methods=["GET"])
def get_orders_for_seller(email):
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        """
        SELECT
            o.OrderID,
            o.Quantity,
            o.DateCreated,
            p.Name AS ProductName,
            p.Price AS ProductPrice,
            t.BuyerEmail AS BuyerEmail,
            t.Total AS TransactionTotal,
            t.Status AS OrderStatus
        FROM Orders o
        JOIN Product p ON o.ProductID = p.ProductID
        JOIN Seller s ON p.BusinessID = s.BusinessID
        JOIN Transactions t ON o.TransactionID = t.TransactionID
        WHERE s.UserEmail = ?
        ORDER BY o.DateCreated DESC
        """,
        (email,),
    )
    orders = [dict(row) for row in cursor.fetchall()]
    return jsonify(orders)
