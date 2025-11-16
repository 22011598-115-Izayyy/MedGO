import React, { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { useCart } from "../../../Components/CartContext";
import "./StoreDetails.css";

function PharmacyStore({ setCurrentPage, selectedPharmacy }) {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedPharmacy?.id) return;

    const fetchProducts = async () => {
      try {
        const productsRef = collection(
          db,
          `Pharmacies/${selectedPharmacy.id}/products`
        );
        const querySnapshot = await getDocs(productsRef);
        const fetchedProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched Products:", fetchedProducts);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedPharmacy]);

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`${product.productName || product.name} added to cart!`);
  };

  if (!selectedPharmacy) {
    return (
      <div className="ahadstore-container">
        <p className="loading-text">No pharmacy selected.</p>
      </div>
    );
  }

  return (
    <div className="ahadstore-container">
      <div className="back-btn-container">
        <button className="back-btn" onClick={() => setCurrentPage("pharmacies")}>
          ← Back to Pharmacies
        </button>
      </div>

      <section className="hero-section">
        <div className="hero-content">
          <h1>{selectedPharmacy.name}</h1>
          <p>
            {selectedPharmacy.address
              ? `Serving ${selectedPharmacy.address} with quality medicines and care.`
              : "Your trusted healthcare partner."}
          </p>
          <div className="hero-stats">
            <div>
              <h3>25+</h3>
              <p>Years Experience</p>
            </div>
            <div>
              <h3>5000+</h3>
              <p>Happy Customers</p>
            </div>
            <div>
              <h3>24/7</h3>
              <p>Service Available</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>About {selectedPharmacy.name}</h2>
        <p>
          {selectedPharmacy.description
            ? selectedPharmacy.description
            : `${selectedPharmacy.name} has been serving the people of Gujrat for years, providing trusted healthcare and timely delivery of medicines.`}
        </p>

        <div className="about-features">
          <div className="feature">✅ Licensed Products</div>
          <div className="feature">⚡ Fast Home Delivery</div>
          <div className="feature">💊 Quality Assured Medicines</div>
          <div className="feature">📦 Affordable Prices</div>
        </div>
      </section>

      <section className="products-section">
        <h2>Our Top Products</h2>

        {loading ? (
          <p className="loading-text">Loading medicines...</p>
        ) : products.length === 0 ? (
          <p className="loading-text">No products found for this pharmacy.</p>
        ) : (
          <div className="products-grid">
            {products.map((p) => (
              <div key={p.id} className="product-card">
                <div
                  className="product-placeholder"
                  style={{
                    width: "100%",
                    height: "180px",
                    backgroundColor: "#f1f1f1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                    color: "#1a7f45",
                    fontWeight: "600",
                    fontSize: "1.2rem",
                  }}
                >
                  {p.productName || "Medicine"}
                </div>

                <h3>{p.productName || "Unnamed Product"}</h3>
                <p>{p.description || "No description available."}</p>
                <p className="price">Rs. {p.price ?? "N/A"}</p>
                <button
                  onClick={() => handleAddToCart(p)}
                  className={`add-btn ${p.stock === 0 ? "disabled" : ""}`}
                  disabled={p.stock === 0}
                >
                  {p.stock === 0 ? "Out of Stock" : "🛒 Add to Cart"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default PharmacyStore;
