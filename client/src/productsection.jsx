import React from 'react';
import './productsection.css';

const ProductSection = () => {
  const products = [
    { id: 1, name: "Fish Oil", pharmacy: "Nature's bounty", price: 56.00, image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop" },
    { id: 2, name: "Vitamin C", pharmacy: "Nature's bounty", price: 56.00, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop" },
    { id: 3, name: "Probiotics", pharmacy: "Nature's bounty", price: 56.00, image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=300&fit=crop" },
    { id: 4, name: "Multivitamin", pharmacy: "Nature's bounty", price: 56.00, image: "https://images.unsplash.com/photo-1550572017-eba552d8f66a?w=300&h=300&fit=crop" },
    
    { id: 5, name: "Omega 3", pharmacy: "Nature's bounty", price: 56.00, image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop" },
    { id: 6, name: "Calcium", pharmacy: "Nature's bounty", price: 56.00, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop" },
    { id: 7, name: "Iron", pharmacy: "Nature's bounty", price: 56.00, image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=300&fit=crop" },
    { id: 8, name: "Magnesium", pharmacy: "Nature's bounty", price: 56.00, image: "https://images.unsplash.com/photo-1550572017-eba552d8f66a?w=300&h=300&fit=crop" },
    
    { id: 9, name: "Zinc", pharmacy: "Nature's bounty", price: 56.00, image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop" },
    { id: 10, name: "Vitamin D", pharmacy: "Nature's bounty", price: 56.00, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop" },
    { id: 11, name: "B Complex", pharmacy: "Nature's bounty", price: 56.00, image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=300&fit=crop" },
    { id: 12, name: "Biotin", pharmacy: "Nature's bounty", price: 56.00, image: "https://images.unsplash.com/photo-1550572017-eba552d8f66a?w=300&h=300&fit=crop" },
    
    { id: 13, name: "Turmeric", pharmacy: "Nature's bounty", price: 56.00, image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop" },
    { id: 14, name: "Ginseng", pharmacy: "Nature's bounty", price: 56.00, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop" },
    { id: 15, name: "Collagen", pharmacy: "Nature's bounty", price: 56.00, image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=300&fit=crop" },
    { id: 16, name: "CoQ10", pharmacy: "Nature's bounty", price: 56.00, image: "https://images.unsplash.com/photo-1550572017-eba552d8f66a?w=300&h=300&fit=crop" }
  ];

  return (
    <div className="product-section">
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <div className="card-header">
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="pharmacy-name">{product.pharmacy}</p>
              </div>
              <div className="heart-icon">♡</div>
            </div>
            
            <div className="product-image">
              <img src={product.image} alt={product.name} />
            </div>
            
            <div className="card-footer">
              <div className="price">${product.price.toFixed(2)}</div>
              <button className="shop-now-btn">
                <span className="shop-icon">🛒</span>
                Shop Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductSection;