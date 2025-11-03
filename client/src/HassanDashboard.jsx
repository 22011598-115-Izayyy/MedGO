import React, { useState, useEffect } from "react";
import { db } from "./firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const HassanPharmacyDashboard = () => {
  const [products, setProducts] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productData, setProductData] = useState({
    productName: "",
    category: "Tablet",
    description: "",
    price: "",
    stock: "",
    expiryDate: "",
    status: "Active",
    image: "",
  });

  const productsRef = collection(db, "pharmacies", "hassanPharmacy", "products");

  const fetchProducts = async () => {
    const snapshot = await getDocs(productsRef);
    setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (file) => {
    const imageRef = ref(storage, `productImages/${file.name}`);
    await uploadBytes(imageRef, file);
    const url = await getDownloadURL(imageRef);
    return url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = productData.image;

    const fileInput = e.target.image.files[0];
    if (fileInput) imageUrl = await handleImageUpload(fileInput);

    const newProduct = { ...productData, image: imageUrl };

    if (editProduct) {
      const productRef = doc(db, "pharmacies", "hassanPharmacy", "products", editProduct.id);
      await updateDoc(productRef, newProduct);
      alert("Product updated successfully!");
    } else {
      await addDoc(productsRef, newProduct);
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
      image: "",
    });
    setFormVisible(false);
    setEditProduct(null);
    fetchProducts();
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setProductData(product);
    setFormVisible(true);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "pharmacies", "hassanPharmacy", "products", id));
    alert("Product deleted successfully!");
    fetchProducts();
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#f4f6f8" }}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <h2 style={{ color: "white", textAlign: "center", marginBottom: "30px" }}>
          Hassan Pharmacy
        </h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li style={sidebarItemStyle}>🏠 Dashboard</li>
          <li style={sidebarItemStyle}>💊 Medicines</li>
          <li style={sidebarItemStyle}>📦 Orders</li>
          <li style={sidebarItemStyle}>👤 Profile</li>
        </ul>
      </div>

      {/* Main Dashboard Content */}
      <div style={{ flex: 1, padding: "30px", overflowY: "auto" }}>
        <h2 style={{ color: "#1a7f45", marginBottom: "20px" }}>Medicine Management</h2>

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
              image: "",
            });
          }}
          style={{
            backgroundColor: "#1a7f45",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            marginBottom: "20px",
            cursor: "pointer",
          }}
        >
          {formVisible ? "Close Form" : "Add Medicine"}
        </button>

        {formVisible && (
          <form
            onSubmit={handleSubmit}
            style={{
              backgroundColor: "white",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              marginBottom: "30px",
            }}
          >
            <h3 style={{ color: "#1a7f45", marginBottom: "20px" }}>
              {editProduct ? "Edit Product" : "Add New Product"}
            </h3>

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
              placeholder="Enter stock quantity"
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

            <input type="file" name="image" style={inputStyle} />

            <div style={{ marginTop: "10px" }}>
              <button
                type="submit"
                style={{
                  backgroundColor: "#1a7f45",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  marginRight: "10px",
                  cursor: "pointer",
                }}
              >
                {editProduct ? "Update" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setFormVisible(false)}
                style={{
                  backgroundColor: "gray",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Product Table */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            padding: "20px",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#1a7f45", color: "white" }}>
                <th style={thStyle}>Product Name</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Stock</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={tdStyle}>{product.productName}</td>
                  <td style={tdStyle}>{product.category}</td>
                  <td style={tdStyle}>{product.stock}</td>
                  <td style={tdStyle}>${product.price}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        color: product.status === "Active" ? "green" : "red",
                        fontWeight: "bold",
                      }}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => handleEdit(product)} style={editBtnStyle}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(product.id)} style={removeBtnStyle}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Sidebar and UI Styles
const sidebarStyle = {
  width: "230px",
  backgroundColor: "#1a7f45",
  color: "white",
  padding: "25px 15px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
};

const sidebarItemStyle = {
  padding: "12px 20px",
  borderRadius: "8px",
  marginBottom: "10px",
  cursor: "pointer",
  backgroundColor: "rgba(255,255,255,0.1)",
  transition: "0.3s",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  margin: "10px 0",
  borderRadius: "6px",
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

export default HassanPharmacyDashboard;
