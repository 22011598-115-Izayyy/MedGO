import React, { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useCart } from "../../../Components/CartContext";
import "./StoreDetails.css";

import CategoriesSection from "../HomePg/CategoriesSection";
import PharmImage from "../../../assets/Pharm.png";
import Pharmacy from "../../../assets/Pharmacy.png";

function PharmacyStore({ setCurrentPage, selectedPharmacy, setSelectedMedicineId }) {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [showReviewForm, setShowReviewForm] = useState(false);

  const [storeSearch, setStoreSearch] = useState("");
  const [storeCategoryFilter, setStoreCategoryFilter] = useState("all");

  const storeCategories = [
    "all", "Pain Killer", "Antibiotic", "Fever And Pain", "Cold And Flu",
    "Allergy", "Digestive", "Respiratory", "Vitamin", "Bone And Joint Pain",
    "Cardiac Care", "Derma Care", "ENT Care", "Eye And Ear Care",
    "Mental Health", "Lung And Liver Care", "Other",
  ];

  const filteredStoreProducts = products.filter((p) => {
    // ── HIDE EXPIRED MEDICINES ──
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(p.expiryDate);
    if (!isNaN(expiry) && expiry < today) return false;

    const q = storeSearch.toLowerCase();
    const matchSearch =
      (p.productName || p.name || "").toLowerCase().includes(q) ||
      (p.formula || "").toLowerCase().includes(q);
    const matchCat =
      storeCategoryFilter === "all" ||
      (p.category || "").toLowerCase() === storeCategoryFilter.toLowerCase();
    return matchSearch && matchCat;
  });

  const averageRating =
    reviews.length === 0
      ? 0
      : (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1);

  useEffect(() => {
    if (!selectedPharmacy?.id) return;
    const fetchProducts = async () => {
      try {
        const productsRef = collection(db, `Pharmacies/${selectedPharmacy.id}/products`);
        const q = await getDocs(productsRef);
        const fetchedProducts = q.docs.map((d) => ({
          id: d.id,
          pharmacyId: selectedPharmacy.id,
          ...d.data(),
        }));
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedPharmacy]);

  useEffect(() => {
    if (!selectedPharmacy?.id) return;
    const fetchReviews = async () => {
      try {
        const reviewsRef = collection(db, "Pharmacies", selectedPharmacy.id, "reviews");
        const snapshot = await getDocs(reviewsRef);
        setReviews(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    fetchReviews();
  }, [selectedPharmacy]);

  const submitReview = async () => {
    if (!name || !email || !rating || !comment) {
      alert("Please fill Name, Email, Rating and Comment");
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "Pharmacies", selectedPharmacy.id, "reviews"), {
        userName: name, email, rating, comment,
        pharmacyId: selectedPharmacy.id,
        createdAt: serverTimestamp(),
        helpfulVotes: 0,
      });
      setReviews([{ userName: name, email, rating, comment }, ...reviews]);
      alert("Review submitted!");
      setRating(0); setComment(""); setName(""); setEmail("");
      setShowReviewForm(false);
    } catch (error) {
      console.error("Error adding review:", error);
    }
    setSubmitting(false);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`${product.productName || product.name} added to cart!`);
  };

  if (!selectedPharmacy) {
    return (
      <div className="ahadstore-container">
        <p className="loading-text">No pharmacy selected.</p>
      </div>
    );
  }

  const heroBackground = PharmImage;

  const avatarColor = (name = "") => {
    const colors = ["#059669","#2563eb","#d97706","#7c3aed","#dc2626","#0891b2"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = (name = "") =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="ahadstore-container">

      {/* ── BACK BUTTON ── */}
      <div className="back-btn-container">
        <button className="back-btn" onClick={() => setCurrentPage("pharmacies")}>
          <svg className="sd-back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Pharmacies
        </button>
      </div>

      {/* ── HERO ── */}
      <section className="hero-section" style={{ backgroundImage: `url(${heroBackground})` }}>
        <div className="sd-orb sd-orb-1" />
        <div className="sd-orb sd-orb-2" />

        <div className="hero-content">
          <div className="sd-hero-eyebrow">
            <span className="sd-eyebrow-dot" />
            MedGO Partner Pharmacy
          </div>

          <h1>
            <span className="line sd-hero-line-1">{selectedPharmacy.name},</span>
            <span className="line sd-hero-line-2">Your Trusted Pharmacy</span>
          </h1>

          <p>
            {selectedPharmacy.address
              ? `Serving ${selectedPharmacy.address} with quality medicines and care.`
              : "Your trusted healthcare partner."}
          </p>

          <div className="sd-hero-pills">
            {selectedPharmacy.phone && (
              <span className="sd-hero-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.23h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.07 6.07l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/>
                </svg>
                {selectedPharmacy.phone}
              </span>
            )}
            {selectedPharmacy.email && (
              <span className="sd-hero-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                {selectedPharmacy.email}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <div className="sd-cats-wrapper">
        <CategoriesSection />
      </div>

      {/* ── ABOUT ── */}
      <section className="about-section">
        <div className="about-left">
          <div className="sd-section-eyebrow">About Us</div>
          <h2>About {selectedPharmacy.name}</h2>
          <p>
            {selectedPharmacy.description
              ? selectedPharmacy.description
              : `${selectedPharmacy.name} has been serving the people of Gujrat for years, providing trusted healthcare and timely delivery of medicines.`}
          </p>
          <div className="about-features">
            <div className="feature"><span className="sd-feat-icon">✅</span>Licensed Products</div>
            <div className="feature"><span className="sd-feat-icon">⚡</span>Fast Home Delivery</div>
            <div className="feature"><span className="sd-feat-icon">💊</span>Quality Assured Medicines</div>
            <div className="feature"><span className="sd-feat-icon">📦</span>Affordable Prices</div>
          </div>
        </div>

        <div className="about-image">
          <div className="sd-about-img-frame">
            <img src={Pharmacy} alt="Pharmacy Preview" />
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section className="products-section">
        <div className="sd-section-header">
          <div className="sd-section-line" />
          <div className="sd-section-center">
            <span className="sd-section-eyebrow">Inventory</span>
            <h2>Our Top Products</h2>
          </div>
          <div className="sd-section-line" />
        </div>

        {!loading && products.length > 0 && (
          <div className="sd-products-toolbar">
            <div className="sd-store-search-wrap">
              <svg className="sd-store-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                className="sd-store-search-input"
                type="text"
                placeholder="Search medicine or formula…"
                value={storeSearch}
                onChange={(e) => setStoreSearch(e.target.value)}
              />
              {storeSearch && (
                <button className="sd-store-clear-btn" onClick={() => setStoreSearch("")}>✕</button>
              )}
            </div>

            <div className="sd-store-count">
              <span className="sd-store-count-num">{filteredStoreProducts.length}</span>
              <span className="sd-store-count-lbl">result{filteredStoreProducts.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="sd-cat-pills">
            {storeCategories.map((cat) => (
              <button
                key={cat}
                className={`sd-cat-pill ${storeCategoryFilter === cat ? "sd-cat-pill-active" : ""}`}
                onClick={() => setStoreCategoryFilter(cat)}
              >
                {cat === "all" ? "✦ All" : cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="products-grid">
            {Array.from({ length: 5 }).map((_, i) => (
              <div className="sd-skeleton-card" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="sd-skel sd-skel-img" />
                <div className="sd-skel-body">
                  <div className="sd-skel sd-skel-title" />
                  <div className="sd-skel sd-skel-row" />
                  <div className="sd-skel sd-skel-row sd-skel-short" />
                  <div className="sd-skel sd-skel-btn" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredStoreProducts.length === 0 ? (
          <div className="sd-empty-state">
            <div className="sd-empty-icon">💊</div>
            <h3>{storeSearch || storeCategoryFilter !== "all" ? "No results found" : "No products found"}</h3>
            <p>{storeSearch || storeCategoryFilter !== "all" ? "Try adjusting your search or filter." : "This pharmacy hasn't added products yet."}</p>
            {(storeSearch || storeCategoryFilter !== "all") && (
              <button className="sd-reset-btn" onClick={() => { setStoreSearch(""); setStoreCategoryFilter("all"); }}>
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="products-grid">
            {filteredStoreProducts.map((p, index) => {
              const productImage =
                p.imageURL || p.image || p.img || p.imgURL || p.photoURL || p.url ||
                `https://placehold.co/300x200/1a7f45/ffffff?text=${encodeURIComponent(p.productName || "Medicine")}`;

              const stockLevel = Number(p.stock) || 0;
              const stockStatus = stockLevel <= 0 ? "out" : stockLevel <= 10 ? "low" : "in";

              return (
                <div
                  key={p.id}
                  className="product-card"
                  style={{ cursor: "pointer", animationDelay: `${(index % 10) * 0.06}s` }}
                  onClick={() => {
                    setSelectedMedicineId({ productId: p.id, pharmacyId: p.pharmacyId });
                    setCurrentPage("medicine-details");
                  }}
                >
                  {p.category && <div className="sd-card-cat">{p.category}</div>}

                  <div className="product-image">
                    <img src={productImage} alt={p.productName} className="product-img" />
                    <div className="sd-prod-overlay"><span>View Details</span></div>
                  </div>

                  <div className="sd-card-body">
                    <h3>{p.productName || "Unnamed Product"}</h3>

                    <div className="product-extra">
                      <p><strong>Formula:</strong> {p.formula ?? "N/A"}</p>
                      <p><strong>Dose:</strong> {p.dose ?? "N/A"}</p>
                      <p><strong>Quantity:</strong> {p.quantity ?? p.stock ?? "N/A"}</p>
                    </div>

                    <div className={`sd-stock-row sd-stock-${stockStatus}`}>
                      <span className="sd-stock-dot" />
                      <span className="sd-stock-label">
                        {stockStatus === "out"
                          ? "Out of Stock"
                          : stockStatus === "low"
                          ? `Low Stock (${stockLevel})`
                          : `In Stock`}
                      </span>
                      <div className="sd-stock-bar">
                        <div
                          className="sd-stock-fill"
                          style={{ width: stockStatus === "out" ? "0%" : stockStatus === "low" ? "25%" : "82%" }}
                        />
                      </div>
                    </div>

                    <p className="price">Rs. {p.price ?? "N/A"}</p>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(p); }}
                      className={`add-btn ${stockLevel === 0 ? "disabled" : ""}`}
                      disabled={stockLevel === 0}
                    >
                      {stockLevel === 0 ? (
                        "Out of Stock"
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sd-cart-icon">
                            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                          </svg>
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── REVIEWS ── */}
      <section className="reviews-section">
        <div className="sd-reviews-bg-deco" />

        <div className="reviews-header">
          <div className="reviews-title">
            <span className="sd-section-eyebrow sd-rev-eyebrow">Customer Voices</span>
            <h2>What Our Customers have to Say</h2>
          </div>

          <div className="review-summary">
            <div className="sd-rating-circle">
              <span className="sd-rating-big">{averageRating}</span>
              <span className="sd-rating-outof">/ 5</span>
            </div>
            <div className="summary-stars">
              {"★".repeat(Math.round(averageRating))}
              {"☆".repeat(5 - Math.round(averageRating))}
            </div>
            <p className="sd-review-count">{reviews.length} Verified Reviews</p>
          </div>
        </div>

        <div className="reviews-marquee">
          <div className="reviews-track">
            {reviews.concat(reviews).map((review, index) => (
              <div key={index} className="review-card">
                <div className="sd-rev-avatar" style={{ background: avatarColor(review.userName || "") }}>
                  {initials(review.userName || "U")}
                </div>
                <div className="review-header">
                  <strong>{review.userName}</strong>
                  <span className="sd-verified">✓ Verified</span>
                </div>
                <div className="review-rating">
                  {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                </div>
                <p className="review-comment">"{review.comment}"</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "48px" }}>
          <button className="sd-write-review-btn" onClick={() => setShowReviewForm(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            Write a Review
          </button>
        </div>

        {showReviewForm && (
          <>
            <div className="sd-form-backdrop" onClick={() => setShowReviewForm(false)} />
            <div className="review-form-premium">
              <div className="review-form-header">
                <div>
                  <span className="sd-section-eyebrow">Share Your Experience</span>
                  <h3>Leave a Review</h3>
                </div>
                <button className="close-review" onClick={() => setShowReviewForm(false)}>✕</button>
              </div>

              <div className="review-form-grid">
                <div className="sd-form-field">
                  <label>Your Name</label>
                  <input type="text" placeholder="e.g. Ahmed Khan" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="sd-form-field">
                  <label>Email Address</label>
                  <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="sd-rating-label">Your Rating</div>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setRating(star)}
                    className={`sd-star ${star <= rating ? "sd-star-active" : ""}`}
                  >★</span>
                ))}
              </div>

              <div className="sd-form-field sd-form-field-full">
                <label>Your Review</label>
                <textarea
                  placeholder="Share your experience with this pharmacy…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <button className="submit-review-btn" onClick={submitReview} disabled={submitting}>
                {submitting ? <span className="sd-btn-loading">Submitting…</span> : <>Submit Review</>}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default PharmacyStore;