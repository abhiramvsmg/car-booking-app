import sqlite3
import os

db_path = "./cab_booking.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Add columns to driver table
    try:
        cursor.execute("ALTER TABLE driver ADD COLUMN license_plate TEXT DEFAULT 'TBD-0000'")
        print("Added license_plate to driver")
    except sqlite3.OperationalError:
        print("license_plate already exists or error")

    try:
        cursor.execute("ALTER TABLE driver ADD COLUMN rating REAL DEFAULT 5.0")
        print("Added rating to driver")
    except sqlite3.OperationalError:
        print("rating already exists or error")

    # Add column to ride table
    try:
        cursor.execute("ALTER TABLE ride ADD COLUMN car_type TEXT DEFAULT 'economy'")
        print("Added car_type to ride")
    except sqlite3.OperationalError:
        print("car_type already exists or error")

    conn.commit()
    conn.close()
    print("Migration finished.")
else:
    print(f"Database {db_path} not found. init_db will create it with correct schema.")
