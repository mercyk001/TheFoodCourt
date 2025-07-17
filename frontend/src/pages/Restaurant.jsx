import React, { useEffect, useState } from 'react';
import Herosection from '../components/Herosection';
import { Link } from 'react-router-dom';

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/restaurants')
      .then(res => res.json())
      .then(data => setRestaurants(data));
  }, []);

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.meals.join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main>
      <Herosection
        title="Browse Our Restaurants"
        subtitle="Discover delicious meals from your favorite spots at Nextgen Mall."
      >
        <div className="container mt-4">
          
          <div className="row align-items-center mb-4">
            <div className="col-md-6 text-center text-md-start mb-2 mb-md-0">
              {/* <h2 className="fw-bold">Browse Restaurants</h2> */}
            </div>
            <div className="col-md-6 text-end">
              <input
                type="text"
                className="form-control form-control-sm w-auto d-inline"
                placeholder="Search meals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          
          <div className="row">
            {filteredRestaurants.map((restaurant) => (
              <div key={restaurant.id} className="col-md-6 mb-4">
                <div className="card shadow-sm h-100">
                  <div className="card-body text-center">
                    <h5 className="card-title">{restaurant.name}</h5>
                    <p className="card-text text-muted">{restaurant.description}</p>
                    <Link
                      to={`/menu/${restaurant.id}`}
                      className="btn btn-outline-danger btn-sm mt-2"
                    >
                      Go to Menu
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Herosection>
    </main>
    
    



  );
}
