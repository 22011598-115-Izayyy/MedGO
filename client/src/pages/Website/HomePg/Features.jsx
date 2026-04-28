import React from "react";
import "./Features.css";
import { FaBriefcaseMedical, FaTruckMedical, FaUserShield, FaTags, FaClock, FaPrescriptionBottle } from "react-icons/fa6";

function Features() {
  return (
    <div className="features-section">

      {/* ambient orbs */}
      <div className="ft-orb ft-orb-1"></div>
      <div className="ft-orb ft-orb-2"></div>
      <div className="ft-orb ft-orb-3"></div>

      {/* header */}
      <div className="ft-header">
        <span className="ft-eyebrow">WHY MEDGO</span>
        <h2 className="section-title">Why Med-Go Is Your Smarter Healthcare Partner?</h2>
        <p className="section-subtitle">
          Healthcare is complex; we make it invisible. MedGo doesn't just deliver medicine;
          we orchestrate a sophisticated, hyper-local network that connects your needs
          to trusted inventories in milliseconds.
        </p>
        <div className="ft-title-line"></div>
      </div>

      <div className="features-grid">

        <div className="item">
          <div className="icon-wrap">
            <FaBriefcaseMedical className="icon" />
          </div>
          <h4>Wide Medicine Range</h4>
          <p>Access all types of medicines from top pharmacies near you.</p>
          <div className="item-glow"></div>
        </div>

        <div className="item">
          <div className="icon-wrap">
            <FaTruckMedical className="icon" />
          </div>
          <h4>Fast Delivery</h4>
          <p>Your medicines are delivered quickly and safely to your doorstep.</p>
          <div className="item-glow"></div>
        </div>

        <div className="item">
          <div className="icon-wrap">
            <FaUserShield className="icon" />
          </div>
          <h4>Secure & Verified</h4>
          <p>All pharmacies and riders are verified for trusted service.</p>
          <div className="item-glow"></div>
        </div>

        <div className="item">
          <div className="icon-wrap">
            <FaTags className="icon" />
          </div>
          <h4>Affordable Prices</h4>
          <p>Get the best medicine prices with exclusive discounts.</p>
          <div className="item-glow"></div>
        </div>

        <div className="item">
          <div className="icon-wrap">
            <FaClock className="icon" />
          </div>
          <h4>24/7 Support</h4>
          <p>Our support team is here to help you anytime you need.</p>
          <div className="item-glow"></div>
        </div>

        <div className="item">
          <div className="icon-wrap">
            <FaPrescriptionBottle className="icon" />
          </div>
          <h4>Easy Ordering</h4>
          <p>Order with just a few taps using our user-friendly system.</p>
          <div className="item-glow"></div>
        </div>

      </div>
    </div>
  );
}

export default Features;