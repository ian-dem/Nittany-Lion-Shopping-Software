from datetime import date, datetime
from flask import Blueprint, jsonify, request
from app.db import get_db

review_bp = Blueprint("review", __name__)

@review_bp.get("/")
def list_review():
    db = get_db()
    rows = db.execute("SELECT * FROM Review").fetchall()
    return jsonify([dict(r) for r in rows])


# ----------------------------------------------------------
# GET all reviews for a product
# ----------------------------------------------------------
@review_bp.get("/product/<int:product_id>")
def get_reviews(product_id):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT ReviewID, Rating, Text, DateCreated, BuyerEmail
        FROM Review
        WHERE ProductID = ?
        ORDER BY DateCreated DESC
    """, (product_id,))

    rows = cur.fetchall()
    conn.close()

    return jsonify([dict(r) for r in rows])


# ----------------------------------------------------------
# GET average rating + review count
# ----------------------------------------------------------
@review_bp.get("/stats/<int:product_id>")
def get_review_stats(product_id):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT 
            AVG(Rating) AS avg_rating,
            COUNT(*) AS total_reviews
        FROM Review
        WHERE ProductID = ?
    """, (product_id,))

    row = cur.fetchone()
    conn.close()

    return jsonify({
        "avg_rating": row["avg_rating"],
        "total_reviews": row["total_reviews"]
    })


# ----------------------------------------------------------
# POST create review
# ----------------------------------------------------------
@review_bp.post("/add")
def add_review():
    data = request.get_json()

    rating = data.get("rating")
    text = data.get("text", "")
    product_id = data.get("product_id")
    buyer_email = data.get("buyer_email")

    if not (rating and product_id and buyer_email):
        return jsonify({"success": False, "error": "Missing fields"}), 400

    conn = get_db()
    cur = conn.cursor()

    # Check if user already reviewed product (optional)
    cur.execute("""
        SELECT 1 FROM Review 
        WHERE ProductID = ? AND BuyerEmail = ?
    """, (product_id, buyer_email))

    if cur.fetchone():
        return jsonify({"success": False, "error": "Already reviewed"}), 409

    # Insert
    cur.execute("""
        INSERT INTO Review (Rating, Text, DateCreated, ProductID, BuyerEmail)
        VALUES (?, ?, ?, ?, ?)
    """, (
        rating,
        text,
        datetime.now().strftime("%Y-%m-%d"),
        product_id,
        buyer_email
    ))

    conn.commit()
    conn.close()

    return jsonify({"success": True})