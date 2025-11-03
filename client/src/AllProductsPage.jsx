import React, { useState } from 'react';
import { useCart } from './CartContext';
import './AllProductsPage.css';

const AllProductsPage = () => {
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = [
    'all', 'pain-relief', 'vitamins', 'antibiotics', 'cold-flu', 'digestive', 'skincare', 'baby-care', 'diabetes', 'heart-health'
  ];

  const allProducts = [
    // Pain Relief
    { id: 1, name: "Paracetamol 500mg", price: 5.99, category: "pain-relief", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop", pharmacy: "City Pharmacy", rating: 4.5 },
    { id: 2, name: "Ibuprofen 400mg", price: 8.50, category: "pain-relief", image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop", pharmacy: "Health Plus", rating: 4.7 },
    { id: 3, name: "Aspirin 100mg", price: 6.25, category: "pain-relief", image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=200&fit=crop", pharmacy: "Quick Meds", rating: 4.3 },
    { id: 4, name: "Diclofenac Gel", price: 12.99, category: "pain-relief", image: "https://images.unsplash.com/photo-1585435557343-3b092031d8fe?w=300&h=200&fit=crop", pharmacy: "MedCenter", rating: 4.6 },
    
    // Vitamins
    { id: 5, name: "Vitamin D3 1000IU", price: 15.99, category: "vitamins", image: "https://images.unsplash.com/photo-1550572017-edd951aa8ca0?w=300&h=200&fit=crop", pharmacy: "Wellness Store", rating: 4.8 },
    { id: 6, name: "Vitamin C 500mg", price: 9.75, category: "vitamins", image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&h=200&fit=crop", pharmacy: "Health Plus", rating: 4.5 },
    { id: 7, name: "Multivitamin Complex", price: 22.50, category: "vitamins", image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=300&h=200&fit=crop", pharmacy: "Wellness Store", rating: 4.7 },
    { id: 8, name: "Vitamin B12", price: 18.99, category: "vitamins", image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&h=200&fit=crop", pharmacy: "City Pharmacy", rating: 4.4 },
    
    // Antibiotics
    { id: 9, name: "Amoxicillin 500mg", price: 12.75, category: "antibiotics", image: "https://images.unsplash.com/photo-1585435557343-3b092031d8fe?w=300&h=200&fit=crop", pharmacy: "MedCenter", rating: 4.6 },
    { id: 10, name: "Azithromycin 250mg", price: 18.50, category: "antibiotics", image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop", pharmacy: "Health Plus", rating: 4.5 },
    { id: 11, name: "Ciprofloxacin 500mg", price: 16.25, category: "antibiotics", image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=300&h=200&fit=crop", pharmacy: "Care Pharmacy", rating: 4.3 },
    { id: 12, name: "Penicillin V", price: 14.99, category: "antibiotics", image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=200&fit=crop", pharmacy: "MedCenter", rating: 4.4 },
    
    // Cold & Flu
    { id: 13, name: "Cough Syrup", price: 11.50, category: "cold-flu", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop", pharmacy: "Quick Meds", rating: 4.2 },
    { id: 14, name: "Throat Lozenges", price: 7.99, category: "cold-flu", image: "https://images.unsplash.com/photo-1550572017-edd951aa8ca0?w=300&h=200&fit=crop", pharmacy: "Health Plus", rating: 4.1 },
    { id: 15, name: "Nasal Decongestant", price: 9.25, category: "cold-flu", image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&h=200&fit=crop", pharmacy: "City Pharmacy", rating: 4.3 },
    { id: 16, name: "Cold & Flu Tablets", price: 13.75, category: "cold-flu", image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&h=200&fit=crop", pharmacy: "Wellness Store", rating: 4.5 },
    
    // Digestive
    { id: 17, name: "Omeprazole 20mg", price: 11.50, category: "digestive", image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=300&h=200&fit=crop", pharmacy: "Care Pharmacy", rating: 4.6 },
    { id: 18, name: "Antacid Tablets", price: 6.99, category: "digestive", image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop", pharmacy: "Quick Meds", rating: 4.2 },
    { id: 19, name: "Probiotics", price: 25.50, category: "digestive", image: "https://images.unsplash.com/photo-1585435557343-3b092031d8fe?w=300&h=200&fit=crop", pharmacy: "Wellness Store", rating: 4.7 },
    { id: 20, name: "Digestive Enzymes", price: 19.99, category: "digestive", image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=200&fit=crop", pharmacy: "Health Plus", rating: 4.4 },
    
    // Skincare
    { id: 21, name: "Moisturizing Cream", price: 14.75, category: "skincare", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop", pharmacy: "Beauty Care", rating: 4.5 },
    { id: 22, name: "Sunscreen SPF 50", price: 18.99, category: "skincare", image: "https://images.unsplash.com/photo-1550572017-edd951aa8ca0?w=300&h=200&fit=crop", pharmacy: "City Pharmacy", rating: 4.6 },
    { id: 23, name: "Anti-Acne Gel", price: 16.50, category: "skincare", image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&h=200&fit=crop", pharmacy: "Health Plus", rating: 4.3 },
    { id: 24, name: "Healing Ointment", price: 12.25, category: "skincare", image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=300&h=200&fit=crop", pharmacy: "MedCenter", rating: 4.4 },
    
    // Baby Care
    { id: 25, name: "Baby Formula", price: 28.99, category: "baby-care", image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&h=200&fit=crop", pharmacy: "Baby World", rating: 4.8 },
    { id: 26, name: "Baby Lotion", price: 11.75, category: "baby-care", image: "https://images.unsplash.com/photo-1585435557343-3b092031d8fe?w=300&h=200&fit=crop", pharmacy: "Care Pharmacy", rating: 4.6 },
    { id: 27, name: "Baby Shampoo", price: 9.50, category: "baby-care", image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop", pharmacy: "Baby World", rating: 4.5 },
    { id: 28, name: "Diaper Rash Cream", price: 13.25, category: "baby-care", image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=200&fit=crop", pharmacy: "Health Plus", rating: 4.7 },
    
    // Diabetes
    { id: 29, name: "Metformin 500mg", price: 9.50, category: "diabetes", image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&h=200&fit=crop", pharmacy: "Diabetes Care", rating: 4.5 },
    { id: 30, name: "Blood Glucose Strips", price: 24.99, category: "diabetes", image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=300&h=200&fit=crop", pharmacy: "MedCenter", rating: 4.6 },
    { id: 31, name: "Insulin Pen", price: 45.75, category: "diabetes", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop", pharmacy: "Diabetes Care", rating: 4.8 },
    { id: 32, name: "Lancets", price: 12.50, category: "diabetes", image: "https://images.unsplash.com/photo-1550572017-edd951aa8ca0?w=300&h=200&fit=crop", pharmacy: "Health Plus", rating: 4.3 },
    
    // Heart Health
    { id: 33, name: "Atorvastatin 20mg", price: 22.99, category: "heart-health", image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&h=200&fit=crop", pharmacy: "CardioMed", rating: 4.6 },
    { id: 34, name: "Aspirin 81mg", price: 8.75, category: "heart-health", image: "https://images.unsplash.com/photo-1585435557343-3b092031d8fe?w=300&h=200&fit=crop", pharmacy: "Heart Care", rating: 4.4 },
    { id: 35, name: "Omega-3 Fish Oil", price: 19.50, category: "heart-health", image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&h=200&fit=crop", pharmacy: "Wellness Store", rating: 4.7 },
    { id: 36, name: "CoQ10 Supplement", price: 26.99, category: "heart-health", image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=200&fit=crop", pharmacy: "CardioMed", rating: 4.5 },
    
    // Additional Products to reach 100+
    { id: 37, name: "Calcium Tablets", price: 15.99, category: "vitamins", image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=300&h=200&fit=crop", pharmacy: "Bone Health", rating: 4.4 },
    { id: 38, name: "Iron Supplements", price: 13.75, category: "vitamins", image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop", pharmacy: "Wellness Store", rating: 4.3 },
    { id: 39, name: "Magnesium Pills", price: 17.50, category: "vitamins", image: "https://images.unsplash.com/photo-1550572017-edd951aa8ca0?w=300&h=200&fit=crop", pharmacy: "Health Plus", rating: 4.5 },
    { id: 40, name: "Zinc Tablets", price: 11.25, category: "vitamins", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop", pharmacy: "City Pharmacy", rating: 4.2 },
    { id: 41, name: "Eye Drops", price: 9.99, category: "skincare", image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&h=200&fit=crop", pharmacy: "Vision Care", rating: 4.4 },
    { id: 42, name: "Ear Drops", price: 8.50, category: "cold-flu", image: "https://images.unsplash.com/photo-1585435557343-3b092031d8fe?w=300&h=200&fit=crop", pharmacy: "ENT Care", rating: 4.1 },
    { id: 43, name: "Sleep Aid", price: 16.75, category: "pain-relief", image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&h=200&fit=crop", pharmacy: "Sleep Center", rating: 4.3 },
    { id: 44, name: "Allergy Relief", price: 12.99, category: "cold-flu", image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=200&fit=crop", pharmacy: "AllerCare", rating: 4.5 },
    { id: 45, name: "Hand Sanitizer", price: 5.99, category: "skincare", image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=300&h=200&fit=crop", pharmacy: "Hygiene Store", rating: 4.6 },
    { id: 46, name: "Thermometer", price: 24.99, category: "diabetes", image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop", pharmacy: "Medical Tools", rating: 4.7 },
    { id: 47, name: "Bandages", price: 7.25, category: "skincare", image: "https://images.unsplash.com/photo-1550572017-edd951aa8ca0?w=300&h=200&fit=crop", pharmacy: "First Aid", rating: 4.2 },
    { id: 48, name: "Antiseptic Cream", price: 10.50, category: "skincare", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop", pharmacy: "Wound Care", rating: 4.4 },
    // Continue adding more products...
    { id: 49, name: "Protein Powder", price: 35.99, category: "vitamins", image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&h=200&fit=crop", pharmacy: "Fitness Store", rating: 4.6 },
    { id: 50, name: "Energy Drink", price: 3.99, category: "vitamins", image: "https://images.unsplash.com/photo-1585435557343-3b092031d8fe?w=300&h=200&fit=crop", pharmacy: "Sports Med", rating: 4.1 }
  ];

  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.pharmacy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="all-products-page">
      <div className="products-hero">
        <div className="hero-content">
          <h1 className="page-title">All Products</h1>
          <p className="page-subtitle">Discover thousands of quality medicines and healthcare products</p>
        </div>
      </div>

      <div className="products-container">
        <div className="filters-section">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="category-filter">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="category-select"
            >
              <option value="all">All Categories</option>
              <option value="pain-relief">Pain Relief</option>
              <option value="vitamins">Vitamins & Supplements</option>
              <option value="antibiotics">Antibiotics</option>
              <option value="cold-flu">Cold & Flu</option>
              <option value="digestive">Digestive Health</option>
              <option value="skincare">Skincare</option>
              <option value="baby-care">Baby Care</option>
              <option value="diabetes">Diabetes Care</option>
              <option value="heart-health">Heart Health</option>
            </select>
          </div>
        </div>

        <div className="results-info">
          <p>Showing {filteredProducts.length} products</p>
        </div>

        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img 
                  src={product.image} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/300x200/1a7f45/white?text=${encodeURIComponent(product.name)}`;
                  }}
                  loading="lazy"
                />
                <div className="product-rating">
                  <span className="stars">★★★★★</span>
                  <span className="rating-number">({product.rating})</span>
                </div>
              </div>
              
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-pharmacy">By {product.pharmacy}</p>
                
                <div className="product-footer">
                  <div className="product-price">${product.price.toFixed(2)}</div>
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

        {filteredProducts.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProductsPage;