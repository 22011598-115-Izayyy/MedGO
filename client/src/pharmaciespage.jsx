import React, { useEffect, useState } from "react";
import { db } from "./firebase/config";
import { collection, getDocs } from "firebase/firestore";
import "./pharmaciespage.css";

function PharmaciesPage({ setCurrentPage, setSelectedPharmacy }) {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Pharmacies"));
        const pharmacyList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPharmacies(pharmacyList);
      } catch (error) {
        console.error("Error fetching pharmacies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, []);

  if (loading) return <p>Loading pharmacies...</p>;

  return (
    <div className="pharmacies-section">
      <div className="pharmacies-container">
        {/* Header */}
        <div className="pharmacies-header">
          <h2 className="pharmacies-title">Pharmacies Available</h2>
          <p className="pharmacies-subtitle">
            Find trusted pharmacies near you with fast delivery and
            professional service.
          </p>
        </div>

        {/* Pharmacies List */}
        <div className="pharmacies-grid">
          {pharmacies.map((pharmacy) => (
            <div className="pharmacy-card" key={pharmacy.id}>
              <div className="pharmacy-image">
                <img
                  src={`https://placehold.co/400x200/1a7f45/ffffff?text=${encodeURIComponent(
                    pharmacy.name
                  )}`}
                  alt={pharmacy.name}
                />
              </div>

              <div className="pharmacy-content">
                <h3 className="pharmacy-name">{pharmacy.name}</h3>
                <p>📍 {pharmacy.address}</p>
                <p>📞 {pharmacy.phone}</p>
                <p>📧 {pharmacy.email}</p>

                {/* ✅ Dynamic Visit Store Button */}
                <button
                  className="pharmacy-visit-btn"
                  onClick={() => {
                    // Pass the clicked pharmacy’s full data to next page
                    setSelectedPharmacy(pharmacy);
                    // Open the dynamic store page
                    setCurrentPage("store");
                  }}
                >
                  Visit Store →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PharmaciesPage;
