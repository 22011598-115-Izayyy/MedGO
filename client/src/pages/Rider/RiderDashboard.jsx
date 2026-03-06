import React, { useEffect, useState } from "react";
import "./RiderDashboard.css";
import { auth, db } from "../../firebase/config";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import MedGoLOGO from "../../assets/MedGo LOGO.png";
import { MdDashboard } from "react-icons/md";
import { TbClipboardList } from "react-icons/tb";
import { FaUser } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { FaBoxOpen, FaMotorcycle, FaCheckCircle } from "react-icons/fa";

const RiderDashboard = ({ setCurrentPage }) => {
  const [activePage, setActivePage] = useState("dashboard");
  const [orders, setOrders] = useState([]);
  const [riderData, setRiderData] = useState(null);

  // ---------------------------------------------------
  // FETCH RIDER (UNCHANGED LOGIC)
  // ---------------------------------------------------
  useEffect(() => {
    let unsubRiderRef = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (!userSnap.exists()) return;

      const { pharmacyId } = userSnap.data();

      const pharmacySnap = await getDocs(
        query(collection(db, "Pharmacies"), where("pharmacyId", "==", pharmacyId))
      );

      if (pharmacySnap.empty) return;

      const pharmacyDocId = pharmacySnap.docs[0].id;

      const riderRef = doc(
        db,
        "Pharmacies",
        pharmacyDocId,
        "riders",
        user.uid
      );

      unsubRiderRef = onSnapshot(riderRef, async (snap) => {
        if (!snap.exists()) return;

        setRiderData({
          ...snap.data(),
          id: snap.id,
          pharmacyDocId
        });

        await updateDoc(riderRef, {
          status: "active",
          lastOnline: new Date()
        });
      });
    });

    return () => {
      if (unsubRiderRef) unsubRiderRef();
      unsubscribeAuth();
    };
  }, []);

  // Stable values (prevents dependency issues)
  const pharmacyDocId = riderData?.pharmacyDocId || null;
  const riderId = riderData?.id || null;

  // ---------------------------------------------------
  // FETCH ASSIGNED ORDERS (OPTIMIZED REALTIME)
  // ---------------------------------------------------
  useEffect(() => {
    if (!pharmacyDocId || !riderId) return;

    const q = query(
      collection(db, "Pharmacies", pharmacyDocId, "orders"),
      where("assignedRiderId", "==", riderId)
    );

    const unsub = onSnapshot(q, (snap) => {
      setOrders((prevOrders) => {
        let updated = [...prevOrders];

        snap.docChanges().forEach((change) => {
          const data = change.doc.data();
          const orderData = {
            id: change.doc.id,
            orderId: data.orderId,
            orderStatus: data.orderStatus,
            totalPrice: data.totalPrice,
            customer: data.customer || {
              name: data.customerName,
              phone: data.customerPhone,
              address: data.customerAddress
            }
          };

          if (change.type === "added") {
            const exists = updated.find(o => o.id === orderData.id);
            if (!exists) updated.push(orderData);
          }

          if (change.type === "modified") {
            updated = updated.map(o =>
              o.id === orderData.id ? orderData : o
            );
          }

          if (change.type === "removed") {
            updated = updated.filter(o => o.id !== orderData.id);
          }
        });

        return updated;
      });
    });

    return () => unsub();
  }, [pharmacyDocId, riderId]);

  // ---------------------------------------------------
  // STATUS UPDATE (UNCHANGED LOGIC)
  // ---------------------------------------------------
  const updateStatus = async (order, nextStatus) => {
    if (order.orderStatus === "delivered") return;

    const allowed = {
      assigned: "picked_up",
      picked_up: "on_the_way"
    };

    if (allowed[order.orderStatus] !== nextStatus) return;

    const payload = { orderStatus: nextStatus };

    if (nextStatus === "picked_up") {
      payload["riderTimeline.pickedAt"] = new Date();
    }

    if (nextStatus === "on_the_way") {
      payload["riderTimeline.onTheWayAt"] = new Date();
    }

    // Instant UI
    setOrders(prev =>
      prev.map(o =>
        o.id === order.id ? { ...o, orderStatus: nextStatus } : o
      )
    );

    await updateDoc(
      doc(db, "Pharmacies", pharmacyDocId, "orders", order.id),
      payload
    );
  };

  // ---------------------------------------------------
  // DELIVERY CONFIRMATION (UNCHANGED LOGIC)
  // ---------------------------------------------------
  const confirmDelivery = async (order) => {
    if (order.orderStatus === "delivered") return;

    const ok = window.confirm("Confirm delivery?");
    if (!ok) return;

    const payload = {
      orderStatus: "delivered",
      "deliveryConfirmation.confirmed": true,
      "deliveryConfirmation.confirmedAt": new Date(),
      "deliveryConfirmation.riderId": riderId,
      "riderTimeline.deliveredAt": new Date()
    };

    setOrders(prev =>
      prev.map(o =>
        o.id === order.id ? { ...o, orderStatus: "delivered" } : o
      )
    );

    await updateDoc(
      doc(db, "Pharmacies", pharmacyDocId, "orders", order.id),
      payload
    );
  };

  const handleLogout = () => {
    auth.signOut();
    setCurrentPage("admin");
  };

  // ---------------- UI (UNCHANGED BELOW) ----------------

  const DashboardHome = () => (
    <div className="page">
      <h2>Rider Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{orders.length}</h3>
          <p>Total Orders</p>
        </div>
        <div className="stat-card">
          <h3>{orders.filter(o => o.orderStatus !== "delivered").length}</h3>
          <p>Active</p>
        </div>
        <div className="stat-card">
          <h3>{orders.filter(o => o.orderStatus === "delivered").length}</h3>
          <p>Delivered</p>
        </div>
      </div>
    </div>
  );

  const MyOrders = () => (
    <div className="page">
      <h2>My Orders</h2>
      {orders.map(order => (
        <div className="order-card" key={order.id}>
          <h4>Order #{order.orderId}</h4>
          <p>
            Status:{" "}
            <strong className={`status ${order.orderStatus}`}>
              {order.orderStatus.replaceAll("_", " ")}
            </strong>
          </p>
          <div className="customer-info">
            <p><span>Customer:</span> {order.customer?.name}</p>
            <p><span>Address:</span> {order.customer?.address}</p>
            <p><span>Phone:</span> {order.customer?.phone}</p>
            <p className="price">Rs. {order.totalPrice}</p>
          </div>
          <div className="action-row">
            <button
              className="primary-btn"
              disabled={order.orderStatus !== "assigned"}
              onClick={() => updateStatus(order, "picked_up")}
            >
              <FaBoxOpen /> Picked Up
            </button>
            <button
              className="primary-btn"
              disabled={order.orderStatus !== "picked_up"}
              onClick={() => updateStatus(order, "on_the_way")}
            >
              <FaMotorcycle /> On the Way
            </button>
            <button
              className="success-btn"
              disabled={order.orderStatus !== "on_the_way"}
              onClick={() => confirmDelivery(order)}
            >
              <FaCheckCircle /> Delivered
            </button>
          </div>
          {order.orderStatus === "delivered" && (
            <span className="badge success">Delivered ✔</span>
          )}
        </div>
      ))}
    </div>
  );

  const Profile = () => (
    <div className="page">
      <h2>My Profile</h2>
      {!riderData ? <p>Loading profile...</p> : (
        <div className="profile-card">
          <p><strong>Name:</strong> {riderData.name}</p>
          <p><strong>Phone:</strong> {riderData.phone}</p>
          <p><strong>Email:</strong> {riderData.email}</p>
          <p><strong>Status:</strong> {riderData.status}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="rider-dashboard-container">
      <div className="sidebar">
        <div className="rider-logo-circle">
          <img src={MedGoLOGO} alt="MedGo Logo" />
        </div>
        <h2 className="logo">MedGO Rider</h2>
        <ul className="menu">
          <li onClick={() => setActivePage("dashboard")}><MdDashboard /> Dashboard</li>
          <li onClick={() => setActivePage("orders")}><TbClipboardList /> My Orders</li>
          <li onClick={() => setActivePage("profile")}><FaUser /> Profile</li>
          <li className="logout-btn" onClick={handleLogout}><FiLogOut /> Logout</li>
        </ul>
      </div>
      <div className="main-area">
        <div className="header">Welcome Rider 👋</div>
        <div className="content">
          {activePage === "dashboard" && <DashboardHome />}
          {activePage === "orders" && <MyOrders />}
          {activePage === "profile" && <Profile />}
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;