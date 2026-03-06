import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  onSnapshot
} from "firebase/firestore";
import { db } from "../../firebase/config";
import "./PharmacyOrders.css";

const PharmacyOrders = ({ pharmacyId }) => {
  const [pharmacyDocId, setPharmacyDocId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ FIXED: pharmacyId is already the document ID
  const loadPharmacyDocId = async () => {
    return pharmacyId;
  };

  // 🔥 INSTANT + STABLE REALTIME LISTENER (UNCHANGED)
  const listenOrders = (docId) =>
    onSnapshot(
      collection(db, "Pharmacies", docId, "orders"),
      (snap) => {
        setOrders((prevOrders) => {
          let updated = [...prevOrders];

          snap.docChanges().forEach((change) => {
            const orderData = {
              id: change.doc.id,
              ...change.doc.data()
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

        setLoading(false);
      }
    );

  const fetchRiders = async (docId) => {
    const snap = await getDocs(collection(db, "Pharmacies", docId, "riders"));

    setRiders(
      snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(r => r.status === "active")
    );
  };

  useEffect(() => {
    let unsub;
    const load = async () => {
      const id = await loadPharmacyDocId();
      if (!id) return;
      setPharmacyDocId(id);
      unsub = listenOrders(id);
      fetchRiders(id);
    };
    load();
    return () => unsub && unsub();
  }, [pharmacyId]);

  // ✅ ACCEPT / REJECT (UNCHANGED)
  const updatePharmacyStatus = async (orderId, status) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, orderStatus: status }
          : order
      )
    );

    await updateDoc(
      doc(db, "Pharmacies", pharmacyDocId, "orders", orderId),
      { orderStatus: status }
    );
  };

  // ✅ ASSIGN RIDER (UNCHANGED)
  const assignRider = async (orderId, riderId) => {
    const rider = riders.find(r => r.id === riderId);
    if (!rider) return;

    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? {
              ...order,
              assignedRiderId: rider.id,
              assignedRiderName: rider.name,
              orderStatus: "assigned"
            }
          : order
      )
    );

    await updateDoc(
      doc(db, "Pharmacies", pharmacyDocId, "orders", orderId),
      {
        assignedRiderId: rider.id,
        assignedRiderName: rider.name,
        orderStatus: "assigned"
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
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.orderId}</td>
              <td>{order.customerName}</td>
              <td>{order.itemCount}</td>
              <td>Rs. {order.totalPrice}</td>

              <td className={`status-cell ${order.orderStatus}`}>
                {order.orderStatus?.replaceAll("_", " ")}
              </td>

              <td>{order.assignedRiderName || "-"}</td>

              <td>
                {order.orderStatus === "pending" && (
                  <>
                    <button
                      className="accept-btn"
                      onClick={() => updatePharmacyStatus(order.id, "accepted")}
                    >
                      Accept
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => updatePharmacyStatus(order.id, "rejected")}
                    >
                      Reject
                    </button>
                  </>
                )}

                {order.orderStatus === "accepted" && (
                  <select
                    defaultValue=""
                    onChange={(e) => assignRider(order.id, e.target.value)}
                  >
                    <option value="">Select Rider</option>
                    {riders.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PharmacyOrders;