import React, { useState } from 'react';
import { useCart } from './CartContext';
import './Checkout.css';

const Checkout = ({ setShowCart, setShowCheckout }) => {
  const { cart, getCartTotal, clearCart } = useCart();
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    shippingAddress: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!formData.shippingAddress.trim()) {
      newErrors.shippingAddress = 'Shipping address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Simulate order placement
    setOrderPlaced(true);
    
    // Clear cart after successful order
    setTimeout(() => {
      clearCart();
      setShowCheckout(false);
      setShowCart(false);
    }, 3000);
  };

  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="order-success">
            <div className="success-icon">✅</div>
            <h2>Order Placed Successfully!</h2>
            <p>Thank you for your order. Your medicines will be delivered via Cash on Delivery.</p>
            <div className="order-details">
              <h3>Order Summary</h3>
              <p><strong>Total Amount:</strong> ${getCartTotal().toFixed(2)}</p>
              <p><strong>Payment Method:</strong> Cash on Delivery</p>
              <p><strong>Delivery Address:</strong> {formData.shippingAddress}</p>
            </div>
            <p className="redirect-message">Redirecting to homepage in a few seconds...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h2>Checkout</h2>
          <button 
            className="back-btn"
            onClick={() => setShowCheckout(false)}
          >
            ← Back to Cart
          </button>
        </div>

        <div className="checkout-content">
          <div className="checkout-form">
            <h3>Delivery Information</h3>
            <form onSubmit={handlePlaceOrder}>
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={errors.fullName ? 'error' : ''}
                  placeholder="Enter your full name"
                />
                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="Enter your email address"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number *</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className={errors.phoneNumber ? 'error' : ''}
                  placeholder="Enter your phone number"
                />
                {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="shippingAddress">Shipping Address *</label>
                <textarea
                  id="shippingAddress"
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleInputChange}
                  className={errors.shippingAddress ? 'error' : ''}
                  placeholder="Enter your complete delivery address"
                  rows="4"
                />
                {errors.shippingAddress && <span className="error-message">{errors.shippingAddress}</span>}
              </div>

              <div className="payment-method">
                <h4>Payment Method</h4>
                <div className="payment-option selected">
                  <div className="payment-info">
                    <span className="payment-icon">💵</span>
                    <div>
                      <strong>Cash on Delivery</strong>
                      <p>Pay when your order arrives at your doorstep</p>
                    </div>
                  </div>
                  <span className="selected-indicator">✓</span>
                </div>
              </div>

              <button type="submit" className="place-order-btn">
                Place Order - ${getCartTotal().toFixed(2)}
              </button>
            </form>
          </div>

          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="checkout-item">
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p>By {item.pharmacy || 'Pharmacy'}</p>
                    <span className="item-quantity">Qty: {item.quantity}</span>
                  </div>
                  <div className="item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="total-section">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Delivery:</span>
                <span className="free">Free</span>
              </div>
              <div className="total-row final-total">
                <span>Total:</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;