import sqlite3
import os

db_path = 'cab_booking.db'
if not os.path.exists(db_path):
    print(f"Database {db_path} not found")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, role FROM user")
    rows = cursor.fetchall()
    print("--- USERS ---")
    for row in rows:
        print(f"ID: {row[0]}, Email: {row[1]}, Role: {row[2]}")
    print("--- END ---")
    conn.close()
