import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  onSnapshot
} from "firebase/firestore";
import { db } from "../../firebase/config";
import "./PharmacyOrders.css";

const PharmacyOrders = ({ pharmacyId }) => {
  const [pharmacyDocId, setPharmacyDocId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------
  // Get pharmacy document ID
  // ---------------------------------------------
  const loadPharmacyDocId = async () => {
    const q = query(
      collection(db, "Pharmacies"),
      where("pharmacyId", "==", pharmacyId)
    );

    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs[0].id;
    return null;
  };

  // ---------------------------------------------
  // REAL-TIME PHARMACY ORDERS (UNCHANGED)
  // ---------------------------------------------
  const listenOrders = (docId) => {
    const ref = collection(db, "Pharmacies", docId, "orders");

    return onSnapshot(ref, (snap) => {
      setOrders(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }))
      );
      setLoading(false);
    });
  };

  // ---------------------------------------------
  // 🔥 REAL-TIME GLOBAL ORDER STATUS SYNC (NEW)
  // ---------------------------------------------
  const listenGlobalOrders = (docId) => {
    const ref = collection(db, "Orders");

    return onSnapshot(ref, async (snap) => {
      for (const d of snap.docs) {
        const global = d.data();

        if (!global.pharmacyOrderId || !global.orderStatus) continue;

        const pharmacyOrderRef = doc(
          db,
          "Pharmacies",
          docId,
          "orders",
          global.pharmacyOrderId
        );

        await updateDoc(pharmacyOrderRef, {
          orderStatus: global.orderStatus
        });
      }
    });
  };

  // ---------------------------------------------
  // Fetch riders
  // ---------------------------------------------
  const fetchRiders = async (docId) => {
    const ref = collection(db, "Pharmacies", docId, "riders");
    const snap = await getDocs(ref);

    setRiders(
      snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((r) => r.status === "active")
    );
  };

  useEffect(() => {
    let unsubOrders;
    let unsubGlobal;

    const load = async () => {
      const id = await loadPharmacyDocId();
      if (!id) return;

      setPharmacyDocId(id);
      unsubOrders = listenOrders(id);
      unsubGlobal = listenGlobalOrders(id);
      fetchRiders(id);
    };

    load();

    return () => {
      unsubOrders && unsubOrders();
      unsubGlobal && unsubGlobal();
    };
  }, [pharmacyId]);

  // ---------------------------------------------
  // Accept / Reject (UNCHANGED)
  // ---------------------------------------------
  const updateOrderStatus = async (orderId, status) => {
    await updateDoc(
      doc(db, "Pharmacies", pharmacyDocId, "orders", orderId),
      {
        pharmacyStatus: status,
        orderStatus: status
      }
    );
  };

  // ---------------------------------------------
  // Assign rider (UNCHANGED)
  // ---------------------------------------------
  const assignRider = async (orderId, riderId) => {
    const rider = riders.find((r) => r.id === riderId);
    if (!rider || !pharmacyDocId) return;

    await updateDoc(
      doc(db, "Pharmacies", pharmacyDocId, "orders", orderId),
      {
        assignedRiderId: rider.id,
        assignedRiderName: rider.name,
        orderStatus: "assigned",
        pharmacyStatus: "assigned"
      }
    );
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="orders-page">
      <h2>Pharmacy Orders</h2>

      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Rider</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.orderId}</td>
              <td>{order.customerName}</td>
              <td>{order.itemCount}</td>
              <td>Rs. {order.totalPrice}</td>

              {/* ✅ NOW THIS CHANGES LIVE */}
              <td>
                {order.orderStatus?.replaceAll("_", " ")}
              </td>

              <td>{order.assignedRiderName || "-"}</td>

              <td>
                <select
                  disabled={order.pharmacyStatus !== "accepted"}
                  onChange={(e) =>
                    assignRider(order.id, e.target.value)
                  }
                  defaultValue=""
                >
                  <option value="">Select Rider</option>
                  {riders.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PharmacyOrders;
