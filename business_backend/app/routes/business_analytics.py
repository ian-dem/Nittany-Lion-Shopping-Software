from flask import Blueprint, jsonify
from ..db import get_db

business_analytics_bp = Blueprint("business_analytics_bp", __name__)

# 1. Total number of products per business
@business_analytics_bp.get("/products_per_business")
def products_per_business():
    db = get_db()
    data = db.execute("""
        SELECT b.BusinessID,
               b.BusinessName,
               COUNT(p.ProductID) AS product_count
        FROM Business b
        LEFT JOIN Product p ON p.BusinessID = b.BusinessID
        GROUP BY b.BusinessID
        ORDER BY product_count DESC;
    """).fetchall()

    return jsonify([dict(row) for row in data])


# 2. Total revenue per business
@business_analytics_bp.get("/revenue_per_business")
def revenue_per_business():
    db = get_db()
    data = db.execute("""
        SELECT b.BusinessID,
               b.BusinessName,
               COALESCE(SUM(o.Quantity * p.Price), 0) AS revenue
        FROM Business b
        LEFT JOIN Product p ON p.BusinessID = b.BusinessID
        LEFT JOIN Orders o ON p.ProductID = o.ProductID
        GROUP BY b.BusinessID
        ORDER BY revenue DESC;
    """).fetchall()

    return jsonify([dict(row) for row in data])


# 3. Monthly revenue per business
@business_analytics_bp.get("/monthly_revenue")
def monthly_revenue():
    db = get_db()
    data = db.execute("""
        SELECT b.BusinessID,
               b.BusinessName,
               strftime('%Y-%m', t.Transaction_Date) AS month,
               COALESCE(SUM(o.Quantity * p.Price), 0) AS revenue
        FROM Business b
        LEFT JOIN Product p ON p.BusinessID = b.BusinessID
        LEFT JOIN Orders o ON p.ProductID = o.ProductID
        LEFT JOIN Transactions t ON o.TransactionID = t.TransactionID
        GROUP BY b.BusinessID, month
        ORDER BY month ASC, revenue DESC;
    """).fetchall()

    return jsonify([dict(row) for row in data])
