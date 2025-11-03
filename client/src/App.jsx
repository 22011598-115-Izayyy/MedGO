import { useState } from 'react';
import './App.css';
import Navbar from './navbar';
import Home from './Home';
import Reviews from './Reviews';
import TopSellingMedicines from './TopSellingMedicines';
import HomeProduct, { allProducts } from "./homeproduct";
import Footer from './Footer';
import PharmaciesPage from './pharmaciespage';
import AllProductsPage from './AllProductsPage';
import PharmacyStore from './pharmacystore';
import Checkout from './Checkout';
import Chatbot from './Chatbot';
import { CartProvider, useCart } from './CartContext';
import AdminLogin from './adminlogin';
import SuperAdminDashboard from './SuperAdminDashboard';
import PharmacyDashboard from './PharmacyDashboard'; // ✅ Unified Dashboard

// ✅ Simplified Cart Component
const SimpleCart = ({ setShowCheckout }) => {
  const { cart, removeFromCart, getCartTotal, clearCart, updateQuantity } = useCart();

  if (cart.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', minHeight: '70vh', background: '#f8f9fa' }}>
        <h2 style={{ color: '#1a7f45' }}>Your Cart is Empty</h2>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            background: '#1a7f45',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px' }}>
      <h2 style={{ color: '#1a7f45', textAlign: 'center' }}>Shopping Cart</h2>
      {cart.map(item => (
        <div key={item.id} style={{
          background: 'white',
          marginBottom: '15px',
          padding: '15px',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h4>{item.name}</h4>
            <p>Rs. {item.price}</p>
          </div>
          <div>
            <button onClick={() => removeFromCart(item.id)} style={{
              background: '#ff4444',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>Remove</button>
          </div>
        </div>
      ))}
      <h3 style={{ color: '#1a7f45' }}>Total: Rs. {getCartTotal()}</h3>
      <button 
        onClick={() => setShowCheckout(true)}
        style={{
          background: '#28a745',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          cursor: 'pointer'
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

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim() === "") {
      setSearchResults([]);
      return;
    }
    const results = allProducts.filter(product =>
      product.name.toLowerCase().includes(term.toLowerCase()) ||
      product.pharmacy.toLowerCase().includes(term.toLowerCase())
    );
    setSearchResults(results);
  };

  const isDashboard =
    currentPage === "admin-dashboard" ||
    currentPage === "pharmacy-dashboard";

  return (
    <CartProvider>
      <div>
        {!isDashboard && (
          <Navbar
            showCart={showCart}
            setShowCart={setShowCart}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        )}

        {showCheckout ? (
          <Checkout setShowCart={setShowCart} setShowCheckout={setShowCheckout} />
        ) : showCart ? (
          <SimpleCart setShowCheckout={setShowCheckout} />
        ) : currentPage === "pharmacies" ? (
          <PharmaciesPage setCurrentPage={setCurrentPage} />
        ) : currentPage === "products" ? (
          <AllProductsPage />
        ) : currentPage === "store" ? (
          <PharmacyStore />
        ) : currentPage === "admin" ? (
          <AdminLogin setCurrentPage={setCurrentPage} />
        ) : currentPage === "admin-dashboard" ? (
          <SuperAdminDashboard setCurrentPage={setCurrentPage} />
        ) : currentPage === "pharmacy-dashboard" ? (
          <PharmacyDashboard setCurrentPage={setCurrentPage} /> // ✅ Unified Dashboard
        ) : (
          <>
            <Home onSearch={handleSearch} searchResults={searchResults} searchTerm={searchTerm} />
            <TopSellingMedicines setCurrentPage={setCurrentPage} />
            <Reviews />
          </>
        )}

        {!isDashboard && <Footer />}
        <Chatbot />
      </div>
    </CartProvider>
  );
}

export default App;
