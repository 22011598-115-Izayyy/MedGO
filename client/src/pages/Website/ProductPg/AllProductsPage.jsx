import React, { useEffect, useState } from "react";
import "./AllProductsPage.css";
import { db } from "../../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { useCart } from "../../../Components/CartContext";

function AllProductsPage({ setCurrentPage, setSelectedMedicineId }) {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [pharmacyFilter, setPharmacyFilter] = useState("all");
  const [pharmacyOptions, setPharmacyOptions] = useState([]);

  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = [
    "all",
    "Pain Killer",
    "Antibiotic",
    "Fever And Pain",
    "Cold And Flu",
    "Allergy",
    "Digestive",
    "Respiratory",
    "Vitamin",
    "Bone And Joint Pain",
  ];

  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      try {
        let allProducts = [];
        let pharmacyNames = [];

        const pharmaciesSnap = await getDocs(collection(db, "Pharmacies"));

        for (const pharmacyDoc of pharmaciesSnap.docs) {
          const pharmacyId = pharmacyDoc.id;
          const pharmacyData = pharmacyDoc.data();
          const pharmacyName = pharmacyData.name || "Unknown Pharmacy";

          pharmacyNames.push(pharmacyName);

          const productsSnap = await getDocs(
            collection(db, `Pharmacies/${pharmacyId}/products`)
          );

          productsSnap.forEach((prodDoc) => {
            allProducts.push({
              id: prodDoc.id,
              pharmacyId,        // ⭐ REQUIRED FIX
              ...prodDoc.data(),
              pharmacyName,
            });
          });
        }

        setPharmacyOptions(["all", ...new Set(pharmacyNames)]);
        setProducts(allProducts);
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

  const filteredProducts = products.filter((product) => {
    const name = (product.productName || product.name || "").toLowerCase();
    const formula = (product.formula || "").toLowerCase();
    const category = (product.category || "").toLowerCase();

    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      formula.includes(searchTerm.toLowerCase());

    const matchesPharmacy =
      pharmacyFilter === "all" || product.pharmacyName === pharmacyFilter;

    const matchesCategory =
      categoryFilter === "all" ||
      category === categoryFilter.toLowerCase();

    return matchesSearch && matchesPharmacy && matchesCategory;
  });

  return (
    <div className="all-products-page">
      <section className="products-hero">
        <div className="hero-content">
          <h1 className="page-title">Trusted Medicines, All in One Place</h1>
          <p className="page-subtitle">
            Browse and shop medicines and healthcare products from all pharmacies in one place.
          </p>
        </div>
      </section>

      <div className="filters-section">
        <div className="search-filter">
          <input
            className="search-input"
            type="text"
            placeholder="Search for product or formula..."
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
            {pharmacyOptions.map((ph) => (
              <option key={ph} value={ph}>
                {ph}
              </option>
            ))}
          </select>
        </div>

        <div className="category-filter">
          <select
            className="category-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

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
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => {
              const productImage =
                product.imageURL ||
                product.image ||
                product.imgURL ||
                product.img ||
                product.photoURL ||
                (Array.isArray(product.images) ? product.images[0] : null) ||
                product.url ||
                `https://placehold.co/300x200/1a7f45/ffffff?text=${encodeURIComponent(
                  product.productName || product.name || "Medicine"
                )}`;

              return (
                <div className="product-card" key={product.id + product.pharmacyName}>
                  
                  {/* ⭐ CLICK TO OPEN MEDICINE PAGE */}
                  <div
                    className="product-image"
                    onClick={() => {
                      setSelectedMedicineId({
                        productId: product.id,
                        pharmacyId: product.pharmacyId,
                      });
                      setCurrentPage("medicine-details");
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={productImage}
                      alt={product.productName || product.name}
                    />

                    <div className="product-rating">
                      <span className="stars">★★★★★</span>
                      <span className="rating-number">(4.8)</span>
                    </div>
                  </div>

                  <div className="product-info">
                    <div
                      className="product-name"
                      onClick={() => {
                        setSelectedMedicineId({
                          productId: product.id,
                          pharmacyId: product.pharmacyId,
                        });
                        setCurrentPage("medicine-details");
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {product.productName || product.name}
                    </div>

                    <div className="product-pharmacy">{product.pharmacyName}</div>

                    <div className="product-extra">
                      <p><strong>Formula:</strong> {product.formula ?? "N/A"}</p>
                      <p><strong>Dose:</strong> {product.dose ?? "N/A"}</p>
                      <p><strong>Quantity:</strong> {product.quantity ?? "N/A"}</p>
                    </div>

                    <div className="product-footer">
                      <div className="product-price">Rs. {product.price ?? "N/A"}</div>

                      <button
                        className="add-to-cart-btn"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                      >
                        {product.stock === 0 ? "Out of Stock" : "🛒 Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AllProductsPage;
