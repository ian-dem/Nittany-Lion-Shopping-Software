from flask import Blueprint, jsonify, request
from app.db import get_db
import bcrypt
from werkzeug.security import generate_password_hash

users_bp = Blueprint("user", __name__)

@users_bp.get("")
@users_bp.get("/")
def list_users():
    db = get_db()
    users = db.execute("SELECT * FROM Registered_User").fetchall()
    return jsonify([dict(u) for u in users])

@users_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "")
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"success": False, "message": "Missing fields"}), 400

    try:
        db = get_db()
        cursor = db.cursor()

        # Fetch user by email ONLY
        cursor.execute("SELECT * FROM Registered_User WHERE Email = ?", (email,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"success": False, "message": "Invalid credentials"}), 401

        stored_hash = user["Password"]

        # -------------------------------------------------
        # BCRYPT PASSWORD CHECK
        # -------------------------------------------------
        if not bcrypt.checkpw(password.encode("utf-8"), stored_hash.encode("utf-8")):
            return jsonify({"success": False, "message": "Invalid credentials"}), 401

        # Determine role
        cursor.execute("SELECT * FROM Help_Desk WHERE HelpDeskEmail = ?", (email,))
        if cursor.fetchone():
            role = "helpdesk"
        else:
            cursor.execute("SELECT * FROM Seller WHERE UserEmail = ?", (email,))
            if cursor.fetchone():
                role = "seller"
            else:
                cursor.execute("SELECT * FROM Buyer WHERE BuyerEmail = ?", (email,))
                if cursor.fetchone():
                    role = "buyer"
                else:
                    role = "unknown"

        return jsonify({"success": True, "role": role}), 200

    except Exception as e:
        print("Login error:", e)
        return jsonify({"success": False, "message": "Server error"}), 500

@users_bp.route("/role/<email>", methods=["GET"])
def get_user_role(email):
    db = get_db()
    cursor = db.cursor()

    try:
        # Check Help_Desk first
        cursor.execute("SELECT * FROM Help_Desk WHERE HelpDeskEmail = ?", (email,))
        if cursor.fetchone():
            return jsonify({"role": "helpdesk"})

        # Check Seller
        cursor.execute("SELECT * FROM Seller WHERE UserEmail = ?", (email,))
        if cursor.fetchone():
            return jsonify({"role": "seller"})

        # Check Buyer
        cursor.execute("SELECT * FROM Buyer WHERE BuyerEmail = ?", (email,))
        if cursor.fetchone():
            return jsonify({"role": "buyer"})

        # Default if not found
        return jsonify({"role": "unknown"})

    except Exception as e:
        print("Error fetching role:", e)
        return jsonify({"role": "error"}), 500

@users_bp.post("/upgradeToSeller")
def upgrade_seller():
    data = request.get_json()
    email = data.get("email")
    business_id = data.get("business_id")

    if not (email and business_id):
        return jsonify({"success": False, "error": "Missing fields"}), 400

    db = get_db()

    # Ensure user exists
    user = db.execute(
        "SELECT Email FROM Registered_User WHERE Email = ?",
        (email,)
    ).fetchone()

    if not user:
        return jsonify({"success": False, "error": "User not found"}), 404

    # Link to business
    try:
        db.execute(
            "INSERT INTO Seller (BusinessID, UserEmail) VALUES (?, ?)",
            (business_id, email)
        )
        db.commit()
    except db.IntegrityError:
        return jsonify({"success": False, "error": "Invalid business ID or user already seller"}), 400

    return jsonify({"success": True})


@users_bp.post("/registerSeller")
def register_seller():
    import bcrypt

    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    business_id = data.get("business_id")

    if not (email and password and business_id):
        return jsonify({"success": False, "error": "Missing fields"}), 400

    # --- HASH PASSWORD USING bcrypt ---
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    hashed_str = hashed.decode("utf-8")  # store as TEXT

    db = get_db()

    try:
        db.execute(
            "INSERT INTO Registered_User (Email, Password) VALUES (?, ?)",
            (email, hashed_str)
        )
    except db.IntegrityError:
        return jsonify({"success": False, "error": "Email already exists"}), 400

    try:
        db.execute(
            "INSERT INTO Seller (BusinessID, UserEmail) VALUES (?, ?)",
            (business_id, email)
        )
        db.commit()
    except db.IntegrityError:
        return jsonify({"success": False, "error": "Invalid business ID"}), 400

    return jsonify({"success": True})

    
@users_bp.post("/registerUser")
def register_user():
    import bcrypt

    data = request.get_json()

    required = ["email", "password", "fname", "lname",
                "street_num", "streetname", "zipcode", "city", "state"]

    for field in required:
        if field not in data or str(data[field]).strip() == "":
            return jsonify({"success": False, "message": f"Missing field: {field}"}), 400

    email = data["email"].strip()
    password = data["password"].strip()
    fname = data["fname"].strip()
    lname = data["lname"].strip()
    street_num = int(data["street_num"])
    streetname = data["streetname"].strip()
    zipcode = int(data["zipcode"])
    city = data["city"].strip()
    state = data["state"].strip()

    # --- HASH USING bcrypt ---
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    hashed_str = hashed.decode("utf-8")

    db = get_db()

    try:
        cur = db.cursor()
        cur.execute("BEGIN")

        # 1. Registered_User with hashed password
        cur.execute("""
            INSERT INTO Registered_User (Email, Password)
            VALUES (?, ?)
        """, (email, hashed_str))

        # 2. Zipcode_Info
        cur.execute("SELECT zipcode FROM Zipcode_Info WHERE zipcode = ?", (zipcode,))
        if cur.fetchone() is None:
            cur.execute("""
                INSERT INTO Zipcode_Info (zipcode, city, state)
                VALUES (?, ?, ?)
            """, (zipcode, city, state))

        # 3. Address
        cur.execute("""
            INSERT INTO Address (zipcode, street_num, streetname)
            VALUES (?, ?, ?)
        """, (zipcode, street_num, streetname))
        address_id = cur.lastrowid

        # 4. Buyer
        cur.execute("""
            INSERT INTO Buyer (BuyerEmail, address_id, FName, LName, RegistrationDate)
            VALUES (?, ?, ?, ?, date('now'))
        """, (email, address_id, fname, lname))

        db.commit()

        return jsonify({"success": True, "message": "User registered successfully!"})

    except Exception as e:
        db.rollback()
        print("Registration error:", e)
        return jsonify({"success": False, "message": "Server error during registration."}), 500