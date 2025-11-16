import React, { useEffect, useState } from "react";
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

const SuperAdminDashboard = ({ setCurrentPage }) => {
  const [pharmacies, setPharmacies] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedSection, setSelectedSection] = useState("auth");
  const [formVisible, setFormVisible] = useState(false);
  const [editPharmacy, setEditPharmacy] = useState(null);
  const [editUser, setEditUser] = useState(null);

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

  // ✅ Fetch Pharmacies
  const fetchPharmacies = async () => {
    try {
      const snapshot = await getDocs(pharmaciesRef);
      setPharmacies(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    } catch (err) {
      console.error("Error fetching pharmacies:", err);
    }
  };

  // ✅ Realtime Fetch Users
  useEffect(() => {
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const fetchedUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(fetchedUsers);
    });

    fetchPharmacies();
    return () => unsubscribe();
  }, []);

  // ✅ Handle Input Changes
  const handleChange = (e) => {
    setPharmacyData({ ...pharmacyData, [e.target.name]: e.target.value });
  };

  const handleUserChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  // ✅ Add or Edit Pharmacy
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editPharmacy) {
        const pharmacyRef = doc(db, "Pharmacies", editPharmacy.id);
        await updateDoc(pharmacyRef, pharmacyData);
        alert("Pharmacy updated successfully!");
      } else {
        await addDoc(pharmaciesRef, pharmacyData);
        alert("Pharmacy added successfully!");
      }

      setPharmacyData({
        pharmacyId: "",
        name: "",
        address: "",
        email: "",
        phone: "",
        status: "Active",
      });
      setFormVisible(false);
      setEditPharmacy(null);
      fetchPharmacies();
    } catch (err) {
      console.error("Error saving pharmacy:", err);
    }
  };

  // ✅ Edit Pharmacy
  const handleEdit = (pharmacy) => {
    setEditPharmacy(pharmacy);
    setPharmacyData(pharmacy);
    setFormVisible(true);
  };

  // ✅ Delete Pharmacy with Confirmation
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this pharmacy?"
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "Pharmacies", id));
      alert("Pharmacy deleted!");
      fetchPharmacies();
    } catch (err) {
      console.error("Error deleting pharmacy:", err);
    }
  };

  // ✅ Toggle Active/Inactive
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const pharmacyRef = doc(db, "Pharmacies", id);
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
      await updateDoc(pharmacyRef, { status: newStatus });
      fetchPharmacies();
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  // ✅ Add or Edit User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    const superAdminEmail = "medgo@gmail.com";
    const superAdminPassword = "admin123";

    try {
      if (editUser) {
        const userRef = doc(db, "users", editUser.id);
        await updateDoc(userRef, newUser);
        alert("User updated successfully!");
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          newUser.email,
          newUser.password
        );
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
          email: newUser.email,
          role: newUser.role,
          pharmacyId: newUser.pharmacyId,
        });
        alert("✅ New pharmacy user created successfully!");
        await signInWithEmailAndPassword(auth, superAdminEmail, superAdminPassword);
      }

      setNewUser({ email: "", password: "", pharmacyId: "", role: "pharmacy_manager" });
      setFormVisible(false);
      setEditUser(null);
    } catch (error) {
      console.error("Error creating/updating user:", error);
      alert("❌ " + error.message);
    }
  };

  // ✅ Edit User
  const handleEditUser = (user) => {
    setEditUser(user);
    setNewUser(user);
    setFormVisible(true);
  };

  // ✅ Delete User
  const handleDeleteUser = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "users", id));
      alert("User deleted!");
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  // ✅ Logout
  const handleLogout = () => {
    setCurrentPage("admin");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "240px",
          backgroundColor: "#1a7f45",
          color: "white",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Super Admin</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li
              style={menuItemStyle(selectedSection === "auth")}
              onClick={() => setSelectedSection("auth")}
            >
              Authentication
            </li>
            <li
              style={menuItemStyle(selectedSection === "pharmacies")}
              onClick={() => setSelectedSection("pharmacies")}
            >
              Pharmacies
            </li>
            <li
              style={menuItemStyle(selectedSection === "orders")}
              onClick={() => setSelectedSection("orders")}
            >
              Orders
            </li>
            <li
              style={menuItemStyle(selectedSection === "riders")}
              onClick={() => setSelectedSection("riders")}
            >
              Riders
            </li>
          </ul>
        </div>

        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#d32f2f",
            color: "white",
            border: "none",
            padding: "12px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "30px" }}>
        <h2 style={{ color: "green", textAlign: "center", marginBottom: "20px" }}>
          Super Admin Dashboard
        </h2>

        {/* 🟢 Authentication Section */}
        {selectedSection === "auth" && (
          <>
            <button
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
              style={addBtnStyle}
            >
              {formVisible ? "Close Form" : "Add User"}
            </button>

            {formVisible && (
              <form onSubmit={handleCreateUser} style={formStyle}>
                <h3 style={{ color: "green" }}>
                  {editUser ? "Edit User" : "Add New User"}
                </h3>

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={handleUserChange}
                  style={inputStyle}
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={newUser.password}
                  onChange={handleUserChange}
                  style={inputStyle}
                  required={!editUser}
                />
                <input
                  type="text"
                  name="pharmacyId"
                  placeholder="Pharmacy ID (e.g., ahad_pharmacy)"
                  value={newUser.pharmacyId}
                  onChange={handleUserChange}
                  style={inputStyle}
                  required
                />
                <button type="submit" style={saveBtnStyle}>
                  {editUser ? "Update User" : "Create User"}
                </button>
              </form>
            )}

            <table style={tableStyle}>
              <thead>
                <tr style={{ backgroundColor: "#c8f7c5" }}>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Pharmacy ID</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={tdStyle}>{u.email}</td>
                    <td style={tdStyle}>{u.role}</td>
                    <td style={tdStyle}>{u.pharmacyId}</td>
                    <td style={tdStyle}>
                      <button onClick={() => handleEditUser(u)} style={editBtnStyle}>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        style={removeBtnStyle}
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

        {/* 💊 Pharmacies Section */}
        {selectedSection === "pharmacies" && (
          <>
            <button
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
              style={addBtnStyle}
            >
              {formVisible ? "Close Form" : "Add Pharmacy"}
            </button>

            {formVisible && (
              <form onSubmit={handleSubmit} style={formStyle}>
                <h3 style={{ color: "green" }}>
                  {editPharmacy ? "Edit Pharmacy" : "Add New Pharmacy"}
                </h3>

                <input
                  type="text"
                  name="pharmacyId"
                  placeholder="Pharmacy ID (e.g., ahad_pharmacy)"
                  value={pharmacyData.pharmacyId}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Pharmacy Name"
                  value={pharmacyData.name}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={pharmacyData.address}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={pharmacyData.email}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone"
                  value={pharmacyData.phone}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
                <button type="submit" style={saveBtnStyle}>
                  {editPharmacy ? "Update" : "Save"}
                </button>
              </form>
            )}

            <table style={tableStyle}>
              <thead>
                <tr style={{ backgroundColor: "#c8f7c5" }}>
                  <th style={thStyle}>Pharmacy ID</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Address</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pharmacies.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={tdStyle}>{p.pharmacyId || p.id}</td>
                    <td style={tdStyle}>{p.name}</td>
                    <td style={tdStyle}>{p.address}</td>
                    <td style={tdStyle}>{p.email}</td>
                    <td style={tdStyle}>{p.phone}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          color: p.status === "Active" ? "green" : "red",
                          fontWeight: "bold",
                        }}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button onClick={() => handleEdit(p)} style={editBtnStyle}>
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(p.id, p.status)}
                        style={{
                          ...toggleBtnStyle,
                          backgroundColor:
                            p.status === "Active" ? "orange" : "green",
                        }}
                      >
                        {p.status === "Active" ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        style={removeBtnStyle}
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

// ✅ Styles
const inputStyle = {
  width: "100%",
  padding: "8px",
  margin: "8px 0",
  borderRadius: "5px",
  border: "1px solid #ccc",
};
const thStyle = { padding: "10px", textAlign: "left" };
const tdStyle = { padding: "10px", textAlign: "left" };
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  backgroundColor: "#fff",
};
const formStyle = {
  backgroundColor: "#e8f5e9",
  padding: "20px",
  borderRadius: "10px",
  marginBottom: "20px",
};
const addBtnStyle = {
  backgroundColor: "green",
  color: "white",
  padding: "10px 20px",
  border: "none",
  borderRadius: "5px",
  marginBottom: "20px",
};
const saveBtnStyle = {
  backgroundColor: "green",
  color: "white",
  border: "none",
  padding: "10px 20px",
  borderRadius: "5px",
};
const editBtnStyle = {
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  padding: "5px 10px",
  borderRadius: "4px",
  marginRight: "5px",
};
const toggleBtnStyle = {
  color: "white",
  border: "none",
  padding: "5px 10px",
  borderRadius: "4px",
  marginRight: "5px",
};
const removeBtnStyle = {
  backgroundColor: "#f44336",
  color: "white",
  border: "none",
  padding: "5px 10px",
  borderRadius: "4px",
};
const menuItemStyle = (active) => ({
  marginBottom: "15px",
  padding: "10px",
  borderRadius: "8px",
  backgroundColor: active ? "#145c32" : "transparent",
  cursor: "pointer",
  fontWeight: active ? "bold" : "normal",
});

export default SuperAdminDashboard;
