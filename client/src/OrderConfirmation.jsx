import React from 'react';

const OrderConfirmation = () => {
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', minHeight: '50vh' }}>
      <h1 style={{ color: '#1a7f45', marginBottom: '20px' }}>Order Confirmation</h1>
      <p style={{ color: '#666', fontSize: '1.1rem' }}>Order confirmation is being loaded...</p>
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '10px', 
        margin: '20px auto',
        maxWidth: '400px'
      }}>
        <p>✅ Order Confirmation: Loaded</p>
        <p>🔄 Order Details: Coming soon</p>
      </div>
    </div>
  );
};

export default OrderConfirmation;