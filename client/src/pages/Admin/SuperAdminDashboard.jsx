import React, { useEffect, useState } from "react";
import MedGoLogo from "../../assets/MedGo LOGO.png";
import { db } from "../../firebase/config";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  FaUserShield,
  FaHospitalAlt,
  FaSignOutAlt,
  FaChartPie,
  FaPills,
  FaSearch,
  FaTimes,
  FaPlus,
} from "react-icons/fa";
import { AiOutlineCalendar } from "react-icons/ai";

import "./SuperAdminDashboard.css";

const SuperAdminDashboard = ({ setCurrentPage }) => {
  const [pharmacies, setPharmacies] = useState([]);
  const [users, setUsers] = useState([]);

  const [selectedSection, setSelectedSection] = useState("main");
  const [formVisible, setFormVisible] = useState(false);
  const [editPharmacy, setEditPharmacy] = useState(null);
  const [editUser, setEditUser] = useState(null);

  // Dashboard stats
  const [totalRiders, setTotalRiders] = useState(0);
  const [activePharmacies, setActivePharmacies] = useState(0);
  const [inactivePharmacies, setInactivePharmacies] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  const [pharmacyData, setPharmacyData] = useState({
    pharmacyId: "",
    name: "",
    address: "",
    email: "",
    phone: "",
    status: "Active",
  });

  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    pharmacyId: "",
    role: "pharmacy_manager",
  });

  // ===========================
  // MASTER MEDICINES STATES
  // ===========================
  const [masterList, setMasterList] = useState([]);
  const [masterFormVisible, setMasterFormVisible] = useState(false);
  const [editMaster, setEditMaster] = useState(null);

  const [masterData, setMasterData] = useState({
    name: "",
    formula: "",
    quantity: "",
    manufacturer: "",
    dose: "",
    category: "",
    type: "",
    description: "",
    price: "",
    stock: "",
    expiryDate: "",
    imageURL: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // Dose options + dropdown mode
  const [doseMode, setDoseMode] = useState("dropdown");
  const doseOptions = ["50mg", "100mg", "250mg", "375mg", "500mg", "1g", "5ml", "10ml", "Custom"];

  // Category & Type options
  const categoryOptions = [
    "Pain Killer", "Antibiotic", "Fever And Pain", "Cold And Flu", "Allergy",
    "Digestive", "Respiratory", "Vitamin", "Bone And Joint Pain", "Cardiac Care",
    "Derma Care", "ENT Care", "Eye And Ear Care", "Mental Health",
    "Lung And Liver Care", "Other",
  ];

  const typeOptions = ["Tablet", "Syrup", "Capsule", "Injection", "Other"];

  // ===========================
  // LIVE CLOCK STATE
  // ===========================
  const [liveTime, setLiveTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ===========================
  // SEARCH STATES
  // ===========================
  const [searchMaster, setSearchMaster] = useState("");
  const [searchPharmacy, setSearchPharmacy] = useState("");
  const [searchUser, setSearchUser] = useState("");

  // ===========================
  // FILTERED LISTS
  // ===========================
  const filteredMasterList = masterList.filter((m) => {
    const q = searchMaster.toLowerCase();
    return (
      (m.name || "").toLowerCase().includes(q) ||
      (m.formula || "").toLowerCase().includes(q) ||
      (m.category || "").toLowerCase().includes(q) ||
      (m.manufacturer || "").toLowerCase().includes(q)
    );
  });

  const filteredPharmacies = pharmacies.filter((p) => {
    const q = searchPharmacy.toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (p.address || "").toLowerCase().includes(q) ||
      (p.email || "").toLowerCase().includes(q)
    );
  });

  const filteredUsers = users.filter((u) => {
    const q = searchUser.toLowerCase();
    return (
      (u.email || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q) ||
      (u.pharmacyId || "").toLowerCase().includes(q)
    );
  });

  // ===========================
  // CLOUDINARY UPLOAD
  // ===========================
  const uploadToCloudinary = async (file) => {
    if (!file) return "";
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", "medicines_upload");
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dvo9nyzgq/image/upload",
        { method: "POST", body: form }
      );
      if (!res.ok) {
        const txt = await res.text();
        throw new Error("Cloudinary upload failed: " + txt);
      }
      const data = await res.json();
      return data.secure_url || "";
    } catch (err) {
      console.error("Cloudinary error:", err);
      return "";
    }
  };

  const handleMasterImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const pharmaciesRef = collection(db, "Pharmacies");
  const usersRef = collection(db, "users");
  const masterRef = collection(db, "masterMedicines");

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const fetched = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(fetched);
      setTotalRiders(fetched.filter((u) => u.role === "rider").length);
    });
    fetchPharmacies();
    fetchMasterMedicines();
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPharmacies = async () => {
    const snapshot = await getDocs(pharmaciesRef);
    const pharms = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    setPharmacies(pharms);
    setActivePharmacies(pharms.filter((p) => p.status === "Active").length);
    setInactivePharmacies(pharms.filter((p) => p.status === "Inactive").length);
    fetchOrdersCount(pharms);
  };

  const fetchOrdersCount = async (pharms) => {
    let count = 0;
    for (let ph of pharms) {
      const snap = await getDocs(collection(db, "Pharmacies", ph.id, "orders"));
      count += snap.size;
    }
    setTotalOrders(count);
  };

  const fetchMasterMedicines = async () => {
    const snap = await getDocs(masterRef);
    setMasterList(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  // ===========================
  // MASTER FORM HANDLERS
  // ===========================
  const handleMasterChange = (e) =>
    setMasterData({ ...masterData, [e.target.name]: e.target.value });

  const handleDoseChange = (e) => {
    const val = e.target.value;
    if (val === "Custom") {
      setDoseMode("custom");
      setMasterData({ ...masterData, dose: "" });
    } else {
      setDoseMode("dropdown");
      setMasterData({ ...masterData, dose: val });
    }
  };

  const handleMasterSubmit = async (e) => {
    e.preventDefault();
    if (masterData.expiryDate) {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const exp = new Date(masterData.expiryDate);
        exp.setHours(0, 0, 0, 0);
        if (isNaN(exp)) throw new Error("Invalid expiry");
        if (exp <= today) {
          if (!window.confirm("Expiry is today or in the past. Save anyway?")) return;
        }
      } catch (err) {
        alert("Invalid expiry date.");
        return;
      }
    }
    try {
      let imgUrl = masterData.imageURL || "";
      if (selectedImage) imgUrl = await uploadToCloudinary(selectedImage);
      const payload = {
        name: masterData.name || "",
        formula: masterData.formula || "",
        quantity: masterData.quantity || "",
        manufacturer: masterData.manufacturer || "",
        dose: masterData.dose || "",
        category: masterData.category || "",
        type: masterData.type || "",
        description: masterData.description || "",
        price: Number(masterData.price) || 0,
        stock: Number(masterData.stock) || 0,
        expiryDate: masterData.expiryDate || "",
        imageURL: imgUrl || "",
      };
      if (editMaster) {
        await updateDoc(doc(db, "masterMedicines", editMaster.id), payload);
        alert("Master medicine updated.");
      } else {
        await addDoc(masterRef, payload);
        alert("Master medicine added.");
      }
      setMasterFormVisible(false);
      setEditMaster(null);
      setMasterData({ name: "", formula: "", quantity: "", manufacturer: "", dose: "", category: "", type: "", description: "", price: "", stock: "", expiryDate: "", imageURL: "" });
      setSelectedImage(null);
      setPreview(null);
      fetchMasterMedicines();
    } catch (err) {
      console.error("Error saving master medicine:", err);
      alert("Error saving. See console.");
    }
  };

  const handleEditMaster = (med) => {
    setEditMaster(med);
    setMasterData({
      name: med.name || "", formula: med.formula || "", quantity: med.quantity || "",
      manufacturer: med.manufacturer || "", dose: med.dose || "", category: med.category || "",
      type: med.type || "", description: med.description || "", price: med.price || "",
      stock: med.stock || "", expiryDate: med.expiryDate || "", imageURL: med.imageURL || "",
    });
    setPreview(med.imageURL || null);
    setSelectedImage(null);
    setDoseMode(doseOptions.includes(med.dose) ? "dropdown" : "custom");
    setMasterFormVisible(true);
  };

  const handleDeleteMaster = async (id) => {
    if (!window.confirm("Delete this master medicine?")) return;
    await deleteDoc(doc(db, "masterMedicines", id));
    fetchMasterMedicines();
  };

  // =========================================================
  // ==============  EXISTING DASHBOARD LOGIC ================
  // =========================================================

  const handleChange = (e) =>
    setPharmacyData({ ...pharmacyData, [e.target.name]: e.target.value });

  const handleUserChange = (e) =>
    setNewUser({ ...newUser, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editPharmacy) {
      await updateDoc(doc(db, "Pharmacies", editPharmacy.id), pharmacyData);
    } else {
      await addDoc(pharmaciesRef, pharmacyData);
    }
    setFormVisible(false);
    setEditPharmacy(null);
    fetchPharmacies();
  };

  const handleEdit = (pharmacy) => {
    setEditPharmacy(pharmacy);
    setPharmacyData(pharmacy);
    setFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this pharmacy?")) return;
    await deleteDoc(doc(db, "Pharmacies", id));
    fetchPharmacies();
  };

  const handleToggleStatus = async (id, currentStatus) => {
    await updateDoc(doc(db, "Pharmacies", id), {
      status: currentStatus === "Active" ? "Inactive" : "Active",
    });
    fetchPharmacies();
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const adminEmail = "medgo@gmail.com";
    const adminPass = "medgo123";
    try {
      if (editUser) {
        await updateDoc(doc(db, "users", editUser.id), newUser);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
        const uid = cred.user.uid;
        await setDoc(doc(db, "users", uid), {
          email: newUser.email,
          pharmacyId: newUser.pharmacyId,
          role: newUser.role,
          createdAt: new Date(),
        });
        await new Promise((r) => setTimeout(r, 400));
        await auth.signOut();
        await signInWithEmailAndPassword(auth, adminEmail, adminPass);
      }
      alert("User saved!");
      setFormVisible(false);
      setEditUser(null);
      setNewUser({ email: "", password: "", pharmacyId: "", role: "pharmacy_manager" });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => setCurrentPage("admin");

  // ===========================
  // HELPER — formatted clock
  // ===========================
  const formatTime = (date) =>
    date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  // ===========================
  // DRAWER CLOSE HELPERS
  // ===========================
  const closeUserDrawer = () => {
    setFormVisible(false);
    setEditUser(null);
    setNewUser({ email: "", password: "", pharmacyId: "", role: "pharmacy_manager" });
  };

  const closePharmacyDrawer = () => {
    setFormVisible(false);
    setEditPharmacy(null);
    setPharmacyData({ pharmacyId: "", name: "", address: "", email: "", phone: "", status: "Active" });
  };

  const closeMasterDrawer = () => {
    setMasterFormVisible(false);
    setEditMaster(null);
    setMasterData({ name: "", formula: "", quantity: "", manufacturer: "", dose: "", category: "", type: "", description: "", price: "", stock: "", expiryDate: "", imageURL: "" });
    setPreview(null);
    setSelectedImage(null);
    setDoseMode("dropdown");
  };

  // Is any drawer open?
  const anyDrawerOpen =
    (selectedSection === "auth" && formVisible) ||
    (selectedSection === "pharmacies" && formVisible) ||
    masterFormVisible;

  const handleBackdropClick = () => {
    if (selectedSection === "auth" && formVisible) closeUserDrawer();
    else if (selectedSection === "pharmacies" && formVisible) closePharmacyDrawer();
    else if (masterFormVisible) closeMasterDrawer();
  };

  // =========================================================
  // ====================  RENDER UI  ========================
  // =========================================================
  return (
    <div className="superadmin-dashboard">

      {/* ── DRAWER BACKDROP ── */}
      <div
        className={`drawer-backdrop ${anyDrawerOpen ? "backdrop-visible" : ""}`}
        onClick={handleBackdropClick}
      />

      {/* ══════════════════════════════════════
          DRAWER — ADD / EDIT USER
      ══════════════════════════════════════ */}
      <div className={`form-drawer ${selectedSection === "auth" && formVisible ? "drawer-open" : ""}`}>
        <div className="drawer-header">
          <div className="drawer-header-text">
            <span className="drawer-eyebrow">Authentication</span>
            <h2 className="drawer-title">{editUser ? "Edit User" : "Add New User"}</h2>
          </div>
          <button className="drawer-close-btn" onClick={closeUserDrawer}>
            <FaTimes />
          </button>
        </div>

        <div className="drawer-body">
          <form onSubmit={handleCreateUser} className="drawer-form" id="userForm">

            <div className="drawer-section-label">Account Details</div>
            <div className="form-grid-2">
              <div className="form-group full-width">
                <label>Email Address</label>
                <input type="email" name="email" value={newUser.email} onChange={handleUserChange} required placeholder="user@example.com" />
              </div>
              {!editUser && (
                <div className="form-group full-width">
                  <label>Password</label>
                  <input type="password" name="password" value={newUser.password} onChange={handleUserChange} required placeholder="Min. 6 characters" />
                </div>
              )}
            </div>

            <div className="drawer-section-label">Role & Access</div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Pharmacy ID</label>
                <input type="text" name="pharmacyId" value={newUser.pharmacyId} onChange={handleUserChange} required placeholder="e.g. PH-001" />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select name="role" value={newUser.role} onChange={handleUserChange}>
                  <option value="pharmacy_manager">Pharmacy Manager</option>
                  <option value="rider">Rider</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>

          </form>
        </div>

        <div className="drawer-footer">
          <button type="button" className="drawer-cancel-btn" onClick={closeUserDrawer}>Cancel</button>
          <button type="submit" form="userForm" className="drawer-save-btn">
            {editUser ? "Update User" : "Create User"}
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════
          DRAWER — ADD / EDIT PHARMACY
      ══════════════════════════════════════ */}
      <div className={`form-drawer ${selectedSection === "pharmacies" && formVisible ? "drawer-open" : ""}`}>
        <div className="drawer-header">
          <div className="drawer-header-text">
            <span className="drawer-eyebrow">Pharmacies</span>
            <h2 className="drawer-title">{editPharmacy ? "Edit Pharmacy" : "Add Pharmacy"}</h2>
          </div>
          <button className="drawer-close-btn" onClick={closePharmacyDrawer}>
            <FaTimes />
          </button>
        </div>

        <div className="drawer-body">
          <form onSubmit={handleSubmit} className="drawer-form" id="pharmacyForm">

            <div className="drawer-section-label">Identification</div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Pharmacy ID</label>
                <input name="pharmacyId" value={pharmacyData.pharmacyId} onChange={handleChange} required placeholder="e.g. PH-001" />
              </div>
              <div className="form-group">
                <label>Pharmacy Name</label>
                <input name="name" value={pharmacyData.name} onChange={handleChange} required placeholder="City Pharma" />
              </div>
            </div>

            <div className="drawer-section-label">Contact Information</div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={pharmacyData.email} onChange={handleChange} required placeholder="contact@pharma.com" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" value={pharmacyData.phone} onChange={handleChange} required placeholder="+92 300 0000000" />
              </div>
              <div className="form-group full-width">
                <label>Address</label>
                <input name="address" value={pharmacyData.address} onChange={handleChange} required placeholder="Street, City, Province" />
              </div>
            </div>

          </form>
        </div>

        <div className="drawer-footer">
          <button type="button" className="drawer-cancel-btn" onClick={closePharmacyDrawer}>Cancel</button>
          <button type="submit" form="pharmacyForm" className="drawer-save-btn">
            {editPharmacy ? "Update Pharmacy" : "Add Pharmacy"}
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════
          DRAWER — ADD / EDIT MASTER MEDICINE
      ══════════════════════════════════════ */}
      <div className={`form-drawer form-drawer--wide ${masterFormVisible ? "drawer-open" : ""}`}>
        <div className="drawer-header">
          <div className="drawer-header-text">
            <span className="drawer-eyebrow">Master Medicines</span>
            <h2 className="drawer-title">{editMaster ? "Edit Medicine" : "Add Medicine"}</h2>
          </div>
          <button className="drawer-close-btn" onClick={closeMasterDrawer}>
            <FaTimes />
          </button>
        </div>

        <div className="drawer-body">
          <form onSubmit={handleMasterSubmit} className="drawer-form" id="masterForm">

            <div className="drawer-section-label">Basic Information</div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Medicine Name</label>
                <input name="name" value={masterData.name} onChange={handleMasterChange} required placeholder="e.g. Panadol" />
              </div>
              <div className="form-group">
                <label>Formula</label>
                <input name="formula" value={masterData.formula} onChange={handleMasterChange} required placeholder="e.g. Paracetamol" />
              </div>
              <div className="form-group">
                <label>Manufacturer</label>
                <input name="manufacturer" value={masterData.manufacturer} onChange={handleMasterChange} required placeholder="e.g. GSK" />
              </div>
              <div className="form-group">
                <label>Quantity (Tablets/ml)</label>
                <input type="text" name="quantity" value={masterData.quantity} onChange={handleMasterChange} required placeholder="e.g. 10 Tablets" />
              </div>
            </div>

            <div className="drawer-section-label">Classification</div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Dose</label>
                <select
                  className="input"
                  value={doseMode === "dropdown" ? masterData.dose : "Custom"}
                  onChange={handleDoseChange}
                >
                  <option value="">Select dose</option>
                  {doseOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                {doseMode === "custom" && (
                  <input
                    name="dose"
                    placeholder="Enter custom dose"
                    value={masterData.dose}
                    onChange={handleMasterChange}
                    className="input"
                    style={{ marginTop: 8 }}
                  />
                )}
              </div>
              <div className="form-group">
                <label>Type</label>
                <select name="type" value={masterData.type} onChange={handleMasterChange} required>
                  <option value="">Select type</option>
                  {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group full-width">
                <label>Category</label>
                <select name="category" value={masterData.category} onChange={handleMasterChange} required>
                  <option value="">Select category</option>
                  {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="drawer-section-label">Inventory & Pricing</div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Stock</label>
                <input type="number" min="0" name="stock" value={masterData.stock} onChange={handleMasterChange} required placeholder="0" />
              </div>
              <div className="form-group">
                <label>Price (Rs.)</label>
                <input type="number" min="0" name="price" value={masterData.price} onChange={handleMasterChange} required placeholder="0" />
              </div>
              <div className="form-group full-width expiry-row">
                <label>Expiry Date</label>
                <div className="expiry-input-wrap">
                  <input type="date" name="expiryDate" value={masterData.expiryDate} onChange={handleMasterChange} className="input date-input" />
                  <AiOutlineCalendar className="calendar-icon" />
                </div>
              </div>
            </div>

            <div className="drawer-section-label">Additional Details</div>
            <div className="form-grid-2">
              <div className="form-group full-width">
                <label>Description</label>
                <textarea name="description" value={masterData.description} onChange={handleMasterChange} rows="3" placeholder="Brief description of the medicine…" />
              </div>
            </div>

            <div className="drawer-section-label">Product Image</div>
            <div className="drawer-upload-zone">
              {preview ? (
                <div className="drawer-preview-wrap">
                  <img src={preview} className="drawer-img-preview" alt="Preview" />
                  <div className="drawer-preview-actions">
                    <span className="drawer-preview-name">Image selected</span>
                    <button
                      type="button"
                      className="drawer-remove-img"
                      onClick={() => { setPreview(null); setSelectedImage(null); setMasterData({ ...masterData, imageURL: "" }); }}
                    >
                      <FaTimes /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="drawer-upload-label">
                  <div className="drawer-upload-icon">📷</div>
                  <span className="drawer-upload-text">Click to upload image</span>
                  <span className="drawer-upload-sub">PNG, JPG, WEBP supported</span>
                  <input type="file" accept="image/*" hidden onChange={handleMasterImageSelect} />
                </label>
              )}
            </div>

          </form>
        </div>

        <div className="drawer-footer">
          <button type="button" className="drawer-cancel-btn" onClick={closeMasterDrawer}>Cancel</button>
          <button type="submit" form="masterForm" className="drawer-save-btn">
            {editMaster ? "Update Medicine" : "Save Medicine"}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="sidebar">
        <div className="superadmin-logo-circle">
          <img src={MedGoLogo} alt="MedGO Logo" />
        </div>
        <h2 className="sidebar-title">MedGO</h2>
        <ul className="sidebar-menu">
          <li className={selectedSection === "main" ? "active" : ""} onClick={() => setSelectedSection("main")}>
            <FaChartPie className="sidebar-icon" /> Dashboard
          </li>
          <li className={selectedSection === "auth" ? "active" : ""} onClick={() => setSelectedSection("auth")}>
            <FaUserShield className="sidebar-icon" /> Authentication
          </li>
          <li className={selectedSection === "pharmacies" ? "active" : ""} onClick={() => setSelectedSection("pharmacies")}>
            <FaHospitalAlt className="sidebar-icon" /> Pharmacies
          </li>
          <li className={selectedSection === "master" ? "active" : ""} onClick={() => setSelectedSection("master")}>
            <FaPills className="sidebar-icon" /> Master Medicines
          </li>
        </ul>
        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt className="sidebar-icon" /> Logout
        </button>
      </div>

      {/* MAIN AREA */}
      <div className="dashboard-content">
        <h1 className="dashboard-header">MedGO Dashboard</h1>

        {/* ── MAIN ── */}
        {selectedSection === "main" && (
          <>
            <div className="welcome-banner">
              <div className="welcome-text">
                <span className="welcome-greeting">Welcome back, Super Admin 👋</span>
                <span className="welcome-date">{formatDate(liveTime)}</span>
              </div>
              <div className="welcome-clock">{formatTime(liveTime)}</div>
            </div>

            <div className="superadmin-stats">
              <div className="stat-card">
                <h2>{pharmacies.length}</h2>
                <p>Total Pharmacies</p>
              </div>
              <div className="stat-card">
                <h2>{activePharmacies}</h2>
                <p>Active Pharmacies</p>
              </div>
              <div className="stat-card">
                <h2>{inactivePharmacies}</h2>
                <p>Inactive Pharmacies</p>
              </div>
              <div className="stat-card">
                <h2>{totalRiders}</h2>
                <p>Total Riders</p>
              </div>
              <div className="stat-card stat-card--users">
                <h2>{users.length}</h2>
                <p>Total Users</p>
              </div>
              <div className="stat-card stat-card--meds">
                <h2>{masterList.length}</h2>
                <p>Master Medicines</p>
              </div>
            </div>

            <div className="quick-overview">
              <div className="qo-header">
                <span className="qo-title">Recent Pharmacies</span>
                <button className="qo-view-all" onClick={() => setSelectedSection("pharmacies")}>
                  View All →
                </button>
              </div>
              <div className="qo-list">
                {pharmacies.slice(0, 5).length === 0 ? (
                  <p className="qo-empty">No pharmacies added yet.</p>
                ) : (
                  pharmacies.slice(0, 5).map((p) => (
                    <div className="qo-item" key={p.id}>
                      <div className="qo-item-icon"><FaHospitalAlt /></div>
                      <div className="qo-item-info">
                        <span className="qo-item-name">{p.name}</span>
                        <span className="qo-item-sub">{p.address}</span>
                      </div>
                      <span className={`status-badge ${p.status === "Active" ? "active" : "inactive"}`}>
                        {p.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="system-strip">
              <div className="strip-item">
                <span className="strip-label">Total Orders</span>
                <span className="strip-value">{totalOrders}</span>
              </div>
              <div className="strip-divider" />
              <div className="strip-item">
                <span className="strip-label">Managers</span>
                <span className="strip-value">{users.filter((u) => u.role === "pharmacy_manager").length}</span>
              </div>
              <div className="strip-divider" />
              <div className="strip-item">
                <span className="strip-label">Riders</span>
                <span className="strip-value">{totalRiders}</span>
              </div>
              <div className="strip-divider" />
              <div className="strip-item">
                <span className="strip-label">Uptime Status</span>
                <span className="strip-value strip-online">● Online</span>
              </div>
            </div>
          </>
        )}

        {/* ── AUTH ── */}
        {selectedSection === "auth" && (
          <>
            <button
              className="add-btn"
              onClick={() => {
                setFormVisible(!formVisible);
                setEditUser(null);
                setNewUser({ email: "", password: "", pharmacyId: "", role: "pharmacy_manager" });
              }}
            >
              <FaPlus /> {formVisible ? "Close" : "Add User"}
            </button>

            <div className="search-bar-wrap">
              <FaSearch className="search-icon" />
              <input
                className="search-bar-input"
                type="text"
                placeholder="Search users by email, role or pharmacy ID…"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
              />
              {searchUser && (
                <span className="search-results-count">{filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""}</span>
              )}
            </div>

            <table className="pharmacy-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Pharmacy ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{u.pharmacyId}</td>
                    <td className="action-buttons">
                      <button className="edit-btn" onClick={() => { setEditUser(u); setNewUser(u); setFormVisible(true); }}>Edit</button>
                      <button className="delete-btn" onClick={async () => { if (!window.confirm("Delete user?")) return; await deleteDoc(doc(db, "users", u.id)); }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* ── PHARMACIES ── */}
        {selectedSection === "pharmacies" && (
          <>
            <button
              className="add-btn"
              onClick={() => {
                setFormVisible(!formVisible);
                setEditPharmacy(null);
                setPharmacyData({ pharmacyId: "", name: "", address: "", email: "", phone: "", status: "Active" });
              }}
            >
              <FaPlus /> {formVisible ? "Close" : "Add Pharmacy"}
            </button>

            <div className="search-bar-wrap">
              <FaSearch className="search-icon" />
              <input
                className="search-bar-input"
                type="text"
                placeholder="Search pharmacies by name, address or email…"
                value={searchPharmacy}
                onChange={(e) => setSearchPharmacy(e.target.value)}
              />
              {searchPharmacy && (
                <span className="search-results-count">{filteredPharmacies.length} result{filteredPharmacies.length !== 1 ? "s" : ""}</span>
              )}
            </div>

            <table className="pharmacy-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPharmacies.map((p) => (
                  <tr key={p.id}>
                    <td>{p.pharmacyId || p.id}</td>
                    <td>{p.name}</td>
                    <td>{p.address}</td>
                    <td>{p.email}</td>
                    <td>{p.phone}</td>
                    <td>
                      <span className={`status-badge ${p.status === "Active" ? "active" : "inactive"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button className="edit-btn" onClick={() => handleEdit(p)}>Edit</button>
                      <button className="toggle-btn" onClick={() => handleToggleStatus(p.id, p.status)}>
                        {p.status === "Active" ? "Deactivate" : "Activate"}
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* ── MASTER MEDICINES ── */}
        {selectedSection === "master" && (
          <>
            <button
              className="add-btn"
              onClick={() => {
                setMasterFormVisible(!masterFormVisible);
                setEditMaster(null);
                setMasterData({ name: "", formula: "", quantity: "", manufacturer: "", dose: "", category: "", type: "", description: "", price: "", stock: "", expiryDate: "", imageURL: "" });
                setPreview(null);
                setSelectedImage(null);
                setDoseMode("dropdown");
              }}
            >
              <FaPlus /> {masterFormVisible ? "Close" : "Add Master Medicine"}
            </button>

            <div className="search-bar-wrap">
              <FaSearch className="search-icon" />
              <input
                className="search-bar-input"
                type="text"
                placeholder="Search by name, formula, category or manufacturer…"
                value={searchMaster}
                onChange={(e) => setSearchMaster(e.target.value)}
              />
              {searchMaster && (
                <span className="search-results-count">{filteredMasterList.length} result{filteredMasterList.length !== 1 ? "s" : ""}</span>
              )}
            </div>

            <table className="pharmacy-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Formula</th>
                  <th>Quantity</th>
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
                {filteredMasterList.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="no-products">
                      {searchMaster ? "No medicines match your search." : "No master medicines."}
                    </td>
                  </tr>
                ) : (
                  filteredMasterList.map((m) => (
                    <tr key={m.id}>
                      <td>{m.name}</td>
                      <td>{m.formula || "-"}</td>
                      <td>{m.quantity || "-"}</td>
                      <td>{m.manufacturer || "-"}</td>
                      <td>{m.dose || "-"}</td>
                      <td>{m.category || "-"}</td>
                      <td>{m.type || "-"}</td>
                      <td>{m.stock != null ? m.stock : "-"}</td>
                      <td>Rs. {m.price != null ? m.price : "-"}</td>
                      <td>{m.expiryDate || "N/A"}</td>
                      <td className="action-buttons">
                        <button className="edit-btn" onClick={() => handleEditMaster(m)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDeleteMaster(m.id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;