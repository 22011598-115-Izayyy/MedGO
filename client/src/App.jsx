import { useState } from 'react'
import './App.css'
import Navbar from './navbar'
import Home from './Home'
import Reviews from './Reviews'
import TopSellingMedicines from './TopSellingMedicines'
import HomeProduct, { allProducts } from "./homeproduct";
import Footer from './Footer'
import PharmaciesPage from './pharmaciespage';
import ProductDetails from './Productdetails';
import AllProductsPage from './AllProductsPage';
import PharmacyStore from './pharmacystore';
import Checkout from './Checkout';
import Chatbot from './Chatbot';
import { CartProvider, useCart } from './CartContext';
import AdminLogin from './adminlogin';
import SuperAdminDashboard from './SuperAdminDashboard';
import AhadPharmacyDashboard from './AhadDashboard';
import AkhtarPharmacyDashboard from './AkhtarDashboard';
import HassanPharmacyDashboard from './HassanDashboard';

const SimpleCart = ({ setShowCheckout }) => {
  const { cart, removeFromCart, getCartTotal, clearCart, updateQuantity } = useCart();

  if (cart.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', minHeight: '70vh', background: '#f8f9fa' }}>
        <h2 style={{ color: '#1a7f45', fontSize: '2.5rem', marginBottom: '20px' }}>Your Cart is Empty</h2>
        <p style={{ color: '#666', fontSize: '1.2rem', marginBottom: '30px' }}>Add some medicines to get started!</p>
        <div>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              background: '#1a7f45',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(26, 127, 69, 0.3)'
            }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', minHeight: '70vh' }}>
      <h2 style={{ color: '#1a7f45', marginBottom: '30px', fontSize: '2.5rem', textAlign: 'center' }}>Shopping Cart</h2>
      
      {cart.map(item => (
        <div key={item.id} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '25px',
          border: '1px solid #e0e0e0',
          borderRadius: '15px',
          marginBottom: '20px',
          background: 'white',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
        }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '1.3rem' }}>{item.name}</h4>
            <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '1rem' }}>By {item.pharmacy || 'Pharmacy'}</p>
            <p style={{ margin: 0, color: '#1a7f45', fontWeight: 'bold', fontSize: '1.1rem' }}>${item.price.toFixed(2)} each</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                style={{
                  background: '#1a7f45',
                  color: 'white',
                  border: 'none',
                  width: '35px',
                  height: '35px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1.4rem',
                  fontWeight: 'bold'
                }}
              >
                -
              </button>
              <span style={{ minWidth: '40px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>{item.quantity}</span>
              <button 
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                style={{
                  background: '#1a7f45',
                  color: 'white',
                  border: 'none',
                  width: '35px',
                  height: '35px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1.4rem',
                  fontWeight: 'bold'
                }}
              >
                +
              </button>
            </div>
          </div>
          
          <div style={{ textAlign: 'right', marginLeft: '25px' }}>
            <p style={{ margin: '0 0 12px 0', fontWeight: 'bold', color: '#1a7f45', fontSize: '1.3rem' }}>
              ${(item.price * item.quantity).toFixed(2)}
            </p>
            <button 
              onClick={() => removeFromCart(item.id)}
              style={{
                background: '#ff4444',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      
      <div style={{ 
        marginTop: '40px', 
        padding: '30px', 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
        borderRadius: '15px',
        textAlign: 'center',
        border: '1px solid #e0e0e0'
      }}>
        <h3 style={{ color: '#1a7f45', fontSize: '2rem', marginBottom: '25px' }}>
          Total: ${getCartTotal().toFixed(2)}
        </h3>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={clearCart}
            style={{
              background: '#ff4444',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}
          >
            Clear Cart
          </button>
          <button 
            onClick={() => setShowCheckout(true)}
            style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
            }}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
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

  // ✅ Only show Navbar & Footer when not in any dashboard
  const isDashboard =
    currentPage === "admin-dashboard" ||
    currentPage === "ahad-dashboard" ||
    currentPage === "akhtar-dashboard" ||
    currentPage === "hassan-dashboard";

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
          <SuperAdminDashboard />
        ) : currentPage === "ahad-dashboard" ? (
          <AhadPharmacyDashboard />
        ) : currentPage === "akhtar-dashboard" ? (
          <AkhtarPharmacyDashboard />
        ) : currentPage === "hassan-dashboard" ? (
          <HassanPharmacyDashboard />
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
