from flask import Blueprint, jsonify
from ..db import get_db

analytics_bp = Blueprint("analytics_bp", __name__)


@analytics_bp.get("/total_sold")
def total_sold():
    db = get_db()
    data = db.execute("""
        SELECT 
            p.ProductID,
            p.Name,
            COALESCE(SUM(o.Quantity), 0) AS total_sold
        FROM Product p
        LEFT JOIN Orders o 
            ON p.ProductID = o.ProductID
        GROUP BY 
            p.ProductID,
            p.Name
        ORDER BY 
            total_sold DESC;
    """).fetchall()
    return jsonify([dict(row) for row in data])

@analytics_bp.get("/sold_per_month")
def sold_per_month():
    db = get_db()
    data = db.execute("""
        SELECT strftime('%Y-%m', t.Transaction_Date) AS month,
               p.ProductID,
               p.Name,
               SUM(o.Quantity) AS units_sold
        FROM Orders o
        JOIN Transactions t ON o.TransactionID = t.TransactionID
        JOIN Product p ON o.ProductID = p.ProductID
        GROUP BY month, p.ProductID
        ORDER BY month;
    """).fetchall()
    return jsonify([dict(row) for row in data])

@analytics_bp.get("/revenue")
def revenue():
    db = get_db()
    data = db.execute("""
        SELECT p.ProductID,
               p.Name,
               SUM(o.Quantity * p.Price) AS revenue
        FROM Product p
        JOIN Orders o ON p.ProductID = o.ProductID
        GROUP BY p.ProductID
    """).fetchall()
    return jsonify([dict(row) for row in data])

@analytics_bp.get("/monthly_revenue")
def monthly_revenue():
    db = get_db()
    data = db.execute("""
        SELECT strftime('%Y-%m', t.Transaction_Date) AS month,
               SUM(o.Quantity * p.Price) AS revenue
        FROM Orders o
        JOIN Transactions t ON o.TransactionID = t.TransactionID
        JOIN Product p ON o.ProductID = p.ProductID
        GROUP BY month
        ORDER BY month;
    """).fetchall()
    return jsonify([dict(row) for row in data])
