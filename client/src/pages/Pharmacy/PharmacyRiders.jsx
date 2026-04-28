import React, { useEffect, useState } from "react";
import {
  collection, getDocs, updateDoc, deleteDoc,
  doc, query, where, setDoc
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { FaTimes, FaSearch, FaMotorcycle, FaUserCheck, FaUserTimes } from "react-icons/fa";
import "./PharmacyRiders.css";

const PharmacyRiders = ({ pharmacyId }) => {
  const [pharmacyDocId, setPharmacyDocId] = useState(null);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "", phone: "", email: "", status: "active",
  });

  // NEW: search
  const [searchRiders, setSearchRiders] = useState("");

  const filteredRiders = riders.filter((r) => {
    const q = searchRiders.toLowerCase();
    return (
      (r.name || "").toLowerCase().includes(q) ||
      (r.email || "").toLowerCase().includes(q) ||
      (r.phone || "").toLowerCase().includes(q)
    );
  });

  // 1️⃣ Get actual Firestore Pharmacy Document ID
  const loadPharmacyDocId = async () => {
    const q1 = query(collection(db, "Pharmacies"), where("pharmacyId", "==", pharmacyId));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pharmacyId, pharmacyDocId]);

  // 3️⃣ Input handler
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // 4️⃣ SAVE RIDER
  const saveRider = async () => {
    const name = form.name.trim();
    const phone = form.phone.trim();
    const email = form.email.trim().toLowerCase();

    if (name.length < 3) { alert("Rider name must be at least 3 characters long."); return; }
    const phoneRegex = /^(03\d{9}|(\+92)3\d{9})$/;
    if (!phoneRegex.test(phone)) { alert("Enter a valid Pakistani phone number (0300xxxxxxx or +92300xxxxxxx)"); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { alert("Please enter a valid email address."); return; }

    const ridersRef = collection(db, "Pharmacies", pharmacyDocId, "riders");
    const allRidersSnap = await getDocs(ridersRef);
    const exists = allRidersSnap.docs.some((r) => {
      const data = r.data();
      if (editId && r.id === editId) return false;
      return data.email?.toLowerCase() === email || data.phone === phone;
    });

    if (exists) { alert("A rider with this email or phone already exists."); return; }

    try {
      if (editId) {
        await updateDoc(doc(db, "Pharmacies", pharmacyDocId, "riders", editId), { name, phone, email, status: form.status });
        alert("Rider updated successfully!");
      } else {
        const usersSnap = await getDocs(
          query(collection(db, "users"), where("email", "==", email), where("role", "==", "rider"))
        );
        if (usersSnap.empty) { alert("Rider account not found in Authentication."); return; }
        const riderUid = usersSnap.docs[0].id;
        await setDoc(doc(db, "Pharmacies", pharmacyDocId, "riders", riderUid), {
          name, phone, email, status: form.status, authUid: riderUid
        });
        alert("Rider added successfully!");
      }

      setModalOpen(false);
      setForm({ name: "", phone: "", email: "", status: "active" });
      setEditId(null);
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

  const activeCount = riders.filter((r) => r.status === "active").length;
  const inactiveCount = riders.filter((r) => r.status === "inactive").length;

  return (
    <div className="rd-page">

      {/* DRAWER BACKDROP */}
      <div
        className={`rd-backdrop ${modalOpen ? "rd-backdrop-visible" : ""}`}
        onClick={() => { setModalOpen(false); setEditId(null); }}
      />

      {/* RIDER DRAWER */}
      <div className={`rd-drawer ${modalOpen ? "rd-drawer-open" : ""}`}>
        <div className="rd-drawer-header">
          <div className="rd-drawer-header-text">
            <span className="rd-drawer-eyebrow">Riders</span>
            <h2 className="rd-drawer-title">{editId ? "Edit Rider" : "Add New Rider"}</h2>
          </div>
          <button className="rd-drawer-close" onClick={() => { setModalOpen(false); setEditId(null); }}>
            <FaTimes />
          </button>
        </div>

        <div className="rd-drawer-body">
          <div className="rd-drawer-section-label">Personal Information</div>
          <div className="rd-form-grid">
            <div className="rd-form-group rd-full">
              <label>Full Name</label>
              <input name="name" placeholder="e.g. Ahmed Khan" value={form.name} onChange={onChange} />
            </div>
            <div className="rd-form-group">
              <label>Phone Number</label>
              <input name="phone" placeholder="03001234567" value={form.phone} onChange={onChange} />
            </div>
            <div className="rd-form-group">
              <label>Email Address</label>
              <input name="email" placeholder="rider@example.com" value={form.email} onChange={onChange} />
            </div>
            <div className="rd-form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={onChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rd-drawer-footer">
          <button className="rd-cancel-btn" onClick={() => { setModalOpen(false); setEditId(null); }}>Cancel</button>
          <button className="rd-save-btn" onClick={saveRider}>{editId ? "Update Rider" : "Add Rider"}</button>
        </div>
      </div>

      {/* PAGE HEADER */}
      <div className="rd-header">
        <h2 className="rd-page-title">Manage Riders</h2>
        <button className="rd-add-btn" onClick={() => { setModalOpen(true); setEditId(null); setForm({ name: "", phone: "", email: "", status: "active" }); }}>
          + Add Rider
        </button>
      </div>

      {/* STAT STRIP */}
      <div className="rd-stat-strip">
        <div className="rd-stat-item">
          <div className="rd-stat-icon rd-icon-total"><FaMotorcycle /></div>
          <div><span className="rd-stat-val">{riders.length}</span><span className="rd-stat-lbl">Total Riders</span></div>
        </div>
        <div className="rd-strip-div" />
        <div className="rd-stat-item">
          <div className="rd-stat-icon rd-icon-active"><FaUserCheck /></div>
          <div><span className="rd-stat-val rd-val-green">{activeCount}</span><span className="rd-stat-lbl">Active</span></div>
        </div>
        <div className="rd-strip-div" />
        <div className="rd-stat-item">
          <div className="rd-stat-icon rd-icon-inactive"><FaUserTimes /></div>
          <div><span className="rd-stat-val rd-val-red">{inactiveCount}</span><span className="rd-stat-lbl">Inactive</span></div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="rd-search-wrap">
        <FaSearch className="rd-search-icon" />
        <input className="rd-search-input" type="text" placeholder="Search by name, email or phone…"
          value={searchRiders} onChange={(e) => setSearchRiders(e.target.value)} />
        {searchRiders && (
          <span className="rd-search-count">{filteredRiders.length} result{filteredRiders.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {loading ? (
        <p className="rd-loading">Loading riders…</p>
      ) : (
        <table className="rd-table">
          <thead>
            <tr>
              <th>Name</th><th>Phone</th><th>Email</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRiders.length === 0 ? (
              <tr><td colSpan="5" className="rd-empty">
                {searchRiders ? "No riders match your search." : "No riders added yet."}
              </td></tr>
            ) : (
              filteredRiders.map((rider) => (
                <tr key={rider.id}>
                  <td className="rd-name-cell">
                    <div className="rd-avatar">{(rider.name || "?")[0].toUpperCase()}</div>
                    {rider.name}
                  </td>
                  <td>{rider.phone}</td>
                  <td>{rider.email}</td>
                  <td>
                    <span className={`rd-status-badge ${rider.status === "active" ? "rd-active" : "rd-inactive"}`}>
                      {rider.status === "active" ? "● Active" : "● Inactive"}
                    </span>
                  </td>
                  <td className="rd-actions">
                    <button className="rd-edit-btn" onClick={() => openEdit(rider)}>Edit</button>
                    <button className="rd-delete-btn" onClick={() => deleteRider(rider.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PharmacyRiders;