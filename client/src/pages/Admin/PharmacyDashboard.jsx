import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./PharmacyDashboard.css";

const PharmacyDashboard = ({ setCurrentPage }) => {
  const [products, setProducts] = useState([]);
  const [pharmacyName, setPharmacyName] = useState("");
  const [formVisible, setFormVisible] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [userId, setUserId] = useState(null);
  const [pharmacyId, setPharmacyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [masterMedicines, setMasterMedicines] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [showSelectModal, setShowSelectModal] = useState(false);

  const [productData, setProductData] = useState({
    productName: "",
    category: "Pain Killer",
    type: "Tablet",
    description: "",
    price: "",
    stock: "",
    expiryDate: "",
    status: "Active",
  });

  // ✅ Listen for logged-in user and fetch their linked pharmacy info
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        await fetchUserPharmacyInfo(user.uid);
      } else {
        console.log("No user logged in");
        setCurrentPage("admin");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Get user's pharmacyId from users collection
  const fetchUserPharmacyInfo = async (uid) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const userPharmacyId = userData.pharmacyId;
        setPharmacyId(userPharmacyId);

        await fetchPharmacyInfo(userPharmacyId);
      } else {
        console.warn("No user document found!");
        setPharmacyName("Pharmacy Dashboard");
      }
    } catch (error) {
      console.error("Error fetching user pharmacy info:", error);
    }
  };

  // ✅ Fetch pharmacy name and its products
  const fetchPharmacyInfo = async (pharmacyId) => {
    try {
      if (!pharmacyId) return;

      const pharmacyQuery = query(
        collection(db, "Pharmacies"),
        where("pharmacyId", "==", pharmacyId)
      );
      const snapshot = await getDocs(pharmacyQuery);

      if (!snapshot.empty) {
        const pharmacyData = snapshot.docs[0].data();
        const pharmacyDocId = snapshot.docs[0].id;
        setPharmacyName(pharmacyData.name || "Pharmacy Dashboard");

        const productsSnap = await getDocs(
          collection(db, "Pharmacies", pharmacyDocId, "products")
        );
        setProducts(productsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } else {
        setPharmacyName("Pharmacy Dashboard");
      }
    } catch (error) {
      console.error("Error fetching pharmacy data:", error);
    }
  };

  // ✅ Fetch master medicines when modal opens
  const fetchMasterMedicines = async () => {
    try {
      const snapshot = await getDocs(collection(db, "masterMedicines"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMasterMedicines(data);
    } catch (error) {
      console.error("Error fetching master medicines:", error);
    }
  };

  // ✅ Toggle selection
  const toggleMedicine = (id) => {
    setSelectedMedicines((prev) =>
      prev.includes(id) ? prev.filter((med) => med !== id) : [...prev, id]
    );
  };

  // ✅ Add selected medicines to this pharmacy’s products (No Duplicates)
  const handleAddSelected = async () => {
    try {
      const pharmacyQuery = query(
        collection(db, "Pharmacies"),
        where("pharmacyId", "==", pharmacyId)
      );
      const snapshot = await getDocs(pharmacyQuery);

      if (snapshot.empty) return alert("Pharmacy not found in Firestore!");

      const pharmacyDocId = snapshot.docs[0].id;
      const pharmacyProductsRef = collection(db, "Pharmacies", pharmacyDocId, "products");

      const existingProductsSnap = await getDocs(pharmacyProductsRef);
      const existingProductNames = existingProductsSnap.docs.map(
        (doc) => doc.data().productName?.toLowerCase()
      );

      let addedCount = 0;
      for (const medId of selectedMedicines) {
        const medicine = masterMedicines.find((m) => m.id === medId);
        const productName =
          (medicine.name || medicine.productName || "").toLowerCase();

        // 🛑 Skip duplicates
        if (existingProductNames.includes(productName)) {
          console.log(`Skipped duplicate: ${productName}`);
          continue;
        }

        const expiry =
          medicine["expiry date"] || medicine.expiryDate || "N/A";

        const productData = {
          productName: medicine.name || medicine.productName || "",
          category: medicine.category || "Pain Killer",
          type: medicine.type || "Tablet",
          price: medicine.price || 0,
          stock: medicine.stock || 0,
          expiryDate: expiry,
          status: "Active",
          description: medicine.description || "",
        };

        await setDoc(doc(pharmacyProductsRef, medId), productData);
        addedCount++;
      }

      if (addedCount === 0) {
        alert("No new medicines were added (duplicates skipped).");
      } else {
        alert(`${addedCount} medicines added successfully!`);
      }

      setShowSelectModal(false);
      setSelectedMedicines([]);
      fetchPharmacyInfo(pharmacyId);
    } catch (error) {
      console.error("Error adding selected medicines:", error);
    }
  };

  // ✅ Handle input change
  const handleChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  // ✅ Add or Update Product
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pharmacyId) return alert("Pharmacy not found!");

    try {
      const pharmacyQuery = query(
        collection(db, "Pharmacies"),
        where("pharmacyId", "==", pharmacyId)
      );
      const snapshot = await getDocs(pharmacyQuery);

      if (snapshot.empty) return alert("Pharmacy not found in Firestore!");

      const pharmacyDocId = snapshot.docs[0].id;
      const newProduct = { ...productData };

      if (editProduct) {
        const productRef = doc(
          db,
          "Pharmacies",
          pharmacyDocId,
          "products",
          editProduct.id
        );
        await updateDoc(productRef, newProduct);
        alert("Product updated successfully!");
      } else {
        await addDoc(collection(db, "Pharmacies", pharmacyDocId, "products"), newProduct);
        alert("Product added successfully!");
      }

      setProductData({
        productName: "",
        category: "Pain Killer",
        type: "Tablet",
        description: "",
        price: "",
        stock: "",
        expiryDate: "",
        status: "Active",
      });
      setFormVisible(false);
      setEditProduct(null);
      fetchPharmacyInfo(pharmacyId);
    } catch (error) {
      console.error("Error adding/updating product:", error);
    }
  };

  // ✅ Edit Product
  const handleEdit = (product) => {
    setEditProduct(product);
    setProductData(product);
    setFormVisible(true);
  };

  // ✅ Delete Product
  const handleDelete = async (id) => {
    if (!pharmacyId) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    try {
      const pharmacyQuery = query(
        collection(db, "Pharmacies"),
        where("pharmacyId", "==", pharmacyId)
      );
      const snapshot = await getDocs(pharmacyQuery);

      if (snapshot.empty) return;

      const pharmacyDocId = snapshot.docs[0].id;
      await deleteDoc(doc(db, "Pharmacies", pharmacyDocId, "products", id));
      alert("Product deleted successfully!");
      fetchPharmacyInfo(pharmacyId);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // ✅ Logout
  const handleLogout = () => {
    auth.signOut();
    setCurrentPage("admin");
  };

  if (loading)
    return <p style={{ textAlign: "center", marginTop: "100px" }}>Loading...</p>;

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div>
          <h2 className="sidebar-title">{pharmacyName || "Pharmacy Dashboard"}</h2>
          <ul className="sidebar-menu">
            <li>Dashboard</li>
            <li>Medicines</li>
            <li>Orders</li>
          </ul>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Main Area */}
      <div className="main-area">
        <div className="header">Welcome, {pharmacyName || "Pharmacy"} 👋</div>

        <div className="content-area">
          <h2 className="dashboard-heading">
            {pharmacyName ? `${pharmacyName} Dashboard` : "Pharmacy Dashboard"}
          </h2>

          <div className="action-buttons">
            <button
              className="add-btn"
              onClick={() => {
                setFormVisible(!formVisible);
                setEditProduct(null);
                setProductData({
                  productName: "",
                  category: "Pain Killer",
                  type: "Tablet",
                  description: "",
                  price: "",
                  stock: "",
                  expiryDate: "",
                  status: "Active",
                });
              }}
            >
              {formVisible ? "Close Form" : "Add Medicine"}
            </button>

            <button
              className="common-btn"
              onClick={() => {
                fetchMasterMedicines();
                setShowSelectModal(true);
              }}
            >
              Select Common Medicines
            </button>
          </div>

          {/* Medicine Form */}
          {formVisible && (
            <form className="form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="productName"
                placeholder="Enter product name"
                value={productData.productName}
                onChange={handleChange}
                required
                className="input"
              />

              {/* ✅ Category Dropdown */}
              <select
                name="category"
                value={productData.category}
                onChange={handleChange}
                className="input"
              >
                <option>Pain Killer</option>
                <option>Antibiotic</option>
                <option>Fever Relief</option>
                <option>Allergy</option>
                <option>Digestive</option>
                <option>Respiratory</option>
                <option>Vitamin</option>
              </select>

              {/* ✅ Type Dropdown */}
              <select
                name="type"
                value={productData.type}
                onChange={handleChange}
                className="input"
              >
                <option>Tablet</option>
                <option>Syrup</option>
                <option>Capsule</option>
                <option>Injection</option>
              </select>

              <textarea
                name="description"
                placeholder="Enter description"
                value={productData.description}
                onChange={handleChange}
                className="input"
              />

              <input
                type="number"
                name="price"
                placeholder="Enter price"
                value={productData.price}
                onChange={handleChange}
                required
                className="input"
              />

              <input
                type="number"
                name="stock"
                placeholder="Enter stock"
                value={productData.stock}
                onChange={handleChange}
                required
                className="input"
              />

              <input
                type="date"
                name="expiryDate"
                value={productData.expiryDate}
                onChange={handleChange}
                required
                className="input"
              />

              <button type="submit" className="save-btn">
                {editProduct ? "Update" : "Save"}
              </button>
            </form>
          )}

          {/* Product Table */}
          <table className="product-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Expiry Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-products">
                    No products added yet.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.productName}</td>
                    <td>{product.category}</td>
                    <td>{product.type}</td>
                    <td>{product.stock}</td>
                    <td>Rs. {product.price}</td>
                    <td>{product.expiryDate || "N/A"}</td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="remove-btn"
                        onClick={() => handleDelete(product.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* ✅ Select Common Medicines Modal */}
          {showSelectModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Select Common Medicines</h2>
                <div className="medicine-list">
                  {masterMedicines.map((med) => (
                    <label key={med.id}>
                      <input
                        type="checkbox"
                        checked={selectedMedicines.includes(med.id)}
                        onChange={() => toggleMedicine(med.id)}
                      />{" "}
                      {med.name || med.productName} — Rs. {med.price}
                    </label>
                  ))}
                </div>
                <div className="modal-actions">
                  <button className="save-btn" onClick={handleAddSelected}>
                    Add Selected
                  </button>
                  <button
                    className="remove-btn"
                    onClick={() => setShowSelectModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmacyDashboard;
