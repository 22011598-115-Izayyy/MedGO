import React, { useState } from "react";
import "./Home.css";

function Home({ onSearch, searchResults, searchTerm }) {
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (localSearchTerm.trim()) {
      onSearch(localSearchTerm.trim());
    }
  };

  const handleInputChange = (e) => {
    setLocalSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  const clearSearch = () => {
    setLocalSearchTerm('');
    onSearch('');
  };

  return (
    <div className="home-container">
      <div className="text-section">
        <h1 className="main-heading">
          MED-GO Pakistan's First <br />
          Online Pharmacy
        </h1>

        <p className="sub-heading">
          Find and order medicines from nearby pharmacies with ease
        </p>

        <form className="search-bar" onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Search for Medicines" 
            value={localSearchTerm}
            onChange={handleInputChange}
          />
          <button type="submit">🔍</button>
          {localSearchTerm && (
            <button 
              type="button" 
              className="clear-search"
              onClick={clearSearch}
            >
              ✕
            </button>
          )}
        </form>

        {searchTerm && (
          <div className="search-results-info">
            <p>
              {searchResults.length > 0 
                ? `Found ${searchResults.length} result(s) for "${searchTerm}"`
                : `No results found for "${searchTerm}"`
              }
            </p>
            {searchResults.length === 0 && (
              <button className="clear-search-btn" onClick={clearSearch}>
                Show All Products
              </button>
            )}
          </div>
        )}

        {/* Show product cards if there are results */}
        {searchResults.length > 0 && (
          <div className="products-grid">
            {searchResults.map((product) => (
              <div className="product-card" key={product.id + product.pharmacyName}>
                <img
                  src={
                    product.image ||
                    `https://placehold.co/300x200/1a7f45/ffffff?text=${encodeURIComponent(
                      product.productName || product.name || "Medicine"
                    )}`
                  }
                  alt={product.productName || product.name || "Medicine"}
                />
                <div className="product-info">
                  <h3>{product.productName || product.name || "Unnamed Product"}</h3>
                  <p>{product.pharmacyName}</p>
                  <p>PKR {product.price ?? "N/A"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="image-section">
        <img
          src="https://phami-pharma.web.app/assets/banner/banner.png"
          alt="Pharmacy Banner"
          className="hero-image"
        />
      </div>
    </div>
  );
}

export default Home;