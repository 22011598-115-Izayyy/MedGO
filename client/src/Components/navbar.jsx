import React from 'react';
import './navbar.css';
import { useCart } from './CartContext';

export default function Navbar({ showCart, setShowCart, currentPage, setCurrentPage }) {
  const { cart } = useCart();
  
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleNavClick = (page) => {
    setCurrentPage(page);
    setShowCart(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <div className="navbar-logo">
            <h2>MED-GO</h2>
          </div>
        </div>
        
        <ul className="navbar-menu">
          <li>
            <button 
              className={currentPage === 'home' ? 'active' : ''}
              onClick={() => handleNavClick('home')}
            >
              Home
            </button>
          </li>
          <li>
            <button 
              className={currentPage === 'pharmacies' ? 'active' : ''}
              onClick={() => handleNavClick('pharmacies')}
            >
              Pharmacies
            </button>
          </li>
          <li>
            <button 
              className={currentPage === 'products' ? 'active' : ''}
              onClick={() => handleNavClick('products')}
            >
              Products
            </button>
          </li>
        </ul>
        
        <div className="navbar-right">

          {/* ⭐ ADDED BUTTON FOR NEARBY PHARMACY MAP */}
          <button 
            className={`nearby-btn ${currentPage === 'nearby-pharmacy' ? 'active' : ''}`}
            onClick={() => handleNavClick('nearby-pharmacy')}
          >
            📍 Nearby Pharmacy
          </button>

          <button 
            className="cart-btn"
            onClick={() => setShowCart(!showCart)}
          >
            🛒 Cart ({cartItemsCount})
          </button>

          <button 
            className={`login-btn ${currentPage === 'admin' ? 'active' : ''}`}
            onClick={() => handleNavClick('admin')}
          >
            🔐 Login
          </button>

        </div>
      </div>
    </nav>
  );
}