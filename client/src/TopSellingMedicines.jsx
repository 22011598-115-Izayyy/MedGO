import React from 'react';
import { useCart } from './CartContext';
import './TopSellingMedicines.css';

const TopSellingMedicines = ({ setCurrentPage }) => {
  const { addToCart } = useCart();

  const topSellingProducts = [
    {
      id: 201,
      name: "Paracetamol 500mg",
      price: 8.99,
      pharmacy: "City Central Pharmacy",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop",
      rating: 4.8,
      sales: "2,340 sold"
    },
    {
      id: 202,
      name: "Vitamin C 1000mg",
      price: 12.50,
      pharmacy: "HealthCare Plus",
      image: "https://images.unsplash.com/photo-1550572017-edd951aa8ca0?w=300&h=200&fit=crop",
      rating: 4.7,
      sales: "1,890 sold"
    },
    {
      id: 203,
      name: "Ibuprofen 400mg",
      price: 10.75,
      pharmacy: "MediCure Store",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop",
      rating: 4.6,
      sales: "1,675 sold"
    },
    {
      id: 204,
      name: "Cough Syrup",
      price: 15.25,
      pharmacy: "City Central Pharmacy",
      image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=200&fit=crop",
      rating: 4.5,
      sales: "1,532 sold"
    },
    {
      id: 205,
      name: "Multivitamin Tablets",
      price: 18.99,
      pharmacy: "HealthCare Plus",
      image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=300&h=200&fit=crop",
      rating: 4.9,
      sales: "1,423 sold"
    },
    {
      id: 206,
      name: "Aspirin 100mg",
      price: 7.50,
      pharmacy: "MediCure Store",
      image: "https://images.unsplash.com/photo-1585435557343-3b092031d8fe?w=300&h=200&fit=crop",
      rating: 4.4,
      sales: "1,298 sold"
    },
    {
      id: 207,
      name: "Antibiotic Cream",
      price: 22.99,
      pharmacy: "City Central Pharmacy",
      image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&h=200&fit=crop",
      rating: 4.6,
      sales: "1,156 sold"
    },
    {
      id: 208,
      name: "Calcium Tablets",
      price: 14.75,
      pharmacy: "HealthCare Plus",
      image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&h=200&fit=crop",
      rating: 4.3,
      sales: "1,087 sold"
    },
    {
      id: 209,
      name: "Iron Supplements",
      price: 16.50,
      pharmacy: "MediCure Store",
      image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=300&h=200&fit=crop",
      rating: 4.5,
      sales: "945 sold"
    }
  ];

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  const handleViewAllProducts = () => {
    setCurrentPage('products');
  };

  return (
    <section className="top-selling-section">
      <div className="top-selling-container">
        <div className="section-header">
          <h2 className="section-title">Top Selling Medicines</h2>
          <p className="section-subtitle">Most popular medicines trusted by thousands of customers</p>
        </div>

        <div className="products-grid">
          {topSellingProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img 
                  src={product.image} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/300x200/1a7f45/white?text=${encodeURIComponent(product.name)}`;
                  }}
                />
                <div className="bestseller-badge">
                  <span className="badge-icon">🏆</span>
                  <span className="badge-text">Bestseller</span>
                </div>
                <div className="product-rating">
                  <span className="stars">★★★★★</span>
                  <span className="rating-number">({product.rating})</span>
                </div>
              </div>
              
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-pharmacy">By {product.pharmacy}</p>
                <div className="product-sales">{product.sales}</div>
                
                <div className="product-footer">
                  <div className="product-price">PKR {product.price.toFixed(2)}</div>
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(product)}
                  >
                    <span className="cart-icon">🛒</span>
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="view-all-section">
          <button className="view-all-btn" onClick={handleViewAllProducts}>
            <span>View All Products</span>
            <span className="arrow-icon">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default TopSellingMedicines;