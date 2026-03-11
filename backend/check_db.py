import sqlite3
import os

db_path = "./cab_booking.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM driver")
    count = cursor.fetchone()[0]
    print(f"Total drivers: {count}")
    
    cursor.execute("SELECT id, status, vehicle_info FROM driver LIMIT 10")
    drivers = cursor.fetchall()
    for d in drivers:
        print(d)
        
    cursor.execute("SELECT id, status FROM ride ORDER BY id DESC LIMIT 5")
    rides = cursor.fetchall()
    print("Recent rides:")
    for r in rides:
        print(r)
        
    conn.close()
else:
    print("Database not found.")
