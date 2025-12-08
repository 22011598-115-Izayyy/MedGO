import React, { useState } from "react";
import "./Home.css";

// ASSETS
import hero from "../../../assets/hero.png";

// COMPONENTS
import Features from "./Features";
import CategoriesSection from "./CategoriesSection";
import Ecosystem from "./Ecosystem"; // ✅ Added

// FIREBASE
import { db } from "../../../firebase/config";
import { collection, getDocs } from "firebase/firestore";

function Home({ onSearch, searchResults, searchTerm }) {
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [localResults, setLocalResults] = useState([]);

  // 🔥 Home-page Firebase search
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

    // ⭐ Search by Name or Formula
    const filtered = allProducts.filter((product) => {
      const name = (product.productName || "").toLowerCase();
      const formula = (product.formula || "").toLowerCase();
      const q = query.toLowerCase();

      return name.includes(q) || formula.includes(q);
    });

    setLocalResults(filtered);
  };

  // Search button
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
          {localResults.map((product) => {
            // ⭐ UNIVERSAL IMAGE HANDLER
            const productImage =
              product.imageURL ||
              product.image ||
              product.imgURL ||
              product.img ||
              product.photoURL ||
              product.picture ||
              (Array.isArray(product.images) ? product.images[0] : null) ||
              product.url ||
              product.thumbnail ||
              product.featuredImage ||
              `https://placehold.co/300x200/1a7f45/ffffff?text=${encodeURIComponent(
                product.productName || "Medicine"
              )}`;

            return (
              <div className="product-card" key={product.id}>
                <img
                  src={productImage}
                  alt={product.productName}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/300x200/1a7f45/ffffff?text=No+Image";
                  }}
                />

                <div className="product-info">
                  <h3>{product.productName}</h3>
                  <p>{product.pharmacyName}</p>
                  <p>PKR {product.price}</p>

                  {/* ⭐ ADDED FORMULA, DOSE, QUANTITY */}
                  <div className="product-extra">
                    <p><strong>Formula:</strong> {product.formula ?? "N/A"}</p>
                    <p><strong>Dose:</strong> {product.dose ?? "N/A"}</p>
                    <p><strong>Quantity:</strong> {product.quantity ?? product.stock ?? "N/A"}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------------- CATEGORY SECTION ---------------- */}
      <CategoriesSection />

      {/* ---------------- FEATURES SECTION ---------------- */}
      <Features />

      {/* ---------------- ECOSYSTEM SECTION ---------------- */}
      <Ecosystem />
    </>
  );
}

export default Home;
