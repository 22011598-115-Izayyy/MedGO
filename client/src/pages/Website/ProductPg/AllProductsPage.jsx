import React, { useEffect, useState } from "react";
import "./AllProductsPage.css";
import { db } from "../../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { useCart } from "../../../Components/CartContext";

function AllProductsPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [pharmacyFilter, setPharmacyFilter] = useState("all");
  const [pharmacyOptions, setPharmacyOptions] = useState([]);

  // Fetch all products from all pharmacies
  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      try {
        const pharmaciesSnap = await getDocs(collection(db, "Pharmacies"));
        let allProducts = [];
        let pharmacyNames = [];
        for (const pharmacyDoc of pharmaciesSnap.docs) {
          const pharmacyId = pharmacyDoc.id;
          const pharmacyData = pharmacyDoc.data();
          pharmacyNames.push(pharmacyData.name || "Unknown Pharmacy");
          const productsSnap = await getDocs(
            collection(db, `Pharmacies/${pharmacyId}/products`)
          );
          productsSnap.forEach((prodDoc) => {
            allProducts.push({
              id: prodDoc.id,
              ...prodDoc.data(),
              pharmacyName: pharmacyData.name || "Unknown Pharmacy",
            });
          });
        }
        setProducts(allProducts);
        setPharmacyOptions([...new Set(pharmacyNames)]);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
      setLoading(false);
    };
    fetchAllProducts();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`${product.productName || product.name} added to cart!`);
  };

  // Filter and search logic
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      (product.productName || product.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesPharmacy =
      pharmacyFilter === "all" ||
      product.pharmacyName === pharmacyFilter;
    return matchesSearch && matchesPharmacy;
  });

  return (
    <div className="all-products-page">
      {/* Hero/Header */}
      <section className="products-hero">
        <div className="hero-content">
          <h1 className="page-title">Trusted Medicines, All in One Place</h1>
          <p className="page-subtitle">
            Browse and shop medicines and healthcare products from all pharmacies in one place.
          </p>
        </div>
      </section>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-filter">
          <input
            className="search-input"
            type="text"
            placeholder="Search for a product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="category-filter">
          <select
            className="category-select"
            value={pharmacyFilter}
            onChange={(e) => setPharmacyFilter(e.target.value)}
          >
            <option value="all">All Pharmacies</option>
            {pharmacyOptions.map((pharmacy) => (
              <option key={pharmacy} value={pharmacy}>
                {pharmacy}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-container">
        {loading ? (
          <div className="no-results">
            <span className="no-results-icon">⏳</span>
            <h3>Loading products...</h3>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="no-results">
            <span className="no-results-icon">😕</span>
            <h3>No products found</h3>
            <p>
              {products.length === 0
                ? "There are currently no products available from any pharmacy."
                : "No products match your search or filter."}
            </p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div className="product-card" key={product.id + product.pharmacyName}>
                <div className="product-image">
                  <img
                    src={
                      product.image ||
                      `https://placehold.co/300x200/1a7f45/ffffff?text=${encodeURIComponent(
                        product.productName || product.name || "Medicine"
                      )}`
                    }
                    alt={product.productName || product.name || "Medicine"}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/300x200/1a7f45/ffffff?text=No+Image";
                    }}
                  />
                  <div className="product-rating">
                    <span className="stars">★★★★★</span>
                    <span className="rating-number">(4.8)</span>
                  </div>
                </div>
                <div className="product-info">
                  <div className="product-name">
                    {product.productName || product.name || "Unnamed Product"}
                  </div>
                  <div className="product-pharmacy">
                    {product.pharmacyName}
                  </div>
                  <div className="product-footer">
                    <div className="product-price">
                      Rs. {product.price ?? "N/A"}
                    </div>
                    <button
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? "Out of Stock" : (
                        <>
                          <span className="cart-icon">🛒</span> Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AllProductsPage;