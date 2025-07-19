from app import app
from models import db, Owner, Customer, Restaurant, Table, Menu, Meal, Reservation, Order, OrderMeal
from datetime import datetime, timedelta

with app.app_context():
    print("Clearing existing data...")
    db.drop_all()
    db.create_all()

    print("Seeding data...")

    # Owners
    owner1 = Owner(username='samtom', email='sam@gmail.com', phone_number='0732567890', password_hash='hashed_pw1')
    owner2 = Owner(username='kiptonui', email='kiptonui@gmail.com', phone_number='0718647673', password_hash='hashed_pw2')
    db.session.add_all([owner1, owner2])
    db.session.commit()

    # Customers
    customer1 = Customer(username='Micheal', email='micheal@gmail.com', phone='0717230456', password_hash='hashed_pw3')
    customer2 = Customer(username='Mercy', email='mercy@gmail.com', phone='0720456213', password_hash='hashed_pw4')
    db.session.add_all([customer1, customer2])
    db.session.commit()

    # Restaurants
    restaurant_data = [
        ("Ocean Basket", "CBD", "Seafood", owner1),
        ("Java House", "Westlands", "Cafe", owner2),
        ("Big Square", "Karen", "Fast Food", owner1),
        ("KFC", "Lavington", "Fried Chicken", owner2),
        ("Pizza Inn", "Yaya", "Pizza", owner1),
        ("Dominos", "Thika Road", "Pizza", owner2),
    ]
    restaurants = [Restaurant(name=n, location=l, cuisine_type=c, owner=o) for n, l, c, o in restaurant_data]
    db.session.add_all(restaurants)
    db.session.commit()

    # Tables
    tables = []
    for i, restaurant in enumerate(restaurants):
        table = Table(table_number=f"T{i+1}", capacity=4 + (i % 3), status='available')
        tables.append(table)
    db.session.add_all(tables)
    db.session.commit()

    # Meals
    meal1 = Meal(name="Grilled Tilapia", food_description="Served with ugali and kachumbari")
    meal2 = Meal(name="Chicken Pizza", food_description="12-inch pizza with BBQ sauce and cheese")
    db.session.add_all([meal1, meal2])
    db.session.commit()

    # Menus with image_url
    image_urls = [
        "https://example.com/images/tilapia.jpg",
        "https://example.com/images/pizza.jpg",
        "https://example.com/images/burger.jpg",
        "https://example.com/images/fried_chicken.jpg",
        "https://example.com/images/pizza_inn.jpg",
        "https://example.com/images/dominos.jpg"
    ]

    menus = []
    for i, restaurant in enumerate(restaurants):
        meal = meal1 if i % 2 == 0 else meal2
        price = 950.0 + (i * 50)
        menu = Menu(
            meal=meal,
            restaurant=restaurant,
            name=f"{meal.name} - Special",
            description=meal.food_description,
            price=price,
            category="Main",
            image_url=image_urls[i]  # image URL goeshere
        )
        menus.append(menu)
    db.session.add_all(menus)
    db.session.commit()

    # Reservations
    reservation1 = Reservation(
        customer=customer1,
        table=tables[0],
        reservation_time=datetime.utcnow() + timedelta(hours=2),
        duration=90,
        members_count=2,
        status="confirmed"
    )
    reservation2 = Reservation(
        customer=customer2,
        table=tables[1],
        reservation_time=datetime.utcnow() + timedelta(hours=4),
        duration=60,
        members_count=3,
        status="pending"
    )
    db.session.add_all([reservation1, reservation2])
    db.session.commit()

    # Orders
    order1 = Order(
        reservation=reservation1,
        order_status='confirmed',
        is_cart=False,
        is_confirmed=True,
        estimated_serving_time=30
    )
    order2 = Order(
        reservation=reservation2,
        order_status='pending',
        is_cart=True,
        is_confirmed=False,
        estimated_serving_time=45
    )
    db.session.add_all([order1, order2])
    db.session.commit()

    # Order Meals
    meal1_price = next((m.price for m in menus if m.meal == meal1), 950.0)
    meal2_price = next((m.price for m in menus if m.meal == meal2), 1000.0)

    order_meal1 = OrderMeal(order=order1, meal=meal1, quantity=2, sub_total=meal1_price * 2)
    order_meal2 = OrderMeal(order=order2, meal=meal2, quantity=1, sub_total=meal2_price * 1)

    order1.total_price = order_meal1.sub_total
    order2.total_price = order_meal2.sub_total

    db.session.add_all([order_meal1, order_meal2])
    db.session.commit()

    print("Database seeded successfully!")
