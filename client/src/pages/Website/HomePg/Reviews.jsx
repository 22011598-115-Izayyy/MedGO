import React, { useState } from "react";
import "./Reviews.css";

const initialReviews = [
  {
    name: "Shoaib Akhtar",
    role: "Customer",
    rating: 4,
    text: "Med-Go made ordering medicines so easy. Fast delivery and great service!"
  },
  {
    name: "Chaudary Aslam",
    role: "Customer",
    rating: 5,
    text: "Amazing platform! I found all medicines I needed at the best prices."
  },
  {
    name: "Rehman Baloch",
    role: "Customer",
    rating: 5,
    text: "Super easy ordering process. Highly recommend Med-Go."
  },
  {
    name: "Ayesha Khan",
    role: "Student",
    rating: 5,
    text: "As a busy mom, Med-Go saves me so much time. The delivery is always quick and reliable."
  },
  {
    name: "Arshad Khan",
    role: "Software Engineer",
    rating: 4,
    text: "Love this app! I compare medicine prices easily and order instantly. Very useful."
  },
  {
    name: "Fatima Noor",
    role: "Customer",
    rating: 5,
    text: "Very helpful for older people like me. No need to stand in long pharmacy lines anymore."
  },
  {
    name: "Iqbal Mansoor",
    role: "Fitness Trainer",
    rating: 5,
    text: "Quick delivery and genuine products every time. Med-Go never disappoints!"
  },
  {
    name: "Sara Ahmed",
    role: "Medical Student",
    rating: 4,
    text: "Reliable and affordable. I always find the medicines I need without any hassle."
  }
];

const AVATAR_COLORS = [
  "#1a7f45", "#0d5c30", "#2563eb", "#7c3aed",
  "#db2777", "#d97706", "#0891b2", "#dc2626"
];

