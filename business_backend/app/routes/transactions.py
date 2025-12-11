from flask import Blueprint, jsonify
from app.db import get_db

transactions_bp = Blueprint("transaction", __name__)

@transactions_bp.get("/")
def list_transactions():
    db = get_db()
    rows = db.execute('SELECT * FROM Transactions').fetchall()
    return jsonify([dict(r) for r in rows])

