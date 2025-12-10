from flask import Blueprint, jsonify, request
from app.db import get_row, update_row, insert_row, delete_row, get_table_columns, get_tables

generic_bp = Blueprint("generic", __name__, url_prefix="/")

 # GET one row by primary key
@generic_bp.get("/table/<table>/<pk>/")
def get_record(table, pk):
    pk_name = request.args.get("pk_name", "id")

    row = get_row(table, pk_name, pk)
    if not row:
        return jsonify({"error": "Row not found"}), 404

    return jsonify(row)


# UPDATE row by primary key
@generic_bp.put("/table/<table>/<pk>")
def update_record(table, pk):
    pk_name = request.args.get("pk_name", "id")
    updated_data = request.json

    success = update_row(table, pk_name, pk, updated_data)

    if not success:
        return jsonify({"error": "Update failed"}), 400

    return jsonify({"success": True, "updated": updated_data})

# INSERT new row into a table
@generic_bp.post("/table/<table>")
def insert_record(table):
    new_data = request.json  # The JSON body sent from React

    inserted_id = insert_row(table, new_data)

    if inserted_id is None:
        return jsonify({"error": "Insert failed"}), 400

    return jsonify({"success": True, "id": inserted_id, "inserted": new_data}), 201

# DELETE a row in a table
@generic_bp.delete("/table/<table>/<pk>")
def delete_record(table, pk):
    pk_name = request.args.get("pk_name", "id")

    success = delete_row(table, pk_name, pk)

    if not success:
        return jsonify({"error": "Delete failed"}), 400

    return jsonify({"success": True, "deleted_pk": pk})


@generic_bp.get("/columns/<table>")
def get_columns(table):
    columns = get_table_columns(table)

    if columns is None:
        return jsonify({"error": "Table not found"}), 404

    return jsonify({"columns": columns})

@generic_bp.route("/tables")
def list_tables():
    # Mapping between SQL table names and blueprint route prefixes
    tables = [
        {"label": "Category",        "route": "category"},
        {"label": "Zipcode Info",    "route": "zipcode"},        # Zipcode_Info table
        {"label": "Address",         "route": "address"},
        {"label": "Tag",             "route": "tag"},
        {"label": "Registered User", "route": "users"},          # Registered_User table
        {"label": "Business",        "route": "business"},
        {"label": "Buyer",           "route": "buyer_table"},    # Buyer table
        {"label": "Help Desk",       "route": "helpdesk_table"}, # Help_Desk table
        {"label": "Transactions",    "route": "transaction"},
        {"label": "Credit Cards",    "route": "creditcards"},
        {"label": "Product",         "route": "products"},
        {"label": "Seller",          "route": "sellers"},
        {"label": "Ticket",          "route": "tickets"},
        {"label": "Orders",          "route": "orders"},
        {"label": "Review",          "route": "review"},
    ]

    return jsonify({"tables": tables})