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
} from "react-icons/fa";

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
  const [totalOrders, setTotalOrders] = useState(0); // NEW — Fetch orders count

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

  const pharmaciesRef = collection(db, "Pharmacies");
  const usersRef = collection(db, "users");
  const auth = getAuth();

  // Fetch users + pharmacies on load
  useEffect(() => {
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const fetchedUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(fetchedUsers);

      // Correct rider count
      setTotalRiders(fetchedUsers.filter((u) => u.role === "rider").length);
    });

    fetchPharmacies();
    return () => unsubscribe();
  }, []);

  // Fetch pharmacies + compute stats
  const fetchPharmacies = async () => {
    const snapshot = await getDocs(pharmaciesRef);
    const pharms = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setPharmacies(pharms);

    setActivePharmacies(pharms.filter((p) => p.status === "Active").length);
    setInactivePharmacies(pharms.filter((p) => p.status === "Inactive").length);

    fetchOrdersCount(pharms); // NEW — fetch total orders
  };

  // Count all orders inside all sub-collections
  const fetchOrdersCount = async (pharms) => {
    let count = 0;

    for (let pharmacy of pharms) {
      const ordersRef = collection(
        db,
        "Pharmacies",
        pharmacy.id,
        "orders"
      );

      const orderSnapshot = await getDocs(ordersRef);
      count += orderSnapshot.size;
    }

    setTotalOrders(count);
  };

  // Handlers (unchanged)
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
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          newUser.email,
          newUser.password
        );

        const uid = userCredential.user.uid;

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
      console.log(err);
    }
  };

  const handleEditUser = (user) => {
    setEditUser(user);
    setNewUser(user);
    setFormVisible(true);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete user?")) return;

    await deleteDoc(doc(db, "users", id));
  };

  const handleLogout = () => setCurrentPage("admin");

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
        </ul>

        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt className="sidebar-icon" /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <h1 className="dashboard-header">MedGO Dashboard</h1>

        {/* =================== MAIN DASHBOARD =================== */}
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

        {/* =================== AUTH SECTION =================== */}
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
                      <button
                        className="edit-btn"
                        onClick={() => handleEditUser(u)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteUser(u.id)}
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

        {/* =================== PHARMACIES SECTION =================== */}
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
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="toggle-btn"
                        onClick={() =>
                          handleToggleStatus(p.id, p.status)
                        }
                      >
                        {p.status === "Active"
                          ? "Deactivate"
                          : "Activate"}
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
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
