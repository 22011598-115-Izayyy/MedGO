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
    "Pain Killer",
    "Antibiotic",
    "Fever Relief",
    "Allergy",
    "Digestive",
    "Respiratory",
    "Vitamin",
    "Bone And Joint Pain",
    "Cardiac Care",
    "Derma Care",
    "ENT Care",
    "Eye And Ear Care",
    "Mental Health",
    "Lung And Liver Care",
    "Other",
  ];

  const typeOptions = ["Tablet", "Syrup", "Capsule", "Injection", "Other"];

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

  // Fetch all users + pharmacies + master meds
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

  // Fetch pharmacies
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

  // Fetch master medicines
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

    // Validate expiry date if provided
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
      if (selectedImage) {
        imgUrl = await uploadToCloudinary(selectedImage);
      }

      const payload = {
        name: masterData.name || "",
        formula: masterData.formula || "",
        quantity: Number(masterData.quantity) || 0,
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

      // reset
      setMasterFormVisible(false);
      setEditMaster(null);
      setMasterData({
        name: "",
        formula: "",
        quantity:"",
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
      name: med.name || "",
      formula: med.formula || "",
      quantity:med.quantity || "",
      manufacturer: med.manufacturer || "",
      dose: med.dose || "",
      category: med.category || "",
      type: med.type || "",
      description: med.description || "",
      price: med.price || "",
      stock: med.stock || "",
      expiryDate: med.expiryDate || "",
      imageURL: med.imageURL || "",
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
        const cred = await createUserWithEmailAndPassword(
          auth,
          newUser.email,
          newUser.password
        );

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

      setNewUser({
        email: "",
        password: "",
        pharmacyId: "",
        role: "pharmacy_manager",
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => setCurrentPage("admin");

  // =========================================================
  // ====================  RENDER UI  ========================
  // =========================================================
  return (
    <div className="superadmin-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="superadmin-logo-circle">
          <img src={MedGoLogo} alt="MedGO Logo" />
        </div>

        <h2 className="sidebar-title">MedGO</h2>

        <ul className="sidebar-menu">
          <li
            className={selectedSection === "main" ? "active" : ""}
            onClick={() => setSelectedSection("main")}
          >
            <FaChartPie className="sidebar-icon" /> Dashboard
          </li>

          <li
            className={selectedSection === "auth" ? "active" : ""}
            onClick={() => setSelectedSection("auth")}
          >
            <FaUserShield className="sidebar-icon" /> Authentication
          </li>

          <li
            className={selectedSection === "pharmacies" ? "active" : ""}
            onClick={() => setSelectedSection("pharmacies")}
          >
            <FaHospitalAlt className="sidebar-icon" /> Pharmacies
          </li>

          {/* NEW MENU ITEM */}
          <li
            className={selectedSection === "master" ? "active" : ""}
            onClick={() => setSelectedSection("master")}
          >
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

        {/* MAIN */}
        {selectedSection === "main" && (
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
          </div>
        )}

        {/* AUTH */}
        {selectedSection === "auth" && (
          <>
            <button
              className="add-btn"
              onClick={() => {
                setFormVisible(!formVisible);
                setEditUser(null);
                setNewUser({
                  email: "",
                  password: "",
                  pharmacyId: "",
                  role: "pharmacy_manager",
                });
              }}
            >
              {formVisible ? "Close Form" : "Add User"}
            </button>

            {formVisible && (
              <form onSubmit={handleCreateUser} className="edit-form">
                <h3>{editUser ? "Edit User" : "Add New User"}</h3>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleUserChange}
                    required
                  />
                </div>

                {!editUser && (
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      name="password"
                      value={newUser.password}
                      onChange={handleUserChange}
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Pharmacy ID</label>
                  <input
                    type="text"
                    name="pharmacyId"
                    value={newUser.pharmacyId}
                    onChange={handleUserChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <select
                    name="role"
                    value={newUser.role}
                    onChange={handleUserChange}
                  >
                    <option value="pharmacy_manager">Pharmacy Manager</option>
                    <option value="rider">Rider</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <button className="save-btn" type="submit">
                  Save
                </button>
              </form>
            )}

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
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{u.pharmacyId}</td>
                    <td className="action-buttons">
                      <button className="edit-btn" onClick={() => {
                        setEditUser(u);
                        setNewUser(u);
                        setFormVisible(true);
                      }}>
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={async () => {
                          if (!window.confirm("Delete user?")) return;
                          await deleteDoc(doc(db, "users", u.id));
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* PHARMACIES */}
        {selectedSection === "pharmacies" && (
          <>
            <button
              className="add-btn"
              onClick={() => {
                setFormVisible(!formVisible);
                setEditPharmacy(null);
                setPharmacyData({
                  pharmacyId: "",
                  name: "",
                  address: "",
                  email: "",
                  phone: "",
                  status: "Active",
                });
              }}
            >
              {formVisible ? "Close Form" : "Add Pharmacy"}
            </button>

            {formVisible && (
              <form onSubmit={handleSubmit} className="edit-form">
                <h3>{editPharmacy ? "Edit Pharmacy" : "Add Pharmacy"}</h3>

                <div className="form-group">
                  <label>Pharmacy ID</label>
                  <input
                    name="pharmacyId"
                    value={pharmacyData.pharmacyId}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Name</label>
                  <input
                    name="name"
                    value={pharmacyData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <input
                    name="address"
                    value={pharmacyData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={pharmacyData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    name="phone"
                    value={pharmacyData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button className="save-btn" type="submit">
                  {editPharmacy ? "Update" : "Save"}
                </button>
              </form>
            )}

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
                {pharmacies.map((p) => (
                  <tr key={p.id}>
                    <td>{p.pharmacyId || p.id}</td>
                    <td>{p.name}</td>
                    <td>{p.address}</td>
                    <td>{p.email}</td>
                    <td>{p.phone}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          p.status === "Active" ? "active" : "inactive"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="action-buttons">
                      <button className="edit-btn" onClick={() => handleEdit(p)}>
                        Edit
                      </button>

                      <button
                        className="toggle-btn"
                        onClick={() => handleToggleStatus(p.id, p.status)}
                      >
                        {p.status === "Active" ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(p.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* MASTER MEDICINES */}
        {selectedSection === "master" && (
          <>
            <button
              className="add-btn"
              onClick={() => {
                setMasterFormVisible(!masterFormVisible);
                setEditMaster(null);
                setMasterData({
                  name: "",
                  formula: "",
                  quantity:"",
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
                setPreview(null);
                setSelectedImage(null);
                setDoseMode("dropdown");
              }}
            >
              {masterFormVisible ? "Close Form" : "Add Master Medicine"}
            </button>

            {masterFormVisible && (
              <form onSubmit={handleMasterSubmit} className="edit-form">
                <h3>{editMaster ? "Edit Master Medicine" : "Add Master Medicine"}</h3>

                {/* NAME */}
                <div className="form-group">
                  <label>Name</label>
                  <input
                    name="name"
                    value={masterData.name}
                    onChange={handleMasterChange}
                    required
                  />
                </div>

                {/* FORMULA */}
                <div className="form-group">
                  <label>Formula</label>
                  <input
                    name="formula"
                    value={masterData.formula}
                    onChange={handleMasterChange}
                    required
                  />
                </div>
<div className="form-group">
  <label>Quantity (Tablets/ml)</label>
  <input
    type="number"
    min="0"
    name="quantity"
    value={masterData.quantity}
    onChange={handleMasterChange}
    required
  />
</div>

                {/* MANUFACTURER */}
                <div className="form-group">
                  <label>Manufacturer</label>
                  <input
                    name="manufacturer"
                    value={masterData.manufacturer}
                    onChange={handleMasterChange}
                    required
                  />
                </div>

                {/* DOSE (dropdown + custom) */}
                <div className="form-group">
                  <label>Dose</label>
                  <select
                    className="input"
                    value={doseMode === "dropdown" ? masterData.dose : "Custom"}
                    onChange={handleDoseChange}
                  >
                    <option value="">Select dose</option>
                    {doseOptions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  {doseMode === "custom" && (
                    <input
                      name="dose"
                      placeholder="Enter custom dose"
                      value={masterData.dose}
                      onChange={handleMasterChange}
                      className="input"
                    />
                  )}
                </div>

                {/* CATEGORY */}
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={masterData.category}
                    onChange={handleMasterChange}
                    required
                  >
                    <option value="">Select category</option>
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* TYPE */}
                <div className="form-group">
                  <label>Type</label>
                  <select
                    name="type"
                    value={masterData.type}
                    onChange={handleMasterChange}
                    required
                  >
                    <option value="">Select type</option>
                    {typeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* STOCK */}
                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    min="0"
                    name="stock"
                    value={masterData.stock}
                    onChange={handleMasterChange}
                    required
                  />
                </div>

                {/* PRICE */}
                <div className="form-group">
                  <label>Price (Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    name="price"
                    value={masterData.price}
                    onChange={handleMasterChange}
                    required
                  />
                </div>

                {/* EXPIRY (date + calendar icon) */}
                <div className="form-group expiry-row">
                  <label>Expiry</label>
                  <div className="expiry-input-wrap">
                    <input
                      type="date"
                      name="expiryDate"
                      value={masterData.expiryDate}
                      onChange={handleMasterChange}
                      className="input date-input"
                      placeholder="Expiry date"
                    />
                    <AiOutlineCalendar className="calendar-icon" />
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={masterData.description}
                    onChange={handleMasterChange}
                    rows="3"
                  />
                </div>

                {/* UPLOAD IMAGE */}
                <label className="upload-btn">
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleMasterImageSelect}
                  />
                </label>

                {preview && (
                  <div className="image-preview-container">
                    <img src={preview} className="img-preview" alt="Preview" />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => {
                        setPreview(null);
                        setSelectedImage(null);
                        setMasterData({ ...masterData, imageURL: "" });
                      }}
                    >
                      ✖
                    </button>
                  </div>
                )}

                <div style={{ marginTop: 12 }}>
                  <button className="save-btn" type="submit">
                    {editMaster ? "Update" : "Save"}
                  </button>

                  {editMaster && (
                    <button
                      type="button"
                      className="delete-btn"
                      style={{ marginLeft: 8 }}
                      onClick={() => {
                        setEditMaster(null);
                        setMasterFormVisible(false);
                        setMasterData({
                          name: "",
                          formula: "",
                          quantity:"",
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
                        setPreview(null);
                        setSelectedImage(null);
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* MASTER LIST TABLE */}
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
                  <th>Image</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {masterList.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="no-products">No master medicines.</td>
                  </tr>
                ) : (
                  masterList.map((m) => (
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
                      <td>
                        {m.imageURL ? (
                          <img src={m.imageURL} alt="img" style={{ width: 60, borderRadius: 6 }} />
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="action-buttons">
                        <button className="edit-btn" onClick={() => handleEditMaster(m)}>
                          Edit
                        </button>

                        <button className="delete-btn" onClick={() => handleDeleteMaster(m.id)}>
                          Delete
                        </button>
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
