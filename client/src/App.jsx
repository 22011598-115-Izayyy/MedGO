import { useState } from "react";
import "./App.css";
import Navbar from "./Components/navbar";
import Home from "./pages/Website/HomePg/Home";
import Reviews from "./pages/Website/HomePg/Reviews";
import TopSellingMedicines from "./pages/Website/HomePg/TopSellingMedicines";
import HomeProduct, { allProducts } from "./pages/Website/HomePg/homeproduct";
import Footer from "./Components/Footer";
import PharmaciesPage from "./pages/Website/PharmaciesPg/pharmaciespage";
import PharmacyStore from "./pages/Website/PharmaciesPg/StoreDetails";
import Checkout from "./pages/Order/Checkout";
import Chatbot from "./Components/Chatbot";
import { CartProvider, useCart } from "./Components/CartContext";
import AdminLogin from "./pages/Admin/adminlogin";
import SuperAdminDashboard from "./pages/Admin/SuperAdminDashboard";
import PharmacyDashboard from "./pages/Pharmacy/PharmacyDashboard";
import AllProductsPage from "./pages/Website/ProductPg/AllProductsPage";
import MedicineDetails from "./pages/Website/MedicineDetails.jsx";
import RiderDashboard from "./pages/Rider/RiderDashboard";
import "./pages/Order/Cart.css";

// ---------------- CART UI ----------------
const SimpleCart = ({ setShowCheckout }) => {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Your Cart is Empty</h2>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="continue-shopping-btn"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
      </div>

      <div className="cart-content">

        <div className="cart-items">
          {cart.map((item) => (
            <div className="cart-item" key={item.id}>
              <div className="item-image">
                <img
                  src={item.imageURL || item.image || "/placeholder.png"}
                  alt={item.name}
                />
              </div>

              <div className="item-details">
                <h3 className="item-name">
                  {item.productName || item.name}
                </h3>

                <p className="item-pharmacy">
                  {item.pharmacyName || "Unknown Pharmacy"}
                </p>

                <p className="item-meta">
                  {item.dose ? `${item.dose} • ` : ""}
                  {item.quantity ? item.quantity : ""}
                </p>

                <p className="item-manufacturer">
                  {item.manufacturer}
                </p>
              </div>

              <div className="quantity-controls">
                <button
                  className="quantity-btn"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  -
                </button>

                <span className="quantity">{item.quantity}</span>

                <button
                  className="quantity-btn"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>

              <p className="item-total">
                Rs. {(item.price * item.quantity).toFixed(2)}
              </p>

              <button
                className="remove-btn"
                onClick={() => removeFromCart(item.id)}
              >
                🗑
              </button>
            </div>
          ))}
        </div>

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
              <strong>
                Rs. {(getCartTotal() + 199 + 9).toFixed(2)}
              </strong>
            </div>

            <button
              className="checkout-btn"
              onClick={() => setShowCheckout(true)}
            >
              Proceed to Checkout
            </button>

            <button
              className="continue-btn"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
// ---------------- END CART UI ----------------


function App() {
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [selectedMedicineId, setSelectedMedicineId] = useState(null);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim() === "") {
      setSearchResults([]);
      return;
    }
    const results = allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(term.toLowerCase()) ||
        product.pharmacy.toLowerCase().includes(term.toLowerCase())
    );
    setSearchResults(results);
  };

  const isDashboard =
    currentPage === "admin-dashboard" ||
    currentPage === "pharmacy-dashboard" ||
    currentPage === "rider-dashboard";

  const isLoginPage = currentPage === "admin";

  return (
    <CartProvider>
      <div>
        {/* NAVBAR */}
        {!isDashboard && !isLoginPage && (
          <Navbar
            showCart={showCart}
            setShowCart={setShowCart}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        )}

        {/* CHECKOUT PAGE */}
        {showCheckout ? (
          <Checkout
            setShowCart={setShowCart}
            setShowCheckout={setShowCheckout}
          />

        ) : showCart ? (
          <SimpleCart setShowCheckout={setShowCheckout} />

        ) : currentPage === "pharmacies" ? (
          <PharmaciesPage
            setCurrentPage={setCurrentPage}
            setSelectedPharmacy={setSelectedPharmacy}
          />

        ) : currentPage === "store" ? (
          <PharmacyStore
            setCurrentPage={setCurrentPage}
            selectedPharmacy={selectedPharmacy}
            setSelectedMedicineId={setSelectedMedicineId}
          />

        ) : currentPage === "products" ? (
          <AllProductsPage
            setCurrentPage={setCurrentPage}
            setSelectedMedicineId={setSelectedMedicineId}
          />

        ) : currentPage === "admin" ? (
          <AdminLogin setCurrentPage={setCurrentPage} />

        ) : currentPage === "admin-dashboard" ? (
          <SuperAdminDashboard setCurrentPage={setCurrentPage} />

        ) : currentPage === "pharmacy-dashboard" ? (
          <PharmacyDashboard setCurrentPage={setCurrentPage} />

        ) : currentPage === "rider-dashboard" ? (
          <RiderDashboard setCurrentPage={setCurrentPage} />

        ) : currentPage === "medicine-details" ? (
          <MedicineDetails
            medicineId={selectedMedicineId}
            setCurrentPage={setCurrentPage}
          />

        ) : (
          <>
          
            <Home
              onSearch={handleSearch}
              searchResults={searchResults}
              searchTerm={searchTerm}
              // ⭐⭐⭐ ADD THIS FOR CLICKING SEARCH RESULTS ⭐⭐⭐
              setCurrentPage={setCurrentPage}
              setSelectedMedicineId={setSelectedMedicineId}
            />

            <TopSellingMedicines
              setCurrentPage={setCurrentPage}
              setSelectedMedicineId={setSelectedMedicineId}
            />

            <Reviews />
          </>
        )}

        {!isDashboard && !isLoginPage && (
          <Footer setCurrentPage={setCurrentPage} />
        )}

        <Chatbot />
      </div>
    </CartProvider>
  );
}

export default App;
