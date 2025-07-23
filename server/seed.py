from app import app
from models import db, Owner, Restaurant, Menu

with app.app_context():
    # Optional: Clear existing data
    Menu.query.delete()
    Restaurant.query.delete()
    Owner.query.delete()

    # Seed Owners
    owner1 = Owner(
        id=1,
        username='joseph',
        email='joseph@example.com',
        password_hash='hashed_password1',
        phone_number='0712345678'
    )
    owner2 = Owner(
        id=2,
        username='adeola',
        email='adeola@example.com',
        password_hash='hashed_password2',
        phone_number='0798765432'
    )

    db.session.add_all([owner1, owner2])
    db.session.commit()

    # Seed Restaurants and Menus
    seed_data = [
        {
            "id": 1,
            "name": "Mama Africa Kitchen",
            "cuisine": "Kenyan",
            "owner_id": 1,
            "menu": [
                { "id": 101, "name": "Nyama Choma", "category": "Main", "price": 800, "img": "https://travelfoodatlas.com/wp-content/uploads/2023/12/Nyama-Choma-Served-480x480.jpg" },
                { "id": 102, "name": "Ugali & Sukuma", "category": "Main", "price": 250, "img": "https://upload.wikimedia.org/wikipedia/commons/4/48/Ugali_%26_Sukuma_Wiki.jpg" },
                { "id": 103, "name": "Mandazi", "category": "Snack", "price": 80, "img": "https://fremu.co.uk/wp-content/uploads/2023/09/mandazi.webp" },
                { "id": 104, "name": "Githeri", "category": "Main", "price": 300, "img": "https://i1.wp.com/winniespurehealth.co.ke/wp-content/uploads/2021/02/A9A1476-1.jpg?resize=500%2C500&ssl=1" },
                { "id": 105, "name": "Chapati Beans", "category": "Kids", "price": 200, "img": "https://images.bolt.eu/store/2024/2024-11-25/0e6a034e-a32a-4906-9deb-0f64ae634cb8.jpeg" }
            ]
        },
        {
            "id": 2,
            "name": "Lagos Bites",
            "cuisine": "Nigerian",
            "owner_id": 2,
            "menu": [
                { "id": 201, "name": "Jollof Rice", "category": "Main", "price": 600, "img": "https://www.yumlista.com/storage/recipes/AiEgolJU4zflIQ03P49S9Czgbtjp0DptdYOa2nM5.jpg" },
                { "id": 202, "name": "Puff Puff", "category": "Snack", "price": 150, "img": "https://www.africanbites.com/wp-content/uploads/2012/11/IMG_5013.jpg" },
                { "id": 203, "name": "Egusi Soup & Fufu", "category": "Main", "price": 750, "img": "https://assets.epicurious.com/photos/5e2f6334b1633d0009d08cc4/1:1/w_2560%2Cc_limit/EgusiStew_HERO_011620_243.jpg" },
                { "id": 204, "name": "Moi Moi", "category": "Snack", "price": 180, "img": "https://images.squarespace-cdn.com/content/v1/5f61fdbf6089cf5861823eb9/1611349931599-3T2LJVRJ0VGDTV6SH1SV/DSC_0797.jpg" },
                { "id": 205, "name": "Nkwobi", "category": "Main", "price": 900, "img": "https://dooneyskitchen.com/wp-content/uploads/2021/03/nkwobi-2.jpg" }
            ]
        }
    ]

    for rest in seed_data:
        restaurant = Restaurant(
            id=rest["id"],
            name=rest["name"],
            cuisine=rest["cuisine"],
            owner_id=rest["owner_id"]
        )
        db.session.add(restaurant)

        for item in rest["menu"]:
            menu_item = Menu(
                id=item["id"],
                name=item["name"],
                category=item["category"],
                price=item["price"],
                image_url=item["img"],
                restaurant_id=rest["id"],
                meal_id=1  # Optional: if you want to associate with an existing meal
            )
            db.session.add(menu_item)

    db.session.commit()
    print("✅ Seeded database with owners, restaurants, and menus!")
