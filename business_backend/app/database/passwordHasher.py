import sqlite3
import bcrypt
import os

APP_DIR = os.path.dirname(os.path.abspath(os.path.dirname(__file__)))
DB_PATH = os.path.join(APP_DIR, "database", "NLionBusiness.db")

def migrate_passwords():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Add unhashedPassword column if it does not exist
    cursor.execute("PRAGMA table_info(Registered_User)")
    columns = [col[1] for col in cursor.fetchall()]

    if "unhashedPassword" not in columns:
        print("Adding unhashedPassword column...")
        cursor.execute("ALTER TABLE Registered_User ADD COLUMN unhashedPassword TEXT")

    # 2. Read all users
    cursor.execute("SELECT Email, Password FROM Registered_User")
    users = cursor.fetchall()

    # 3. Migrate passwords
    print("Hashing passwords...")
    for email, old_password in users:

        # Skip if password already hashed (bcrypt hashes always start with $2)
        if old_password.startswith("$2"):
            print(f"Skipping {email} (already hashed)")
            continue

        # Store the original password in unhashedPassword
        cursor.execute("""
            UPDATE Registered_User
            SET unhashedPassword = ?
            WHERE Email = ?
        """, (old_password, email))

        # Hash the password using bcrypt
        hashed = bcrypt.hashpw(old_password.encode("utf-8"), bcrypt.gensalt())

        # Save hashed password back into Password column
        cursor.execute("""
            UPDATE Registered_User
            SET Password = ?
            WHERE Email = ?
        """, (hashed.decode("utf-8"), email))

        print(f"Migrated: {email}")

    conn.commit()
    conn.close()
    print("\nMigration complete! All passwords are now hashed.")

if __name__ == "__main__":
    migrate_passwords()