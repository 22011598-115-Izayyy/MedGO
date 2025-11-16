import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Company Section */}
        <div className="footer-section">
          <div className="footer-logo">
            <h3>MedGo</h3>
            <p>Your trusted online pharmacy platform. Find nearby pharmacies and order medicines with ease.</p>
          </div>
          <div className="social-links">
            <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#nearby">Find Nearby Pharmacies</a></li>
            <li><a href="#pharmacies">All Pharmacies</a></li>
            <li><a href="#chatbot">Health Assistant</a></li>
          </ul>
        </div>

        {/* Services */}
        <div className="footer-section">
          <h4>Our Services</h4>
          <ul>
            <li><a href="#">Prescription Medicines</a></li>
            <li><a href="#">Over-the-Counter Drugs</a></li>
            <li><a href="#">Health Supplements</a></li>
            <li><a href="#">Medical Equipment</a></li>
            <li><a href="#">Health Consultation</a></li>
          </ul>
        </div>

        {/* Support */}
        <div className="footer-section">
          <h4>Customer Support</h4>
          <ul>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Track Your Order</a></li>
            <li><a href="#">Return Policy</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h4>Contact Us</h4>
          <div className="contact-info">
            <p><i className="fas fa-phone"></i> +1 (555) 123-4567</p>
            <p><i className="fas fa-envelope"></i> support@medgo.com</p>
            <p><i className="fas fa-map-marker-alt"></i> 123 Health Street, Medical City</p>
            <p><i className="fas fa-clock"></i> 24/7 Customer Support</p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; 2025 MedGo. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;