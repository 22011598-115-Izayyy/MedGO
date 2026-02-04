import React, { useState, useEffect } from "react";
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

import MedGoLOGO from "../../assets/MedGo LOGO.png";
import { MdDashboard } from "react-icons/md";
import { TbClipboardList } from "react-icons/tb";
import { FaUser } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

/* ✅ ONLY ADDITION: icons for buttons */
import { FaBoxOpen, FaMotorcycle, FaCheckCircle } from "react-icons/fa";

const RiderDashboard = ({ setCurrentPage }) => {
  const [activePage, setActivePage] = useState("dashboard");
  const [orders, setOrders] = useState([]);
  const [riderData, setRiderData] = useState(null);

  // ---------------------------------------------------
  // FETCH RIDER (UNCHANGED)
  // ---------------------------------------------------
  useEffect(() => {
    const fetchRider = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (!userSnap.exists()) return;

      const { pharmacyId, email } = userSnap.data();

      const pharmacyQuery = query(
        collection(db, "Pharmacies"),
        where("pharmacyId", "==", pharmacyId)
      );
      const pharmacySnap = await getDocs(pharmacyQuery);
      if (pharmacySnap.empty) return;

      const pharmacyDocId = pharmacySnap.docs[0].id;

      const q = query(
        collection(db, "Pharmacies", pharmacyDocId, "riders"),
        where("email", "==", email)
      );

      const unsub = onSnapshot(q, async (snap) => {
        if (!snap.empty) {
          const riderDoc = snap.docs[0];

          setRiderData({
            ...riderDoc.data(),
            id: riderDoc.id,
            pharmacyId,
            pharmacyDocId
          });

          await updateDoc(riderDoc.ref, {
            status: "active",
            lastOnline: new Date()
          });
        }
      });

      return () => unsub();
    };

    fetchRider();
  }, []);

  // ---------------------------------------------------
  // FETCH ASSIGNED ORDERS (UNCHANGED)
  // ---------------------------------------------------
  useEffect(() => {
    if (!riderData?.pharmacyDocId) return;

    const q = query(
      collection(db, "Pharmacies", riderData.pharmacyDocId, "orders"),
      where("assignedRiderId", "==", riderData.id)
    );

    const unsub = onSnapshot(q, async (snap) => {
      const list = [];

      for (const d of snap.docs) {
        let data = d.data();

        if (!data.customer && data.orderId) {
          const globalSnap = await getDoc(doc(db, "Orders", data.orderId));
          if (globalSnap.exists()) {
            data = {
              ...data,
              customer: globalSnap.data().customer
            };
          }
        }

        list.push({ id: d.id, ...data });
      }

      setOrders(list);
    });

    return () => unsub();
  }, [riderData]);

  // ---------------------------------------------------
  // STATUS UPDATE (ONLY ADDITION INSIDE)
  // ---------------------------------------------------
  const updateStatus = async (order, nextStatus) => {
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

    await updateDoc(
      doc(db, "Pharmacies", riderData.pharmacyDocId, "orders", order.id),
      payload
    );

    // ✅ ADDITION (GLOBAL ORDERS SYNC)
    await updateDoc(
      doc(db, "Orders", order.orderId),
      { orderStatus: nextStatus }
    );
  };

  // ---------------------------------------------------
  // DELIVERY CONFIRMATION (ONLY ADDITION INSIDE)
  // ---------------------------------------------------
  const confirmDelivery = async (order) => {
    const ok = window.confirm(
      "Confirm that this order has been delivered to the customer?"
    );
    if (!ok) return;

    await updateDoc(
      doc(db, "Pharmacies", riderData.pharmacyDocId, "orders", order.id),
      {
        orderStatus: "delivered",
        "deliveryConfirmation.confirmed": true,
        "deliveryConfirmation.confirmedAt": new Date(),
        "deliveryConfirmation.riderId": riderData.id,
        "riderTimeline.deliveredAt": new Date()
      }
    );

    // ✅ ADDITION (GLOBAL ORDERS SYNC)
    await updateDoc(
      doc(db, "Orders", order.orderId),
      { orderStatus: "delivered" }
    );
  };

  // ---------------------------------------------------
  // LOGOUT (UNCHANGED)
  // ---------------------------------------------------
  const handleLogout = () => {
    auth.signOut();
    setCurrentPage("admin");
  };

  // ---------------- DASHBOARD ----------------
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

  // ---------------- MY ORDERS ----------------
  const MyOrders = () => (
    <div className="page">
      <h2>My Orders</h2>

      {orders.length === 0 && (
        <p style={{ marginTop: 20, color: "#777" }}>
          No orders assigned yet.
        </p>
      )}

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
            <p><span>Customer:</span> {order.customer?.name || order.customerName || "-"}</p>
            <p><span>Address:</span> {order.customer?.address || "-"}</p>
            <p>
              <span>Phone:</span>{" "}
              {order.customer?.phone ? (
                <a href={`tel:${order.customer.phone}`}>
                  {order.customer.phone}
                </a>
              ) : "-"}
            </p>
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

  // ---------------- PROFILE ----------------
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

  return (
    <div className="rider-dashboard-container">
      <div className="sidebar">
        <div className="rider-logo-circle">
          <img src={MedGoLOGO} alt="MedGo Logo" />
        </div>

        <h2 className="logo">MedGO Rider</h2>

        <ul className="menu">
          <li
            className={activePage === "dashboard" ? "active" : ""}
            onClick={() => setActivePage("dashboard")}
          >
            <MdDashboard /> Dashboard
          </li>

          <li
            className={activePage === "orders" ? "active" : ""}
            onClick={() => setActivePage("orders")}
          >
            <TbClipboardList /> My Orders
          </li>

          <li
            className={activePage === "profile" ? "active" : ""}
            onClick={() => setActivePage("profile")}
          >
            <FaUser /> Profile
          </li>

          <li className="logout-btn" onClick={handleLogout}>
            <FiLogOut /> Logout
          </li>
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
