import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const [formData, setFormData] = useState({
        customerName: '',
        email: '',
        phoneNumber: '',
        address: '',
        gstin: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const Navigate = useNavigate();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhoneNumber = (phoneNumber) => {
        const phoneRegex = /^[0-9]{10}$/; // Example: validates 10-digit numbers
        return phoneRegex.test(phoneNumber);
    };

    const handleBackClick = () => {
        Navigate('/home');
    };

    const handleNextClick = () => {
        Navigate('/customer-selection');
    };

    const validateGstin = (gstin) => {
        return gstin.length === 8;
    };

    // Function to handle input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Function to handle form submission
    const handleSaveCustomerDetails = async () => {
        const { customerName, email, phoneNumber, address, gstin } = formData;

        if (!customerName || !email || !phoneNumber || !address || !gstin) {
            setError('All fields are required.');
            setSuccess('');
            return;
        }
        if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
            setSuccess('');
            return;
        }
        if (!validatePhoneNumber(phoneNumber)) {
            setError('Please enter a valid 10-digit phone number.');
            setSuccess('');
            return;
        }
        if (!validateGstin(gstin)) {
            setError('GSTIN must be exactly 8 characters.');
            setSuccess('');
            
            return;
        }

        const customerDetails = {
            customerName: formData.customerName,
            email: formData.email,
            phone_number: formData.phoneNumber, // Corrected field name
            address: formData.address,
            gstin: formData.gstin
        };

        try {
            const response = await axios.post('http://localhost:8000/api/customers/', customerDetails);
            console.log('Customer Details Saved:', response.data);
            setSuccess('Customer details saved successfully!');
            // Navigate('/home');
            setError('');
            alert('Customer details saved successfully!');
            setFormData({
                customerName: '',
                email: '',
                phoneNumber: '',
                address: '',
                gstin: ''
            });   
        } catch (err) {
            if (err.response) {
                console.error('Error response:', err.response.data);
                setError(`Failed to save customer details: ${err.response.data.detail || err.response.statusText}`);
            } else if (err.request) {
                console.error('Error request:', err.request);
                setError('Failed to save customer details: No response received from server.');
            } else {
                console.error('Error message:', err.message);
                setError(`Failed to save customer details: ${err.message}`);
            }
            setSuccess('');
            
        }
    };

    return (
        <div className="dashboard">
            <span onClick={handleBackClick} style={{ cursor:'pointer', fontSize: '24px', fontWeight: 'bold' }}>&larr;</span> 
            {/* <span style={{ marginLeft: '10px' }}>home</span>  */}
            
            <span onClick={handleNextClick} style={{ cursor: 'pointer', fontSize: '24px', fontWeight: 'bold', float: 'right' }}>&rarr;</span>
            <span style={{ float: 'right', marginRight: '10px' }}></span><h1>Customer Form</h1>
            <form>
                <input
                    type="text"
                    name="customerName"
                    placeholder="Customer Name"
                    value={formData.customerName}
                    onChange={handleChange}
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="gstin"
                    placeholder="GSTIN"
                    value={formData.gstin}
                    onChange={handleChange}
                />
                <button type="button" onClick={handleSaveCustomerDetails}>Save</button>
            </form>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
        </div>
    );
};

export default Dashboard;
