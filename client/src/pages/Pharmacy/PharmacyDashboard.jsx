// PharmacyDashboard.jsx
// Full component with Cloudinary upload UI integrated (Add + Edit) and UI improvements.
// No business logic changed.

import { MdDashboard } from "react-icons/md";
import { AiOutlinePlus } from "react-icons/ai";
import { FaPills } from "react-icons/fa";
import { TbClipboardList } from "react-icons/tb";
import PharmacyRiders from "./PharmacyRiders";
import MedGoLOGO from "../../assets/MedGo LOGO.png";
import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./PharmacyDashboard.css";

const PharmacyDashboard = ({ setCurrentPage }) => {
  // Core states
  const [products, setProducts] = useState([]);
  const [pharmacyName, setPharmacyName] = useState("");
  const [editProduct, setEditProduct] = useState(null);
  const [userId, setUserId] = useState(null);
  const [pharmacyId, setPharmacyId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Master & selection modal
  const [masterMedicines, setMasterMedicines] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [showSelectModal, setShowSelectModal] = useState(false);

  // Dose handling
  const [doseMode, setDoseMode] = useState("dropdown");
  const doseOptions = [
    "50mg",
    "100mg",
    "250mg",
    "500mg",
    "1g",
    "5ml",
    "10ml",
    "Custom",
  ];

  // Form data
  const [productData, setProductData] = useState({
    productName: "",
    formula: "",
    manufacturer: "",
    dose: "",
    category: "",
    type: "",
    description: "",
    price: "",
    stock: "",
    expiryDate: "",
    status: "Active",
    quantity: "", // <-- ADDED (string)
  });

  // Page selection
  const [activePage, setActivePage] = useState("dashboard");
  const [dashboardTab, setDashboardTab] = useState("all");
  const [ordersCount, setOrdersCount] = useState(0);

  // Image upload states (Add + Edit)
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editSelectedImage, setEditSelectedImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

  // ==========================
  // AUTH + initial fetch
  // ==========================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        await fetchUserPharmacyInfo(user.uid);
      } else {
        setCurrentPage("admin");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setCurrentPage]);

  // Clear add-image states when switching to Add page
  useEffect(() => {
    if (activePage === "add") {
      setSelectedImage(null);
      setImagePreview(null);
    }
  }, [activePage]);

  // When editProduct changes, set edit preview
  useEffect(() => {
    if (!editProduct) {
      setEditSelectedImage(null);
      setEditImagePreview(null);
    } else {
      setEditSelectedImage(null);
      setEditImagePreview(editProduct.imageURL || null);
    }
  }, [editProduct]);

  // ==========================
  // Firestore helpers
  // ==========================
  const fetchUserPharmacyInfo = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        const pid = data.pharmacyId;
        setPharmacyId(pid);
        await fetchPharmacyInfo(pid);
        await fetchOrdersCount(pid);
      } else {
        setPharmacyName("Pharmacy Dashboard");
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  };

  const fetchPharmacyInfo = async (phId) => {
    try {
      if (!phId) return;
      const q = query(collection(db, "Pharmacies"), where("pharmacyId", "==", phId));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const pharmacyDoc = snap.docs[0];
        setPharmacyName(pharmacyDoc.data().name || "Pharmacy Dashboard");

        const productsSnap = await getDocs(
          collection(db, "Pharmacies", pharmacyDoc.id, "products")
        );
        setProducts(productsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } else {
        setPharmacyName("Pharmacy Dashboard");
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching pharmacy info:", err);
    }
  };

  const fetchOrdersCount = async (phId) => {
    try {
      if (!phId) return setOrdersCount(0);

      const q1 = query(collection(db, "orders"), where("pharmacyId", "==", phId));
      const snap1 = await getDocs(q1);
      if (!snap1.empty) {
        setOrdersCount(snap1.size);
        return;
      }

      const q2 = query(collection(db, "Pharmacies"), where("pharmacyId", "==", phId));
      const snap = await getDocs(q2);

      if (!snap.empty) {
        const pharmacyDocId = snap.docs[0].id;
        const ordersSnap = await getDocs(
          collection(db, "Pharmacies", pharmacyDocId, "orders")
        );
        setOrdersCount(ordersSnap.size || 0);
        return;
      }

      setOrdersCount(0);
    } catch (err) {
      console.error("fetchOrdersCount error:", err);
      setOrdersCount(0);
    }
  };

  // ==========================
  // Master medicines and selection
  // ==========================
  const fetchMasterMedicines = async () => {
    try {
      const snapshot = await getDocs(collection(db, "masterMedicines"));
      setMasterMedicines(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error fetching master meds:", err);
    }
  };

  const toggleMedicine = (id) => {
    setSelectedMedicines((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAddSelected = async () => {
    try {
      const q = query(
        collection(db, "Pharmacies"),
        where("pharmacyId", "==", pharmacyId)
      );
      const snap = await getDocs(q);
      if (snap.empty) return alert("Pharmacy not found!");

      const pharmacyDocId = snap.docs[0].id;
      const ref = collection(db, "Pharmacies", pharmacyDocId, "products");

      const existingSnap = await getDocs(ref);
      const existing = existingSnap.docs.map((d) =>
        (d.data().productName || "").toLowerCase()
      );

      let added = 0;
      for (const medId of selectedMedicines) {
        const med = masterMedicines.find((m) => m.id === medId);
        if (!med) continue;

        const name = (med.name || med.productName || "").toLowerCase();
        if (existing.includes(name)) continue;

        await setDoc(doc(ref, medId), {
          productName: med.name || med.productName || "",
          formula: med.formula || "",
          quantity: med.quantity || 0, // master->pharmacy mapping (keeps master value)
          manufacturer: med.manufacturer || med.brand || "",
          dose: med.dose || "",
          category: med.category || "",
          type: med.type || "",
          price: med.price || 0,
          stock: med.stock || 0,
          expiryDate: med.expiryDate || "N/A",
          description: med.description || "",
          status: "Active",
          imageURL: med.imageURL || med.image || med.img || "",
        });

        added++;
      }

      alert(`${added} medicine(s) added.`);
      setShowSelectModal(false);
      setSelectedMedicines([]);
      fetchPharmacyInfo(pharmacyId);
    } catch (err) {
      console.error("Error adding:", err);
    }
  };

  // ==========================
  // Form handlers
  // ==========================
  const handleChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  const handleDoseChange = (e) => {
    const val = e.target.value;
    if (val === "Custom") {
      setDoseMode("custom");
      setProductData({ ...productData, dose: "" });
    } else {
      setDoseMode("dropdown");
      setProductData({ ...productData, dose: val });
    }
  };

  // ==========================
  // Image handlers
  // ==========================
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleEditImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditSelectedImage(file);
    setEditImagePreview(URL.createObjectURL(file));
  };

  // ==========================
  // Cloudinary upload
  // ==========================
  const uploadToCloudinary = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "medicines_upload"); // unsigned preset

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dvo9nyzgq/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error("Cloudinary upload failed: " + text);
    }

    const data = await res.json();
    return data.secure_url || data.url || null;
  };

  // ==========================
  // Submit form (Add / Edit)
  // ==========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pharmacyId) return alert("Pharmacy not found!");

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const exp = new Date(productData.expiryDate);
      exp.setHours(0, 0, 0, 0);

      if (exp <= today) {
        return alert("Expiry date must be in future.");
      }
    } catch (err) {
      return alert("Invalid expiry date.");
    }

    try {
      const q = query(
        collection(db, "Pharmacies"),
        where("pharmacyId", "==", pharmacyId)
      );
      const snap = await getDocs(q);
      if (snap.empty) return;

      const pharmacyDocId = snap.docs[0].id;
      const ref = collection(db, "Pharmacies", pharmacyDocId, "products");

      // Handle image upload
      let imageURL = "";
      if (!editProduct) {
        if (selectedImage) {
          imageURL = await uploadToCloudinary(selectedImage);
        }
      } else {
        if (editSelectedImage) {
          imageURL = await uploadToCloudinary(editSelectedImage);
        } else {
          imageURL = editProduct.imageURL || "";
        }
      }

      const finalData = {
        ...productData,
        quantity: productData.quantity || "", // <-- ADDED (string)
        imageURL: imageURL || "",
      };

      // ADD or UPDATE
      if (!editProduct) {
        const existingSnap = await getDocs(ref);
        const existing = existingSnap.docs.map((d) =>
          (d.data().productName || "").toLowerCase()
        );

        if (existing.includes(productData.productName.toLowerCase())) {
          return alert("This medicine already exists.");
        }

        await addDoc(ref, finalData);
      } else {
        await updateDoc(doc(ref, editProduct.id), finalData);
      }

      alert(editProduct ? "Updated!" : "Added!");

      // Reset form
      setProductData({
        productName: "",
        formula: "",
        manufacturer: "",
        dose: "",
        category: "",
        type: "",
        description: "",
        price: "",
        stock: "",
        expiryDate: "",
        status: "Active",
        quantity: "", // <-- RESET quantity here
      });

      setDoseMode("dropdown");
      setEditProduct(null);

      // reset images
      setSelectedImage(null);
      setImagePreview(null);
      setEditSelectedImage(null);
      setEditImagePreview(null);

      fetchPharmacyInfo(pharmacyId);
      fetchOrdersCount(pharmacyId);
    } catch (err) {
      console.error("Submit error:", err);
      alert("Error while saving. See console for details.");
    }
  };

  // ==========================
  // Edit product (populate form)
  // ==========================
  const handleEdit = (product) => {
    setEditProduct(product);
    setProductData({
      productName: product.productName || "",
      formula: product.formula || "",
      quantity: product.quantity || "", // <-- LOAD quantity
      manufacturer: product.manufacturer || "",
      dose: product.dose || "",
      category: product.category || "",
      type: product.type || "",
      description: product.description || "",
      price: product.price || "",
      stock: product.stock || "",
      expiryDate: product.expiryDate || "",
      status: product.status || "Active",
    });
    setDoseMode(doseOptions.includes(product.dose) ? "dropdown" : "custom");
    setActivePage("medicines");
  };

  // ==========================
  // Delete product
  // ==========================
  const handleDelete = async (id) => {
    if (!pharmacyId) return;
    if (!window.confirm("Are you sure?")) return;

    try {
      const q = query(
        collection(db, "Pharmacies"),
        where("pharmacyId", "==", pharmacyId)
      );
      const snap = await getDocs(q);
      if (snap.empty) return;

      const pharmacyDocId = snap.docs[0].id;
      await deleteDoc(doc(db, "Pharmacies", pharmacyDocId, "products", id));
      alert("Deleted!");
      fetchPharmacyInfo(pharmacyId);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ==========================
  // Logout
  // ==========================
  const handleLogout = () => {
    auth.signOut();
    setCurrentPage("admin");
  };

  // ==========================
  // Dashboard calculations
  // ==========================
  const computeOutOfStock = () =>
    products.filter((p) => Number(p.stock) <= 0).length;

  const computeExpired = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return products.filter((p) => {
      const d = new Date(p.expiryDate);
      if (isNaN(d)) return false;
      d.setHours(0, 0, 0, 0);
      return d < today;
    }).length;
  };

  const filteredForTab = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dashboardTab === "all") return products;
    if (dashboardTab === "expired")
      return products.filter((p) => new Date(p.expiryDate) < today);
    if (dashboardTab === "outofstock")
      return products.filter((p) => Number(p.stock) <= 0);
    if (dashboardTab === "lowstock")
      return products.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 10);

    return products;
  };

  // ==========================
  // RENDER
  // ==========================
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="pharmacy-logo-circle">
          <img src={MedGoLOGO} alt="MedGO Logo" />
        </div>

        <h2 className="sidebar-title">{pharmacyName || "Pharmacy"}</h2>

        <ul className="sidebar-menu">
          <li
            className={activePage === "dashboard" ? "active" : ""}
            onClick={() => {
              setActivePage("dashboard");
              setEditProduct(null);
            }}
          >
            <MdDashboard className="menu-icon" />
            Dashboard
          </li>

          <li
            className={activePage === "add" ? "active" : ""}
            onClick={() => {
              setActivePage("add");
              setEditProduct(null);
              setProductData({
                productName: "",
                formula: "",
                manufacturer: "",
                dose: "",
                category: "",
                type: "",
                description: "",
                price: "",
                stock: "",
                expiryDate: "",
                status: "Active",
                quantity: "", // <-- ensure quantity reset when opening Add
              });
              setDoseMode("dropdown");
              setSelectedImage(null);
              setImagePreview(null);
            }}
          >
            <AiOutlinePlus className="menu-icon" />
            Add Medicine
          </li>

          <li
            className={activePage === "medicines" ? "active" : ""}
            onClick={() => {
              setActivePage("medicines");
              setEditProduct(null);
            }}
          >
            <FaPills className="menu-icon" />
            Medicines
          </li>

          <li
            className={activePage === "orders" ? "active" : ""}
            onClick={() => {
              setActivePage("orders");
              setEditProduct(null);
            }}
          >
            <TbClipboardList className="menu-icon" />
            Orders
          </li>

          <li className={activePage === "riders" ? "active" : ""} onClick={() => setActivePage("riders")}>
            🚴 Riders
          </li>
        </ul>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* MAIN AREA */}
      <div className="main-area">
        <div className="header">Welcome, {pharmacyName || "Pharmacy"} 👋</div>

        <div className="content-area">
          {/* DASHBOARD */}
          {activePage === "dashboard" && (
            <div style={{ padding: 20 }}>
              <h2 style={{ margin: 0 }}>{pharmacyName} Dashboard</h2>

              <table className="summary-table">
                <thead>
                  <tr>
                    <th>Total Meds</th>
                    <th>Out of Stock</th>
                    <th>Expired</th>
                    <th>Total Orders</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{products.length}</td>
                    <td>{computeOutOfStock()}</td>
                    <td>{computeExpired()}</td>
                    <td>{ordersCount}</td>
                  </tr>
                </tbody>
              </table>

              <div className="dashboard-tabs">
                <button
                  className={`tab-btn ${dashboardTab === "all" ? "active" : ""}`}
                  onClick={() => setDashboardTab("all")}
                >
                  All
                </button>

                <button
                  className={`tab-btn ${dashboardTab === "expired" ? "active" : ""}`}
                  onClick={() => setDashboardTab("expired")}
                >
                  Expired Medicines
                </button>

                <button
                  className={`tab-btn ${dashboardTab === "outofstock" ? "active" : ""}`}
                  onClick={() => setDashboardTab("outofstock")}
                >
                  Out of Stock
                </button>

                <button
                  className={`tab-btn ${dashboardTab === "lowstock" ? "active" : ""}`}
                  onClick={() => setDashboardTab("lowstock")}
                >
                  Low Stock (≤10)
                </button>
              </div>

              <table className="product-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Stock</th>
                    <th>Expiry</th>
                    <th>Category</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredForTab().length === 0 ? (
                    <tr>
                      <td colSpan="5" className="no-products">
                        No results found.
                      </td>
                    </tr>
                  ) : (
                    filteredForTab().map((p) => (
                      <tr key={p.id}>
                        <td>{p.productName}</td>
                        <td>{p.type || "-"}</td>
                        <td>{p.stock}</td>
                        <td>{p.expiryDate || "-"}</td>
                        <td>{p.category || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ADD MEDICINE */}
          {activePage === "add" && (
            <div style={{ padding: 20 }}>
              <h2>Add Medicine</h2>

              <form className="form" onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="productName"
                  placeholder="Enter product name"
                  className="input"
                  value={productData.productName}
                  onChange={handleChange}
                  required
                />

                <input
                  type="text"
                  name="formula"
                  placeholder="Enter formula"
                  className="input"
                  value={productData.formula}
                  onChange={handleChange}
                  required
                />

                <input
                  type="text"
                  name="manufacturer"
                  placeholder="Enter manufacturer"
                  className="input"
                  value={productData.manufacturer}
                  onChange={handleChange}
                  required
                />

                <select
                  className="input"
                  value={doseMode === "dropdown" ? productData.dose : "Custom"}
                  onChange={handleDoseChange}
                >
                  <option value="">Enter dose</option>
                  {doseOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                {doseMode === "custom" && (
                  <input
                    type="text"
                    name="dose"
                    placeholder="Enter custom dose"
                    className="input"
                    value={productData.dose}
                    onChange={handleChange}
                  />
                )}

                <select
                  name="category"
                  className="input"
                  value={productData.category}
                  onChange={handleChange}
                >
                  <option value="">Enter category</option>
                  <option>Pain Killer</option>
                      <option>Antibiotic</option>
                      <option>Fever And Pain</option>
                      <option>Cold And Flu</option>
                      <option>Allergy</option>
                      <option>Digestive</option>
                      <option>Respiratory</option>
                      <option>Vitamin</option>
                      <option>Bone And Joint Pain</option>
                      <option>Cardiac Care</option>
                      <option>Derma Care</option>
                      <option>ENT Care</option>
                      <option>Eye And Ear Care</option>
                      <option>Mental Health</option>
                      <option>Lung And Liver Care</option>
                      <option>Other</option>
                </select>

                <select
                  name="type"
                  className="input"
                  value={productData.type}
                  onChange={handleChange}
                >
                  <option value="">Enter type</option>
                  <option>Tablet</option>
                  <option>Syrup</option>
                  <option>Capsule</option>
                  <option>Injection</option>
                </select>

                <textarea
                  name="description"
                  placeholder="Enter description"
                  className="input"
                  value={productData.description}
                  onChange={handleChange}
                />

                <input
                  type="number"
                  name="price"
                  placeholder="Enter price"
                  className="input"
                  value={productData.price}
                  onChange={handleChange}
                  required
                />

                <input
                  type="number"
                  name="stock"
                  placeholder="Enter stock"
                  className="input"
                  value={productData.stock}
                  onChange={handleChange}
                  required
                />

                {/* quantity as string field */}
                <input
                  type="text"
                  name="quantity"
                  placeholder="Enter quantity (e.g. 20 tablets or 60 ml)"
                  className="input"
                  value={productData.quantity}
                  onChange={handleChange}
                />

                <input
                  type="date"
                  name="expiryDate"
                  className="input"
                  value={productData.expiryDate}
                  onChange={handleChange}
                  required
                />

                {/* Upload button */}
                <label className="upload-btn">
                  <span>📤 Upload Image</span>
                  <input type="file" accept="image/*" onChange={handleImageSelect} hidden />
                </label>

                {/* Preview with inside remove X (Option A) */}
                {imagePreview && (
                  <div className="image-preview-container">
                    <img src={imagePreview} alt="Preview" className="img-preview" />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                    >
                      ✖
                    </button>
                  </div>
                )}

                {/* Save aligned to right */}
                <div className="save-container">
                  <button type="submit" className="save-btn">
                    {editProduct ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MEDICINES */}
          {activePage === "medicines" && (
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h2>{pharmacyName} Medicines</h2>

                <button
                  className="common-btn"
                  onClick={() => {
                    fetchMasterMedicines();
                    setShowSelectModal(true);
                  }}
                >
                  Select Common Medicines
                </button>
              </div>

              <table className="product-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Formula</th>
                    <th>Quantity</th> {/* ADDED */}
                    <th>Manufacturer</th>
                    <th>Dose</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Stock</th>
                    <th>Price</th>
                    <th>Expiry</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="no-products">
                        No products added yet.
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p.id}>
                        <td>{p.productName}</td>
                        <td>{p.formula || "-"}</td>
                        <td>{p.quantity || "-"}</td> {/* ADDED */}
                        <td>{p.manufacturer || "-"}</td>
                        <td>{p.dose || "-"}</td>
                        <td>{p.category || "-"}</td>
                        <td>{p.type || "-"}</td>
                        <td>{p.stock}</td>
                        <td>Rs. {p.price}</td>
                        <td>{p.expiryDate || "-"}</td>

                        <td>
                          <button className="edit-btn" onClick={() => handleEdit(p)}>
                            Edit
                          </button>
                          <button className="remove-btn" onClick={() => handleDelete(p.id)}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* EDIT FORM */}
              {editProduct && (
                <div style={{ marginTop: 20 }}>
                  <h3>Edit Medicine</h3>

                  <form className="form" onSubmit={handleSubmit}>
                    <input
                      type="text"
                      name="productName"
                      className="input"
                      value={productData.productName}
                      onChange={handleChange}
                      required
                    />

                    <input
                      type="text"
                      name="formula"
                      className="input"
                      value={productData.formula}
                      onChange={handleChange}
                      required
                    />

                    {/* Edit quantity as string field */}
                    <input
                      type="text"
                      name="quantity"
                      className="input"
                      value={productData.quantity}
                      onChange={handleChange}
                    />

                    <input
                      type="text"
                      name="manufacturer"
                      className="input"
                      value={productData.manufacturer}
                      onChange={handleChange}
                      required
                    />

                    <select
                      className="input"
                      value={doseMode === "dropdown" ? productData.dose : "Custom"}
                      onChange={handleDoseChange}
                    >
                      <option value="">Enter dose</option>
                      {doseOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>

                    {doseMode === "custom" && (
                      <input
                        type="text"
                        name="dose"
                        className="input"
                        value={productData.dose}
                        onChange={handleChange}
                      />
                    )}

                    <select
                      name="category"
                      className="input"
                      value={productData.category}
                      onChange={handleChange}
                    >
                      <option value="">Enter category</option>
                      <option>Pain Killer</option>
                      <option>Antibiotic</option>
                      <option>Fever And Pain</option>
                      <option>Cold And Flu</option>
                      <option>Allergy</option>
                      <option>Digestive</option>
                      <option>Respiratory</option>
                      <option>Vitamin</option>
                      <option>Bone And Joint Pain</option>
                      <option>Cardiac Care</option>
                      <option>Derma Care</option>
                      <option>ENT Care</option>
                      <option>Eye And Ear Care</option>
                      <option>Mental Health</option>
                      <option>Lung And Liver Care</option>
                      <option>Other</option>
                              </select>

                    <select
                      name="type"
                      className="input"
                      value={productData.type}
                      onChange={handleChange}
                    >
                      <option value="">Enter type</option>
                      <option>Tablet</option>
                      <option>Syrup</option>
                      <option>Capsule</option>
                      <option>Injection</option>
                    </select>

                    <textarea
                      name="description"
                      className="input"
                      value={productData.description}
                      onChange={handleChange}
                    />

                    <input
                      type="number"
                      name="price"
                      className="input"
                      value={productData.price}
                      onChange={handleChange}
                      required
                    />

                    <input
                      type="number"
                      name="stock"
                      className="input"
                      value={productData.stock}
                      onChange={handleChange}
                      required
                    />

                    <input
                      type="date"
                      name="expiryDate"
                      className="input"
                      value={productData.expiryDate}
                      onChange={handleChange}
                      required
                    />

                    {/* Upload button for edit */}
                    <label className="upload-btn">
                      <span>📤 Change Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageSelect}
                        hidden
                      />
                    </label>

                    {/* Edit image preview with inside X */}
                    {editImagePreview && (
                      <div className="image-preview-container">
                        <img src={editImagePreview} alt="Edit Preview" className="img-preview" />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => {
                            setEditSelectedImage(null);
                            setEditImagePreview(null);
                          }}
                        >
                          ✖
                        </button>
                      </div>
                    )}

                    <div className="save-container" style={{ marginTop: 12 }}>
                      <button className="save-btn" type="submit">
                        Update
                      </button>

                      <button
                        type="button"
                        className="remove-btn"
                        style={{ marginLeft: 8 }}
                        onClick={() => {
                          setEditProduct(null);
                          setProductData({
                            productName: "",
                            formula: "",
                            manufacturer: "",
                            dose: "",
                            category: "",
                            type: "",
                            description: "",
                            price: "",
                            stock: "",
                            expiryDate: "",
                            status: "Active",
                            quantity: "", // reset quantity
                          });
                          setDoseMode("dropdown");
                          // clear edit-image preview
                          setEditSelectedImage(null);
                          setEditImagePreview(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* RIDERS PAGE */}
          {activePage === "riders" && <PharmacyRiders pharmacyId={pharmacyId} />}

          {/* ORDERS PAGE */}
          {activePage === "orders" && (
            <div style={{ padding: 20 }}>
              <h2>Orders</h2>
              <p>Orders layout unchanged (placeholder).</p>
            </div>
          )}

          {/* MASTER MEDICINES MODAL */}
          {showSelectModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Select Common Medicines</h2>

                <div className="medicine-list">
                  {masterMedicines.map((med) => (
                    <label key={med.id} style={{ display: "block", marginBottom: 8 }}>
                      <input
                        type="checkbox"
                        checked={selectedMedicines.includes(med.id)}
                        onChange={() => toggleMedicine(med.id)}
                      />{" "}
                      {med.name || med.productName} — Rs. {med.price}
                    </label>
                  ))}
                </div>

                <div className="modal-actions">
                  <button
                    className="add-btn"
                    onClick={() => setSelectedMedicines(masterMedicines.map((m) => m.id))}
                  >
                    Select All
                  </button>

                  <button
                    className="remove-btn"
                    onClick={() => setSelectedMedicines([])}
                    style={{ marginLeft: 8 }}
                  >
                    Unselect All
                  </button>

                  <button
                    className="save-btn"
                    onClick={handleAddSelected}
                    style={{ marginLeft: 8 }}
                  >
                    Add Selected
                  </button>

                  <button
                    className="remove-btn"
                    onClick={() => setShowSelectModal(false)}
                    style={{ marginLeft: 8 }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmacyDashboard;
