import React, { useEffect, useState } from "react";
import { useCart } from "../../../Components/CartContext";
import { db } from "../../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import "./TopSellingMedicines.css";

const TopSellingMedicines = ({ setCurrentPage }) => {
  const { addToCart } = useCart();
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch ONLY from Pharmacies collection
  useEffect(() => {
    const fetchAllMedicines = async () => {
      try {
        let allMedicines = [];

        const pharmaciesSnapshot = await getDocs(collection(db, "Pharmacies"));

        for (const pharmacyDoc of pharmaciesSnapshot.docs) {
          const pharmacyId = pharmacyDoc.id;

          const productsRef = collection(
            db,
            "Pharmacies",
            pharmacyId,
            "products"
          );

          const productsSnapshot = await getDocs(productsRef);

          const products = productsSnapshot.docs.map((doc) => ({
            id: doc.id,
            pharmacyName: pharmacyDoc.data().name,
            ...doc.data(),
          }));

          allMedicines = [...allMedicines, ...products];
        }

        setTopSellingProducts(allMedicines.slice(0, 6));
      } catch (error) {
        console.error("Error fetching medicines:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMedicines();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`${product.productName} added to cart!`);
  };

  const handleViewAllProducts = () => {
    setCurrentPage("products");
  };

  return (
    <section className="top-selling-section">
      <div className="top-selling-container">
        <div className="section-header">
          <h2 className="section-title">Most Ordered Medicines on Med-Go</h2>
          <p className="section-subtitle">
            Shop our most popular medicines, chosen by customers for their
            effectiveness and trusted results. Every product is authentic,
            pharmacy-verified, and delivered quickly to your home.
          </p>
        </div>

        <div className="products-grid">
          {loading ? (
            <p style={{ textAlign: "center", fontSize: "1.2rem", color: "#666" }}>
              Loading medicines...
            </p>
          ) : topSellingProducts.length === 0 ? (
            <p style={{ textAlign: "center", fontSize: "1.2rem", color: "#666" }}>
              No medicines found.
            </p>
          ) : (
            topSellingProducts.map((product) => {
              // ⭐ UNIVERSAL IMAGE LOADER (fix for Master Medicine)
              const productImage =
                product.imageURL ||
                product.image ||
                product.imgURL ||
                product.img ||
                product.photoURL ||
                product.picture ||
                (Array.isArray(product.images) ? product.images[0] : null) ||
                product.url ||
                product.thumbnail ||
                product.featuredImage ||
                `https://placehold.co/400x200/1a7f45/ffffff?text=${encodeURIComponent(
                  product.productName
                )}`;

              return (
                <div key={product.id} className="product-card">
                  {/* PRODUCT IMAGE */}
                  <div className="product-image">
                    <img
                      src={productImage}
                      alt={product.productName}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/400x200/1a7f45/ffffff?text=No+Image";
                      }}
                    />

                    <div className="bestseller-badge">
                      <span className="badge-icon">🏆</span>
                      <span className="badge-text">Bestseller</span>
                    </div>

                    <div className="product-rating">
                      <span className="stars">★★★★★</span>
                      <span className="rating-number">(4.5)</span>
                    </div>
                  </div>

                  {/* PRODUCT DETAILS */}
                  <div className="product-info">
                    <h3 className="product-name">{product.productName}</h3>

                    <p className="product-pharmacy">
                      By {product.pharmacyName || "Unknown Pharmacy"}
                    </p>

                    <div className="product-sales">
                      {product.category || "General Medicine"}
                    </div>

                    <div className="product-footer">
                      <div className="product-price">
                        PKR {Number(product.price).toFixed(2)}
                      </div>

                      <button
                        className="add-to-cart-btn"
                        onClick={() => handleAddToCart(product)}
                      >
                        <span className="cart-icon">🛒</span>
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="view-all-section">
          <button className="view-all-btn" onClick={handleViewAllProducts}>
            <span>View All Products</span>
            <span className="arrow-icon">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default TopSellingMedicines;
