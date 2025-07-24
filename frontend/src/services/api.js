const API_BASE_URL = 'http://localhost:5555'; // Updated to match your Flask backend port

class ApiService {
  constructor() {
    // JWT tokens are handled via HTTP-only cookies
  }

  // Helper method to make API requests
  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for JWT
      mode: 'cors', // Explicitly set CORS mode
      ...options,
    };

    // Add Authorization header if we have a token
    // Note: We're using HTTP-only cookies for JWT, so no manual token handling needed

    try {
      const response = await fetch(url, config);
      
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
        } catch {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      // Don't log 401 errors for auth checks as they're expected when not authenticated
      const isAuthCheck = endpoint === '/users/me';
      const is401Error = error.message.includes('401') || error.message.includes('Unauthorized');
      
      if (!isAuthCheck || !is401Error) {
        console.error('API Error:', error);
      }
      
      // Handle specific connection errors
      if (error.message.includes('Failed to fetch')) {
        if (error.message.includes('ERR_CONNECTION_REFUSED') || error.toString().includes('ERR_CONNECTION_REFUSED')) {
          throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please make sure your Flask backend is running.`);
        }
        throw new Error('Unable to connect to server. Please check if the backend is running and CORS is configured correctly.');
      }
      
      throw error;
    }
  }

  // Authentication methods
  async loginUser(email, password) {
    try {
      // For login, we must use credentials to set the JWT cookie
      const response = await this.makeRequest('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      console.log('Login response:', response);
      
      // The JWT token is set in HTTP-only cookies by the backend
      // No need to manually handle tokens
      return response;
    } catch (error) {
      // For login, don't fall back to no-credentials mode as it won't set cookies
      if (error.message.includes('CORS') || error.message.includes('credentials')) {
        throw new Error('Login failed due to server configuration. Please contact support.');
      }
      throw error;
    }
  }

  // Fallback method without credentials
  async makeRequestWithoutCredentials(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      mode: 'cors',
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
        } catch {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      console.error('API Error (no credentials):', error);
      throw error;
    }
  }

  async registerCustomer(userData) {
    const { name, email, password, phone } = userData;
    try {
      return await this.makeRequest('/users/register/customer', {
        method: 'POST',
        body: JSON.stringify({
          username: name,
          email,
          password,
          phone,
        }),
      });
    } catch (error) {
      // Fallback without credentials
      if (error.message.includes('CORS') || error.message.includes('credentials') || error.message.includes('Failed to fetch')) {
        console.warn('CORS issue detected, trying registration without credentials...');
        return await this.makeRequestWithoutCredentials('/users/register/customer', {
          method: 'POST',
          body: JSON.stringify({
            username: name,
            email,
            password,
            phone,
          }),
        });
      }
      throw error;
    }
  }

  async registerOwner(userData) {
    const { name, email, password, phone, restaurantName, location, cuisineType } = userData;
    try {
      return await this.makeRequest('/users/register/owner', {
        method: 'POST',
        body: JSON.stringify({
          username: name,
          email,
          password,
          phone_number: phone,
          restaurant: {
            name: restaurantName,
            location: location || 'Nairobi',
            cuisine_type: cuisineType || 'Mixed',
          },
        }),
      });
    } catch (error) {
      // Fallback without credentials
      if (error.message.includes('CORS') || error.message.includes('credentials') || error.message.includes('Failed to fetch')) {
        console.warn('CORS issue detected, trying registration without credentials...');
        return await this.makeRequestWithoutCredentials('/users/register/owner', {
          method: 'POST',
          body: JSON.stringify({
            username: name,
            email,
            password,
            phone_number: phone,
            restaurant: {
              name: restaurantName,
              location: location || 'Nairobi',
              cuisine_type: cuisineType || 'Mixed',
            },
          }),
        });
      }
      throw error;
    }
  }

  async getUserProfile() {
    try {
      return await this.makeRequest('/users/me', {
        method: 'GET',
      });
    } catch (error) {
      // If we get a 401, it means the user is not authenticated
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        throw new Error('Session expired or invalid. Please log in again.');
      }
      
      // If there's a connection error, provide more helpful message
      if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
        throw new Error('Cannot connect to server. Please ensure the backend is running.');
      }
      
      throw error;
    }
  }

  // Helper method to check if user is authenticated
  async checkAuthStatus() {
    try {
      const response = await this.getUserProfile();
      return { isAuthenticated: true, user: response.data };
    } catch (error) {
      // Don't log 401 errors as they're expected when not authenticated
      if (!error.message.includes('401') && !error.message.includes('Unauthorized')) {
        console.warn('Auth check error:', error.message);
      }
      return { isAuthenticated: false, error: error.message };
    }
  }

  // Logout method
  async logout() {
    try {
      // Try to call backend logout endpoint if it exists
      await this.makeRequest('/users/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Backend logout failed:', error.message);
    } finally {
      // HTTP-only cookies are cleared by the backend logout endpoint
      // No manual token cleanup needed
    }
  }

  async updateUserProfile(userData) {
    return this.makeRequest('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  // Restaurant methods
  async getRestaurants() {
    return this.makeRequest('/restaurants', {
      method: 'GET',
    });
  }

  async createRestaurant(restaurantData) {
    return this.makeRequest('/restaurants', {
      method: 'POST',
      body: JSON.stringify(restaurantData),
    });
  }

  async updateRestaurant(restaurantId, restaurantData) {
    return this.makeRequest(`/restaurants/${restaurantId}`, {
      method: 'PATCH',
      body: JSON.stringify(restaurantData),
    });
  }

  async deleteRestaurant(restaurantId) {
    return this.makeRequest(`/restaurants/${restaurantId}`, {
      method: 'DELETE',
    });
  }

  async getUserRestaurants() {
    return this.makeRequest('/restaurants/my', {
      method: 'GET',
    });
  }

  // Order methods
  async getOrders() {
    return this.makeRequest('/api/orders', {
      method: 'GET',
    });
  }

  async createOrder(orderData) {
    return this.makeRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(orderId, status) {
    return this.makeRequest(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Dashboard methods
  async getRestaurantStats() {
    return this.makeRequest('/dashboard/stats/restaurants', {
      method: 'GET',
    });
  }

  async getOrderStats() {
    return this.makeRequest('/dashboard/stats/orders', {
      method: 'GET',
    });
  }

  async getBookingStats() {
    return this.makeRequest('/dashboard/stats/bookings', {
      method: 'GET',
    });
  }

  async getDashboardStats() {
    try {
      // Fetch all stats in parallel
      const [restaurantStats, orderStats, bookingStats] = await Promise.all([
        this.getRestaurantStats(),
        this.getOrderStats(),
        this.getBookingStats()
      ]);

      console.log('Restaurant stats response:', restaurantStats);
      console.log('Order stats response:', orderStats);
      console.log('Booking stats response:', bookingStats);

      // Combine all stats into a single object - extract data from each response
      const combinedStats = {
        ...restaurantStats.data || restaurantStats,
        ...orderStats.data || orderStats,
        ...bookingStats.data || bookingStats
      };

      console.log('Combined stats:', combinedStats);
      return combinedStats;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Menu methods
  async getMenus() {
    return this.makeRequest('/menus', {
      method: 'GET',
    });
  }

  async getMenusByRestaurant(restaurantId) {
    return this.makeRequest(`/menus?restaurant_id=${restaurantId}`, {
      method: 'GET',
    });
  }

  async createMenu(menuData) {
    return this.makeRequest('/menus', {
      method: 'POST',
      body: JSON.stringify(menuData),
    });
  }

  async updateMenu(menuId, menuData) {
    return this.makeRequest(`/menus/${menuId}`, {
      method: 'PATCH',
      body: JSON.stringify(menuData),
    });
  }

  async deleteMenu(menuId) {
    return this.makeRequest(`/menus/${menuId}`, {
      method: 'DELETE',
    });
  }

  // Reservation methods
  async getReservations() {
    return this.makeRequest('/reservations', {
      method: 'GET',
    });
  }

  async getReservation(reservationId) {
    return this.makeRequest(`/reservations/${reservationId}`, {
      method: 'GET',
    });
  }

  async updateReservation(reservationId, reservationData) {
    return this.makeRequest(`/reservations/${reservationId}`, {
      method: 'PUT',
      body: JSON.stringify(reservationData),
    });
  }

  async updateReservationStatus(reservationId, status) {
    return this.makeRequest(`/reservations/${reservationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async createReservation(reservationData) {
    return this.makeRequest('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservationData),
    });
  }

  // Unsplash API for food images
  async searchFoodImages(query) {
    try {
      // Using sample food images based on the query
      // In production, you would integrate with Unsplash API or another image service
      const sampleImages = [
        { id: 1, url: `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&q=80`, description: `Delicious ${query}` },
        { id: 2, url: `https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&q=80`, description: `Fresh ${query}` },
        { id: 3, url: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&q=80`, description: `Tasty ${query}` },
        { id: 4, url: `https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop&q=80`, description: `Gourmet ${query}` },
        { id: 5, url: `https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop&q=80`, description: `Authentic ${query}` },
        { id: 6, url: `https://images.unsplash.com/photo-1563379091339-03246963d396?w=400&h=300&fit=crop&q=80`, description: `Traditional ${query}` },
        { id: 7, url: `https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop&q=80`, description: `Classic ${query}` },
        { id: 8, url: `https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&h=300&fit=crop&q=80`, description: `Premium ${query}` }
      ];
      
      console.log('Fetching images for query:', query);
      console.log('Sample images:', sampleImages);
      
      return { data: sampleImages };
    } catch (error) {
      console.error('Error fetching food images:', error);
      return { data: [] };
    }
  }
}

export default new ApiService();
