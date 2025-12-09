import React from "react";
import { useCart } from "../../Components/CartContext";
import "./Cart.css";
import { FaTrash } from "react-icons/fa";

const Cart = ({ setShowCheckout }) => {
  const { cart, incrementQuantity, decrementQuantity, removeFromCart, getCartTotal } = useCart();

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add items to continue shopping.</p>
          <button className="continue-shopping-btn" onClick={() => window.location.href = "/products"}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="cart-content">
          {/* ---------------- LEFT SIDE ITEMS ---------------- */}
          <div className="cart-items">
            {cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>

                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-pharmacy">{item.pharmacy || "Local Pharmacy"}</p>
                  <p className="item-price">Rs. {item.price}</p>
                </div>

                <div className="quantity-controls">
                  <button className="quantity-btn" onClick={() => decrementQuantity(item.id)}>-</button>
                  <span className="quantity">{item.quantity}</span>
                  <button className="quantity-btn" onClick={() => incrementQuantity(item.id)}>+</button>
                </div>

                <p className="item-total">Rs. {(item.price * item.quantity).toFixed(2)}</p>

                <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          {/* ---------------- RIGHT SIDE SUMMARY ---------------- */}
          <div className="cart-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>

              <div className="summary-row">
                <span>Subtotal:</span>
                <strong>Rs. {getCartTotal().toFixed(2)}</strong>
              </div>

              <div className="summary-row">
                <span>Platform Fee:</span>
                <strong>Rs. 9</strong>
              </div>

              <div className="summary-row">
                <span>Delivery Charges:</span>
                <strong>Rs. 199</strong>
              </div>

              <div className="summary-row total">
                <span>Grand Total:</span>
                <strong>Rs. {(getCartTotal() + 199 + 9).toFixed(2)}</strong>
              </div>

              <button className="checkout-btn" onClick={() => setShowCheckout(true)}>
                Proceed to Checkout
              </button>

              <button className="continue-btn" onClick={() => window.location.href = "/products"}>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
