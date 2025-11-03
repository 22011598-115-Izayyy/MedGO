import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase/config";
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
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const PharmacyDashboard = ({ setCurrentPage }) => {
  const [products, setProducts] = useState([]);
  const [pharmacyName, setPharmacyName] = useState("");
  const [formVisible, setFormVisible] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [userId, setUserId] = useState(null);
  const [pharmacyId, setPharmacyId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [productData, setProductData] = useState({
    productName: "",
    category: "Tablet",
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

  // ✅ Step 1: Get user's pharmacyId from users collection
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

  // ✅ Step 2: Fetch pharmacy name and its products
  const fetchPharmacyInfo = async (pharmacyId) => {
    try {
      if (!pharmacyId) return;

      // Find pharmacy by its pharmacyId field (not document ID)
      const pharmacyQuery = query(
        collection(db, "Pharmacies"),
        where("pharmacyId", "==", pharmacyId)
      );
      const snapshot = await getDocs(pharmacyQuery);

      if (!snapshot.empty) {
        const pharmacyData = snapshot.docs[0].data();
        const pharmacyDocId = snapshot.docs[0].id;
        setPharmacyName(pharmacyData.name || "Pharmacy Dashboard");

        // Fetch that pharmacy's products
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

  // ✅ Handle input change
  const handleChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  // ✅ Add or Update Product
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pharmacyId) return alert("Pharmacy not found!");

    try {
      // Get correct pharmacy document ID using pharmacyId
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
        await addDoc(
          collection(db, "Pharmacies", pharmacyDocId, "products"),
          newProduct
        );
        alert("Product added successfully!");
      }

      setProductData({
        productName: "",
        category: "Tablet",
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
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "240px",
          backgroundColor: "#1a7f45",
          color: "white",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
            {pharmacyName || "Pharmacy Dashboard"}
          </h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ marginBottom: "20px", cursor: "pointer", fontWeight: "bold" }}>
              Dashboard
            </li>
            <li style={{ marginBottom: "20px", cursor: "pointer" }}>Medicines</li>
            <li style={{ marginBottom: "20px", cursor: "pointer" }}>Orders</li>
          </ul>
        </div>

        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#d32f2f",
            color: "white",
            border: "none",
            padding: "12px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Area */}
      <div style={{ flex: 1, padding: "0px", display: "flex", flexDirection: "column" }}>
        {/* Top Header */}
        <div
          style={{
            backgroundColor: "#1a7f45",
            color: "white",
            padding: "20px 30px",
            fontSize: "1.5rem",
            fontWeight: "bold",
            borderBottom: "3px solid #146f38",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          Welcome, {pharmacyName || "Pharmacy"} 👋
        </div>

        <div style={{ padding: "30px", flex: 1 }}>
          <h2
            style={{
              color: "#1a7f45",
              textAlign: "center",
              marginBottom: "20px",
              fontSize: "1.8rem",
            }}
          >
            {pharmacyName ? `${pharmacyName} Dashboard` : "Pharmacy Dashboard"}
          </h2>

          <button
            onClick={() => {
              setFormVisible(!formVisible);
              setEditProduct(null);
              setProductData({
                productName: "",
                category: "Tablet",
                description: "",
                price: "",
                stock: "",
                expiryDate: "",
                status: "Active",
              });
            }}
            style={{
              backgroundColor: "#1a7f45",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              marginBottom: "20px",
            }}
          >
            {formVisible ? "Close Form" : "Add Medicine"}
          </button>

          {formVisible && (
            <form
              onSubmit={handleSubmit}
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "10px",
                marginBottom: "20px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              }}
            >
              <input
                type="text"
                name="productName"
                placeholder="Enter product name"
                value={productData.productName}
                onChange={handleChange}
                required
                style={inputStyle}
              />

              <select
                name="category"
                value={productData.category}
                onChange={handleChange}
                style={inputStyle}
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
                style={inputStyle}
              />

              <input
                type="number"
                name="price"
                placeholder="Enter price"
                value={productData.price}
                onChange={handleChange}
                required
                style={inputStyle}
              />

              <input
                type="number"
                name="stock"
                placeholder="Enter stock"
                value={productData.stock}
                onChange={handleChange}
                required
                style={inputStyle}
              />

              <input
                type="date"
                name="expiryDate"
                value={productData.expiryDate}
                onChange={handleChange}
                required
                style={inputStyle}
              />

              <select
                name="status"
                value={productData.status}
                onChange={handleChange}
                style={inputStyle}
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>

              <button
                type="submit"
                style={{
                  backgroundColor: "#1a7f45",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "5px",
                }}
              >
                {editProduct ? "Update" : "Save"}
              </button>
            </form>
          )}

          {/* Product Table */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "white",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#1a7f45", color: "white" }}>
                <th style={thStyle}>Product</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Stock</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "20px", color: "#777" }}
                  >
                    No products added yet.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={tdStyle}>{product.productName}</td>
                    <td style={tdStyle}>{product.category}</td>
                    <td style={tdStyle}>{product.stock}</td>
                    <td style={tdStyle}>Rs. {product.price}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          color: product.status === "Active" ? "green" : "red",
                        }}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button onClick={() => handleEdit(product)} style={editBtnStyle}>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        style={removeBtnStyle}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ✅ Styles
const inputStyle = {
  width: "100%",
  padding: "8px",
  margin: "8px 0",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

const thStyle = { padding: "10px", textAlign: "left" };
const tdStyle = { padding: "10px", textAlign: "left" };
const editBtnStyle = {
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  padding: "5px 10px",
  borderRadius: "4px",
  marginRight: "5px",
  cursor: "pointer",
};
const removeBtnStyle = {
  backgroundColor: "#f44336",
  color: "white",
  border: "none",
  padding: "5px 10px",
  borderRadius: "4px",
  cursor: "pointer",
};

export default PharmacyDashboard;
