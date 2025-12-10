import sqlite3
import bcrypt
import os

APP_DIR = os.path.dirname(os.path.abspath(os.path.dirname(__file__)))
DB_PATH = os.path.join(APP_DIR, "database", "NLionBusiness.db")

db = sqlite3.connect(DB_PATH)
cursor = db.cursor()

cursor.execute("""
        UPDATE Category
        SET ParentCategoryID = NULL
        WHERE ParentCategoryID = '';
               """)

db.commit()
db.close()
print("\nTask complete, cleaned up category table.")