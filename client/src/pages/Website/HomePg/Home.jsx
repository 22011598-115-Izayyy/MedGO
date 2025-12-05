import React, { useState } from "react";
import "./Home.css";

// ASSETS
import hero from "../../../assets/hero.png";

// COMPONENTS
import Features from "./Features";
import CategoriesSection from "./CategoriesSection";

function Home({ onSearch, searchResults, searchTerm }) {
  const [localSearchTerm, setLocalSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (localSearchTerm.trim()) onSearch(localSearchTerm.trim());
  };

  return (
    <>
      {/* ---------------- HERO SECTION ---------------- */}
      <div
        className="home-container"
        style={{ backgroundImage: `url(${hero})` }}
      >
        {/* FLOATING PILLS */}
        <div className="floating-pill pill1"></div>
        <div className="floating-pill pill2"></div>
        <div className="floating-pill pill3"></div>
        <div className="floating-pill pill4"></div>
        <div className="floating-pill pill5"></div>
        <div className="floating-pill pill6"></div>

        {/* LEFT CONTENT */}
        <div className="left-content">
          <h1 className="main-heading">
            MED-GO Pakistan's First Online Pharmacy
          </h1>

          <p className="sub-heading">
            Find the medicines you need instantly, compare options, and get fast
            delivery from nearby pharmacies. Med-Go makes healthcare easy,
            convenient, and reliable.
          </p>

          {/* SEARCH BAR */}
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search for Medicines"
              value={localSearchTerm}
              onChange={(e) => {
                setLocalSearchTerm(e.target.value);
                onSearch(e.target.value);
              }}
            />
            <button type="submit">🔍</button>
          </form>

          {/* SEARCH RESULTS INFO */}
          {searchTerm && (
            <div className="search-results-info">
              <p>
                {searchResults.length > 0
                  ? `Found ${searchResults.length} result(s) for "${searchTerm}"`
                  : `No results found for "${searchTerm}"`}
              </p>

              {searchResults.length === 0 && (
                <button
                  className="clear-search-btn"
                  onClick={() => {
                    setLocalSearchTerm("");
                    onSearch("");
                  }}
                >
                  Show All Products
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------- */}
      {/* 🔥 FIX: SEARCH RESULTS MOVED OUT OF HERO (CLUTTER SOLVED) */}
      {/* -------------------------------------------------------- */}

      {searchResults.length > 0 && (
        <div className="products-grid">
          {searchResults.map((product, index) => (
            <div className="product-card" key={index}>
              <img src={product.image} alt={product.name} />
              <div className="product-info">
                <h3>{product.name}</h3>
                <p>{product.pharmacyName}</p>
                <p>PKR {product.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------------- CATEGORY SECTION ---------------- */}
      <CategoriesSection />

      {/* ---------------- FEATURES SECTION ---------------- */}
      <Features />
    </>
  );
}

export default Home;