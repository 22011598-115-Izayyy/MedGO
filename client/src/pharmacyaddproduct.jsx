import React, { useState } from 'react';
import './PharmacyAddProduct.css';

const PharmacyAddProduct = () => {
  const [productData, setProductData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    image: null
  });

  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Product Data:', productData);
    // Handle form submission logic here
    alert('Product added successfully!');
  };

  const handleReset = () => {
    setProductData({
      title: '',
      description: '',
      price: '',
      stock: '',
      image: null
    });
    setImagePreview(null);
  };

  return (
    <div className="add-product-container">
      <div className="add-product-header">
        <h1 className="add-product-title">Add New Product</h1>
        <p className="add-product-subtitle">Fill in the details to add a new medicine to your pharmacy</p>
      </div>

      <div className="add-product-card">
        <form onSubmit={handleSubmit} className="add-product-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Product Title *</label>
              <input
                type="text"
                name="title"
                placeholder="Enter product name"
                value={productData.title}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Price (USD) *</label>
              <input
                type="number"
                name="price"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={productData.price}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Stock Quantity *</label>
              <input
                type="number"
                name="stock"
                placeholder="Enter stock quantity"
                min="0"
                value={productData.stock}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="form-input-file"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label className="form-label">Product Description *</label>
            <textarea
              name="description"
              placeholder="Enter detailed product description, usage instructions, and benefits..."
              value={productData.description}
              onChange={handleInputChange}
              className="form-textarea"
              rows="4"
              required
            />
          </div>

          {imagePreview && (
            <div className="image-preview-container">
              <label className="form-label">Image Preview</label>
              <div className="image-preview">
                <img src={imagePreview} alt="Product preview" />
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={handleReset} className="btn-secondary">
              Reset Form
            </button>
            <button type="submit" className="btn-primary">
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PharmacyAddProduct;