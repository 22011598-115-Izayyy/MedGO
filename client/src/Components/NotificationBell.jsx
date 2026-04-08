import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
  writeBatch,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import "./NotificationBell.css";

/**
 * Props:
 *  pharmacyId    — Firestore document ID of the pharmacy
 *  recipientRole — "admin" | "rider"
 *  recipientId   — null for admin, riderId string for rider
 */
const NotificationBell = ({ pharmacyId, recipientRole, recipientId }) => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ─── Real-time listener ───────────────────────────────────────────────────
  useEffect(() => {
    if (!pharmacyId || !recipientRole) return;

    const notifRef = collection(
      db,
      "Pharmacies",
      pharmacyId,
      "notifications"
    );

    const q =
      recipientRole === "admin"
        ? query(notifRef, orderBy("createdAt", "desc"))
        : query(
            notifRef,
            where("recipientRole", "==", "rider"),
            where("recipientId", "==", recipientId),
            orderBy("createdAt", "desc")
          );

    const unsub = onSnapshot(q, (snap) => {
      setNotifications(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });

    return () => unsub();
  }, [pharmacyId, recipientRole, recipientId]);

  // ─── Close dropdown when clicking outside ────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markOneRead = async (notif) => {
    if (notif.isRead) return;
    await updateDoc(
      doc(db, "Pharmacies", pharmacyId, "notifications", notif.id),
      { isRead: true }
    );
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;
    const batch = writeBatch(db);
    unread.forEach((n) => {
      batch.update(
        doc(db, "Pharmacies", pharmacyId, "notifications", n.id),
        { isRead: true }
      );
    });
    await batch.commit();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getIcon = (type) => {
    const icons = {
      new_order: "🛒",
      new_assignment: "📦",
      picked_up: "🏍️",
      on_the_way: "🚀",
      delivered: "✅",
      rejected: "❌",
    };
    return icons[type] || "🔔";
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="notif-bell-wrapper" ref={dropdownRef}>
      <button className="notif-bell-btn" onClick={() => setOpen((p) => !p)}>
        🔔
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <p className="notif-empty">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notif-item ${n.isRead ? "read" : "unread"}`}
                  onClick={() => markOneRead(n)}
                >
                  <span className="notif-icon">{getIcon(n.type)}</span>
                  <div className="notif-body">
                    <p className="notif-title">{n.title}</p>
                    <p className="notif-msg">{n.message}</p>
                    <span className="notif-time">{formatTime(n.createdAt)}</span>
                  </div>
                  {!n.isRead && <span className="unread-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;