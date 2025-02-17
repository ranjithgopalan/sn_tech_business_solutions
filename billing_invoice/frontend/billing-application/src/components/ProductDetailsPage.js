import React, { useState,useEffect} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Gridview.css';

const ProductDetailsPage = ({ invoiceNumber, customerId,invoiceDate, onAddProduct }) => {
    const [productName, setProductName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [perQuantityRate, setPerQuantityRate] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const userId = customerId;

    useEffect(() => {
      setTotalAmount(quantity * perQuantityRate);
  }, [quantity, perQuantityRate]);


    const validateFields = () => {
        if (!productName) {
            setError('Product name is required');
            return false;
        }
        if (!quantity || isNaN(quantity) || quantity <= 0) {
            setError('Quantity must be a positive number');
            return false;
        }
        if (!perQuantityRate || isNaN(perQuantityRate) || perQuantityRate <= 0) {
            setError('Per quantity rate must be a positive number');
            return false;
        }
        return true;
    };

    const handleAddToCart = async () => {
        if (!validateFields()) {
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/api/create-product2/', {
                invoice_number: invoiceNumber,
                invoice_date: invoiceDate,
                product_name: productName,
                product_price: perQuantityRate,
                product_quantity: quantity,
                total_amount: totalAmount,
                user_id : Number(userId),
            });
            onAddProduct(response.data);
            setProductName('');
            setQuantity('');
            setPerQuantityRate('');
            setTotalAmount('');
            setError('');
            alert('Product added successfully'); // Show alert box
            navigate('/'); // Navigate to homepage after adding product to cart
        } catch (error) {
            console.error('Error adding product to cart:', error);
            setError('Failed to add product to cart');
        }
    };

    return (
      <div className="product-details-page" style={{
        maxWidth: '800px',
        margin: '20px auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ textAlign: 'center', color: '#333', fontSize: '24px', marginBottom: '16px' }}>Product Details</h3>
        {error && <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}
        
        {/* Labels Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '10px', fontWeight: 'bold', color: '#555' }}>
          <label style={labelStyle}>Product Name:</label>
          <label style={labelStyle}>Quantity:</label>
          <label style={labelStyle}>Per Quantity Rate:</label>
          <label style={labelStyle}>Total Amount:</label>
        </div>
        
        {/* Input Fields Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
          <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} style={inputStyle} />
          <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} style={inputStyle} />
          <input type="number" value={perQuantityRate} onChange={(e) => setPerQuantityRate(Number(e.target.value))} style={inputStyle} />
          <input type="number" value={totalAmount} readOnly style={{ ...inputStyle, backgroundColor: '#e0e0e0' }} />
        </div>
        
        {/* Add to Cart Button */}
        <div style={{ textAlign: 'center' }}>
          <button type="button" onClick={handleAddToCart} style={buttonStyle}
            onMouseOver={(e) => e.target.style.backgroundColor = '#005a4c'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#00796b'}
          >
            Add to Cart
          </button>
        </div>
            </div>
        );
      };
      
      // Styles
      const inputStyle = {
        padding: '10px',
        width: '100%',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '14px',
        transition: 'border-color 0.3s ease',
        outline: 'none'
      };
      
      const labelStyle = {
        textAlign: 'center',
        display: 'block',
        width: '100%'
      };
      
      const buttonStyle = {
        padding: '10px 20px',
        backgroundColor: '#00796b',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background-color 0.3s ease'
      };
      
  

export default ProductDetailsPage;