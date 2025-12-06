import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where
} from "firebase/firestore";
import { db } from "../../firebase/config";
import "./PharmacyRiders.css";

const PharmacyRiders = ({ pharmacyId }) => {

  const [pharmacyDocId, setPharmacyDocId] = useState(null);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    status: "active",
  });

  // 1️⃣ Get actual Firestore Pharmacy Document ID
  const loadPharmacyDocId = async () => {
    const q1 = query(
      collection(db, "Pharmacies"),
      where("pharmacyId", "==", pharmacyId)
    );

    const snap = await getDocs(q1);

    if (!snap.empty) {
      const id = snap.docs[0].id;
      setPharmacyDocId(id);
      return id;
    }

    console.error("Pharmacy document not found in Firestore");
    return null;
  };

  // 2️⃣ Fetch Riders
  const fetchRiders = async () => {
    if (!pharmacyDocId) return;

    setLoading(true);

    const ref = collection(db, "Pharmacies", pharmacyDocId, "riders");
    const snapshot = await getDocs(ref);

    setRiders(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    const load = async () => {
      const id = await loadPharmacyDocId();
      if (id) await fetchRiders();
    };
    load();
  }, [pharmacyId, pharmacyDocId]);

  // 3️⃣ Input handler
  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 4️⃣ SAVE RIDER (Add or Edit)
  const saveRider = async () => {
    const name = form.name.trim();
    const phone = form.phone.trim();
    const email = form.email.trim().toLowerCase();

    // ---------------- VALIDATIONS ---------------- //

    // Name >= 3 chars
    if (name.length < 3) {
      alert("Rider name must be at least 3 characters long.");
      return;
    }

    // Pakistani phone validation
    const phoneRegex = /^(03\d{9}|(\+92)3\d{9})$/;
    if (!phoneRegex.test(phone)) {
      alert("Enter a valid Pakistani phone number (0300xxxxxxx or +92300xxxxxxx)");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Duplicate check
    const ridersRef = collection(db, "Pharmacies", pharmacyDocId, "riders");
    const allRidersSnap = await getDocs(ridersRef);

    const exists = allRidersSnap.docs.some((r) => {
      const data = r.data();
      if (editId && r.id === editId) return false; // skip current user during edit

      return (
        data.email?.toLowerCase() === email ||
        data.phone === phone
      );
    });

    if (exists) {
      alert("A rider with this email or phone already exists.");
      return;
    }

    // ---------------- END VALIDATIONS ---------------- //

    try {
      if (editId) {
        // UPDATE RIDER
        await updateDoc(
          doc(db, "Pharmacies", pharmacyDocId, "riders", editId),
          { name, phone, email, status: form.status }
        );
        alert("Rider updated successfully!");

      } else {
        // ADD NEW RIDER
        await addDoc(ridersRef, {
          name,
          phone,
          email,
          status: form.status,
        });
        alert("Rider added successfully!");
      }

      // Close modal + reset form
      setModalOpen(false);
      setForm({ name: "", phone: "", email: "", status: "active" });
      setEditId(null);

      // Refresh list
      fetchRiders();

    } catch (error) {
      console.error(error);
      alert("Something went wrong while saving rider.");
    }
  };

  // 5️⃣ Edit Rider
  const openEdit = (rider) => {
    setModalOpen(true);
    setEditId(rider.id);
    setForm(rider);
  };

  // 6️⃣ Delete Rider
  const deleteRider = async (id) => {
    if (!window.confirm("Delete this rider?")) return;

    await deleteDoc(doc(db, "Pharmacies", pharmacyDocId, "riders", id));
    alert("Rider deleted.");
    fetchRiders();
  };

  return (
    <div className="rider-page">
      <div className="rider-header">
        <h2>Manage Riders</h2>
        <button className="add-btn" onClick={() => setModalOpen(true)}>
          + Add Rider
        </button>
      </div>

      {loading ? (
        <p>Loading riders...</p>
      ) : (
        <table className="rider-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {riders.map((rider) => (
              <tr key={rider.id}>
                <td>{rider.name}</td>
                <td>{rider.phone}</td>
                <td>{rider.email}</td>
                <td className={rider.status}>{rider.status}</td>

                <td>
                  <button className="edit-btn" onClick={() => openEdit(rider)}>
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => deleteRider(rider.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      )}

      {/* MODAL */}
      {modalOpen && (
        <div className="modal-bg">
          <div className="modal-box">
            <h3>{editId ? "Edit Rider" : "Add Rider"}</h3>

            <input
              name="name"
              placeholder="Rider Name"
              value={form.name}
              onChange={onChange}
            />

            <input
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={onChange}
            />

            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={onChange}
            />

            <select name="status" value={form.status} onChange={onChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="modal-actions">
              <button className="save-btn" onClick={saveRider}>
                Save
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setModalOpen(false);
                  setEditId(null);
                }}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default PharmacyRiders;
