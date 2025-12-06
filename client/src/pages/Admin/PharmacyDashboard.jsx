// PART A: imports, state, hooks, functions
import { MdDashboard } from "react-icons/md";
import { AiOutlinePlus } from "react-icons/ai";
import { FaPills } from "react-icons/fa";
import { TbClipboardList } from "react-icons/tb";
import PharmacyRiders from "./PharmacyRiders";
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
  const doseOptions = ["50mg", "100mg", "250mg", "500mg", "1g", "5ml", "10ml", "Custom"];

  // Form data (including manufacturer)
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
  });

  // Page selection: dashboard / add / medicines / orders
  const [activePage, setActivePage] = useState("dashboard");

  // Dashboard tab (only on dashboard)
  const [dashboardTab, setDashboardTab] = useState("all"); // all, expired, outofstock, lowstock

  // Orders count for dashboard stats
  const [ordersCount, setOrdersCount] = useState(0);

  // ==========================
  // On auth change -> fetch pharmacy info
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
  }, []);

  // ==========================
  // Fetch user's pharmacyId from users collection
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
      console.error("Error fetching user pharmacy info:", err);
    }
  };

  // ==========================
  // Fetch pharmacy details + products
  // ==========================
  const fetchPharmacyInfo = async (phId) => {
    try {
      if (!phId) return;
      const q = query(collection(db, "Pharmacies"), where("pharmacyId", "==", phId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const pharmacyDoc = snap.docs[0];
        setPharmacyName(pharmacyDoc.data().name || "Pharmacy Dashboard");

        const productsSnap = await getDocs(collection(db, "Pharmacies", pharmacyDoc.id, "products"));
        setProducts(productsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } else {
        setPharmacyName("Pharmacy Dashboard");
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching pharmacy info:", err);
    }
  };

  // ==========================
  // Fetch orders count
  // ==========================
  const fetchOrdersCount = async (phId) => {
    try {
      if (!phId) return setOrdersCount(0);

      // Try top-level "orders" collection
      try {
        const q1 = query(collection(db, "orders"), where("pharmacyId", "==", phId));
        const snap1 = await getDocs(q1);
        if (!snap1.empty) {
          setOrdersCount(snap1.size);
          return;
        }
      } catch (e) { /* ignore */ }

      // Try subcollection under Pharmacies
      try {
        const q2 = query(collection(db, "Pharmacies"), where("pharmacyId", "==", phId));
        const snap = await getDocs(q2);
        if (!snap.empty) {
          const pharmacyDocId = snap.docs[0].id;
          const ordersSnap = await getDocs(collection(db, "Pharmacies", pharmacyDocId, "orders"));
          setOrdersCount(ordersSnap.size || 0);
          return;
        }
      } catch (e) { /* ignore */ }

      setOrdersCount(0);
    } catch (err) {
      console.error("fetchOrdersCount error:", err);
      setOrdersCount(0);
    }
  };

  // ==========================
  // Fetch master medicines
  // ==========================
  const fetchMasterMedicines = async () => {
    try {
      const snapshot = await getDocs(collection(db, "masterMedicines"));
      setMasterMedicines(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error fetching master medicines:", err);
    }
  };

  const toggleMedicine = (id) => {
    setSelectedMedicines((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ==========================
  // Add selected master medicines
  // ==========================
  const handleAddSelected = async () => {
    try {
      const q = query(collection(db, "Pharmacies"), where("pharmacyId", "==", pharmacyId));
      const snap = await getDocs(q);
      if (snap.empty) {
        alert("Pharmacy not found!");
        return;
      }
      const pharmacyDocId = snap.docs[0].id;
      const pharmacyProductsRef = collection(db, "Pharmacies", pharmacyDocId, "products");

      const existingSnap = await getDocs(pharmacyProductsRef);
      const existingNames = existingSnap.docs.map((d) =>
        (d.data().productName || "").toLowerCase()
      );

      let added = 0;
      for (const medId of selectedMedicines) {
        const med = masterMedicines.find((m) => m.id === medId);
        if (!med) continue;

        const name = (med.name || med.productName || "").toLowerCase();
        if (existingNames.includes(name)) continue;

        const newMed = {
          productName: med.name || med.productName || "",
          formula: med.formula || "",
          manufacturer: med.manufacturer || med.brand || "",
          dose: med.dose || "",
          category: med.category || "",
          type: med.type || "",
          price: med.price || 0,
          stock: med.stock || 0,
          expiryDate: med.expiryDate || "N/A",
          description: med.description || "",
          status: "Active",
        };

        await setDoc(doc(pharmacyProductsRef, medId), newMed);
        added++;
      }

      alert(`${added} medicine(s) added successfully.`);
      setShowSelectModal(false);
      setSelectedMedicines([]);
      fetchPharmacyInfo(pharmacyId);
    } catch (err) {
      console.error("Error adding selected:", err);
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
  // Submit (Add or Update)
  // ==========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pharmacyId) return alert("Pharmacy not found!");

    // expiry validation: cannot be today or past
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const exp = new Date(productData.expiryDate);
      exp.setHours(0, 0, 0, 0);

      if (exp <= today) {
        alert("Expiry date cannot be today or a past date.");
        return;
      }
    } catch (err) {
      console.error("Invalid expiry:", err);
      return alert("Invalid expiry date.");
    }

    try {
      const q = query(collection(db, "Pharmacies"), where("pharmacyId", "==", pharmacyId));
      const snap = await getDocs(q);
      if (snap.empty) return;

      const pharmacyDocId = snap.docs[0].id;
      const productsRef = collection(db, "Pharmacies", pharmacyDocId, "products");

      // duplicate check when adding new product
      if (!editProduct) {
        const existingProductsSnap = await getDocs(productsRef);
        const existingNames = existingProductsSnap.docs.map((d) =>
          (d.data().productName || "").toLowerCase()
        );

        if (existingNames.includes((productData.productName || "").toLowerCase())) {
          alert("This medicine already exists in your inventory.");
          return;
        }

        await addDoc(productsRef, productData);
        alert("Product added!");
      } else {
        await updateDoc(doc(productsRef, editProduct.id), productData);
        alert("Product updated!");
      }

      // reset form
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
      });

      setDoseMode("dropdown");
      setEditProduct(null);
      fetchPharmacyInfo(pharmacyId);
      fetchOrdersCount(pharmacyId);
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  // ==========================
  // Edit Product
  // ==========================
  const handleEdit = (product) => {
    setEditProduct(product);
    // ensure manufacturer exists in product object for controlled inputs
    setProductData({
      productName: product.productName || "",
      formula: product.formula || "",
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
  // Delete Product
  // ==========================
  const handleDelete = async (id) => {
    if (!pharmacyId) return;

    if (!window.confirm("Are you sure?")) return;

    try {
      const q = query(collection(db, "Pharmacies"), where("pharmacyId", "==", pharmacyId));
      const snap = await getDocs(q);
      if (snap.empty) return;
      const pharmacyDocId = snap.docs[0].id;

      await deleteDoc(doc(db, "Pharmacies", pharmacyDocId, "products", id));
      alert("Deleted");
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
  // Dashboard Filters / helpers
  // ==========================
  const computeOutOfStock = () =>
    products.filter((p) => {
      const s = Number(p.stock);
      return !isNaN(s) && s <= 0;
    }).length;

  const computeExpired = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return products.filter((p) => {
      if (!p.expiryDate) return false;
      const d = new Date(p.expiryDate);
      if (isNaN(d.getTime())) return false;
      d.setHours(0, 0, 0, 0);
      return d < today;
    }).length;
  };

  const filteredForTab = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dashboardTab === "all") return products;
    if (dashboardTab === "expired")
      return products.filter((p) => {
        if (!p.expiryDate) return false;
        const d = new Date(p.expiryDate);
        if (isNaN(d.getTime())) return false;
        d.setHours(0, 0, 0, 0);
        return d < today;
      });
    if (dashboardTab === "outofstock")
      return products.filter((p) => {
        const s = Number(p.stock);
        return !isNaN(s) && s <= 0;
      });
    if (dashboardTab === "lowstock")
      return products.filter((p) => {
        const s = Number(p.stock);
        return !isNaN(s) && s > 0 && s <= 10;
      });

    return products;
  };

  
  // ==========================
  // RENDER
  // ==========================
  return (
    <div className="dashboard-container">

      {/* Sidebar */}
<div className="sidebar">
  

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
        });
        setDoseMode("dropdown");
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
    <li
  className={activePage === "riders" ? "active" : ""}
  onClick={() => setActivePage("riders")}
>
  🚴 Riders
</li>


  </ul>

  <button className="logout-btn" onClick={handleLogout}>
    Logout
  </button>
</div>


      {/* MAIN AREA */}
      <div className="main-area">
        <div className="header">
          Welcome, {pharmacyName || "Pharmacy"} 👋
        </div>

        <div className="content-area">

          {/* DASHBOARD */}
          {activePage === "dashboard" && (
            <div style={{ padding: 20 }}>
              <h2 style={{ margin: 0 }}>
                {pharmacyName} Dashboard
              </h2>

              {/* SUMMARY TABLE */}
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

              {/* RED BUTTON TABS */}
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

              {/* FILTERED RESULTS TABLE */}
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
                    <option key={opt} value={opt}>{opt}</option>
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
                  <option>Fever Relief</option>
                  <option>Allergy</option>
                  <option>Digestive</option>
                  <option>Respiratory</option>
                  <option>Vitamin</option>
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

                <input
                  type="date"
                  name="expiryDate"
                  className="input"
                  value={productData.expiryDate}
                  onChange={handleChange}
                  required
                />

                <button type="submit" className="save-btn">
                  {editProduct ? "Update" : "Save"}
                </button>
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

              {/* PRODUCTS TABLE */}
              <table className="product-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Formula</th>
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
                      <td colSpan="10" className="no-products">
                        No products added yet.
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p.id}>
                        <td>{p.productName}</td>
                        <td>{p.formula || "-"}</td>
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

              {/* EDIT FORM BELOW TABLE */}
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
                        <option key={opt} value={opt}>{opt}</option>
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
                      <option>Fever Relief</option>
                      <option>Allergy</option>
                      <option>Digestive</option>
                      <option>Respiratory</option>
                      <option>Vitamin</option>
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

                    <div style={{ marginTop: 12 }}>
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
                          });
                          setDoseMode("dropdown");
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
{activePage === "riders" && (
  <PharmacyRiders pharmacyId={pharmacyId} />
)}

          {/* ORDERS PAGE */}
          {activePage === "orders" && (
            <div style={{ padding: 20 }}>
              <h2>Orders</h2>
              <p>
                Orders layout unchanged (placeholder).
              </p>
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
                      />
                      {" "}{med.name || med.productName} — Rs. {med.price}
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
