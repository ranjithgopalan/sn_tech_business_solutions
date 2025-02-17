import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ProductDetailsPage from './ProductDetailsPage';
import CartListPage from './CartListPage';
import SummaryPage from './SummaryPage';

const CustomerSelectionPage = () => {
    const [customers, setCustomers] = useState([]);
    const [noResults, setNoResults] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedCustomerName, setSelectedCustomerName] = useState('');
    const [selectedCustomerPhoneNumber, setSelectedCustomerPhoneNumber] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [invoiceDate, setInvoiceDate] = useState('');
    const [products, setProducts] = useState([]);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const navigate = useNavigate();

    // Fetch customers on component mount
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/customers/');
                setCustomers(response.data);
            } catch (error) {
                console.error('Error fetching customers:', error);
            }
        };

        fetchCustomers();
    }, []);

    // Fetch products for the selected customer
    const fetchProducts = useCallback(async (userId) => {
        try {
            const response = await axios.get(`http://localhost:8000/api/get-products-by-user/?user_id=${userId}`);
            setProducts(response.data);
            calculateTotals(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }, []);

    useEffect(() => {
        if (selectedUserId) {
            fetchProducts(selectedUserId);
        }
    }, [selectedUserId, fetchProducts]);

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.get(`http://localhost:8000/api/search-customers/?q=${query}`);
            if (response.data.length === 0) {
                setNoResults(true);
            } else {
                setNoResults(false);
                setResults(response.data);
            }
        } catch (err) {
            console.error('Error searching customers:', err);
        }
    };

    const handleSelectCustomer = async (e) => {
        const userId = e.target.value;
        const customer = customers.find((c => c.id === parseInt(userId)));
        if (customer) {
            setSelectedUserId(Number(customer.id));
            setSelectedCustomerName(customer.customerName);

            try {
                const response = await axios.get(`http://localhost:8000/api/customers/${userId}/`);
                const customerDetails = response.data;
                setSelectedCustomerPhoneNumber(customerDetails.phone_number);
                const newInvoiceNumber = `INV-${Math.floor(Math.random() * 100000)}`;
                const currentDate = new Date().toISOString().split('T')[0];
                setInvoiceNumber(newInvoiceNumber);
                setInvoiceDate(currentDate);
                console.log('Invoice Number:', invoiceNumber);
                console.log('Invoice Date:', invoiceDate);
            } catch (error) {
                console.error('Error fetching customer details:', error);
            }
        }
    };

    const generateInvoiceDate = () => {
        const date = new Date();
        const formattedDate = date.toISOString().split('T')[0];
        setInvoiceDate(formattedDate);
    };

    const handleAddCustomerClick = () => {
        navigate('/dashboard');
    };

    const calculateTotals = (products) => {
        const totalQuantity = products.reduce((sum, product) => sum + product.product_quantity, 0);
        const totalAmount = products.reduce((sum, product) => sum + product.total_amount, 0);
        setTotalQuantity(totalQuantity);
        setTotalAmount(totalAmount);
    };

    const handleProductAdded = (product) => {
        const updatedProducts = [...products, product];
        setProducts(updatedProducts);
        calculateTotals(updatedProducts);
    };

    return (
        <>
            <div className="container" style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
                <h3 align="center" style={{ marginBottom: '20px', color: '#333', fontSize: '24px' }}>Customer Selection</h3>
                <div className="customer-details" style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr>
                                {/* Customer Name and Phone Number in the same row */}
                                <td style={{ padding: '10px' }}>
                                    <label htmlFor="customerName" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Customer Name:</label>
                                    <select
                                        id="customerDropdown"
                                        onChange={handleSelectCustomer}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            borderRadius: '4px',
                                            border: '1px solid #ccc',
                                            fontSize: '14px',
                                            backgroundColor: '#fff',
                                            cursor: 'pointer',
                                            transition: 'border-color 0.3s ease'
                                        }}
                                        onMouseOver={(e) => e.target.style.borderColor = '#00796b'}
                                        onMouseOut={(e) => e.target.style.borderColor = '#ccc'}
                                        onFocus={(e) => e.target.style.borderColor = '#00796b'}
                                        onBlur={(e) => e.target.style.borderColor = '#ccc'}
                                    >
                                        <option value="">Select a customer</option>
                                        {customers.map((customer) => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.customerName}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td style={{ padding: '10px' }}>
                                    <label htmlFor="phoneNumber" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Phone Number:</label>
                                    <input
                                        type="text"
                                        id="phoneNumber"
                                        value={selectedCustomerPhoneNumber}
                                        readOnly
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            borderRadius: '4px',
                                            border: '1px solid #ccc',
                                            fontSize: '14px',
                                            backgroundColor: '#f0f0f0',
                                            color: '#333',
                                            transition: 'border-color 0.3s ease'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#00796b'}
                                        onBlur={(e) => e.target.style.borderColor = '#ccc'} />
                                </td>
                            </tr>
                            <tr>
                                {/* Invoice Number and Invoice Date in the same row */}
                                <td style={{ padding: '10px' }}>
                                    <label htmlFor="invoiceNumber" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Invoice Number:</label>
                                    <input
                                        type="text"
                                        id="invoiceNumber"
                                        value={invoiceNumber}
                                        readOnly
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            borderRadius: '4px',
                                            border: '1px solid #ccc',
                                            fontSize: '14px',
                                            backgroundColor: '#f0f0f0',
                                            color: '#333',
                                            transition: 'border-color 0.3s ease'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#00796b'}
                                        onBlur={(e) => e.target.style.borderColor = '#ccc'} />
                                </td>
                                <td style={{ padding: '10px' }}>
                                    <label htmlFor="invoiceDate" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Invoice Date:</label>
                                    <input
                                        type="date"
                                        id="invoiceDate"
                                        value={invoiceDate}
                                        readOnly
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            borderRadius: '4px',
                                            border: '1px solid #ccc',
                                            fontSize: '14px',
                                            backgroundColor: '#f0f0f0',
                                            color: '#333',
                                            transition: 'border-color 0.3s ease'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#00796b'}
                                        onBlur={(e) => e.target.style.borderColor = '#ccc'} />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {selectedCustomerName && (
                        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e0f7fa', borderRadius: '4px', borderLeft: '4px solid #00bcd4' }}>
                            <h3 style={{ margin: '0', color: '#00796b' }}>Selected Customer: {selectedCustomerName}</h3>
                        </div>
                    )}

                    {/* Add a button for adding new customers */}
                    <button
                        onClick={handleAddCustomerClick}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            backgroundColor: '#00796b',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'background-color 0.3s ease'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#005a4c'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#00796b'}
                    >
                        Add New Customer
                    </button>
                </div>
            </div>
            <div className="product-details">
                <ProductDetailsPage
                    invoiceNumber={invoiceNumber}
                    invoiceDate={invoiceDate}
                    customerId={selectedUserId}
                    onAddProduct={handleProductAdded} />
            </div>
            <div className="cart-list">
                <CartListPage
                    customerId={selectedUserId}
                    products={products}
                    setProducts={setProducts}
                    calculateTotals={calculateTotals}
                    totalQuantity={totalQuantity}
                    totalAmount={totalAmount} />
            </div>
            <div className="Summary">
                <SummaryPage
                    customerId={selectedUserId}
                    totalQuantity={totalQuantity}
                    totalAmount={totalAmount} />
            </div>
        </>
    );
};

export default CustomerSelectionPage;