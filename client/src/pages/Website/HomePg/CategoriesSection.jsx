import React from "react";
import "./CategoriesSection.css";

// Import icons from your EXACT file names
import pain from "../../../assets/pain.png";
import cold from "../../../assets/cold.png";
import antibiotic from "../../../assets/antibiotic.png";
import vitamin from "../../../assets/vitamin.png";
import baby from "../../../assets/baby.png";
import skin from "../../../assets/skin.png";

function CategoriesSection() {
  const categories = [
    { name: "Pain Relief", icon: pain },
    { name: "Cold & Flu", icon: cold },
    { name: "Antibiotics", icon: antibiotic },
    { name: "Vitamins", icon: vitamin },
    { name: "Baby Care", icon: baby },
    { name: "Skin Care", icon: skin },
  ];

  return (
    <div className="categories-wrapper">
      <div className="categories-container">
        {categories.map((item, index) => (
          <div className="category-item" key={index}>
            <img src={item.icon} alt={item.name} className="category-icon" />
            <p>{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoriesSection;
