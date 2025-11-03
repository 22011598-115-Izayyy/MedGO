import React from 'react';
import { useCart } from './CartContext';
import './pharmacystore.css';

const PharmacyStore = () => {
  const { addToCart } = useCart();

  const storeProducts = [
    {
      id: 101,
      name: "Paracetamol 500mg",
      price: 12.99,
      originalPrice: 15.99,
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop",
      description: "Pain relief tablets",
      inStock: true
    },
    {
      id: 102,
      name: "Vitamin C Tablets",
      price: 8.50,
      originalPrice: 10.50,
      image: "https://images.unsplash.com/photo-1550572017-edd951aa8ca0?w=300&h=200&fit=crop",
      description: "Immune system booster",
      inStock: true
    },
    {
      id: 103,
      name: "Cough Syrup",
      price: 15.75,
      originalPrice: 18.75,
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop",
      description: "Effective cough relief",
      inStock: true
    },
    {
      id: 104,
      name: "Antibiotic Cream",
      price: 22.99,
      originalPrice: 25.99,
      image: "https://images.unsplash.com/photo-1585435557343-3b092031d8fe?w=300&h=200&fit=crop",
      description: "Topical antibiotic treatment",
      inStock: false
    },
    {
      id: 105,
      name: "Blood Pressure Monitor",
      price: 45.99,
      originalPrice: 55.99,
      image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=300&h=200&fit=crop",
      description: "Digital BP monitor",
      inStock: true
    },
    {
      id: 106,
      name: "First Aid Kit",
      price: 18.50,
      originalPrice: 22.50,
      image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=200&fit=crop",
      description: "Complete emergency kit",
      inStock: true
    }
  ];

  const handleAddToCart = (product) => {
    if (product.inStock) {
      addToCart(product);
      alert(`${product.name} added to cart!`);
    }
  };

  return (
    <div className="pharmacy-store">
      {/* Hero Section */}
      <div className="store-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="store-name">John Medical Store</h1>
            <p className="store-tagline">Your trusted healthcare partner since 1998</p>
            
            <div className="store-stats">
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
          
          <div className="hero-image">
            <img 
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=500&h=400&fit=crop" 
              alt="John Medical Store"
            />
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="about-section">
        <div className="about-container">
          <h2 className="about-title">About John Medical Store</h2>
          <div className="about-content">
            <div className="about-text">
              <p>
                John Medical Store has been serving the community for over 25 years with dedication 
                and commitment to providing quality healthcare products. We pride ourselves on our 
                extensive range of medicines, healthcare products, and professional pharmaceutical services.
              </p>
              <p>
                Our experienced pharmacists are always ready to help you with your healthcare needs, 
                providing expert advice and ensuring you get the right medication for your condition.
              </p>
              
              <div className="features">
                <div className="feature">
                  <span className="feature-icon">✓</span>
                  <span>Licensed Pharmacists</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">✓</span>
                  <span>Quality Assured Products</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">✓</span>
                  <span>Fast Home Delivery</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">✓</span>
                  <span>Competitive Prices</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="products-section">
        <div className="products-container">
          <h2 className="products-title">Our Top Products</h2>
          
          <div className="products-grid">
            {storeProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/300x200/1a7f45/white?text=${encodeURIComponent(product.name)}`;
                    }}
                  />
                  {!product.inStock && <div className="out-of-stock-overlay">Out of Stock</div>}
                </div>
                
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  
                  <div className="product-pricing">
                    <div className="price-section">
                      <span className="current-price">${product.price}</span>
                      <span className="original-price">${product.originalPrice}</span>
                    </div>
                    <div className="savings">
                      Save ${(product.originalPrice - product.price).toFixed(2)}
                    </div>
                  </div>
                  
                  <button 
                    className={`add-to-cart-btn ${!product.inStock ? 'disabled' : ''}`}
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                  >
                    {product.inStock ? (
                      <>
                        <span className="cart-icon">🛒</span>
                        <span>Add to Cart</span>
                      </>
                    ) : (
                      <span>Out of Stock</span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Address Section */}
      <div className="address-section">
        <div className="address-container">
          <h2 className="address-title">Visit Our Store</h2>
          
          <div className="address-content">
            <div className="address-info">
              <div className="address-item">
                <span className="address-icon">📍</span>
                <div>
                  <h4>Address</h4>
                  <p>123 Main Street, Medical Plaza<br />Downtown Area, City 12345</p>
                </div>
              </div>
              
              <div className="address-item">
                <span className="address-icon">📞</span>
                <div>
                  <h4>Phone</h4>
                  <p>+92-300-1234567<br />+92-21-1234567</p>
                </div>
              </div>
              
              <div className="address-item">
                <span className="address-icon">🕒</span>
                <div>
                  <h4>Working Hours</h4>
                  <p>Mon - Sat: 8:00 AM - 10:00 PM<br />Sunday: 9:00 AM - 9:00 PM</p>
                </div>
              </div>
              
              <div className="address-item">
                <span className="address-icon">✉️</span>
                <div>
                  <h4>Email</h4>
                  <p>info@johnmedicalstore.com<br />support@johnmedicalstore.com</p>
                </div>
              </div>
            </div>
            
            <div className="map-placeholder">
              <div className="map-content">
                <h3>Store Location</h3>
                <p>Find us easily with GPS navigation</p>
                <button className="directions-btn">Get Directions</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyStore;