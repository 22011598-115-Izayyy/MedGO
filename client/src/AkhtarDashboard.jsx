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

const AkhtarPharmacyDashboard = () => {
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

  const productsRef = collection(db, "pharmacies", "akhtarPharmacy", "products");

  // Fetch products
  const fetchProducts = async () => {
    const snapshot = await getDocs(productsRef);
    setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  // Handle image upload
  const handleImageUpload = async (file) => {
    const imageRef = ref(storage, `productImages/${file.name}`);
    await uploadBytes(imageRef, file);
    const url = await getDownloadURL(imageRef);
    return url;
  };

  // Add or Update Product
  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = productData.image;

    const fileInput = e.target.image.files[0];
    if (fileInput) imageUrl = await handleImageUpload(fileInput);

    const newProduct = { ...productData, image: imageUrl };

    if (editProduct) {
      const productRef = doc(db, "pharmacies", "akhtarPharmacy", "products", editProduct.id);
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

  // Edit Product
  const handleEdit = (product) => {
    setEditProduct(product);
    setProductData(product);
    setFormVisible(true);
  };

  // Delete Product
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "pharmacies", "akhtarPharmacy", "products", id));
    alert("Product deleted!");
    fetchProducts();
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2 style={{ color: "green", textAlign: "center", marginBottom: "20px" }}>
        Akhtar Pharmacy Dashboard
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
            image: "",
          });
        }}
        style={{
          backgroundColor: "green",
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
            backgroundColor: "#e8f5e9",
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ color: "green" }}>
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

          <button
            type="submit"
            style={{
              backgroundColor: "green",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              marginRight: "10px",
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
            }}
          >
            Cancel
          </button>
        </form>
      )}

      {/* Product Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "#f9fff9",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#c8f7c5" }}>
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
                <button
                  onClick={() => handleEdit(product)}
                  style={editBtnStyle}
                >
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Styles
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
};

const removeBtnStyle = {
  backgroundColor: "#f44336",
  color: "white",
  border: "none",
  padding: "5px 10px",
  borderRadius: "4px",
};

export default AkhtarPharmacyDashboard;