function getInitials(name) {
  return name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getAvgRating(reviews) {
  if (!reviews.length) return 0;
  return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
}

function ReviewCard({ review }) {
  return (
    <div className="rv-card">
      <div className="rv-card-top">
        <div
          className="rv-avatar"
          style={{ background: getAvatarColor(review.name) }}
        >
          {getInitials(review.name)}
        </div>
        <div className="rv-card-meta">
          <span className="rv-card-name">{review.name}</span>
          <span className="rv-verified">✓ Verified</span>
        </div>
      </div>

      <div className="rv-card-stars">
        {[1,2,3,4,5].map(s => (
          <span key={s} className={s <= review.rating ? "rv-star-on" : "rv-star-off"}>★</span>
        ))}
      </div>

      <p className="rv-card-text">"{review.text}"</p>

      <span className="rv-card-role">{review.role}</span>
    </div>
  );
}

function Reviews() {
  // ── FORM STATE (untouched logic) ──
  const [reviewsData, setReviewsData]   = useState(initialReviews);
  const [form, setForm]                 = useState({ name: "", role: "", text: "", rating: 5 });
  const [hoverStar, setHoverStar]       = useState(0);
  const [submitted, setSubmitted]       = useState(false);
  const [showForm, setShowForm]         = useState(false);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.text.trim()) return;

    const newReview = {
      name:   form.name.trim(),
      role:   form.role.trim() || "Customer",
      rating: Number(form.rating),
      text:   form.text.trim(),
    };

    setReviewsData((prev) => [newReview, ...prev]);
    setForm({ name: "", role: "", text: "", rating: 5 });
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setShowForm(false); }, 3000);
  };

  const avg     = getAvgRating(reviewsData);
  const full    = Math.floor(avg);
  const partial = avg - full >= 0.5;

  // Duplicate for seamless loop
  const track = [...reviewsData, ...reviewsData];

  return (
    <div className="reviews-section">
      <div className="rv-orb rv-orb-1"></div>
      <div className="rv-orb rv-orb-2"></div>

      {/* ── HEADER ── */}
      <div className="rv-header-row">
        <div className="rv-header-text">
          <span className="rv-eyebrow">CUSTOMER VOICES</span>
          <h2 className="rv-heading">What Our Customers have to Say</h2>
        </div>

        {/* Rating widget */}
        <div className="rv-rating-widget">
          <div className="rv-big-score">
            {avg}<span className="rv-score-denom">/5</span>
          </div>
          <div className="rv-widget-stars">
            {[1,2,3,4,5].map(s => (
              <span key={s} className={
                s <= full ? "rv-wstar-on"
                : (s === full + 1 && partial) ? "rv-wstar-half"
                : "rv-wstar-off"
              }>★</span>
            ))}
          </div>
          <span className="rv-widget-count">{reviewsData.length} Verified Reviews</span>
        </div>
      </div>

      {/* ── MARQUEE TRACK ── */}
      <div className="rv-marquee-wrapper">
        {/* fade edges */}
        <div className="rv-fade rv-fade-left"></div>
        <div className="rv-fade rv-fade-right"></div>

        <div
          className="rv-track"
          style={{ "--card-count": reviewsData.length }}
        >
          {track.map((review, i) => (
            <ReviewCard key={i} review={review} />
          ))}
        </div>
      </div>

      {/* ── WRITE A REVIEW BUTTON ── */}
      <div className="rv-write-row">
        <button
          className="rv-write-btn"
          onClick={() => setShowForm(v => !v)}
        >
          <span className="rv-write-icon">✏️</span>
          <span>WRITE A REVIEW</span>
        </button>
      </div>

      {/* ── REVIEW FORM (logic untouched) ── */}
      {showForm && (
        <div className="rv-form-wrapper">
          <div className="rv-form-inner">

            <div className="rv-form-left">
              <span className="rv-form-eyebrow">SHARE YOUR EXPERIENCE</span>
              <h3 className="rv-form-title">Your Voice Matters</h3>
              <p className="rv-form-desc">
                Helped by Med-Go? Tell the world — your review helps thousands of
                Pakistanis find reliable medicines faster.
              </p>
              <div className="rv-trust-row">
                <span className="rv-trust-chip">✓ Instant publish</span>
                <span className="rv-trust-chip">✓ Real reviews only</span>
                <span className="rv-trust-chip">✓ No account needed</span>
              </div>
            </div>

            <form className="rv-form" onSubmit={handleSubmit}>

              <div className="rv-form-row">
                <div className="rv-field">
                  <label className="rv-label">Your Name *</label>
                  <input
                    className="rv-input"
                    type="text"
                    name="name"
                    placeholder="e.g. Ayesha Khan"
                    value={form.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="rv-field">
                  <label className="rv-label">Your Role</label>
                  <input
                    className="rv-input"
                    type="text"
                    name="role"
                    placeholder="e.g. Customer, Doctor…"
                    value={form.role}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="rv-field">
                <label className="rv-label">Rating *</label>
                <div className="rv-star-picker">
                  {[1,2,3,4,5].map((star) => (
                    <span
                      key={star}
                      className={`rv-star-btn ${star <= (hoverStar || form.rating) ? "rv-star-lit" : ""}`}
                      onClick={() => setForm({ ...form, rating: star })}
                      onMouseEnter={() => setHoverStar(star)}
                      onMouseLeave={() => setHoverStar(0)}
                    >★</span>
                  ))}
                  <span className="rv-star-label">
                    {["","Poor","Fair","Good","Great","Excellent"][hoverStar || form.rating]}
                  </span>
                </div>
              </div>

              <div className="rv-field">
                <label className="rv-label">Your Review *</label>
                <textarea
                  className="rv-textarea"
                  name="text"
                  rows={4}
                  placeholder="Share your experience with Med-Go…"
                  value={form.text}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <button className="rv-submit-btn" type="submit">
                <span>Publish My Review</span>
                <span className="rv-submit-arrow">→</span>
              </button>

              {submitted && (
                <div className="rv-success">
                  <span>🎉</span> Your review is live — thank you!
                </div>
              )}

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Reviews;