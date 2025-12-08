import React, { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useCart } from "../../Components/CartContext";
import "./MedicineDetails.css";

const MedicineDetails = ({ medicineId }) => {
  const [medicine, setMedicine] = useState(null);
  const [pharmacyName, setPharmacyName] = useState("Unknown Pharmacy");
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();

  const { productId, pharmacyId } = medicineId || {};

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (!productId || !pharmacyId) return;

        // Fetch medicine
        const medRef = doc(db, `Pharmacies/${pharmacyId}/products/${productId}`);
        const medSnap = await getDoc(medRef);
        if (medSnap.exists()) setMedicine(medSnap.data());

        // Fetch pharmacy name
        const phRef = doc(db, "Pharmacies", pharmacyId);
        const phSnap = await getDoc(phRef);
        if (phSnap.exists()) setPharmacyName(phSnap.data().name);

      } catch (err) {
        console.log(err);
      }
      setLoading(false);
    };

    fetchDetails();
  }, [productId, pharmacyId]);

  if (loading) return <p>Loading...</p>;
  if (!medicine) return <p>Medicine not found</p>;

  const medName = medicine.name || medicine.productName || "Medicine";

  return (
    <div className="medicine-wrapper">

      {/* TITLE */}
      <h1 className="medicine-title">{medName}</h1>
      <p className="pharmacy-label">
        <strong>Pharmacy:</strong> {pharmacyName}
      </p>

      <div className="medicine-grid">

        {/* LEFT IMAGE BOX */}
        <div className="medicine-image-card">
          <img
            className="medicine-img"
            src={
              medicine.imageUrl ||
              medicine.imageURL ||
              medicine.image ||
              medicine.imgURL ||
              medicine.img ||
              (Array.isArray(medicine.images) ? medicine.images[0] : null) ||
              "https://via.placeholder.com/350x250?text=No+Image"
            }
            alt={medName}
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="medicine-info-panel">

          <p className="info-item">
            <b>Formula:</b> {medicine.formula}
          </p>

          <p className="info-item">
            <b>Manufacturer:</b> {medicine.manufacturer}
          </p>

          <p className="info-item">
            <b>Dose:</b> {medicine.dose}
          </p>

          <p className="info-item">
            <b>Quantity:</b> {medicine.quantity}
          </p>

          <p className="info-item">
            <b>Type:</b> {medicine.type}
          </p>

          <p className="info-item">
            <b>Expiry Date:</b> {medicine.expiryDate}
          </p>

          
          <h3 style={{ marginTop: "20px", fontWeight: "700" }}>Description</h3>

          <p className="description-box">{medicine.description}</p>

          <h2 className="price-tag">Rs. {medicine.price}</h2>

          <button
            className="add-btn"
            onClick={() => {
              addToCart(medicine);
              alert(`${medName} added to cart!`);
            }}
          >
            Add To Cart
          </button>
        </div>

      </div>
    </div>
  );
};

export default MedicineDetails;
