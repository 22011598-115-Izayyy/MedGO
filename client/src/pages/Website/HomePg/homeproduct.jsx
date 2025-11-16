import React from "react";
import { useCart } from '../../../Components/CartContext';
import "./homeproduct.css";

const allProducts = [
  {
    id: 1,
    name: "Paracetamol",
    price: 5.99,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop",
    pharmacy: "City Pharmacy"
  },
  {
    id: 2,
    name: "Ibuprofen",
    price: 8.50,
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop",
    pharmacy: "Health Plus"
  },
  {
    id: 3,
    name: "Amoxicillin",
    price: 12.75,
    image: "https://images.unsplash.com/photo-1585435557343-3b092031d8fe?w=300&h=200&fit=crop",
    pharmacy: "MedCenter"
  },
  {
    id: 4,
    name: "Vitamin D3",
    price: 15.99,
    image: "https://images.unsplash.com/photo-1550572017-edd951aa8ca0?w=300&h=200&fit=crop",
    pharmacy: "Wellness Store"
  },
  {
    id: 5,
    name: "Aspirin",
    price: 6.25,
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=200&fit=crop",
    pharmacy: "Quick Meds"
  },
  {
    id: 6,
    name: "Omeprazole",
    price: 11.50,
    image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=300&h=200&fit=crop",
    pharmacy: "Care Pharmacy"
  },
  {
    id: 7,
    name: "Cetirizine",
    price: 7.99,
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&h=200&fit=crop",
    pharmacy: "AllerCare Pharmacy"
  },
  {
    id: 8,
    name: "Metformin",
    price: 9.50,
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&h=200&fit=crop",
    pharmacy: "Diabetes Care"
  }
];

export { allProducts };

export default function HomeProduct({ searchResults, searchTerm }) {
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  const productsToShow = searchTerm ? searchResults : allProducts;

  return (
    <section className="homeproduct-section">
      <div className="container">
        <h2 className="section-title">
          {searchTerm 
            ? `Search Results for "${searchTerm}"` 
            : "Top Selling Medicines"
          }
        </h2>

        {productsToShow.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No medicines found</h3>
            <p>Try searching for "Paracetamol", "Vitamin", or "Aspirin"</p>
          </div>
        ) : (
          <div className="homeproduct-grid">
            {productsToShow.map(product => (
              <div key={product.id} className="homeproduct-card">
                <div className="homeproduct-card-header">
                  <div className="homeproduct-info">
                    <h3 className="homeproduct-name">{product.name}</h3>
                    <p className="homeproduct-pharmacy">By {product.pharmacy}</p>
                  </div>
                  <button className="homeproduct-heart">♡</button>
                </div>
                
                <div className="homeproduct-image">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/300x200/1a7f45/white?text=${encodeURIComponent(product.name)}`;
                    }}
                    loading="lazy"
                  />
                </div>
                
                <div className="homeproduct-footer">
                  <div className="homeproduct-price-section">
                    <span className="homeproduct-price">${product.price.toFixed(2)}</span>
                    <span className="homeproduct-rating">
                      <span className="stars">★★★★★</span>
                      <span className="rating-text">(4.8)</span>
                    </span>
                  </div>
                  <button 
                    className="homeproduct-cart-btn"
                    onClick={() => handleAddToCart(product)}
                  >
                    <span className="homeproduct-cart-icon">🛒</span>
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}