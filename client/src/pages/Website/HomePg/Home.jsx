import React, { useState } from "react";
import "./Home.css";

// ASSETS
import hero from "../../../assets/hero.png";

// COMPONENTS
import Features from "./Features";
import CategoriesSection from "./CategoriesSection";
import Ecosystem from "./Ecosystem";   // ✅ Added

// FIREBASE
import { db } from "../../../firebase/config";
import { collection, getDocs } from "firebase/firestore";

function Home({ onSearch, searchResults, searchTerm }) {
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [localResults, setLocalResults] = useState([]);

  // 🔥 NEW: Home-page Firebase search (App.jsx remains unchanged)
  const performFirebaseSearch = async (query) => {
    if (!query.trim()) {
      setLocalResults([]);
      return;
    }

    let allProducts = [];

    const pharmaciesSnap = await getDocs(collection(db, "Pharmacies"));

    for (const pharmacyDoc of pharmaciesSnap.docs) {
      const pharmacyId = pharmacyDoc.id;
      const pharmacy = pharmacyDoc.data();

      const productsSnap = await getDocs(
        collection(db, `Pharmacies/${pharmacyId}/products`)
      );

      productsSnap.forEach((prodDoc) => {
        allProducts.push({
          id: prodDoc.id,
          ...prodDoc.data(),
          pharmacyName: pharmacy.name,
        });
      });
    }

    // Filter
    const filtered = allProducts.filter((product) =>
      (product.productName || "")
        .toLowerCase()
        .includes(query.toLowerCase())
    );

    setLocalResults(filtered);
  };

  // Search handler for Home page only
  const handleSearch = (e) => {
    e.preventDefault();
    performFirebaseSearch(localSearchTerm);
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
                performFirebaseSearch(e.target.value);
              }}
            />
            <button type="submit">🔍</button>
          </form>

          {/* SEARCH RESULTS INFO */}
          {localSearchTerm && (
            <div className="search-results-info">
              <p>
                {localResults.length > 0
                  ? `Found ${localResults.length} result(s) for "${localSearchTerm}"`
                  : `No results found for "${localSearchTerm}"`}
              </p>

              {localResults.length === 0 && (
                <button
                  className="clear-search-btn"
                  onClick={() => {
                    setLocalSearchTerm("");
                    setLocalResults([]);
                  }}
                >
                  Show All Products
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---------------- SEARCH RESULTS BELOW HERO ---------------- */}
      {localResults.length > 0 && (
        <div className="products-grid">
          {localResults.map((product) => (
            <div className="product-card" key={product.id}>
              <img
                src={
                  product.image ||
                  `https://placehold.co/300x200/1a7f45/ffffff?text=${encodeURIComponent(
                    product.productName
                  )}`
                }
                alt={product.productName}
              />

              <div className="product-info">
                <h3>{product.productName}</h3>
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
      {/* ---------------- ECOSYSTEM SECTION (Added) ---------------- */}
      <Ecosystem />   {/* ✅ Added */}

      
    </>
  );
}

export default Home;
