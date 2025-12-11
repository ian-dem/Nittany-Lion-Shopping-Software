from flask import Blueprint, request, jsonify
from app.db import get_db

products_bp = Blueprint("product", __name__)

@products_bp.get("/")
def list_products():

    db = get_db()
    rows = db.execute("SELECT * FROM Product").fetchall()
    return jsonify([dict(r) for r in rows])

@products_bp.route("/seller/<email>", methods=["GET"])
def get_products_for_seller(email):
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        """
        SELECT
            p.ProductID,
            p.Name,
            p.Description,
            p.Price,
            p.Quantity,
            c.CategoryName,
            p.CategoryID
        FROM Product p
        JOIN Seller s ON p.BusinessID = s.BusinessID
        LEFT JOIN Category c ON p.CategoryID = c.CategoryID
        WHERE s.UserEmail = ?
        """,
        (email,),
    )
    products = [dict(row) for row in cursor.fetchall()]
    return jsonify(products)

@products_bp.route("/create", methods=["POST"])
def create_product():
    data = request.get_json()
    name = data.get("name")
    description = data.get("description")
    quantity = data.get("quantity")
    price = data.get("price")
    category_id = data.get("categoryID")
    tag_id = data.get("tagID", None)
    business_id = data.get("businessID")

    if not all([name, description, quantity, price, category_id, business_id]):
        return jsonify({"success": False, "error": "Missing required fields"}), 400

    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("""
            INSERT INTO Product (Name, Description, Quantity, TagID, CategoryID, Price, BusinessID)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (name, description, quantity, tag_id, category_id, price, business_id))
        db.commit()
        return jsonify({"success": True}), 201
    except Exception as e:
        print("Error inserting product:", e)
        return jsonify({"success": False, "error": "Database insert failed"}), 500



@products_bp.route("/update/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    data = request.get_json()
    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
        UPDATE Product
        SET Name=?, Description=?, Quantity=?, Price=?
        WHERE ProductID=?
    """, (data["name"], data["description"], data["quantity"], data["price"], product_id))
    db.commit()
    return jsonify({"success": True})

@products_bp.route("/delete/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM Product WHERE ProductID = ?", (product_id,))
    db.commit()
    return jsonify({"success": True})
