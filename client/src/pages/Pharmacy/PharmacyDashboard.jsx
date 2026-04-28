import { MdDashboard } from "react-icons/md";
import { AiOutlinePlus } from "react-icons/ai";
import {
  FaPills, FaTimes, FaSearch, FaBoxes,
  FaExclamationTriangle, FaClipboardList, FaMotorcycle,
} from "react-icons/fa";
import { TbClipboardList } from "react-icons/tb";
import PharmacyRiders from "./PharmacyRiders";
import PharmacyOrders from "./PharmacyOrders";
import MedGoLOGO from "../../assets/MedGo LOGO.png";
import React, { useState, useEffect, useCallback } from "react";
import { auth, db } from "../../firebase/config";
import {
  collection, addDoc, getDocs, getDoc, updateDoc,
  deleteDoc, doc, query, where, setDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./PharmacyDashboard.css";
import NotificationBell from "../../Components/NotificationBell";

// ═══════════════════════════════════════════════════════════
// MOVED OUTSIDE PharmacyDashboard — THIS IS THE CRITICAL FIX
// Defining a component inside another component causes React
// to unmount/remount it on every parent render, killing input focus.
// ═══════════════════════════════════════════════════════════
const MedicineFormFields = ({
  isEdit,
  productData,
  handleChange,
  handleDoseChange,
  doseMode,
  doseOptions,
  imagePreview,
  editImagePreview,
  setSelectedImage,
  setImagePreview,
  setEditSelectedImage,
  setEditImagePreview,
  handleImageSelect,
  handleEditImageSelect,
}) => (
  <>
    <div className="ph-drawer-section-label">Basic Information</div>
    <div className="ph-form-grid-2">
      <div className="ph-form-group">
        <label>Medicine Name</label>
        <input
          type="text" name="productName"
          placeholder="e.g. Panadol" className="input"
          value={productData.productName} onChange={handleChange} required
        />
      </div>
      <div className="ph-form-group">
        <label>Formula</label>
        <input
          type="text" name="formula"
          placeholder="e.g. Paracetamol" className="input"
          value={productData.formula} onChange={handleChange} required
        />
      </div>
      <div className="ph-form-group">
        <label>Manufacturer</label>
        <input
          type="text" name="manufacturer"
          placeholder="e.g. GSK" className="input"
          value={productData.manufacturer} onChange={handleChange} required
        />
      </div>
      <div className="ph-form-group">
        <label>Quantity</label>
        <input
          type="text" name="quantity"
          placeholder="e.g. 10 Tablets" className="input"
          value={productData.quantity} onChange={handleChange}
        />
      </div>
    </div>

    <div className="ph-drawer-section-label">Classification</div>
    <div className="ph-form-grid-2">
      <div className="ph-form-group">
        <label>Dose</label>
        <select
          className="input"
          value={doseMode === "dropdown" ? productData.dose : "Custom"}
          onChange={handleDoseChange}
        >
          <option value="">Select dose</option>
          {doseOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        {doseMode === "custom" && (
          <input
            type="text" name="dose"
            placeholder="Enter custom dose" className="input"
            value={productData.dose} onChange={handleChange}
            style={{ marginTop: 8 }}
          />
        )}
      </div>
      <div className="ph-form-group">
        <label>Type</label>
        <select name="type" className="input" value={productData.type} onChange={handleChange}>
          <option value="">Select type</option>
          <option>Tablet</option>
          <option>Syrup</option>
          <option>Capsule</option>
          <option>Injection</option>
        </select>
      </div>
      <div className="ph-form-group ph-full-width">
        <label>Category</label>
        <select name="category" className="input" value={productData.category} onChange={handleChange}>
          <option value="">Select category</option>
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
      </div>
    </div>

    <div className="ph-drawer-section-label">Inventory & Pricing</div>
    <div className="ph-form-grid-2">
      <div className="ph-form-group">
        <label>Price (Rs.)</label>
        <input
          type="number" name="price"
          placeholder="0" className="input"
          value={productData.price} onChange={handleChange} required
        />
      </div>
      <div className="ph-form-group">
        <label>Stock</label>
        <input
          type="number" name="stock"
          placeholder="0" className="input"
          value={productData.stock} onChange={handleChange} required
        />
      </div>
      <div className="ph-form-group ph-full-width">
        <label>Expiry Date</label>
        <input
          type="date" name="expiryDate"
          className="input"
          value={productData.expiryDate} onChange={handleChange} required
        />
      </div>
    </div>

    <div className="ph-drawer-section-label">Additional Details</div>
    <div className="ph-form-grid-2">
      <div className="ph-form-group ph-full-width">
        <label>Description</label>
        <textarea
          name="description"
          placeholder="Brief description…" className="input"
          value={productData.description} onChange={handleChange} rows="3"
        />
      </div>
    </div>

    <div className="ph-drawer-section-label">Product Image</div>
    <div className="ph-upload-zone">
      {(isEdit ? editImagePreview : imagePreview) ? (
        <div className="ph-preview-wrap">
          <img
            src={isEdit ? editImagePreview : imagePreview}
            alt="Preview" className="ph-img-preview"
          />
          <div className="ph-preview-actions">
            <span className="ph-preview-name">Image selected</span>
            <button
              type="button" className="ph-remove-img"
              onClick={() => {
                if (isEdit) {
                  setEditSelectedImage(null);
                  setEditImagePreview(null);
                } else {
                  setSelectedImage(null);
                  setImagePreview(null);
                }
              }}
            >
              <FaTimes /> Remove
            </button>
          </div>
        </div>
      ) : (
        <label className="ph-upload-label">
          <div className="ph-upload-icon">📷</div>
          <span className="ph-upload-text">
            {isEdit ? "Click to change image" : "Click to upload image"}
          </span>
          <span className="ph-upload-sub">PNG, JPG, WEBP supported</span>
          <input
            type="file" accept="image/*" hidden
            onChange={isEdit ? handleEditImageSelect : handleImageSelect}
          />
        </label>
      )}
    </div>
  </>
);

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const PharmacyDashboard = ({ setCurrentPage }) => {
  // Core states
  const [products, setProducts] = useState([]);
  const [pharmacyName, setPharmacyName] = useState("");
  const [editProduct, setEditProduct] = useState(null);
  const [pharmacyId, setPharmacyId] = useState(null);
  const [pharmacyDocId, setPharmacyDocId] = useState(null);

  // Master & selection modal
  const [masterMedicines, setMasterMedicines] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [showSelectModal, setShowSelectModal] = useState(false);

  // Dose handling
  const [doseMode, setDoseMode] = useState("dropdown");
  const doseOptions = ["50mg","100mg","250mg","500mg","1g","5ml","10ml","Custom"];

  // Form data
  const [productData, setProductData] = useState({
    productName: "", formula: "", manufacturer: "", dose: "",
    category: "", type: "", description: "", price: "", stock: "",
    expiryDate: "", status: "Active", quantity: "",
  });

  // Page selection
  const [activePage, setActivePage] = useState("dashboard");
  const [dashboardTab, setDashboardTab] = useState("all");
  const [ordersCount, setOrdersCount] = useState(0);

  // Image upload states
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editSelectedImage, setEditSelectedImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

  // Live clock
  const [liveTime, setLiveTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Search
  const [searchMedicines, setSearchMedicines] = useState("");

  const filteredProducts = products.filter((p) => {
    const q = searchMedicines.toLowerCase();
    return (
      (p.productName || "").toLowerCase().includes(q) ||
      (p.formula || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q) ||
      (p.manufacturer || "").toLowerCase().includes(q)
    );
  });

  // Drawer helpers
  const addDrawerOpen = activePage === "add";
  const editDrawerOpen = !!editProduct;
  const anyDrawerOpen = addDrawerOpen || editDrawerOpen;

  const emptyProductData = {
    productName: "", formula: "", manufacturer: "", dose: "",
    category: "", type: "", description: "", price: "", stock: "",
    expiryDate: "", status: "Active", quantity: "",
  };

  const closeAddDrawer = () => {
    setActivePage("medicines");
    setSelectedImage(null);
    setImagePreview(null);
    setProductData(emptyProductData);
    setDoseMode("dropdown");
  };

  const closeEditDrawer = () => {
    setEditProduct(null);
    setEditSelectedImage(null);
    setEditImagePreview(null);
    setProductData(emptyProductData);
    setDoseMode("dropdown");
  };

  const handleBackdrop = () => {
    if (editDrawerOpen) closeEditDrawer();
    else if (addDrawerOpen) closeAddDrawer();
  };

  // ===========================
  // Firestore helpers
  // ===========================
  const fetchPharmacyInfo = useCallback(async (phId) => {
    try {
      if (!phId) return;
      const q = query(collection(db, "Pharmacies"), where("pharmacyId", "==", phId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const pharmacyDoc = snap.docs[0];
        setPharmacyName(pharmacyDoc.data().name || "Pharmacy Dashboard");
        setPharmacyDocId(pharmacyDoc.id);
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
  }, []);

  const fetchOrdersCount = useCallback(async (phId) => {
    try {
      if (!phId) return setOrdersCount(0);
      const q1 = query(collection(db, "orders"), where("pharmacyId", "==", phId));
      const snap1 = await getDocs(q1);
      if (!snap1.empty) { setOrdersCount(snap1.size); return; }
      const q2 = query(collection(db, "Pharmacies"), where("pharmacyId", "==", phId));
      const snap = await getDocs(q2);
      if (!snap.empty) {
        const pdId = snap.docs[0].id;
        const ordersSnap = await getDocs(collection(db, "Pharmacies", pdId, "orders"));
        setOrdersCount(ordersSnap.size || 0);
        return;
      }
      setOrdersCount(0);
    } catch (err) {
      console.error("fetchOrdersCount error:", err);
      setOrdersCount(0);
    }
  }, []);

  const fetchUserPharmacyInfo = useCallback(async (uid) => {
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
  }, [fetchPharmacyInfo, fetchOrdersCount]);

  // AUTH
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchUserPharmacyInfo(user.uid);
      } else {
        setCurrentPage("admin");
      }
    });
    return () => unsubscribe();
  }, [setCurrentPage, fetchUserPharmacyInfo]);

  useEffect(() => {
    if (activePage === "add") {
      setSelectedImage(null);
      setImagePreview(null);
    }
  }, [activePage]);

  useEffect(() => {
    if (!editProduct) {
      setEditSelectedImage(null);
      setEditImagePreview(null);
    } else {
      setEditSelectedImage(null);
      setEditImagePreview(editProduct.imageURL || null);
    }
  }, [editProduct]);

  // ===========================
  // Master medicines
  // ===========================
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
      const q = query(collection(db, "Pharmacies"), where("pharmacyId", "==", pharmacyId));
      const snap = await getDocs(q);
      if (snap.empty) return alert("Pharmacy not found!");
      const pdId = snap.docs[0].id;
      const ref = collection(db, "Pharmacies", pdId, "products");
      const existingSnap = await getDocs(ref);
      const existing = existingSnap.docs.map((d) => (d.data().productName || "").toLowerCase());
      let added = 0;
      for (const medId of selectedMedicines) {
        const med = masterMedicines.find((m) => m.id === medId);
        if (!med) continue;
        const name = (med.name || med.productName || "").toLowerCase();
        if (existing.includes(name)) continue;
        await setDoc(doc(ref, medId), {
          productName: med.name || med.productName || "",
          formula: med.formula || "",
          quantity: med.quantity || 0,
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

  // ===========================
  // Form handlers
  // ===========================
  const handleChange = (e) =>
    setProductData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleDoseChange = (e) => {
    const val = e.target.value;
    if (val === "Custom") {
      setDoseMode("custom");
      setProductData((prev) => ({ ...prev, dose: "" }));
    } else {
      setDoseMode("dropdown");
      setProductData((prev) => ({ ...prev, dose: val }));
    }
  };

  // ===========================
  // Image handlers
  // ===========================
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

  // ===========================
  // Cloudinary upload
  // ===========================
  const uploadToCloudinary = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "medicines_upload");
    const res = await fetch("https://api.cloudinary.com/v1_1/dvo9nyzgq/image/upload", {
      method: "POST", body: formData,
    });
    if (!res.ok) { const text = await res.text(); throw new Error("Cloudinary upload failed: " + text); }
    const data = await res.json();
    return data.secure_url || data.url || null;
  };

  // ===========================
  // Submit form
  // ===========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pharmacyId) return alert("Pharmacy not found!");
    try {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const exp = new Date(productData.expiryDate); exp.setHours(0, 0, 0, 0);
      if (exp <= today) return alert("Expiry date must be in future.");
} catch { return alert("Invalid expiry date."); }
    try {
      const q = query(collection(db, "Pharmacies"), where("pharmacyId", "==", pharmacyId));
      const snap = await getDocs(q);
      if (snap.empty) return;
      const pdId = snap.docs[0].id;
      const ref = collection(db, "Pharmacies", pdId, "products");
      let imageURL = "";
      if (!editProduct) {
        if (selectedImage) imageURL = await uploadToCloudinary(selectedImage);
      } else {
        if (editSelectedImage) imageURL = await uploadToCloudinary(editSelectedImage);
        else imageURL = editProduct.imageURL || "";
      }
      const finalData = { ...productData, quantity: productData.quantity || "", imageURL: imageURL || "" };
      if (!editProduct) {
        const existingSnap = await getDocs(ref);
        const existing = existingSnap.docs.map((d) => (d.data().productName || "").toLowerCase());
        if (existing.includes(productData.productName.toLowerCase())) return alert("This medicine already exists.");
        await addDoc(ref, finalData);
      } else {
        await updateDoc(doc(ref, editProduct.id), finalData);
      }
      alert(editProduct ? "Updated!" : "Added!");
      setProductData(emptyProductData);
      setDoseMode("dropdown");
      setEditProduct(null);
      setSelectedImage(null); setImagePreview(null);
      setEditSelectedImage(null); setEditImagePreview(null);
      fetchPharmacyInfo(pharmacyId);
      fetchOrdersCount(pharmacyId);
    } catch (err) {
      console.error("Submit error:", err);
      alert("Error while saving. See console for details.");
    }
  };

  // ===========================
  // Edit product
  // ===========================
  const handleEdit = (product) => {
    setEditProduct(product);
    setProductData({
      productName: product.productName || "", formula: product.formula || "",
      quantity: product.quantity || "", manufacturer: product.manufacturer || "",
      dose: product.dose || "", category: product.category || "",
      type: product.type || "", description: product.description || "",
      price: product.price || "", stock: product.stock || "",
      expiryDate: product.expiryDate || "", status: product.status || "Active",
    });
    setDoseMode(doseOptions.includes(product.dose) ? "dropdown" : "custom");
    setActivePage("medicines");
  };

  // ===========================
  // Delete product
  // ===========================
  const handleDelete = async (id) => {
    if (!pharmacyId) return;
    if (!window.confirm("Are you sure?")) return;
    try {
      const q = query(collection(db, "Pharmacies"), where("pharmacyId", "==", pharmacyId));
      const snap = await getDocs(q);
      if (snap.empty) return;
      const pdId = snap.docs[0].id;
      await deleteDoc(doc(db, "Pharmacies", pdId, "products", id));
      alert("Deleted!");
      fetchPharmacyInfo(pharmacyId);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ===========================
  // Logout
  // ===========================
  const handleLogout = () => { auth.signOut(); setCurrentPage("admin"); };

  // ===========================
  // Dashboard calculations
  // ===========================
  const computeOutOfStock = () => products.filter((p) => Number(p.stock) <= 0).length;
  const computeExpired = () => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return products.filter((p) => {
      const d = new Date(p.expiryDate);
      if (isNaN(d)) return false;
      d.setHours(0, 0, 0, 0);
      return d < today;
    }).length;
  };
  const computeLowStock = () => products.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 10).length;

  const filteredForTab = () => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (dashboardTab === "all") return products;
    if (dashboardTab === "expired") return products.filter((p) => new Date(p.expiryDate) < today);
    if (dashboardTab === "outofstock") return products.filter((p) => Number(p.stock) <= 0);
    if (dashboardTab === "lowstock") return products.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 10);
    return products;
  };

  const formatTime = (d) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formatDate = (d) => d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  // Shared props object for MedicineFormFields
  const formFieldProps = {
    productData, handleChange, handleDoseChange, doseMode, doseOptions,
    imagePreview, editImagePreview,
    setSelectedImage, setImagePreview,
    setEditSelectedImage, setEditImagePreview,
    handleImageSelect, handleEditImageSelect,
  };

  // ===========================
  // RENDER
  // ===========================
  return (
    <div className="ph-dashboard-container">

      {/* ── DRAWER BACKDROP ── */}
      <div
        className={`ph-drawer-backdrop ${anyDrawerOpen ? "ph-backdrop-visible" : ""}`}
        onClick={handleBackdrop}
      />

      {/* ══════════════════════════════════════
          DRAWER — ADD MEDICINE
      ══════════════════════════════════════ */}
      <div className={`ph-form-drawer ${addDrawerOpen ? "ph-drawer-open" : ""}`}>
        <div className="ph-drawer-header">
          <div className="ph-drawer-header-text">
            <span className="ph-drawer-eyebrow">Inventory</span>
            <h2 className="ph-drawer-title">Add Medicine</h2>
          </div>
          <button className="ph-drawer-close-btn" onClick={closeAddDrawer}><FaTimes /></button>
        </div>
        <div className="ph-drawer-body">
          <form onSubmit={handleSubmit} className="ph-drawer-form" id="addMedForm">
            <MedicineFormFields isEdit={false} {...formFieldProps} />
          </form>
        </div>
        <div className="ph-drawer-footer">
          <button type="button" className="ph-drawer-cancel-btn" onClick={closeAddDrawer}>Cancel</button>
          <button type="submit" form="addMedForm" className="ph-drawer-save-btn">Save Medicine</button>
        </div>
      </div>

      {/* ══════════════════════════════════════
          DRAWER — EDIT MEDICINE
      ══════════════════════════════════════ */}
      <div className={`ph-form-drawer ${editDrawerOpen ? "ph-drawer-open" : ""}`}>
        <div className="ph-drawer-header">
          <div className="ph-drawer-header-text">
            <span className="ph-drawer-eyebrow">Inventory</span>
            <h2 className="ph-drawer-title">Edit Medicine</h2>
          </div>
          <button className="ph-drawer-close-btn" onClick={closeEditDrawer}><FaTimes /></button>
        </div>
        <div className="ph-drawer-body">
          <form onSubmit={handleSubmit} className="ph-drawer-form" id="editMedForm">
            <MedicineFormFields isEdit={true} {...formFieldProps} />
          </form>
        </div>
        <div className="ph-drawer-footer">
          <button type="button" className="ph-drawer-cancel-btn" onClick={closeEditDrawer}>Cancel</button>
          <button type="submit" form="editMedForm" className="ph-drawer-save-btn">Update Medicine</button>
        </div>
      </div>

      {/* ── SIDEBAR ── */}
      <div className="ph-sidebar">
        <div className="ph-logo-circle">
          <img src={MedGoLOGO} alt="MedGO Logo" />
        </div>
        <h2 className="ph-sidebar-title">{pharmacyName || "Pharmacy"}</h2>

        <ul className="ph-sidebar-menu">
          <li
            className={activePage === "dashboard" ? "active" : ""}
            onClick={() => { setActivePage("dashboard"); setEditProduct(null); }}
          >
            <MdDashboard className="ph-menu-icon" /> Dashboard
          </li>
          <li
            className={activePage === "add" ? "active" : ""}
            onClick={() => {
              setActivePage("add"); setEditProduct(null);
              setProductData(emptyProductData);
              setDoseMode("dropdown");
              setSelectedImage(null); setImagePreview(null);
            }}
          >
            <AiOutlinePlus className="ph-menu-icon" /> Add Medicine
          </li>
          <li
            className={activePage === "medicines" ? "active" : ""}
            onClick={() => { setActivePage("medicines"); setEditProduct(null); }}
          >
            <FaPills className="ph-menu-icon" /> Medicines
          </li>
          <li
            className={activePage === "orders" ? "active" : ""}
            onClick={() => { setActivePage("orders"); setEditProduct(null); }}
          >
            <TbClipboardList className="ph-menu-icon" /> Orders
          </li>
          <li
            className={activePage === "riders" ? "active" : ""}
            onClick={() => setActivePage("riders")}
          >
            <FaMotorcycle className="ph-menu-icon" /> Riders
          </li>
        </ul>

        <button className="ph-logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {/* ── MAIN AREA ── */}
      <div className="ph-main-area">
        <div className="ph-header">
          <span>Welcome, {pharmacyName || "Pharmacy"} 👋</span>
          {pharmacyDocId && (
            <NotificationBell
              pharmacyId={pharmacyDocId}
              recipientRole="admin"
              recipientId={null}
            />
          )}
        </div>

        <div className="ph-content-area">

          {/* ── DASHBOARD ── */}
          {(activePage === "dashboard" || activePage === "add") && (
            <div className="ph-dashboard-section">

              <div className="ph-welcome-banner">
                <div className="ph-welcome-text">
                  <span className="ph-welcome-greeting">Welcome back, {pharmacyName} 👋</span>
                  <span className="ph-welcome-date">{formatDate(liveTime)}</span>
                </div>
                <div className="ph-welcome-clock">{formatTime(liveTime)}</div>
              </div>

              <div className="ph-stats-grid">
                <div className="ph-stat-card ph-stat-green">
                  <div className="ph-stat-icon"><FaPills /></div>
                  <div className="ph-stat-info">
                    <h2>{products.length}</h2>
                    <p>Total Medicines</p>
                  </div>
                </div>
                <div className="ph-stat-card ph-stat-red">
                  <div className="ph-stat-icon"><FaBoxes /></div>
                  <div className="ph-stat-info">
                    <h2>{computeOutOfStock()}</h2>
                    <p>Out of Stock</p>
                  </div>
                </div>
                <div className="ph-stat-card ph-stat-amber">
                  <div className="ph-stat-icon"><FaExclamationTriangle /></div>
                  <div className="ph-stat-info">
                    <h2>{computeExpired()}</h2>
                    <p>Expired</p>
                  </div>
                </div>
                <div className="ph-stat-card ph-stat-orange">
                  <div className="ph-stat-icon"><FaExclamationTriangle /></div>
                  <div className="ph-stat-info">
                    <h2>{computeLowStock()}</h2>
                    <p>Low Stock (≤10)</p>
                  </div>
                </div>
                <div className="ph-stat-card ph-stat-blue">
                  <div className="ph-stat-icon"><FaClipboardList /></div>
                  <div className="ph-stat-info">
                    <h2>{ordersCount}</h2>
                    <p>Total Orders</p>
                  </div>
                </div>
              </div>

              <div className="ph-dashboard-tabs">
                {["all","expired","outofstock","lowstock"].map((tab) => (
                  <button
                    key={tab}
                    className={`ph-tab-btn ${dashboardTab === tab ? "active" : ""}`}
                    onClick={() => setDashboardTab(tab)}
                  >
                    {tab === "all" ? "All" : tab === "expired" ? "Expired" : tab === "outofstock" ? "Out of Stock" : "Low Stock (≤10)"}
                  </button>
                ))}
              </div>

              <table className="ph-product-table">
                <thead>
                  <tr>
                    <th>Name</th><th>Type</th><th>Stock</th><th>Expiry</th><th>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredForTab().length === 0 ? (
                    <tr><td colSpan="5" className="ph-no-products">No results found.</td></tr>
                  ) : (
                    filteredForTab().map((p) => (
                      <tr key={p.id}>
                        <td>{p.productName}</td>
                        <td>{p.type || "-"}</td>
                        <td>
                          <span className={`ph-stock-badge ${Number(p.stock) <= 0 ? "ph-stock-out" : Number(p.stock) <= 10 ? "ph-stock-low" : "ph-stock-ok"}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td>{p.expiryDate || "-"}</td>
                        <td>{p.category || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ── MEDICINES ── */}
          {activePage === "medicines" && (
            <div className="ph-medicines-section">
              <div className="ph-section-top">
                <h2 className="ph-section-title">{pharmacyName} Medicines</h2>
                <button
                  className="ph-common-btn"
                  onClick={() => { fetchMasterMedicines(); setShowSelectModal(true); }}
                >
                  Select Common Medicines
                </button>
              </div>

              <div className="ph-search-wrap">
                <FaSearch className="ph-search-icon" />
                <input
                  className="ph-search-input" type="text"
                  placeholder="Search by name, formula, category…"
                  value={searchMedicines}
                  onChange={(e) => setSearchMedicines(e.target.value)}
                />
                {searchMedicines && (
                  <span className="ph-search-count">
                    {filteredProducts.length} result{filteredProducts.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <table className="ph-product-table">
                <thead>
                  <tr>
                    <th>Name</th><th>Formula</th><th>Qty</th><th>Manufacturer</th>
                    <th>Dose</th><th>Category</th><th>Type</th><th>Stock</th>
                    <th>Price</th><th>Expiry</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="ph-no-products">
                        {searchMedicines ? "No medicines match your search." : "No products added yet."}
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.id}>
                        <td>{p.productName}</td>
                        <td>{p.formula || "-"}</td>
                        <td>{p.quantity || "-"}</td>
                        <td>{p.manufacturer || "-"}</td>
                        <td>{p.dose || "-"}</td>
                        <td>{p.category || "-"}</td>
                        <td>{p.type || "-"}</td>
                        <td>
                          <span className={`ph-stock-badge ${Number(p.stock) <= 0 ? "ph-stock-out" : Number(p.stock) <= 10 ? "ph-stock-low" : "ph-stock-ok"}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td>Rs. {p.price}</td>
                        <td>{p.expiryDate || "-"}</td>
                        <td className="ph-action-btns">
                          <button className="ph-edit-btn" onClick={() => handleEdit(p)}>Edit</button>
                          <button className="ph-remove-btn" onClick={() => handleDelete(p.id)}>Remove</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ── RIDERS ── */}
          {activePage === "riders" && <PharmacyRiders pharmacyId={pharmacyId} />}

          {/* ── ORDERS ── */}
          {activePage === "orders" && <PharmacyOrders pharmacyId={pharmacyDocId} />}

          {/* ── COMMON MEDICINES MODAL ── */}
          {showSelectModal && (
            <div className="ph-modal-overlay">
              <div className="ph-modal-content">
                <div className="ph-modal-header">
                  <h2>Select Common Medicines</h2>
                  <button className="ph-modal-close" onClick={() => setShowSelectModal(false)}>
                    <FaTimes />
                  </button>
                </div>
                <div className="ph-medicine-list">
                  {masterMedicines.map((med) => (
                    <label key={med.id} className="ph-med-check-item">
                      <input
                        type="checkbox"
                        checked={selectedMedicines.includes(med.id)}
                        onChange={() => toggleMedicine(med.id)}
                      />
                      <span className="ph-med-check-name">{med.name || med.productName}</span>
                      <span className="ph-med-check-price">Rs. {med.price}</span>
                    </label>
                  ))}
                </div>
                <div className="ph-modal-actions">
                  <button
                    className="ph-modal-sel-all"
                    onClick={() => setSelectedMedicines(masterMedicines.map((m) => m.id))}
                  >
                    Select All
                  </button>
                  <button className="ph-modal-unsel" onClick={() => setSelectedMedicines([])}>
                    Unselect All
                  </button>
                  <button className="ph-drawer-save-btn" onClick={handleAddSelected}>
                    Add Selected
                  </button>
                  <button className="ph-drawer-cancel-btn" onClick={() => setShowSelectModal(false)}>
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