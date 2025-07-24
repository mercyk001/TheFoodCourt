#!/usr/bin/env python3

"""
Test script to create sample order data for testing the orders dashboard
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from models import db, Order, Customer, Restaurant
from datetime import datetime

def create_test_data():
    with app.app_context():
        print("Creating test data...")
        
        # Check if we have restaurants and customers
        restaurants = Restaurant.query.all()
        customers = Customer.query.all()
        
        print(f"Found {len(restaurants)} restaurants")
        print(f"Found {len(customers)} customers") 
        
        if not restaurants or not customers:
            print("Need restaurants and customers to create test orders")
            return
        
        # Get first restaurant and customer for testing
        restaurant = restaurants[0]
        customer = customers[0]
        
        print(f"Using restaurant: {restaurant.name} (ID: {restaurant.id})")
        print(f"Using customer: {customer.username} (ID: {customer.id})")
        
        # Create multiple test orders with different statuses
        test_orders = [
            {"status": "pending", "total": 250.00},
            {"status": "accepted", "total": 150.75},
            {"status": "preparing", "total": 300.50},
            {"status": "ready", "total": 175.25},
        ]
        
        created_orders = []
        
        for i, order_data in enumerate(test_orders):
            test_order = Order(
                customer_id=customer.id,
                restaurant_id=restaurant.id,
                order_time=datetime.utcnow(),
                order_status=order_data["status"],
                is_confirmed=True,
                total_price=order_data["total"]
            )
            
            db.session.add(test_order)
            created_orders.append(test_order)
            print(f"Created order with status '{order_data['status']}' and total KES {order_data['total']}")
        
        try:
            db.session.commit()
            print(f"Successfully created {len(created_orders)} test orders!")
            
            # Verify the orders were created
            for order in created_orders:
                db.session.refresh(order)  # Refresh to get the ID
                print(f"Order {order.id}: {order.order_status} - KES {order.total_price}")
                
        except Exception as e:
            db.session.rollback()
            print(f"Error creating test data: {e}")

if __name__ == "__main__":
    create_test_data()
