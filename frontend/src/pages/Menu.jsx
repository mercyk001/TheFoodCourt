import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Herosection from '../components/Herosection';

export default function Menu() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:8000/restaurants/${id}`)
      .then(res => {
        setRestaurant(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching menu:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Herosection title="Loading Menu..." subtitle="Please wait as we fetch the meals." />
    );
  }

  if (!restaurant) {
    return (
      <Herosection title="Restaurant Not Found" subtitle="We couldn't find the restaurant you're looking for." />
    );
  }

  return (
    <Herosection
      title={`${restaurant.name} - Menu`}
      subtitle="Choose your favorite meals and place your order instantly!"
    >
      <div className="container mt-5">
        <div className="row">
          {restaurant.meals.map((meal, index) => (
            <div key={index} className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm text-center">
                <div className="card-body">
                  <h5 className="card-title">{meal}</h5>
                  <p className="card-text text-muted">Delicious {meal} served fresh!</p>
                  <button className="btn btn-outline-danger btn-sm">Add to Cart</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Herosection>
  );
}
