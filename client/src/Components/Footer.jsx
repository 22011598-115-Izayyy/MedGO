import React from 'react';
import './Footer.css';

const Footer = ({ setCurrentPage }) => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Company Section */}
        <div className="footer-section">
          <div className="footer-logo">
            <h3>MedGo</h3>
            <p>Your trusted online pharmacy platform connecting users with nearby pharmacies.</p>
          </div>

          <div className="social-links">
            <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>

        {/* Company */}
        <div className="footer-section">
          <h4>Company</h4>
          <ul>

            <li>
              <button
                className="footer-link-button"
                onClick={() => setCurrentPage("about")} // If no about page, I can add one for you
              >
                About MedGo
              </button>
            </li>

            <li>
              <button
                className="footer-link-button"
                onClick={() => setCurrentPage("contact")}
              >
                Contact Us
              </button>
            </li>

          </ul>
        </div>

        {/* Services */}
        <div className="footer-section">
          <h4>Services</h4>
          <ul>

            <li>
              <button
                className="footer-link-button"
                onClick={() => setCurrentPage("products")}
              >
                Browse Medicines
              </button>
            </li>

            <li>
              <button
                className="footer-link-button"
                onClick={() => setCurrentPage("pharmacies")}
              >
                Pharmacy Registration
              </button>
            </li>

            <li>
              <button
                className="footer-link-button"
                onClick={() => setCurrentPage("admin")} // Your login page value
              >
                Customer Login / Signup
              </button>
            </li>

          </ul>
        </div>

        {/* Legal */}
        <div className="footer-section">
          <h4>Legal</h4>
          <ul>

            <li>
              <button
                className="footer-link-button"
                onClick={() => setCurrentPage("terms")}
              >
                Terms & Conditions
              </button>
            </li>

            <li>
              <button
                className="footer-link-button"
                onClick={() => setCurrentPage("privacy")}
              >
                Privacy Policy
              </button>
            </li>

          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h4>Connect</h4>
          <div className="contact-info">
            <p><i className="fas fa-phone"></i> +1 (555) 123-4567</p>
            <p><i className="fas fa-envelope"></i> support@medgo.com</p>
            <p><i className="fas fa-clock"></i> WhatsApp Support Available</p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; 2025 MedGo. All rights reserved.</p>

          <div className="footer-bottom-links">

            <button className="footer-link-button" onClick={() => setCurrentPage("privacy")}>
              Privacy
            </button>

            <button className="footer-link-button" onClick={() => setCurrentPage("terms")}>
              Terms
            </button>

          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;