#!/usr/bin/env python3
import requests
import json

# Base URL
BASE_URL = "http://localhost:5555"

def test_endpoints():
    session = requests.Session()
    
    # Login data - adjust as needed
    login_data = {
        "email": "shellylovescookies_123@dd",
        "password": "123456"  # You'll need to provide the correct password
    }
    
    print("1. Testing login...")
    try:
        login_response = session.post(f"{BASE_URL}/users/login", json=login_data)
        print(f"Login Status: {login_response.status_code}")
        if login_response.status_code != 200:
            print(f"Login failed: {login_response.text}")
            return
        print("Login successful!")
        
        # Test restaurant stats
        print("\n2. Testing restaurant stats...")
        restaurant_response = session.get(f"{BASE_URL}/dashboard/stats/restaurants")
        print(f"Restaurant Stats Status: {restaurant_response.status_code}")
        print(f"Restaurant Stats Response: {restaurant_response.text}")
        
        # Test order stats
        print("\n3. Testing order stats...")
        order_response = session.get(f"{BASE_URL}/dashboard/stats/orders")
        print(f"Order Stats Status: {order_response.status_code}")
        print(f"Order Stats Response: {order_response.text}")
        
        # Test booking stats
        print("\n4. Testing booking stats...")
        booking_response = session.get(f"{BASE_URL}/dashboard/stats/bookings")
        print(f"Booking Stats Status: {booking_response.status_code}")
        print(f"Booking Stats Response: {booking_response.text}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_endpoints()
