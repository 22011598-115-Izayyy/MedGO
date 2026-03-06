import React, { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useCart } from "../../../Components/CartContext";
import "./StoreDetails.css";

import CategoriesSection from "../HomePg/CategoriesSection";

// Images
import PharmImage from "../../../assets/Pharm.png";
import Pharmacy from "../../../assets/Pharmacy.png";

function PharmacyStore({ setCurrentPage, selectedPharmacy, setSelectedMedicineId }) {

  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [showReviewForm, setShowReviewForm] = useState(false);

  const averageRating =
    reviews.length === 0
      ? 0
      : (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1);

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
          pharmacyId: selectedPharmacy.id,
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

  useEffect(() => {
    if (!selectedPharmacy?.id) return;

    const fetchReviews = async () => {
      try {
        const reviewsRef = collection(
          db,
          "Pharmacies",
          selectedPharmacy.id,
          "reviews"
        );

        const snapshot = await getDocs(reviewsRef);

        const fetchedReviews = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReviews(fetchedReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, [selectedPharmacy]);

  const submitReview = async () => {

    if (!name || !email || !rating || !comment) {
      alert("Please fill Name, Email, Rating and Comment");
      return;
    }

    setSubmitting(true);

    try {
      await addDoc(
        collection(db, "Pharmacies", selectedPharmacy.id, "reviews"),
        {
          userName: name,
          email: email,
          rating: rating,
          comment: comment,
          pharmacyId: selectedPharmacy.id,
          createdAt: serverTimestamp(),
          helpfulVotes: 0,
        }
      );

      const newReview = {
        userName: name,
        email: email,
        rating: rating,
        comment: comment
      };

      setReviews([newReview, ...reviews]);

      alert("Review submitted!");

      setRating(0);
      setComment("");
      setName("");
      setEmail("");

      setShowReviewForm(false);

    } catch (error) {
      console.error("Error adding review:", error);
    }

    setSubmitting(false);
  };

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

      <div className="back-btn-container">
        <button className="back-btn" onClick={() => setCurrentPage("pharmacies")}>
          ← Back to Pharmacies
        </button>
      </div>

      <section
        className="hero-section"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="hero-content">
          <h1>
            <span className="line">{selectedPharmacy.name},</span>
            <span className="line">Your Trusted Pharmacy</span>
          </h1>

          <p>
            {selectedPharmacy.address
              ? `Serving ${selectedPharmacy.address} with quality medicines and care.`
              : "Your trusted healthcare partner."}
          </p>
        </div>
      </section>

      <CategoriesSection />

      <section className="about-section">
        <div className="about-left">
          <h2>About {selectedPharmacy.name}</h2>

          <p>
            {selectedPharmacy.description
              ? selectedPharmacy.description
              : `${selectedPharmacy.name} has been serving the people of Gujrat for years, providing trusted healthcare and timely delivery of medicines.`}
          </p>

          <div className="about-features">
            <div className="feature">✅ Licensed Products</div>
            <div className="feature">⚡ Fast Home Delivery</div>
            <br></br>
            <div className="feature">💊 Quality Assured Medicines</div>
            <div className="feature">📦 Affordable Prices</div>
          </div>
        </div>

        <div className="about-image">
          <img src={Pharmacy} alt="Pharmacy Preview" />
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
                <div
                  key={p.id}
                  className="product-card"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setSelectedMedicineId({
                      productId: p.id,
                      pharmacyId: p.pharmacyId,
                    });
                    setCurrentPage("medicine-details");
                  }}
                >
                  <div className="product-image">
                    <img src={productImage} alt={p.productName} className="product-img"/>
                  </div>

                  <h3>{p.productName || "Unnamed Product"}</h3>

                  <div className="product-extra">
                    <p><strong>Formula:</strong> {p.formula ?? "N/A"}</p>
                    <p><strong>Dose:</strong> {p.dose ?? "N/A"}</p>
                    <p><strong>Quantity:</strong> {p.quantity ?? p.stock ?? "N/A"}</p>
                  </div>

                  <p className="price">Rs. {p.price ?? "N/A"}</p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(p);
                    }}
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

      {/* REVIEWS SECTION */}

      <section className="reviews-section">

        <div className="reviews-header">

          <div className="reviews-title">
            <h2>What Our Customers have to Say</h2>
          </div>

          <div className="review-summary">
            <h1>{averageRating}</h1>
            <div className="summary-stars">
              {"★".repeat(Math.round(averageRating))}
              {"☆".repeat(5 - Math.round(averageRating))}
            </div>
            <p>{reviews.length} Reviews</p>
          </div>

        </div>

        {/* AUTO SCROLL REVIEWS */}

        <div className="reviews-marquee">

          <div className="reviews-track">

            {reviews.concat(reviews).map((review,index)=>(
              <div key={index} className="review-card">

                <div className="review-header">
                  <strong>{review.userName}</strong>
                </div>

                <div className="review-rating">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5-review.rating)}
                </div>

                <p className="review-comment">{review.comment}</p>

              </div>
            ))}

          </div>

        </div>

        <div style={{textAlign:"center",marginTop:"40px"}}>
          <button
            className="add-btn"
            style={{width:"200px"}}
            onClick={()=>setShowReviewForm(true)}
          >
            Add Review
          </button>
        </div>

        {showReviewForm && (

          <div className="review-form-premium">

            <div className="review-form-header">
              <h3>Leave a Review</h3>
              <button className="close-review" onClick={()=>setShowReviewForm(false)}>✕</button>
            </div>

            <div className="review-form-grid">

              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e)=>setName(e.target.value)}
              />

              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
              />

            </div>

            <div className="rating-stars">
              {[1,2,3,4,5].map((star)=>(
                <span
                  key={star}
                  onClick={()=>setRating(star)}
                  style={{
                    cursor:"pointer",
                    fontSize:"28px",
                    color: star <= rating ? "#FFD700" : "#ccc"
                  }}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea
              placeholder="Write your review..."
              value={comment}
              onChange={(e)=>setComment(e.target.value)}
            />

            <button className="submit-review-btn" onClick={submitReview} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </button>

          </div>

        )}

      </section>

    </div>
  );
}

export default PharmacyStore;