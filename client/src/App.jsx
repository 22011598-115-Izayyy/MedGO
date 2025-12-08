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

const SimpleCart = ({ setShowCheckout }) => {
  const { cart, removeFromCart, getCartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div
        style={{
          padding: "40px 20px",
          textAlign: "center",
          minHeight: "70vh",
          background: "#f8f9fa",
        }}
      >
        <h2 style={{ color: "#1a7f45" }}>Your Cart is Empty</h2>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            background: "#1a7f45",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 20px" }}>
      <h2 style={{ color: "#1a7f45", textAlign: "center" }}>Shopping Cart</h2>
      {cart.map((item) => (
        <div
          key={item.id}
          style={{
            background: "white",
            marginBottom: "15px",
            padding: "15px",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h4>{item.name}</h4>
            <p>Rs. {item.price}</p>
          </div>
          <div>
            <button
              onClick={() => removeFromCart(item.id)}
              style={{
                background: "#ff4444",
                color: "white",
                border: "none",
                padding: "5px 10px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <h3 style={{ color: "#1a7f45" }}>Total: Rs. {getCartTotal()}</h3>
      <button
        onClick={() => setShowCheckout(true)}
        style={{
          background: "#28a745",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Proceed to Checkout
      </button>
    </div>
  );
};

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
        {!isDashboard && !isLoginPage && (
          <Navbar
            showCart={showCart}
            setShowCart={setShowCart}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        )}

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
          <MedicineDetails medicineId={selectedMedicineId} />
        ) : (
          <>
            <Home
              onSearch={handleSearch}
              searchResults={searchResults}
              searchTerm={searchTerm}
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