import React, { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useCart } from "../../Components/CartContext";
import "./MedicineDetails.css";

const MedicineDetails = ({ medicineId, setCurrentPage }) => {
  const [medicine, setMedicine] = useState(null);
  const [pharmacyName, setPharmacyName] = useState("Unknown Pharmacy");
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();

  const { productId, pharmacyId } = medicineId || {};

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (!productId || !pharmacyId) return;

        const medRef = doc(db, `Pharmacies/${pharmacyId}/products/${productId}`);
        const medSnap = await getDoc(medRef);
        if (medSnap.exists()) setMedicine(medSnap.data());

        const phRef = doc(db, "Pharmacies", pharmacyId);
        const phSnap = await getDoc(phRef);
        if (phSnap.exists()) setPharmacyName(phSnap.data().name);

      } catch (err) {
        console.log(err);
      }
      setLoading(false);
    };

    fetchDetails();
  }, [productId, pharmacyId]);

  if (loading) return (
    <div className="md-loading-screen">
      <div className="md-loading-ring" />
      <p className="md-loading-text">Loading medicine details…</p>
    </div>
  );

  if (!medicine) return (
    <div className="md-not-found">
      <div className="md-not-found-icon">💊</div>
      <h3>Medicine not found</h3>
      <button className="md-not-found-btn" onClick={() => setCurrentPage("products")}>
        ← Back to Products
      </button>
    </div>
  );

  const medName = medicine.name || medicine.productName || "Medicine";

  const medImage =
    medicine.imageUrl ||
    medicine.imageURL ||
    medicine.image ||
    medicine.imgURL ||
    medicine.img ||
    (Array.isArray(medicine.images) ? medicine.images[0] : null) ||
    "https://via.placeholder.com/350x250?text=No+Image";

  const stockLevel = Number(medicine.stock) || 0;
  const stockStatus = stockLevel <= 0 ? "out" : stockLevel <= 10 ? "low" : "in";

  // Info rows config — same data, richer display
  const infoRows = [
    { icon: "🧪", label: "Formula",      value: medicine.formula },
    { icon: "🏭", label: "Manufacturer", value: medicine.manufacturer },
    { icon: "💉", label: "Dose",         value: medicine.dose },
    { icon: "📦", label: "Quantity",     value: medicine.quantity },
    { icon: "💊", label: "Type",         value: medicine.type },
    { icon: "📅", label: "Expiry Date",  value: medicine.expiryDate },
  ];

  return (
    <div className="medicine-wrapper">

      {/* Decorative ambient orbs */}
      <div className="md-orb md-orb-1" />
      <div className="md-orb md-orb-2" />

      {/* ── BACK BUTTON (same onClick, same className) ── */}
      <button
        className="back-btn-medicine"
        onClick={() => setCurrentPage("products")}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="md-back-arrow">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Back to Products
      </button>

      {/* ── EYEBROW + TITLE + PHARMACY ── */}
      <div className="md-hero-header">
        {/* NEW: Category + Type badges */}
        <div className="md-badge-row">
          {medicine.category && (
            <span className="md-badge md-badge-category">{medicine.category}</span>
          )}
          {medicine.type && (
            <span className="md-badge md-badge-type">{medicine.type}</span>
          )}
        </div>

        {/* Existing: title */}
        <h1 className="medicine-title">{medName}</h1>

        {/* Existing: pharmacy label — now styled as a pill */}
        <div className="pharmacy-label">
          <span className="md-pharmacy-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md-pharmacy-icon">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            {pharmacyName}
          </span>
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="medicine-grid">

        {/* LEFT — IMAGE CARD */}
        <div className="medicine-image-card">
          {/* Blurred background */}
          <div
            className="md-img-blur-bg"
            style={{ backgroundImage: `url(${medImage})` }}
          />
          <div className="md-img-overlay-gradient" />

          <img
            className="medicine-img"
            src={medImage}
            alt={medName}
          />

          {/* NEW: Stock badge over image */}
          <div className={`md-stock-badge md-stock-${stockStatus}`}>
            <span className="md-stock-badge-dot" />
            {stockStatus === "out" ? "Out of Stock" : stockStatus === "low" ? `Low Stock (${stockLevel})` : `In Stock`}
          </div>

          {/* NEW: Rating display */}
          <div className="md-rating-pill">
            <span className="md-stars">★★★★★</span>
            <span className="md-rating-num">4.8</span>
          </div>
        </div>

        {/* RIGHT — INFO PANEL */}
        <div className="medicine-info-panel">

          {/* NEW: Info grid replacing plain <p> tags (same data, same fields) */}
          <div className="md-info-grid">
            {infoRows.map((row) => (
              row.value ? (
                <div className="md-info-tile" key={row.label}>
                  <span className="md-info-icon">{row.icon}</span>
                  <div className="md-info-content">
                    <span className="md-info-label">{row.label}</span>
                    <span className="md-info-value">{row.value}</span>
                  </div>
                </div>
              ) : null
            ))}
          </div>

          {/* Existing: stock info as visual bar */}
          <div className={`md-stock-bar-row md-stock-bar-${stockStatus}`}>
            <span className="md-stock-bar-dot" />
            <span className="md-stock-bar-label">
              {stockStatus === "out" ? "Out of Stock" : stockStatus === "low" ? `Low Stock — only ${stockLevel} left` : `In Stock (${stockLevel} units)`}
            </span>
            <div className="md-stock-track">
              <div
                className="md-stock-fill"
                style={{ width: stockStatus === "out" ? "0%" : stockStatus === "low" ? "22%" : "78%" }}
              />
            </div>
          </div>

          {/* Existing: Description */}
          <div className="md-desc-section">
            <div className="md-desc-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md-desc-icon">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              Description
            </div>
            <p className="description-box">{medicine.description || "No description available."}</p>
          </div>

          {/* Existing: Price + Cart */}
          <div className="md-footer">
            <div className="md-price-block">
              <span className="md-price-label">Price</span>
              <h2 className="price-tag">Rs. {medicine.price}</h2>
            </div>

            <button
              className="add-btn"
              onClick={() => {
                addToCart(medicine);
                alert(`${medName} added to cart!`);
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md-cart-icon">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              Add To Cart
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MedicineDetails;