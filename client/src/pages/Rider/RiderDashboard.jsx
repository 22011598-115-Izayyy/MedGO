import React, { useEffect, useState } from "react";
import "./RiderDashboard.css";
import { auth, db } from "../../firebase/config";
import {
  doc, getDoc, getDocs, collection, query, where, onSnapshot, updateDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { createNotification } from "../../utils/createNotification";
import { sendOrderStatusEmail } from "../../utils/sendCustomerEmail";
import NotificationBell from "../../Components/NotificationBell";

import MedGoLOGO from "../../assets/MedGo LOGO.png";
import { MdDashboard } from "react-icons/md";
import { TbClipboardList } from "react-icons/tb";
import { FaUser, FaBoxOpen, FaMotorcycle, FaCheckCircle, FaSearch, FaMapMarkerAlt, FaPhone, FaEnvelope, FaRupeeSign } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { MdPendingActions } from "react-icons/md";

const RiderDashboard = ({ setCurrentPage }) => {
  const [activePage, setActivePage] = useState("dashboard");
  const [orders, setOrders] = useState([]);
  const [riderData, setRiderData] = useState(null);

  // ===========================
  // NEW: LIVE CLOCK
  // ===========================
  const [liveTime, setLiveTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ===========================
  // NEW: ORDER SEARCH & FILTER
  // ===========================
  const [searchOrders, setSearchOrders] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredOrders = orders.filter((o) => {
    const q = searchOrders.toLowerCase();
    const matchSearch =
      (o.orderId || "").toString().toLowerCase().includes(q) ||
      (o.customer?.name || "").toLowerCase().includes(q) ||
      (o.customer?.address || "").toLowerCase().includes(q);
    const matchFilter = filterStatus === "all" || o.orderStatus === filterStatus;
    return matchSearch && matchFilter;
  });

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
      const riderRef = doc(db, "Pharmacies", pharmacyDocId, "riders", user.uid);
      unsubRiderRef = onSnapshot(riderRef, async (snap) => {
        if (!snap.exists()) return;
        setRiderData({ ...snap.data(), id: snap.id, pharmacyDocId });
        await updateDoc(riderRef, { status: "active", lastOnline: new Date() });
      });
    });
    return () => { if (unsubRiderRef) unsubRiderRef(); unsubscribeAuth(); };
  }, []);

  const pharmacyDocId = riderData?.pharmacyDocId || null;
  const riderId = riderData?.id || null;

  // ---------------------------------------------------
  // FETCH ASSIGNED ORDERS (UNCHANGED LOGIC)
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
              email: data.customerEmail,
              phone: data.customerPhone,
              address: data.customerAddress
            }
          };
          if (change.type === "added") {
            const exists = updated.find(o => o.id === orderData.id);
            if (!exists) updated.push(orderData);
          }
          if (change.type === "modified") updated = updated.map(o => o.id === orderData.id ? orderData : o);
          if (change.type === "removed") updated = updated.filter(o => o.id !== orderData.id);
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
    const allowed = { assigned: "picked_up", picked_up: "on_the_way" };
    if (allowed[order.orderStatus] !== nextStatus) return;
    const payload = { orderStatus: nextStatus };
    if (nextStatus === "picked_up") payload["riderTimeline.pickedAt"] = new Date();
    if (nextStatus === "on_the_way") payload["riderTimeline.onTheWayAt"] = new Date();
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, orderStatus: nextStatus } : o));
    await updateDoc(doc(db, "Pharmacies", pharmacyDocId, "orders", order.id), payload);
    const notifMessages = {
      picked_up: { type: "picked_up", title: "Order Picked Up", message: `Rider ${riderData?.name || ""} picked up order #${order.orderId}` },
      on_the_way: { type: "on_the_way", title: "Order On The Way", message: `Rider ${riderData?.name || ""} is on the way for order #${order.orderId}` },
    };
    if (notifMessages[nextStatus]) {
      await createNotification({ pharmacyId: pharmacyDocId, ...notifMessages[nextStatus], orderId: order.id, recipientRole: "admin", recipientId: null });
    }
    if (order.customer?.email) {
      await sendOrderStatusEmail({ customerName: order.customer.name, customerEmail: order.customer.email, orderId: order.orderId, status: nextStatus });
    }
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
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, orderStatus: "delivered" } : o));
    await updateDoc(doc(db, "Pharmacies", pharmacyDocId, "orders", order.id), payload);
    await createNotification({
      pharmacyId: pharmacyDocId, type: "delivered", title: "Order Delivered ✔",
      message: `Order #${order.orderId} has been delivered by ${riderData?.name || "rider"}`,
      orderId: order.id, recipientRole: "admin", recipientId: null,
    });
    if (order.customer?.email) {
      await sendOrderStatusEmail({ customerName: order.customer.name, customerEmail: order.customer.email, orderId: order.orderId, status: "delivered" });
    }
  };

  const handleLogout = () => { auth.signOut(); setCurrentPage("admin"); };

  const formatTime = (d) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formatDate = (d) => d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  // ===========================
  // STATUS CONFIG
  // ===========================
  const statusConfig = {
    assigned:   { label: "Assigned",   color: "rd-s-assigned",   step: 1 },
    picked_up:  { label: "Picked Up",  color: "rd-s-picked",     step: 2 },
    on_the_way: { label: "On the Way", color: "rd-s-onway",      step: 3 },
    delivered:  { label: "Delivered",  color: "rd-s-delivered",  step: 4 },
  };

  // ===========================
  // STATUS PROGRESS BAR
  // ===========================
  const StatusTimeline = ({ status }) => {
    const steps = [
      { key: "assigned",   icon: "📋", label: "Assigned" },
      { key: "picked_up",  icon: "📦", label: "Picked Up" },
      { key: "on_the_way", icon: "🏍️", label: "On the Way" },
      { key: "delivered",  icon: "✅", label: "Delivered" },
    ];
    const currentStep = statusConfig[status]?.step || 1;
    return (
      <div className="rd-timeline">
        {steps.map((s, i) => (
          <React.Fragment key={s.key}>
            <div className={`rd-timeline-step ${currentStep >= s.step ? "rd-step-done" : ""} ${currentStep === s.step ? "rd-step-active" : ""}`}>
              <div className="rd-step-dot">{currentStep >= s.step ? s.icon : ""}</div>
              <span className="rd-step-label">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`rd-timeline-line ${currentStep > s.step ? "rd-line-done" : ""}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // ===========================
  // DASHBOARD HOME
  // ===========================
  const DashboardHome = () => (
    <div className="rd-page">
      {/* Welcome Banner */}
      <div className="rd-welcome-banner">
        <div className="rd-welcome-left">
          <span className="rd-welcome-greeting">Welcome back, {riderData?.name || "Rider"} 👋</span>
          <span className="rd-welcome-date">{formatDate(liveTime)}</span>
        </div>
        <div className="rd-welcome-clock">{formatTime(liveTime)}</div>
      </div>

      {/* Stat Cards */}
      <div className="rd-stats-grid">
        <div className="rd-stat-card rd-stat-green">
          <div className="rd-stat-icon-wrap"><TbClipboardList /></div>
          <div className="rd-stat-info">
            <h3>{orders.length}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="rd-stat-card rd-stat-amber">
          <div className="rd-stat-icon-wrap"><MdPendingActions /></div>
          <div className="rd-stat-info">
            <h3>{orders.filter(o => o.orderStatus !== "delivered").length}</h3>
            <p>Active</p>
          </div>
        </div>
        <div className="rd-stat-card rd-stat-blue">
          <div className="rd-stat-icon-wrap"><FaMotorcycle /></div>
          <div className="rd-stat-info">
            <h3>{orders.filter(o => o.orderStatus === "on_the_way").length}</h3>
            <p>On the Way</p>
          </div>
        </div>
        <div className="rd-stat-card rd-stat-emerald">
          <div className="rd-stat-icon-wrap"><FaCheckCircle /></div>
          <div className="rd-stat-info">
            <h3>{orders.filter(o => o.orderStatus === "delivered").length}</h3>
            <p>Delivered</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Preview */}
      <div className="rd-recent-section">
        <div className="rd-recent-header">
          <span className="rd-recent-title">Recent Orders</span>
          <button className="rd-view-all-btn" onClick={() => setActivePage("orders")}>View All →</button>
        </div>
        <div className="rd-recent-list">
          {orders.length === 0 ? (
            <p className="rd-empty-msg">No orders assigned yet.</p>
          ) : (
            orders.slice(0, 4).map((o) => (
              <div className="rd-recent-item" key={o.id}>
                <div className="rd-recent-icon">🛵</div>
                <div className="rd-recent-info">
                  <span className="rd-recent-name">Order #{o.orderId}</span>
                  <span className="rd-recent-sub">{o.customer?.name} · {o.customer?.address}</span>
                </div>
                <span className={`rd-status-pill ${statusConfig[o.orderStatus]?.color || ""}`}>
                  {statusConfig[o.orderStatus]?.label || o.orderStatus}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Earnings Strip */}
      <div className="rd-earnings-strip">
        <div className="rd-earn-item">
          <span className="rd-earn-label">Total Earnings</span>
          <span className="rd-earn-val">
            Rs. {orders.filter(o => o.orderStatus === "delivered").reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0)}
          </span>
        </div>
        <div className="rd-earn-divider" />
        <div className="rd-earn-item">
          <span className="rd-earn-label">Completed Runs</span>
          <span className="rd-earn-val">{orders.filter(o => o.orderStatus === "delivered").length}</span>
        </div>
        <div className="rd-earn-divider" />
        <div className="rd-earn-item">
          <span className="rd-earn-label">Rider Status</span>
          <span className="rd-earn-val rd-earn-online">● Online</span>
        </div>
      </div>
    </div>
  );

  // ===========================
  // MY ORDERS
  // ===========================
  const MyOrders = () => (
    <div className="rd-page">
      <h2 className="rd-page-title">My Orders</h2>

      {/* Search & Filter */}
      <div className="rd-orders-toolbar">
        <div className="rd-search-wrap">
          <FaSearch className="rd-search-icon" />
          <input
            className="rd-search-input"
            type="text"
            placeholder="Search by order ID, customer, address…"
            value={searchOrders}
            onChange={(e) => setSearchOrders(e.target.value)}
          />
          {searchOrders && (
            <span className="rd-search-count">{filteredOrders.length} result{filteredOrders.length !== 1 ? "s" : ""}</span>
          )}
        </div>
        <div className="rd-filter-tabs">
          {["all", "assigned", "picked_up", "on_the_way", "delivered"].map((f) => (
            <button
              key={f}
              className={`rd-filter-tab ${filterStatus === f ? "rd-filter-active" : ""}`}
              onClick={() => setFilterStatus(f)}
            >
              {f === "all" ? "All" : f === "picked_up" ? "Picked Up" : f === "on_the_way" ? "On the Way" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rd-orders-empty">
          <span style={{ fontSize: "2.5rem" }}>🛵</span>
          <p>{searchOrders || filterStatus !== "all" ? "No orders match your filter." : "No orders assigned yet."}</p>
        </div>
      ) : (
        filteredOrders.map(order => (
          <div className={`rd-order-card ${order.orderStatus === "delivered" ? "rd-card-delivered" : ""}`} key={order.id}>
            {/* Card Header */}
            <div className="rd-card-header">
              <div className="rd-card-header-left">
                <span className="rd-order-id">Order #{order.orderId}</span>
                <span className={`rd-status-pill ${statusConfig[order.orderStatus]?.color || ""}`}>
                  {statusConfig[order.orderStatus]?.label || order.orderStatus}
                </span>
              </div>
              <span className="rd-order-price">
                <FaRupeeSign style={{ fontSize: "0.8rem" }} /> {order.totalPrice}
              </span>
            </div>

            {/* Status Timeline */}
            <StatusTimeline status={order.orderStatus} />

            {/* Customer Info */}
            <div className="rd-customer-grid">
              <div className="rd-customer-field">
                <FaUser className="rd-cust-icon" />
                <div>
                  <span className="rd-cust-label">Customer</span>
                  <span className="rd-cust-val">{order.customer?.name || "—"}</span>
                </div>
              </div>
              <div className="rd-customer-field">
                <FaPhone className="rd-cust-icon" />
                <div>
                  <span className="rd-cust-label">Phone</span>
                  <span className="rd-cust-val">{order.customer?.phone || "—"}</span>
                </div>
              </div>
              <div className="rd-customer-field rd-cust-full">
                <FaMapMarkerAlt className="rd-cust-icon" />
                <div>
                  <span className="rd-cust-label">Address</span>
                  <span className="rd-cust-val">{order.customer?.address || "—"}</span>
                </div>
              </div>
              {order.customer?.email && (
                <div className="rd-customer-field rd-cust-full">
                  <FaEnvelope className="rd-cust-icon" />
                  <div>
                    <span className="rd-cust-label">Email</span>
                    <span className="rd-cust-val">{order.customer.email}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {order.orderStatus !== "delivered" && (
              <div className="rd-action-row">
                <button
                  className="rd-action-btn rd-btn-pickup"
                  disabled={order.orderStatus !== "assigned"}
                  onClick={() => updateStatus(order, "picked_up")}
                >
                  <FaBoxOpen /> Picked Up
                </button>
                <button
                  className="rd-action-btn rd-btn-onway"
                  disabled={order.orderStatus !== "picked_up"}
                  onClick={() => updateStatus(order, "on_the_way")}
                >
                  <FaMotorcycle /> On the Way
                </button>
                <button
                  className="rd-action-btn rd-btn-deliver"
                  disabled={order.orderStatus !== "on_the_way"}
                  onClick={() => confirmDelivery(order)}
                >
                  <FaCheckCircle /> Delivered
                </button>
              </div>
            )}

            {order.orderStatus === "delivered" && (
              <div className="rd-delivered-badge">✅ Delivered Successfully</div>
            )}
          </div>
        ))
      )}
    </div>
  );

  // ===========================
  // PROFILE
  // ===========================
  const Profile = () => (
    <div className="rd-page">
      <h2 className="rd-page-title">My Profile</h2>
      {!riderData ? (
        <p className="rd-loading">Loading profile…</p>
      ) : (
        <div className="rd-profile-wrap">
          {/* Avatar Card */}
          <div className="rd-profile-avatar-card">
            <div className="rd-avatar-circle">{(riderData.name || "R")[0].toUpperCase()}</div>
            <h3 className="rd-avatar-name">{riderData.name}</h3>
            <span className={`rd-status-pill ${riderData.status === "active" ? "rd-s-delivered" : "rd-s-assigned"}`}>
              {riderData.status === "active" ? "● Online" : "● Offline"}
            </span>
          </div>

          {/* Info Cards */}
          <div className="rd-profile-grid">
            <div className="rd-profile-field">
              <span className="rd-profile-label"><FaUser /> Full Name</span>
              <span className="rd-profile-val">{riderData.name}</span>
            </div>
            <div className="rd-profile-field">
              <span className="rd-profile-label"><FaPhone /> Phone</span>
              <span className="rd-profile-val">{riderData.phone}</span>
            </div>
            <div className="rd-profile-field rd-pf-full">
              <span className="rd-profile-label"><FaEnvelope /> Email</span>
              <span className="rd-profile-val">{riderData.email}</span>
            </div>
            <div className="rd-profile-field">
              <span className="rd-profile-label">📦 Total Orders</span>
              <span className="rd-profile-val rd-profile-big">{orders.length}</span>
            </div>
            <div className="rd-profile-field">
              <span className="rd-profile-label">✅ Delivered</span>
              <span className="rd-profile-val rd-profile-big rd-profile-green">
                {orders.filter(o => o.orderStatus === "delivered").length}
              </span>
            </div>
            <div className="rd-profile-field">
              <span className="rd-profile-label">🏍️ Active Runs</span>
              <span className="rd-profile-val rd-profile-big rd-profile-amber">
                {orders.filter(o => o.orderStatus !== "delivered").length}
              </span>
            </div>
            <div className="rd-profile-field rd-pf-full">
              <span className="rd-profile-label"><FaRupeeSign /> Total Earnings</span>
              <span className="rd-profile-val rd-profile-big rd-profile-green">
                Rs. {orders.filter(o => o.orderStatus === "delivered").reduce((s, o) => s + (Number(o.totalPrice) || 0), 0)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ===========================
  // RENDER
  // ===========================
  return (
    <div className="rd-container">
      {/* ── SIDEBAR ── */}
      <div className="rd-sidebar">
        <div className="rd-logo-circle">
          <img src={MedGoLOGO} alt="MedGo Logo" />
        </div>
        <h2 className="rd-sidebar-title">MedGO Rider</h2>

        <ul className="rd-menu">
          <li className={activePage === "dashboard" ? "rd-active" : ""} onClick={() => setActivePage("dashboard")}>
            <MdDashboard className="rd-menu-icon" /> Dashboard
          </li>
          <li className={activePage === "orders" ? "rd-active" : ""} onClick={() => setActivePage("orders")}>
            <TbClipboardList className="rd-menu-icon" /> My Orders
            {orders.filter(o => o.orderStatus !== "delivered").length > 0 && (
              <span className="rd-menu-badge">{orders.filter(o => o.orderStatus !== "delivered").length}</span>
            )}
          </li>
          <li className={activePage === "profile" ? "rd-active" : ""} onClick={() => setActivePage("profile")}>
            <FaUser className="rd-menu-icon" /> Profile
          </li>
        </ul>

        <button className="rd-logout-btn" onClick={handleLogout}>
          <FiLogOut /> Logout
        </button>
      </div>

      {/* ── MAIN AREA ── */}
      <div className="rd-main">
        <div className="rd-header">
          <span>Welcome, {riderData?.name || "Rider"} 👋</span>
          {pharmacyDocId && riderId && (
            <NotificationBell pharmacyId={pharmacyDocId} recipientRole="rider" recipientId={riderId} />
          )}
        </div>

        <div className="rd-content">
          {activePage === "dashboard" && <DashboardHome />}
          {activePage === "orders" && <MyOrders />}
          {activePage === "profile" && <Profile />}
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;