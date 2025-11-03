import { getAuth } from "firebase/auth";
import React, { useState, useEffect } from "react";
import { db } from "./firebase/config";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
  doc,
} from "firebase/firestore";
import "./Dashboard.css";

const SuperAdminDashboard = () => {
  const auth = getAuth();
  console.log("Current user:", auth.currentUser);

  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState("pharmacies");
  const [editingPharmacy, setEditingPharmacy] = useState(null);
  const [addingPharmacy, setAddingPharmacy] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    Email: "",
    phone: "",
    Address: "",
    status: "active",
  });

  // ✅ Fetch Pharmacies from Firestore
  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const pharmaciesCollection = collection(db, "Pharmacies");
        const pharmaciesSnapshot = await getDocs(pharmaciesCollection);
        const pharmaciesList = pharmaciesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPharmacies(pharmaciesList);
      } catch (error) {
        console.error("Error fetching Pharmacies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, []);

  // ✅ Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" })); // clear error when typing
  };

  // ✅ Validate Form Fields
  const validateForm = () => {
    const errors = {};

    if (!formData.name || formData.name.trim().length < 3) {
      errors.name = "Pharmacy name must be at least 3 characters.";
    }

    if (!formData.Email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
      errors.Email = "Please enter a valid email address.";
    }

    if (
      !formData.phone ||
      !/^\+?\d{11,13}$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      errors.phone = "Phone number must be 11–13 digits (e.g. +923001234567).";
    }

    if (!formData.Address || formData.Address.trim().length < 5) {
      errors.Address = "Address must be at least 5 characters.";
    }

    if (!formData.status) {
      errors.status = "Please select a status.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // true if valid
  };

  // ✅ Edit Pharmacy - open form
  const handleEditClick = (pharmacy) => {
    setAddingPharmacy(false);
    setEditingPharmacy(pharmacy.id);
    setFormData({
      name: pharmacy.name || "",
      Email: pharmacy.Email || pharmacy.email || "",
      phone: pharmacy.phone || "",
      Address: pharmacy.Address || pharmacy.address || "",
      status: pharmacy.status || "active",
    });
    setFormErrors({});
  };

  // ✅ Save Edited Pharmacy
  const handleSaveEdit = async () => {
    if (!validateForm()) {
      showToast("⚠️ Please correct form errors before saving.", "error");
      return;
    }

    try {
      const pharmacyRef = doc(db, "Pharmacies", editingPharmacy);
      await updateDoc(pharmacyRef, {
        name: formData.name,
        Email: formData.Email,
        phone: formData.phone,
        Address: formData.Address,
        status: formData.status,
      });

      setPharmacies((prev) =>
        prev.map((p) =>
          p.id === editingPharmacy ? { ...p, ...formData } : p
        )
      );

      setEditingPharmacy(null);
      showToast("✅ Pharmacy information updated successfully!", "success");
    } catch (error) {
      console.error("🔥 Firestore update failed:", error);
      showToast("❌ Failed to update pharmacy information.", "error");
    }
  };

  // ✅ Add New Pharmacy
  const handleAddPharmacy = () => {
    setEditingPharmacy(null);
    setAddingPharmacy(true);
    setFormData({
      name: "",
      Email: "",
      phone: "",
      Address: "",
      status: "active",
    });
    setFormErrors({});
  };

  const handleSaveNewPharmacy = async () => {
    if (!validateForm()) {
      showToast("⚠️ Please correct form errors before saving.", "error");
      return;
    }

    try {
      const newPharmacy = {
        name: formData.name,
        Email: formData.Email,
        phone: formData.phone,
        Address: formData.Address,
        status: formData.status,
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, "Pharmacies"), newPharmacy);
      setPharmacies((prev) => [...prev, { id: docRef.id, ...newPharmacy }]);
      setAddingPharmacy(false);
      showToast("✅ Pharmacy added successfully!", "success");
    } catch (error) {
      console.error("Error adding pharmacy:", error);
      showToast("❌ Failed to add pharmacy.", "error");
    }
  };

  // ✅ Toggle Active / Inactive
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const pharmacyRef = doc(db, "Pharmacies", id);
      await updateDoc(pharmacyRef, { status: newStatus });

      setPharmacies((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: newStatus } : p
        )
      );

      showToast(
        `Status changed to ${newStatus.toUpperCase()} successfully!`,
        "success"
      );
    } catch (error) {
      console.error("Error toggling status:", error);
      showToast("❌ Failed to change status.", "error");
    }
  };

  // ✅ Delete Pharmacy
  const handleDeletePharmacy = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this pharmacy?"
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "Pharmacies", id));
      setPharmacies((prev) => prev.filter((p) => p.id !== id));
      showToast("🗑️ Pharmacy deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting pharmacy:", error);
      showToast("❌ Failed to delete pharmacy.", "error");
    }
  };

  // ✅ Toast Notification
  const showToast = (message, type) => {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.position = "fixed";
    toast.style.bottom = "30px";
    toast.style.right = "30px";
    toast.style.padding = "12px 20px";
    toast.style.borderRadius = "8px";
    toast.style.fontWeight = "600";
    toast.style.zIndex = "9999";
    toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
    toast.style.color = "white";
    toast.style.backgroundColor =
      type === "success" ? "#16a34a" : "#dc2626";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  };

  if (loading) return <div className="loading">Loading Pharmacies...</div>;

  return (
    <div className="superadmin-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="sidebar-title">Admin Panel</h2>
        <ul>
          <li
            className={currentSection === "pharmacies" ? "active" : ""}
            onClick={() => setCurrentSection("pharmacies")}
          >
            🏥 Pharmacies
          </li>
          <li
            className={currentSection === "orders" ? "active" : ""}
            onClick={() => setCurrentSection("orders")}
          >
            📦 Orders
          </li>
          <li
            className={currentSection === "riders" ? "active" : ""}
            onClick={() => setCurrentSection("riders")}
          >
            🛵 Riders
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <h1>Super Admin Dashboard</h1>

        {currentSection === "pharmacies" && (
          <div className="pharmacy-section">
            <div className="pharmacy-header">
              <h2>Pharmacy Management</h2>
              <button className="add-btn" onClick={handleAddPharmacy}>
                ➕ Add Pharmacy
              </button>
            </div>

            {pharmacies.length === 0 ? (
              <p>No Pharmacies found in Firestore.</p>
            ) : (
              <table className="pharmacy-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pharmacies.map((pharmacy) => (
                    <tr key={pharmacy.id}>
                      <td>{pharmacy.name || "Unnamed Pharmacy"}</td>
                      <td>{pharmacy.Address || pharmacy.address || "N/A"}</td>
                      <td>{pharmacy.Email || pharmacy.email || "N/A"}</td>
                      <td>{pharmacy.phone || "N/A"}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            pharmacy.status === "active"
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          {pharmacy.status || "Unknown"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-btn"
                            onClick={() => handleEditClick(pharmacy)}
                          >
                            Edit
                          </button>
                          <button
                            className="toggle-btn"
                            onClick={() =>
                              handleToggleStatus(pharmacy.id, pharmacy.status)
                            }
                          >
                            {pharmacy.status === "active"
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeletePharmacy(pharmacy.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* ✅ Add or Edit Form */}
            {(addingPharmacy || editingPharmacy) && (
              <div className="edit-form">
                <h3>{addingPharmacy ? "Add New Pharmacy" : "Edit Pharmacy Details"}</h3>
                <div className="form-group">
                  <label>Pharmacy Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                  {formErrors.name && <p className="error-text">{formErrors.name}</p>}
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="Email"
                    value={formData.Email}
                    onChange={handleInputChange}
                  />
                  {formErrors.Email && <p className="error-text">{formErrors.Email}</p>}
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                  {formErrors.phone && <p className="error-text">{formErrors.phone}</p>}
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="Address"
                    value={formData.Address}
                    onChange={handleInputChange}
                  />
                  {formErrors.Address && <p className="error-text">{formErrors.Address}</p>}
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  {formErrors.status && <p className="error-text">{formErrors.status}</p>}
                </div>
                <div className="edit-actions">
                  <button
                    className="save-btn"
                    onClick={addingPharmacy ? handleSaveNewPharmacy : handleSaveEdit}
                  >
                    Save
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setAddingPharmacy(false);
                      setEditingPharmacy(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
