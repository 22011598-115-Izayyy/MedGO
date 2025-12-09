import React, { useState } from "react";
import "./Home.css";

// ASSETS
import hero from "../../../assets/hero.png";

// COMPONENTS
import Features from "./Features";
import CategoriesSection from "./CategoriesSection";
import Ecosystem from "./Ecosystem";

// FIREBASE
import { db } from "../../../firebase/config";
import { collection, getDocs } from "firebase/firestore";

function Home({
  onSearch,
  searchResults,
  searchTerm,
  setCurrentPage,
  setSelectedMedicineId,
}) {
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [localResults, setLocalResults] = useState([]);
  const [showGridResults, setShowGridResults] = useState(false);

  // FIREBASE SEARCH
  const performFirebaseSearch = async (query) => {
    if (!query.trim()) {
      setLocalResults([]);
      setShowGridResults(false);
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
          id: pharmacyId + "-" + prodDoc.id,  
          productId: prodDoc.id,
          pharmacyId: pharmacyId,
          ...prodDoc.data(),
          pharmacyName: pharmacy.name,
        });
      });
    }

    // FILTER + SORT
    const filtered = allProducts
      .filter((product) => {
        const name = (product.productName || "").toLowerCase();
        const formula = (product.formula || "").toLowerCase();
        const q = query.toLowerCase();
        return name.includes(q) || formula.includes(q);
      })
      .sort((a, b) => {
        const q = query.toLowerCase();
        const aName = (a.productName || "").toLowerCase();
        const bName = (b.productName || "").toLowerCase();

        if (aName === q) return -1;
        if (bName === q) return 1;

        if (aName.startsWith(q) && !bName.startsWith(q)) return -1;
        if (bName.startsWith(q) && !aName.startsWith(q)) return 1;

        return aName.localeCompare(bName);
      });

    setLocalResults(filtered);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setShowGridResults(true);
    performFirebaseSearch(localSearchTerm);
  };

  const goToDetails = (item) => {
    setSelectedMedicineId({
      productId: item.productId,
      pharmacyId: item.pharmacyId,
    });
    setCurrentPage("medicine-details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* HERO SECTION */}
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

        <div className="left-content">
          <h1 className="main-heading">
            MED-GO Pakistan's First Online Pharmacy
          </h1>

          <p className="sub-heading">
            Find the medicines you need instantly, compare options, and get fast
            delivery from nearby pharmacies.
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

            {/* DROPDOWN RESULTS */}
            {localSearchTerm.trim() !== "" && (
              <div className="search-dropdown">
                {localResults.length === 0 ? (
                  <div className="no-results">No results found.</div>
                ) : (
                  localResults.map((item) => (
                    <div
                      key={item.id}
                      className="search-item"
                      onClick={() => goToDetails(item)}
                    >
                      <span className="item-name">{item.productName}</span>
                      <span className="item-pharmacy">{item.pharmacyName}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </form>

          {/* SEARCH INFO */}
          {localSearchTerm && (
            <div className="search-results-info">
              <p>
                {localResults.length > 0
                  ? `Found ${localResults.length} result(s) for "${localSearchTerm}"`
                  : `No results found for "${localSearchTerm}"`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* GRID RESULTS */}
      {showGridResults && localResults.length > 0 && (
        <div className="products-grid">
          {localResults.map((product) => {
            const productImage =
              product.imageURL ||
              product.image ||
              product.imgURL ||
              product.photoURL ||
              (Array.isArray(product.images) ? product.images[0] : null) ||
              `https://placehold.co/300x200?text=${encodeURIComponent(
                product.productName
              )}`;

            return (
              <div
                className="product-card"
                key={product.id}
                onClick={() => goToDetails(product)}
              >
                <img src={productImage} alt={product.productName} />

                <div className="product-info">
                  <h3>{product.productName}</h3>
                  <p>{product.pharmacyName}</p>
                  <p>PKR {product.price}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SECTIONS */}
      <CategoriesSection />
      <Features />
      <Ecosystem />
    </>
  );
}

export default Home;
