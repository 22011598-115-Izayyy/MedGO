import React, { useState } from "react";
import "./Reviews.css";

const reviews = [
  {
    text: "MedGo has completely transformed the way I handle my daily operations. The platform is intuitive, reliable, and saves me hours every week!",
    name: "Edison Bulb",
    role: "Entrepreneur",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/75.jpg",
  },
  {
    text: "I love how simple yet powerful MedGo is. It has boosted my team's productivity like never before.",
    name: "Maria Smith",
    role: "Marketing Expert",
    rating: 4,
    image: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    text: "The experience with MedGo has been nothing short of amazing. It’s now an essential part of my workflow!",
    name: "John Carter",
    role: "Software Engineer",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/85.jpg",
  },
  {
    text: "MedGo performance and support are excellent. I’d recommend it to any professional or team.",
    name: "Sophia Lee",
    role: "Business Consultant",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/58.jpg",
  },
  {
    text: "I was amazed by how seamlessly everything worked. The MedGo team really understands business needs.",
    name: "David Kim",
    role: "Creative Director",
    rating: 4,
    image: "https://randomuser.me/api/portraits/men/60.jpg",
  },
];

export default function Reviews() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="reviews-section">
      <h2 className="section-heading">What people think about MedGo</h2>

      <div className="reviews-container">
        <div className="review-card">
          <p className="review-text">"{reviews[activeIndex].text}"</p>

          <div className="review-rating">
            {"★".repeat(reviews[activeIndex].rating)}
            {"☆".repeat(5 - reviews[activeIndex].rating)}
          </div>

          <img
            src={reviews[activeIndex].image}
            alt={reviews[activeIndex].name}
            className="review-image"
          />

          <h3 className="review-name">{reviews[activeIndex].name}</h3>
          <p className="review-role">{reviews[activeIndex].role}</p>

          <div className="review-dots">
            {reviews.map((_, index) => (
              <span
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`dot ${activeIndex === index ? "active" : ""}`}
              ></span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
