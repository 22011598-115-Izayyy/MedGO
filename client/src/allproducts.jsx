import React from "react";
import { useCart } from './CartContext';
import "./pharmacystore.css";

const products = [
  {
    id: 13,
    name: "Cough Syrup",
    price: 8.99,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop",
    pharmacy: "John's Medical Store"
  },
  {
    id: 14,
    name: "Bandages",
    price: 3.50,
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop",
    pharmacy: "John's Medical Store"
  },
  {
    id: 15,
    name: "Antiseptic",
    price: 6.75,
    image: "https://images.unsplash.com/photo-1585435557343-3b092031d8fe?w=300&h=200&fit=crop",
    pharmacy: "John's Medical Store"
  },
  {
    id: 16,
    name: "Thermometer",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1550572017-edd951aa8ca0?w=300&h=200&fit=crop",
    pharmacy: "John's Medical Store"
  },
  {
    id: 17,
    name: "Pain Relief Gel",
    price: 9.25,
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=200&fit=crop",
    pharmacy: "John's Medical Store"
  },
  {
    id: 18,
    name: "Multivitamins",
    price: 18.50,
    image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=300&h=200&fit=crop",
    pharmacy: "John's Medical Store"
  },
  {
    id: 19,
    name: "Hand Sanitizer",
    price: 4.99,
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&h=200&fit=crop",
    pharmacy: "John's Medical Store"
  },
  {
    id: 20,
    name: "Face Masks",
    price: 12.50,
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&h=200&fit=crop",
    pharmacy: "John's Medical Store"
  }
];

function PharmacyStore() {
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="pharmacy-store-page">
      {/* Hero Section */}
      <section className="pharmacy-hero">
        <div className="pharmacy-hero-content">
          <h1 className="pharmacy-hero-title">John's Medical Store</h1>
          <p className="pharmacy-hero-subtitle">Your trusted neighborhood pharmacy since 1995</p>
          <div className="pharmacy-hero-stats">
            <div className="stat">
              <span className="stat-number">25+</span>
              <span className="stat-label">Years Experience</span>
            </div>
            <div className="stat">
              <span className="stat-number">5000+</span>
              <span className="stat-label">Happy Customers</span>
            </div>
            <div className="stat">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="pharmacy-about">
        <div className="container">
          <div className="about-content">
            <h2>About John's Medical Store</h2>
            <p>
              For over 25 years, John's Medical Store has been serving the community with 
              quality medicines and healthcare products. We pride ourselves on providing 
              personalized service and expert advice to help you maintain your health and wellbeing.
            </p>
            <div className="features">
              <div className="feature">
                <span className="feature-icon">💊</span>
                <h4>Quality Medicines</h4>
                <p>Only authentic, high-quality pharmaceutical products</p>
              </div>
              <div className="feature">
                <span className="feature-icon">🚚</span>
                <h4>Fast Delivery</h4>
                <p>Quick and reliable delivery to your doorstep</p>
              </div>
              <div className="feature">
                <span className="feature-icon">👨‍⚕️</span>
                <h4>Expert Advice</h4>
                <p>Professional consultation from licensed pharmacists</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="pharmacy-product-section">
        <div className="container">
          <h2 className="pharmacy-section-title">Our Top Products</h2>

          <div className="pharmacy-product-grid">
            {products.map(product => (
              <div key={product.id} className="pharmacy-product-card">
                <div className="pharmacy-product-header">
                  <span className="pharmacy-product-badge">In Stock</span>
                  <span className="pharmacy-product-heart">♡</span>
                </div>
                
                <div className="pharmacy-product-image">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/300x200/1a7f45/white?text=${encodeURIComponent(product.name)}`;
                    }}
                  />
                </div>
                
                <div className="pharmacy-product-content">
                  <h3 className="pharmacy-product-title">{product.name}</h3>
                  <p className="pharmacy-product-pharmacy">By {product.pharmacy}</p>
                  <div className="pharmacy-product-rating">
                    <span className="stars">★★★★★</span>
                    <span className="rating-text">(4.8)</span>
                  </div>
                </div>
                
                <div className="pharmacy-product-footer">
                  <div className="pharmacy-product-price">${product.price.toFixed(2)}</div>
                  <button 
                    className="pharmacy-cart-btn"
                    onClick={() => handleAddToCart(product)}
                  >
                    <span className="pharmacy-cart-icon">🛒</span>
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="pharmacy-contact">
        <div className="container">
          <h2>Visit Our Store</h2>
          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <div>
                <h4>Address</h4>
                <p>123 Medical Street, Health City, HC 12345</p>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <div>
                <h4>Phone</h4>
                <p>(555) 123-4567</p>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">🕒</span>
              <div>
                <h4>Hours</h4>
                <p>Open 24/7 for your convenience</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PharmacyStore;