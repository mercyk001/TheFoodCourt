from app import app
from models import db, Table

with app.app_context():
    print("Clearing existing data...")
    db.drop_all()
    db.create_all()

    print("Seeding tables...")

    # Tables - 100 tables categorized by capacity
    tables = []
    
    # Small tables (2 people) - 40 tables
    for i in range(1, 41):
        table = Table(table_number=f'S{i:02d}', capacity=2, status='available')
        tables.append(table)
    
    # Medium tables (4 people) - 30 tables  
    for i in range(1, 31):
        table = Table(table_number=f'M{i:02d}', capacity=4, status='available')
        tables.append(table)
    
    # Large tables (6 people) - 20 tables
    for i in range(1, 21):
        table = Table(table_number=f'L{i:02d}', capacity=6, status='available')
        tables.append(table)
    
    # Extra Large tables (8 people) - 10 tables
    for i in range(1, 11):
        table = Table(table_number=f'XL{i:02d}', capacity=8, status='available')
        tables.append(table)
    
    db.session.add_all(tables)
    db.session.commit()

    print("Database seeded successfully!")
    print(f"Created {len(tables)} tables:")
    print("- Small tables (2 people): 40 tables (S01-S40)")
    print("- Medium tables (4 people): 30 tables (M01-M30)")
    print("- Large tables (6 people): 20 tables (L01-L20)")
    print("- Extra Large tables (8 people): 10 tables (XL01-XL10)")
    print(f"Total: {len(tables)} tables")
