import React from 'react';

const features = [
  {
    icon: '🍽️',
    title: 'Diverse Cuisines',
    description: 'Ethiopian, Nigerian, Congolese, Kenyan and more authentic flavors',
  },
  {
    icon: '⏱️',
    title: 'Quick Service',
    description: 'Order ahead or from your table for faster service',
  },
  {
    icon: '⭐',
    title: 'Quality Food',
    description: 'Fresh ingredients and authentic recipes from experienced chefs',
  },
  {
    icon: '👨‍👩‍👧‍👦',
    title: 'Family Friendly',
    description: 'Perfect atmosphere for families, friends, and business meetings',
  },
];

const FeatureCards = () => {
  return (
    <section className="py-5 bg-light text-center  ">
      <div className="row mx-0 ">
        <h2 className="mb-3 fw-bold">Why Choose Nextgen Food Court?</h2>
        <p className="mb-5 text-muted">
          Located along Mombasa Road, we bring together the best of African cuisine in one convenient location.
        </p>
        <div className="row">
          {features.map((feature, index) => (
            <div key={index} className="col-md-6 col-lg-3 mb-4">
              <div className="p-4 bg-white rounded shadow-sm h-100">
                <div className="display-4 mb-3">{feature.icon}</div>
                <h5 className="fw-semibold">{feature.title}</h5>
                <p className="text-muted">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
