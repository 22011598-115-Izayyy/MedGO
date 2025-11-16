import React from "react";
import "./Features.css";
import { FaBriefcaseMedical, FaTruckMedical, FaUserShield, FaTags, FaClock, FaPrescriptionBottle } from "react-icons/fa6";

function Features() {
  return (
    <div className="features-section">
      <h2 className="section-title">Why Med-Go Is Your Smarter Healthcare Partner?</h2>

      <div className="features-grid">
        <div className="item">
          <FaBriefcaseMedical className="icon" />
          <h4>Wide Medicine Range</h4>
          <p>Access all types of medicines from top pharmacies near you.</p>
        </div>

        <div className="item">
          <FaTruckMedical className="icon" />
          <h4>Fast Delivery</h4>
          <p>Your medicines are delivered quickly and safely to your doorstep.</p>
        </div>

        <div className="item">
          <FaUserShield className="icon" />
          <h4>Secure & Verified</h4>
          <p>All pharmacies and riders are verified for trusted service.</p>
        </div>

        <div className="item">
          <FaTags className="icon" />
          <h4>Affordable Prices</h4>
          <p>Get the best medicine prices with exclusive discounts.</p>
        </div>

        <div className="item">
          <FaClock className="icon" />
          <h4>24/7 Support</h4>
          <p>Our support team is here to help you anytime you need.</p>
        </div>

        <div className="item">
          <FaPrescriptionBottle className="icon" />
          <h4>Easy Ordering</h4>
          <p>Order with just a few taps using our user-friendly system.</p>
        </div>
      </div>
    </div>
  );
}

export default Features;
