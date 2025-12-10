from flask import Blueprint, jsonify
from app.db import get_db

category_bp = Blueprint("category", __name__)

def build_category_tree(db, parent_id=None):
    if parent_id is None:
        rows = db.execute(
            """
            SELECT CategoryID, CategoryName 
            FROM Category 
            WHERE ParentCategoryID IS NULL OR ParentCategoryID = ''
            """
        ).fetchall()
    else:
        rows = db.execute(
            """
            SELECT CategoryID, CategoryName 
            FROM Category 
            WHERE ParentCategoryID = ?
            """,
            (parent_id,)
        ).fetchall()

    tree = []
    for row in rows:
        children = build_category_tree(db, row["CategoryID"])
        tree.append({
            "CategoryID": row["CategoryID"],
            "CategoryName": row["CategoryName"],
            "children": children
        })
    return tree


@category_bp.get("/")
def list_category():
    db = get_db()
    rows = db.execute("SELECT * FROM Category").fetchall()
    return jsonify([dict(r) for r in rows])


@category_bp.get("/categories")
def get_categories():
    db = get_db()
    rows = db.execute("""
        SELECT CategoryID, CategoryName
        FROM Category
        WHERE ParentCategoryID IS NULL
    """).fetchall()

    return jsonify([dict(r) for r in rows])

@category_bp.get("/categories/<int:cat_id>/children")
def get_child_categories(cat_id):
    db = get_db()
    rows = db.execute("""
        SELECT CategoryID, CategoryName
        FROM Category
        WHERE ParentCategoryID = ?
    """, (cat_id,)).fetchall()

    return jsonify([dict(r) for r in rows])



@category_bp.get("/tree")
def get_category_tree():
    db = get_db()
    return jsonify(build_category_tree(db))

@category_bp.get("/products/<int:category_id>")
def get_products_by_category(category_id):
    db = get_db()

    # Recursively collect descendants
    def get_all_descendants(cid):
        children = db.execute(
            "SELECT CategoryID FROM Category WHERE ParentCategoryID = ?",
            (cid,)
        ).fetchall()

        ids = [cid]
        for child in children:
            ids.extend(get_all_descendants(child["CategoryID"]))
        return ids

    all_ids = get_all_descendants(category_id)
    placeholders = ",".join("?" for _ in all_ids)

    products = db.execute(
        f"SELECT * FROM Product WHERE CategoryID IN ({placeholders})",
        all_ids
    ).fetchall()

    return jsonify([dict(p) for p in products])
