import React, { useState } from 'react';
import './ProductDetails.css';

const ProductDetails = () => {
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  const product = {
    id: 1,
    name: "Ibuprofen 500mg Capsule",
    price: 32,
    rating: 4.8,
    reviews: 127,
    inStock: true,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop&crop=center",
    description: "Ibuprofen is used to relieve pain from various conditions such as headache, dental pain, menstrual cramps, muscle aches, or arthritis. It is also used to reduce fever and to relieve minor aches and pain due to the common cold or flu. Ibuprofen is used to relieve pain from various conditions such as headache, dental pain, menstrual cramps, muscle aches, or arthritis."
  };

  const handleAddToCart = () => {
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 2000);
  };

  const renderStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  return (
    <div className="product-details-page">
      {/* Back Button */}
      <div className="back-button">
        ← Back
      </div>

      {/* Main Product Section */}
      <div className="product-container">
        {/* Left Side - Image */}
        <div className="product-image-section">
          <div className="product-image">
            <img src={product.image} alt={product.name} />
          </div>
        </div>

        {/* Right Side - Product Info */}
        <div className="product-info-section">
          <h1 className="product-name">{product.name}</h1>
          
          <div className="product-rating">
            <span className="stars">{renderStars(product.rating)}</span>
            <span className="rating-count">({product.reviews} reviews)</span>
          </div>

          <div className="product-description">
            {product.description}
          </div>

          <div className="price-and-cart">
            <div className="product-price">
              ${product.price}
            </div>

            <button 
              className={`add-to-cart-button ${isAddedToCart ? 'added' : ''}`}
              onClick={handleAddToCart}
            >
              {isAddedToCart ? '✓ Added' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;