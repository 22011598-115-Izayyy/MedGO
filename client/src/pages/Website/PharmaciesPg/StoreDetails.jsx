import React, { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { useCart } from "../../../Components/CartContext";
import "./StoreDetails.css";

import CategoriesSection from "../HomePg/CategoriesSection";

// Images + Video
import PharmImage from "../../../assets/Pharm.png";
import Pharmacy from "../../../assets/Pharmacy.png";

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
        const q = await getDocs(productsRef);
        const fetchedProducts = q.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
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

  const heroBackground = PharmImage;

  return (
    <div className="ahadstore-container">
      {/* Back Button */}
      <div className="back-btn-container">
        <button className="back-btn" onClick={() => setCurrentPage("pharmacies")}>
          ← Back to Pharmacies
        </button>
      </div>

      {/* HERO */}
      <section
        className="hero-section"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="hero-inner">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1>{selectedPharmacy.name}</h1>
            <p>
              {selectedPharmacy.address
                ? `Serving ${selectedPharmacy.address} with quality medicines and care.`
                : "Your trusted healthcare partner."}
            </p>
          </div>
        </div>
      </section>

      <CategoriesSection />

      {/* ABOUT */}
      <section className="about-section">
        <div className="about-left">
          <h2>About {selectedPharmacy.name}</h2>
        </div>

        <div className="about-image">
          <img src={Pharmacy} alt="Pharmacy Preview" />
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="products-section">
        <h2>Our Top Products</h2>

        {loading ? (
          <p className="loading-text">Loading medicines...</p>
        ) : products.length === 0 ? (
          <p className="loading-text">No products found for this pharmacy.</p>
        ) : (
          <div className="products-grid">
            {products.map((p) => {
              const productImage =
                p.imageURL ||
                p.image ||
                p.img ||
                p.imgURL ||
                p.photoURL ||
                p.url ||
                `https://placehold.co/300x200/1a7f45/ffffff?text=${encodeURIComponent(
                  p.productName || "Medicine"
                )}`;

              return (
                <div key={p.id} className="product-card">
                  <div className="product-image">
                    <img
                      src={productImage}
                      alt={p.productName}
                      className="product-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/300x200?text=No+Image";
                      }}
                    />
                  </div>

                  <h3>{p.productName || "Unnamed Product"}</h3>
                  <p className="price">Rs. {p.price ?? "N/A"}</p>

                  <button
                    onClick={() => handleAddToCart(p)}
                    className={`add-btn ${p.stock === 0 ? "disabled" : ""}`}
                    disabled={p.stock === 0}
                  >
                    {p.stock === 0 ? "Out of Stock" : "🛒 Add to Cart"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default PharmacyStore;
