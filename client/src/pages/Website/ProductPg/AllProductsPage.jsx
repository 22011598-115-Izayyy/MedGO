import React, { useEffect, useState } from "react";
import "./AllProductsPage.css";
import { db } from "../../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { useCart } from "../../../Components/CartContext";

function AllProductsPage({ setCurrentPage, setSelectedMedicineId, chatbotSearchQuery }) {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [pharmacyFilter, setPharmacyFilter] = useState("all");
  const [pharmacyOptions, setPharmacyOptions] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = [
    "all",
    "Pain Killer",
    "Antibiotic",
    "Fever And Pain",
    "Cold And Flu",
    "Allergy",
    "Digestive",
    "Respiratory",
    "Vitamin",
    "Bone And Joint Pain",
  ];

  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      try {
        let allProducts = [];
        let pharmacyNames = [];

        const pharmaciesSnap = await getDocs(collection(db, "Pharmacies"));

        for (const pharmacyDoc of pharmaciesSnap.docs) {
          const pharmacyId = pharmacyDoc.id;
          const pharmacyData = pharmacyDoc.data();
          const pharmacyName = pharmacyData.name || "Unknown Pharmacy";

          pharmacyNames.push(pharmacyName);

          const productsSnap = await getDocs(
            collection(db, `Pharmacies/${pharmacyId}/products`)
          );

          productsSnap.forEach((prodDoc) => {
            allProducts.push({
              id: prodDoc.id,
              pharmacyId,
              ...prodDoc.data(),
              pharmacyName,
            });
          });
        }

        setPharmacyOptions(["all", ...new Set(pharmacyNames)]);
        setProducts(allProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
      setLoading(false);
    };

    fetchAllProducts();
  }, []);

  // Apply chatbot search query when it changes
  useEffect(() => {
    if (chatbotSearchQuery) {
      setSearchTerm(chatbotSearchQuery);
    }
  }, [chatbotSearchQuery]);

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`${product.productName || product.name} added to cart!`);
  };

  const filteredProducts = products.filter((product) => {
    // ── HIDE EXPIRED MEDICINES ──
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(product.expiryDate);
    if (!isNaN(expiry) && expiry < today) return false;

    const name = (product.productName || product.name || "").toLowerCase();
    const formula = (product.formula || "").toLowerCase();
    const category = (product.category || "").toLowerCase();

    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      formula.includes(searchTerm.toLowerCase());

    const matchesPharmacy =
      pharmacyFilter === "all" || product.pharmacyName === pharmacyFilter;

    const matchesCategory =
      categoryFilter === "all" ||
      category === categoryFilter.toLowerCase();

    return matchesSearch && matchesPharmacy && matchesCategory;
  });

  return (
    <div className="all-products-page">

      {/* ── HERO ── */}
      <section className="products-hero">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="hero-dot" />
            Pakistan's Trusted Online Pharmacy
          </div>

          <h1 className="page-title">
            <span className="line title-line-1">Trusted Medicines,</span>
            <span className="line title-line-2">All in One Place</span>
          </h1>

          <p className="page-subtitle">
            Browse and shop healthcare products and medicines from all pharmacies in one place.
          </p>

          {!loading && (
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-num">{products.length}+</span>
                <span className="hero-stat-lbl">Products</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-num">{pharmacyOptions.length - 1}+</span>
                <span className="hero-stat-lbl">Pharmacies</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-num">24/7</span>
                <span className="hero-stat-lbl">Available</span>
              </div>
            </div>
          )}
        </div>

        <div className="hero-wave">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#F8FAFC" />
          </svg>
        </div>
      </section>

      {/* ── STICKY FILTER BAR ── */}
      <div className="ap-sticky-filters">
        <div className="ap-filters-inner">

          <div className="ap-search-wrap">
            <svg className="ap-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search medicine or formula…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="ap-clear-btn" onClick={() => setSearchTerm("")}>✕</button>
            )}
          </div>

          <div className="ap-select-wrap">
            <svg className="ap-select-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <select
              className="category-select"
              value={pharmacyFilter}
              onChange={(e) => setPharmacyFilter(e.target.value)}
            >
              {pharmacyOptions.map((ph) => (
                <option key={ph} value={ph}>{ph === "all" ? "All Pharmacies" : ph}</option>
              ))}
            </select>
            <svg className="ap-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>

          {!loading && (
            <div className="ap-count-badge">
              <span className="ap-count-num">{filteredProducts.length}</span>
              <span className="ap-count-lbl">results</span>
            </div>
          )}
        </div>

        <div className="ap-category-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`ap-pill ${categoryFilter === cat ? "ap-pill-active" : ""}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat === "all" ? "✦ All" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── PRODUCTS AREA ── */}
      <div className="products-container">
        {loading ? (
          <div className="ap-skeleton-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div className="ap-skeleton-card" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="ap-skel ap-skel-img" />
                <div className="ap-skel ap-skel-title" />
                <div className="ap-skel ap-skel-sub" />
                <div className="ap-skel ap-skel-row" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">
              <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="40" r="38" stroke="#D1FAE5" strokeWidth="4"/>
                <path d="M28 40h24M40 28v24" stroke="#6EE7B7" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </div>
            <h3>No medicines found</h3>
            <p>Try adjusting your search or filters</p>
            <button className="ap-reset-btn" onClick={() => { setSearchTerm(""); setCategoryFilter("all"); setPharmacyFilter("all"); }}>
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="ap-section-header">
              <div className="ap-section-line" />
              <span className="ap-section-label">
                {categoryFilter === "all" ? "All Products" : categoryFilter}
              </span>
              <div className="ap-section-line" />
            </div>

            <div className="products-grid">
              {filteredProducts.map((product, index) => {
                const productImage =
                  product.imageURL ||
                  product.image ||
                  product.imgURL ||
                  product.img ||
                  product.photoURL ||
                  (Array.isArray(product.images) ? product.images[0] : null) ||
                  product.url ||
                  `https://placehold.co/300x200/1a7f45/ffffff?text=${encodeURIComponent(
                    product.productName || product.name || "Medicine"
                  )}`;

                const stockLevel = Number(product.stock) || 0;
                const stockStatus =
                  stockLevel <= 0 ? "out" : stockLevel <= 10 ? "low" : "in";

                return (
                  <div
                    className="product-card"
                    key={product.id + product.pharmacyName}
                    style={{ animationDelay: `${(index % 12) * 0.06}s` }}
                  >
                    {product.category && (
                      <div className="ap-card-category">{product.category}</div>
                    )}

                    <div
                      className="product-image"
                      onClick={() => {
                        setSelectedMedicineId({
                          productId: product.id,
                          pharmacyId: product.pharmacyId,
                        });
                        setCurrentPage("medicine-details");
                      }}
                    >
                      <img src={productImage} alt={product.productName || product.name} />
                      <div className="ap-img-overlay">
                        <span className="ap-view-label">View Details</span>
                      </div>
                      <div className="product-rating">
                        <span className="stars">★★★★★</span>
                        <span className="rating-number">(4.8)</span>
                      </div>
                    </div>

                    <div className="product-info">
                      <div
                        className="product-name"
                        onClick={() => {
                          setSelectedMedicineId({
                            productId: product.id,
                            pharmacyId: product.pharmacyId,
                          });
                          setCurrentPage("medicine-details");
                        }}
                      >
                        {product.productName || product.name}
                      </div>

                      <div className="product-pharmacy">
                        <span className="ap-pharma-dot" />
                        {product.pharmacyName}
                      </div>

                      <div className="ap-meta-pills">
                        {product.formula && (
                          <span className="ap-meta-pill">
                            <span className="ap-meta-lbl">Formula</span> {product.formula}
                          </span>
                        )}
                        {product.dose && (
                          <span className="ap-meta-pill">
                            <span className="ap-meta-lbl">Dose</span> {product.dose}
                          </span>
                        )}
                        {product.quantity && (
                          <span className="ap-meta-pill">
                            <span className="ap-meta-lbl">Qty</span> {product.quantity}
                          </span>
                        )}
                      </div>

                      <div className={`ap-stock-row ap-stock-${stockStatus}`}>
                        <span className="ap-stock-dot" />
                        <span className="ap-stock-label">
                          {stockStatus === "out"
                            ? "Out of Stock"
                            : stockStatus === "low"
                            ? `Low Stock (${stockLevel})`
                            : `In Stock (${stockLevel})`}
                        </span>
                        <div className="ap-stock-bar">
                          <div
                            className="ap-stock-fill"
                            style={{ width: stockStatus === "out" ? "0%" : stockStatus === "low" ? "25%" : "80%" }}
                          />
                        </div>
                      </div>

                      <div className="product-footer">
                        <div className="product-price">Rs. {product.price ?? "N/A"}</div>
                        <button
                          className="add-to-cart-btn"
                          onClick={() => handleAddToCart(product)}
                          disabled={stockLevel === 0}
                        >
                          {stockLevel === 0 ? (
                            "Out of Stock"
                          ) : (
                            <>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ap-cart-icon">
                                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                              </svg>
                              Add to Cart
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AllProductsPage;