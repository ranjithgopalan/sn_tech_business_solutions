import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ProductDetailsPage from './ProductDetailsPage';
import CartListPage from './CartListPage';
import { 
    Users, 
    UserPlus, 
    ShoppingCart, 
    Package 
} from 'lucide-react';

const CustomerSelectionPage = () => {
    const [customers, setCustomers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedCustomerName, setSelectedCustomerName] = useState('');
    const [selectedCustomerPhoneNumber, setSelectedCustomerPhoneNumber] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [invoiceDate, setInvoiceDate] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    // Fetch customers on component mount
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/get-customer-ids/');
                setCustomers(response.data);
            } catch (error) {
                console.error('Error fetching customers:', error);
                // Optional: Add user-friendly error handling
                alert('Failed to load customers. Please try again later.');
            }
        };

        fetchCustomers();
    }, []);

    const handleSelectCustomer = async (e) => {
        const userId = e.target.value;
        
        // Clear existing data first
        setSelectedUserId('');
        setSelectedCustomerName('');
        setSelectedCustomerPhoneNumber('');
        setInvoiceNumber('');
        setInvoiceDate('');
        setProducts([]);
        setRefreshTrigger(prev => prev + 1); // Trigger refresh to clear cart
        
        // If empty selection, just return after clearing
        if (!userId) {
            return;
        }
        
        // Find customer with flexible property names
        const customer = customers.find((c) => c.id === parseInt(userId));
        if (customer) {
            try {
                const response = await axios.get(`http://localhost:8000/api/get-customer/`, {
                    params: {
                        customer_id: customer.id,
                    }
                });
                const customerDetails = response.data;
                
                // Generate new invoice details
                const newInvoiceNumber = `INV-${Math.floor(Math.random() * 100000)}`;
                const currentDate = new Date().toISOString().split('T')[0];
                
                // Set all the customer and invoice details
                setSelectedUserId(Number(customer.id));
                
                // Flexible customer name handling
                setSelectedCustomerName(
                    customer.customerName || 
                    customer.name || 
                    customerDetails.customer_name || 
                    'Unknown Customer'
                );
                
                // Flexible phone number handling
                setSelectedCustomerPhoneNumber(
                    customerDetails.phone_number || 
                    customerDetails.phoneNumber || 
                    'N/A'
                );
                
                setInvoiceNumber(newInvoiceNumber);
                setInvoiceDate(currentDate);
                
                // Trigger another refresh with the new customer ID
                setRefreshTrigger(prev => prev + 1);
            } catch (error) {
                console.error('Error fetching customer details:', error);
                alert('Failed to load customer details. Please try again.');
            }
        }
    };

    const handleAddCustomerClick = () => {
        navigate('/dashboard');
    };

    const handleProductAdded = useCallback((updatedProducts) => {
        // Update products list
        setProducts(updatedProducts);
        // Trigger refresh for cart
        setRefreshTrigger(prev => prev + 1);
    }, []);

    return (
        <div style={styles.pageContainer}>
            {/* Customer Selection Section */}
            <div style={styles.sectionContainer}>
                <div style={styles.sectionHeader}>
                    <Users size={24} color="#00796b" />
                    <h3 style={styles.sectionTitle}>Customer Selection</h3>
                </div>
                
                <div style={styles.inputContainer}>
                    <label style={styles.label}>Customer Name</label>
                    <select
                        onChange={handleSelectCustomer}
                        style={styles.select}
                    >
                        <option value="">Select a customer</option>
                        {customers.map((customer) => (
                            <option 
                                key={customer.id} 
                                value={customer.id}
                            >
                                {/* Flexible customer name display */}
                                {customer.customerName || 
                                 customer.name || 
                                 `Customer ${customer.id}`}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedUserId && (
                    <>
                        <div style={styles.inputContainer}>
                            <label style={styles.label}>Phone Number</label>
                            <input
                                type="text"
                                value={selectedCustomerPhoneNumber}
                                readOnly
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.customerBadge}>
                            <span style={{ fontWeight: '600', color: '#00796b' }}>
                                Selected Customer: {selectedCustomerName}
                            </span>
                            <button 
                                onClick={() => {
                                    setSelectedUserId('');
                                    setSelectedCustomerName('');
                                    setSelectedCustomerPhoneNumber('');
                                    setInvoiceNumber('');
                                    setInvoiceDate('');
                                    setRefreshTrigger(prev => prev + 1);
                                }}
                                style={{
                                    backgroundColor: 'transparent',
                                    color: '#e74c3c',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Clear
                            </button>
                        </div>
                    </>
                )}

                <button
                    onClick={handleAddCustomerClick}
                    style={styles.addButton}
                >
                    <UserPlus size={20} /> Add New Customer
                </button>
            </div>

            {/* Product Details Section */}
            <div style={styles.sectionContainer}>
                <div style={styles.sectionHeader}>
                    <Package size={24} color="#00796b" />
                    <h3 style={styles.sectionTitle}>Product Details</h3>
                </div>
                <ProductDetailsPage 
                    customerId={selectedUserId}
                    invoiceNumber={invoiceNumber}
                    invoiceDate={invoiceDate}
                    onAddProduct={handleProductAdded}
                    setProducts={setProducts}
                />
            </div>

            {/* Cart List Section */}
            <div style={styles.sectionContainer}>
                <div style={styles.sectionHeader}>
                    <ShoppingCart size={24} color="#00796b" />
                    <h3 style={styles.sectionTitle}>Cart Items</h3>
                </div>
                <CartListPage 
                    customerId={selectedUserId} 
                    refreshTrigger={refreshTrigger}
                    products={products}
                    setProducts={setProducts}
                    invoiceNumber={invoiceNumber}
                    invoiceDate={invoiceDate}
                />
            </div>
        </div>
    );
};

// Styles
const styles = {
    pageContainer: {
        display: 'flex',
        gap: '25px',
        padding: '30px',
        fontFamily: 'Inter, Arial, sans-serif',
        width: '100%',
        backgroundColor: '#f4f6f9',
        borderRadius: '16px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)'
    },
    sectionContainer: {
        flex: 1,
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s ease',
        border: '1px solid #e9ecef'
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: '2px solid #00796b'
    },
    sectionTitle: {
        margin: 0,
        color: '#2c3e50',
        fontSize: '20px',
        fontWeight: '600'
    },
    inputContainer: {
        marginBottom: '15px'
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '600',
        color: '#34495e',
        fontSize: '14px'
    },
    select: {
        width: '100%',
        padding: '12px 15px',
        borderRadius: '8px',
        border: '2px solid #e0e0e0',
        fontSize: '15px',
        backgroundColor: '#f9f9f9',
        transition: 'all 0.3s ease',
        outline: 'none'
    },
    input: {
        width: '100%',
        padding: '12px 15px',
        borderRadius: '8px',
        border: '2px solid #e0e0e0',
        fontSize: '15px',
        backgroundColor: '#f0f0f0',
        color: '#495057',
        cursor: 'not-allowed'
    },
    customerBadge: {
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e0f2f1',
        borderLeft: '4px solid #00796b',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    addButton: {
        marginTop: '20px',
        padding: '12px 20px',
        backgroundColor: '#00796b',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer'
    }
};

export default CustomerSelectionPage;