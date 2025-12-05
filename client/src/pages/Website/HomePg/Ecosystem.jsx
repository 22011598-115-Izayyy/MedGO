import React from "react";
import "./Ecosystem.css";

// Import images
import sourceImg from "../../../assets/source.jpeg";
import expiryImg from "../../../assets/expiry.jpeg";
import safetyImg from "../../../assets/safety.jpeg";
import trackingImg  from "../../../assets/tracking.jpeg"; // ⭐ 4th card image
// ==========================================
// QUALITY SECTION
// ==========================================
export const QualityPromiseSection = () => {
  return (
    <section className="quality-section">
      <div className="section-container">
        <div className="quality-header">
          <h2 className="section-title">The MedGo Quality Shield</h2>
          <p className="section-subtitle">
            We enforce a <strong>Zero-Tolerance Policy</strong> for counterfeits, ensuring every medicine is fully verified, safe, and authentic.
          </p>
        </div>

        <div className="quality-grid">

          {/* CARD 1 */}
          <div className="quality-step">
            <img src={sourceImg} className="quality-icon" alt="Source Verification" />
            <h3>Source Verification</h3>
            <p>We only work with pharmacies that buy directly from manufacturers.</p>
          </div>

          {/* CARD 2 */}
          <div className="quality-step">
            <img src={expiryImg} className="quality-icon" alt="Digital Expiry Guard" />
            <h3>Digital Expiry Guard</h3>
            <p>Products within 6 months of expiry are automatically blocked.</p>
          </div>

          {/* CARD 3 */}
          <div className="quality-step">
            <img src={safetyImg} className="quality-icon" alt="Sealed for Safety" />
            <h3>Sealed for Safety</h3>
            <p>Every order arrives in tamper-proof MedGo Secure Shield™ packaging.</p>
          </div>

          {/* CARD 4 */}
          <div className="quality-step">
            <img src={trackingImg} className="quality-icon" alt="Verified Pharmacies" />
            <h3>Authenticity Chain Tracking</h3>
            <p>We record every medicine’s movement from  pharmacy → customer to guarantee authenticity at every step.</p>
          </div>

        </div>
      </div>
    </section>
  );
};

// ==========================================
// DIVIDER
// ==========================================
export const SectionDivider = () => {
  return <div className="section-divider"></div>;
};

// ==========================================
// HEALTHCARE GAP SECTION
// ==========================================
export const HealthcareGapSection = () => {
  return (
    <section className="gap-section">
      <div className="gap-container">

        <div className="gap-content">
          <span className="story-badge">OUR MISSION</span>
          <h2 className="gap-title">Ending the "Pharmacy Hop"</h2>

          <div className="story-block">
            <p className="highlight-p">
              Everyone knows the frustration of hearing 
              <span className="red-text"> "Out of Stock."</span>
            </p>

            <p>
              In Pakistan, finding critical medication is often a struggle.
              Inventory is fragmented, phone lines are busy, and availability is uncertain.
            </p>

            <p>
              <strong>MedGo changes this narrative forever.</strong>
              By combining verified pharmacies, real-time inventory,
              and instant delivery — MedGo makes healthcare reliable and stress-free.
            </p>
          </div>
        </div>

        <div className="gap-image-wrapper">
          <div className="abstract-circle c1"></div>
          <div className="abstract-circle c2"></div>

          <div className="glass-card">
            <div className="check-icon">✓</div>
            <div>
              <span className="glass-title">Medicine Found!</span><br />
              <span className="glass-sub">G-9 Markaz • 12 mins away</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

// ==========================================
// MAIN EXPORT
// ==========================================
const Ecosystem = () => {
  return (
    <>
      <QualityPromiseSection />
      <SectionDivider />
      <HealthcareGapSection />
    </>
  );
};

export default Ecosystem;
