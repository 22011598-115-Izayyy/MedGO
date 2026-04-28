import React, { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import "./pharmaciespage.css";

import AhadLogo from "../../../assets/ahad.png";
import AkhtarLogo from "../../../assets/akhtar.png";
import HassanLogo from "../../../assets/hassan.png";
import HeroPharm from "../../../assets/heropharm.jpg";

function PharmaciesPage({ setCurrentPage, setSelectedPharmacy }) {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Pharmacies"));
        const pharmacyList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPharmacies(pharmacyList);
      } catch (error) {
        console.error("Error fetching pharmacies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPharmacies();
  }, []);

  const getPharmacyLogo = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes("ahad")) return AhadLogo;
    if (lower.includes("akhtar")) return AkhtarLogo;
    if (lower.includes("hassan")) return HassanLogo;
    return null;
  };

  // NEW: accent colors per card index (cycles)
  const accentColors = [
    "#059669", "#2563eb", "#d97706", "#7c3aed", "#dc2626", "#0891b2",
  ];

  return (
    <div className="pharmacies-section">

      {/* ── HERO ── */}
      <section
        className="pharmacies-hero"
        style={{ backgroundImage: `url(${HeroPharm})` }}
      >
        <div className="pharmacies-hero-overlay" />

        {/* Decorative orbs */}
        <div className="ph-orb ph-orb-1" />
        <div className="ph-orb ph-orb-2" />

        <div className="ph-hero-content">
          {/* NEW: eyebrow */}
          <div className="ph-eyebrow">
            <span className="ph-eyebrow-dot" />
            MedGO Partner Network
          </div>

          <h2 className="pharmacies-title">
            Connecting You to
            <br />
            <span className="ph-title-accent">Trusted Pharmacies</span>
          </h2>

          <p className="pharmacies-subtitle">
            Find trusted pharmacies near you with fast delivery and professional service.
          </p>

          {/* NEW: Pill count strip */}
          {!loading && (
            <div className="ph-hero-strip">
              <div className="ph-hero-pill">
                <span className="ph-hero-pill-num">{pharmacies.length}</span>
                <span className="ph-hero-pill-lbl">Pharmacies</span>
              </div>
              <div className="ph-hero-pill-div" />
              <div className="ph-hero-pill">
                <span className="ph-hero-pill-num">24/7</span>
                <span className="ph-hero-pill-lbl">Available</span>
              </div>
              <div className="ph-hero-pill-div" />
              <div className="ph-hero-pill">
                <span className="ph-hero-pill-num">Fast</span>
                <span className="ph-hero-pill-lbl">Delivery</span>
              </div>
            </div>
          )}
        </div>

        {/* SVG wave */}
        <div className="ph-hero-wave">
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,45 C480,90 960,0 1440,45 L1440,90 L0,90 Z" fill="#F8FAFC" />
          </svg>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <div className="pharmacies-container">

        {/* NEW: Section header */}
        <div className="ph-section-header">
          <div className="ph-section-line" />
          <span className="ph-section-label">Our Partner Pharmacies</span>
          <div className="ph-section-line" />
        </div>

        {loading ? (
          /* NEW: Skeleton grid */
          <div className="pharmacies-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div className="ph-skeleton-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="ph-skel ph-skel-img" />
                <div className="ph-skel-body">
                  <div className="ph-skel ph-skel-title" />
                  <div className="ph-skel ph-skel-row" />
                  <div className="ph-skel ph-skel-row" />
                  <div className="ph-skel ph-skel-row ph-skel-short" />
                  <div className="ph-skel ph-skel-btn" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="pharmacies-grid">
            {pharmacies.map((pharmacy, index) => {
              const logo = getPharmacyLogo(pharmacy.name);
              const accent = accentColors[index % accentColors.length];

              return (
                <div
                  className="pharmacy-card"
                  key={pharmacy.id}
                  style={{
                    "--ph-accent": accent,
                    animationDelay: `${index * 0.08}s`,
                  }}
                >
                  {/* NEW: Top accent bar */}
                  <div className="ph-card-accent-bar" />

                  {/* NEW: Card index badge */}
                  <div className="ph-card-index">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  {/* Image */}
                  <div className="pharmacy-image">
                    <img
                      src={logo || `https://placehold.co/400x200/1a7f45/ffffff?text=${encodeURIComponent(pharmacy.name)}`}
                      alt={pharmacy.name}
                      className="pharmacy-logo-img"
                    />
                    {/* NEW: Image overlay on hover */}
                    <div className="ph-img-overlay">
                      <span className="ph-img-overlay-text">View Store</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="pharmacy-content">
                    {/* NEW: Status badge */}
                    <div className="ph-status-badge">
                      <span className="ph-status-dot" />
                      Active
                    </div>

                    <h3 className="pharmacy-name">{pharmacy.name}</h3>

                    <div className="ph-info-list">
                      <div className="ph-info-row">
                        <span className="ph-info-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                        </span>
                        <span className="ph-info-text">{pharmacy.address}</span>
                      </div>
                      <div className="ph-info-row">
                        <span className="ph-info-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.23h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.07 6.07l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/>
                          </svg>
                        </span>
                        <span className="ph-info-text">{pharmacy.phone}</span>
                      </div>
                      <div className="ph-info-row">
                        <span className="ph-info-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                          </svg>
                        </span>
                        <span className="ph-info-text">{pharmacy.email}</span>
                      </div>
                    </div>

                    <button
                      className="pharmacy-visit-btn"
                      onClick={() => {
                        setSelectedPharmacy(pharmacy);
                        setCurrentPage("store");
                      }}
                    >
                      Visit Store
                      <svg className="ph-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default PharmaciesPage;