import React, { useState, useEffect } from "react";
import "./RiderDashboard.css";
import { auth, db } from "../../firebase/config";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import MedGoLOGO from "../../assets/MedGo LOGO.png";
import { MdDashboard } from "react-icons/md";
import { TbClipboardList } from "react-icons/tb";
import { FaUser } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

const RiderDashboard = ({ setCurrentPage }) => {
  const [activePage, setActivePage] = useState("dashboard");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);

  const [riderData, setRiderData] = useState(null);

  // ------------------------------------------------------------------
  // FETCH REAL RIDER PROFILE
  // ------------------------------------------------------------------
  useEffect(() => {
    const fetchRider = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (!userSnap.exists()) return;

      const { pharmacyId, email } = userSnap.data();

      const ridersRef = collection(db, "Pharmacies", pharmacyId, "riders");
      const q = query(ridersRef, where("email", "==", email));
      const snap = await getDocs(q);

      if (!snap.empty) {
        setRiderData(snap.docs[0].data());
      }
    };

    fetchRider();
  }, []);

  // ------------------------------------------------------------------
  // REMOVE DUMMY ORDERS
  // ------------------------------------------------------------------
  useEffect(() => {
    setOrders([]);
  }, []);

  // Logout
  const handleLogout = () => {
    auth.signOut();
    setCurrentPage("admin");
  };

  // ----------------------------- Dashboard Page -----------------------------
  const DashboardHome = () => {
    return (
      <div className="page">
        <h2>Rider Dashboard</h2>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>{orders.length}</h3>
            <p>Total Orders</p>
          </div>

          <div className="stat-card">
            <h3>{orders.filter(o => o.status !== "delivered").length}</h3>
            <p>Pending</p>
          </div>

          <div className="stat-card">
            <h3>{orders.filter(o => o.status === "delivered").length}</h3>
            <p>Delivered</p>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------- My Orders -----------------------------
  const MyOrders = () => (
    <div className="page">
      <h2>My Orders</h2>

      {orders.length === 0 && (
        <p style={{ marginTop: "20px", color: "#777" }}>
          No orders assigned yet.
        </p>
      )}
    </div>
  );

  // ----------------------------- Profile Page -----------------------------
  const Profile = () => (
    <div className="page">
      <h2>My Profile</h2>

      {!riderData ? (
        <p>Loading profile...</p>
      ) : (
        <div className="profile-card">
          <p><strong>Name:</strong> {riderData.name}</p>
          <p><strong>Phone:</strong> {riderData.phone}</p>
          <p><strong>Email:</strong> {riderData.email}</p>
          <p><strong>Status:</strong> {riderData.status}</p>
        </div>
      )}
    </div>
  );

  // -----------------------------------------------------------------------
  return (
    <div className="rider-dashboard-container">

      {/* Sidebar */}
      <div className="sidebar">
        

        {/* ✅ ADDED LOGO CIRCLE HERE */}
        <div className="rider-logo-circle">
          <img src={MedGoLOGO} alt="MedGo Logo" />
        </div>
<h2 className="logo">MedGO Rider</h2>
        <ul className="menu">
          <li
            className={activePage === "dashboard" ? "active" : ""}
            onClick={() => setActivePage("dashboard")}
          >
            <MdDashboard className="icon" /> Dashboard
          </li>

          <li
            className={activePage === "orders" ? "active" : ""}
            onClick={() => setActivePage("orders")}
          >
            <TbClipboardList className="icon" /> My Orders
          </li>

          <li
            className={activePage === "profile" ? "active" : ""}
            onClick={() => setActivePage("profile")}
          >
            <FaUser className="icon" /> Profile
          </li>

          <li className="logout-btn" onClick={handleLogout}>
            <FiLogOut className="icon" /> Logout
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-area">
        <div className="header">Welcome Rider 👋</div>

        <div className="content">
          {activePage === "dashboard" && <DashboardHome />}
          {activePage === "orders" && <MyOrders />}
          {activePage === "profile" && <Profile />}
        </div>
      </div>

      {selectedOrder && <OrderDetailsModal />}
    </div>
  );
};

export default RiderDashboard;
