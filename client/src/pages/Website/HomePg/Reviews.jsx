import React, { useState } from "react";
import "./Reviews.css";

const reviewsData = [
  {
    name: "Olivia Wilson",
    role: "Customer",
    image: "https://i.pravatar.cc/150?img=47",
    rating: 4,
    text: "Med-Go made ordering medicines so easy. Fast delivery and great service!"
  },
  {
    name: "Shawn Garcia",
    role: "Customer",
    image: "https://i.pravatar.cc/150?img=32",
    rating: 5,
    text: "Amazing platform! I found all medicines I needed at the best prices."
  },
  {
    name: "Pedro Fernandes",
    role: "Customer",
    image: "https://i.pravatar.cc/150?img=12",
    rating: 5,
    text: "Super easy ordering process. Highly recommend Med-Go."
  },
  {
    name: "Ayesha Khan",
    role: "Mother & Teacher",
    image: "https://i.pravatar.cc/150?img=65",
    rating: 5,
    text: "As a busy mom, Med-Go saves me so much time. The delivery is always quick and reliable."
  },
  {
    name: "Hamza Malik",
    role: "Software Engineer",
    image: "https://i.pravatar.cc/150?img=15",
    rating: 4,
    text: "Love this app! I compare medicine prices easily and order instantly. Very useful."
  },
  {
    name: "Fatima Noor",
    role: "Senior Citizen",
    image: "https://i.pravatar.cc/150?img=29",
    rating: 5,
    text: "Very helpful for older people like me. No need to stand in long pharmacy lines anymore."
  },
  {
    name: "James Carter",
    role: "Fitness Trainer",
    image: "https://i.pravatar.cc/150?img=50",
    rating: 5,
    text: "Quick delivery and genuine products every time. Med-Go never disappoints!"
  },
  {
    name: "Sara Ahmed",
    role: "Medical Student",
    image: "https://i.pravatar.cc/150?img=23",
    rating: 4,
    text: "Reliable and affordable. I always find the medicines I need without any hassle."
  }
];


function Reviews() {
  const [index, setIndex] = useState(0);

  const prevSlide = () => {
    setIndex((i) => (i === 0 ? reviewsData.length - 1 : i - 1));
  };

  const nextSlide = () => {
    setIndex((i) => (i === reviewsData.length - 1 ? 0 : i + 1));
  };

  const center = reviewsData[index];
  const left = reviewsData[(index - 1 + reviewsData.length) % reviewsData.length];
  const right = reviewsData[(index + 1) % reviewsData.length];

  return (
    <div className="reviews-section">

      <h2 className="section-heading">What our Clients say</h2>

      <div className="carousel-container">

        {/* Left Card */}
        <div className="review-card small-card">
          <img src={left.image} className="review-img small-img" alt={left.name} />
          <h3 className="review-name">{left.name}</h3>
          <p className="review-role">{left.role}</p>
          <div className="review-rating">
            {"★".repeat(left.rating)}{"☆".repeat(5 - left.rating)}
          </div>
          <p className="review-text">{left.text}</p>
        </div>

        {/* Center Card */}
        <div className="review-card big-card">
          <img src={center.image} className="review-img" alt={center.name} />
          <h3 className="review-name">{center.name}</h3>
          <p className="review-role">{center.role}</p>
          <div className="review-rating">
            {"★".repeat(center.rating)}{"☆".repeat(5 - center.rating)}
          </div>
          <p className="review-text">{center.text}</p>
        </div>

        {/* Right Card */}
        <div className="review-card small-card">
          <img src={right.image} className="review-img small-img" alt={right.name} />
          <h3 className="review-name">{right.name}</h3>
          <p className="review-role">{right.role}</p>
          <div className="review-rating">
            {"★".repeat(right.rating)}{"☆".repeat(5 - right.rating)}
          </div>
          <p className="review-text">{right.text}</p>
        </div>

      </div>

      {/* Arrows */}
      <div className="arrow-buttons">
        <button className="arrow-btn" onClick={prevSlide}>❮</button>
        <button className="arrow-btn" onClick={nextSlide}>❯</button>
      </div>

    </div>
  );
}

export default Reviews;
