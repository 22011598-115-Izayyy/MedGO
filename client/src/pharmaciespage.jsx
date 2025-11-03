import React, { useEffect, useState } from "react";
import { db } from "./firebase/config";  // adjust path if needed
import { collection, getDocs } from "firebase/firestore";
import "./pharmaciespage.css"; // optional for styling

function PharmaciesPage() {
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

        console.log("Pharmacy documents:", querySnapshot.docs);
console.log("Pharmacy list data:", pharmacyList);

      } catch (error) {
        console.error("Error fetching pharmacies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, []);

  if (loading) {
    return <p>Loading pharmacies...</p>;
  }

  return (
    <div className="pharmacies-page">
      <h2>Available Pharmacies</h2>

      {pharmacies.length === 0 ? (
        <p>No pharmacies available right now.</p>
      ) : (
        <div className="pharmacy-list">
          {pharmacies.map((pharmacy) => (
            <div className="pharmacy-card" key={pharmacy.id}>
              <h3>{pharmacy.name}</h3>
              <p><strong>Email:</strong> {pharmacy.email}</p>
              <p><strong>Phone:</strong> {pharmacy.phone}</p>
              <p><strong>Address:</strong> {pharmacy.address}</p>
              <p><strong>Status:</strong> {pharmacy.status || "active"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PharmaciesPage;
