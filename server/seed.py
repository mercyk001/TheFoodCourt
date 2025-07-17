from app import app
from models import db, Customer, Table, Reservation
from datetime import datetime, timedelta

def seed():
    with app.app_context():
        print("🌱 Clearing old data...")
        Reservation.query.delete()
        Customer.query.delete()
        Table.query.delete()

        print("👤 Creating customers...")
        c1 = Customer(username="jane_doe", phone="0712345678", email="jane@example.com", password="hashed_password_1")
        c2 = Customer(username="john_smith", phone="0723456789", email="john@example.com", password="hashed_password_2")

        db.session.add_all([c1, c2])
        db.session.commit()

        print("🪑 Creating tables...")
        t1 = Table(table_number="T1", capacity=2)
        t2 = Table(table_number="T2", capacity=4)
        t3 = Table(table_number="T3", capacity=6)

        db.session.add_all([t1, t2, t3])
        db.session.commit()

        print("📅 Creating reservations...")
        r1 = Reservation(
            customer_id=c1.id,
            table_id=t2.id,
            reservation_time=datetime.utcnow() + timedelta(hours=1),
            duration=60,
            members_count=2,
            status='confirmed'
        )

        r2 = Reservation(
            customer_id=c2.id,
            table_id=t3.id,
            reservation_time=datetime.utcnow() + timedelta(hours=2),
            duration=90,
            members_count=4,
            status='pending'
        )

        db.session.add_all([r1, r2])
        db.session.commit()

        print("✅ Seeding complete!")

if __name__ == '__main__':
    seed()
