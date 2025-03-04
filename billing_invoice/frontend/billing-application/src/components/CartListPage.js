import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, AlertCircle, Trash2, Save, Package, DollarSign } from 'lucide-react';
import './CartListPage.css';

const CartListPage = ({ customerId, refreshTrigger, invoiceNumber, invoiceDate }) => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Fetch products when customerId or refreshTrigger changes
    useEffect(() => {
        const fetchProducts = async () => {
            if (!customerId) return;

            setIsLoading(true);
            try {
                const response = await axios.get(`http://localhost:8000/api/get-products-by-user/?user_id=${customerId}`);
                setProducts(response.data);
                
                // Calculate totals
                const totalQty = response.data.reduce((sum, product) => 
                    sum + (Number(product.product_quantity) || 0), 0);
                const totalAmt = response.data.reduce((sum, product) => 
                    sum + (Number(product.total_amount) || 0), 0);
                
                setTotalQuantity(totalQty);
                setTotalAmount(totalAmt);
                setError('');
            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Error fetching products');
                setProducts([]);
                setTotalQuantity(0);
                setTotalAmount(0);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [customerId, refreshTrigger]);

    const handleDelete = async (productId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this product?');
        if (confirmDelete) {
            try {
                await axios.delete(`http://localhost:8000/api/delete-product/${productId}/`);
                const updatedProducts = products.filter(product => product.id !== productId);
                setProducts(updatedProducts);
                
                // Update totals after deletion
                const totalQty = updatedProducts.reduce((sum, product) => 
                    sum + (Number(product.product_quantity) || 0), 0);
                const totalAmt = updatedProducts.reduce((sum, product) => 
                    sum + (Number(product.total_amount) || 0), 0);
                
                setTotalQuantity(totalQty);
                setTotalAmount(totalAmt);
                alert('Product deleted successfully');
            } catch (error) {
                console.error('Error deleting product:', error);
                setError('Failed to delete product');
            }
        }
    };

    // Format amount for display
    const formatAmount = (amount) => {
        try {
            const numAmount = Number(amount);
            return !isNaN(numAmount) ? numAmount.toFixed(2) : "0.00";
        } catch (error) {
            console.error('Error formatting amount:', error);
            return "0.00";
        }
    };

    // Handle saving the summary
    const handleSave = async () => {
        if (!customerId) {
            alert('Please select a customer first');
            return;
        }

        if (!invoiceNumber || !invoiceDate) {
            alert('Invoice number and date are required');
            return;
        }

        if (totalQuantity <= 0 || totalAmount <= 0) {
            alert('Please add some products before saving');
            return;
        }

        setSaving(true);
        try {
            await axios.post('http://localhost:8000/api/save-summary/', {
                customer_id: customerId,
                total_products: totalQuantity,
                total_amount: Number(totalAmount),
                invoice_number: invoiceNumber,
                invoice_date: invoiceDate
            });

            console.log('Sending data:', {
                customer_id: customerId,
                total_products: totalQuantity,
                total_amount: Number(totalAmount),
                invoice_number: invoiceNumber,
                invoice_date: invoiceDate
            });

            alert('Summary saved successfully');
            navigate('/home');
        } catch (error) {
            console.error('Error saving summary:', error);
            alert(error.response?.data?.error || 'Failed to save summary');
        } finally {
            setSaving(false);
        }
    };

    // Check if cart is empty
    const isCartEmpty = products.length === 0 && !isLoading;

    return (
        <div style={styles.container}>
            {/* Error Message */}
            {error && (
                <div style={styles.errorContainer}>
                    <AlertCircle size={20} color="#d32f2f" />
                    <span style={styles.errorText}>{error}</span>
                </div>
            )}

            {/* Total Summary Card */}
            <div style={styles.summaryCard}>
                <div style={styles.summaryItem}>
                    <Package size={20} color="#00796b" />
                    <span style={styles.summaryLabel}>Total Items:</span>
                    <span style={styles.summaryValue}>{totalQuantity}</span>
                </div>
                <div style={styles.summaryItem}>
                    <DollarSign size={20} color="#00796b" />
                    <span style={styles.summaryLabel}>Total Amount:</span>
                    <span style={styles.summaryValue}>Rs. {formatAmount(totalAmount)}</span>
                </div>
            </div>

            {/* Loading Indicator */}
            {isLoading && (
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <p style={styles.loadingText}>Loading cart items...</p>
                </div>
            )}

            {/* Empty Cart */}
            {isCartEmpty && (
                <div style={styles.emptyCartContainer}>
                    <ShoppingCart size={48} color="#ccc" />
                    <p style={styles.emptyCartText}>Your cart is empty</p>
                    <p style={styles.emptyCartSubtext}>Add some products to get started</p>
                </div>
            )}

            {/* Cart Items Table - Now with scroll */}
            {!isLoading && products.length > 0 && (
                <div style={styles.tableContainer}>
                    <div style={styles.tableScrollContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.tableHeader}>Product Name</th>
                                    <th style={styles.tableHeader}>Quantity</th>
                                    <th style={styles.tableHeader}>Rate (Rs.)</th>
                                    <th style={styles.tableHeader}>Total (Rs.)</th>
                                    <th style={styles.tableHeader}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product, index) => (
                                    <tr key={product.id} style={index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                                        <td style={styles.tableCell}>
                                            <div style={styles.productNameContainer}>
                                                <span style={styles.productName}>{product.product_name}</span>
                                            </div>
                                        </td>
                                        <td style={styles.tableCell}>
                                            <span style={styles.quantityBadge}>{product.product_quantity}</span>
                                        </td>
                                        <td style={styles.tableCell}>{Number(product.product_price).toFixed(2)}</td>
                                        <td style={styles.tableCell}>{Number(product.total_amount).toFixed(2)}</td>
                                        <td style={styles.tableCell}>
                                            <button 
                                                onClick={() => handleDelete(product.id)}
                                                style={styles.deleteButton}
                                                aria-label="Delete product"
                                            >
                                                <Trash2 size={16} />
                                                <span style={styles.buttonText}>Delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Summary Section */}
            <div style={styles.finalSummarySection}>
                <h3 style={styles.finalSummaryTitle}>Order Summary</h3>
                
                <div style={styles.finalSummaryContent}>
                    <div style={styles.finalSummaryRow}>
                        <span style={styles.finalSummaryLabel}>Total Products:</span>
                        <span style={styles.finalSummaryValue}>{totalQuantity || 0}</span>
                    </div>
                    <div style={styles.finalSummaryRow}>
                        <span style={styles.finalSummaryLabel}>Total Amount:</span>
                        <span style={styles.finalSummaryValue}>Rs. {formatAmount(totalAmount)}</span>
                    </div>
                    {invoiceNumber && (
                        <div style={styles.finalSummaryRow}>
                            <span style={styles.finalSummaryLabel}>Invoice Number:</span>
                            <span style={styles.finalSummaryValue}>{invoiceNumber}</span>
                        </div>
                    )}
                    {invoiceDate && (
                        <div style={styles.finalSummaryRow}>
                            <span style={styles.finalSummaryLabel}>Invoice Date:</span>
                            <span style={styles.finalSummaryValue}>{invoiceDate}</span>
                        </div>
                    )}
                </div>

                <div style={styles.buttonContainer}>
                    <button 
                        onClick={handleSave}
                        disabled={saving || !customerId || totalQuantity <= 0 || !invoiceNumber || !invoiceDate}
                        style={styles.saveButton(saving || !customerId || totalQuantity <= 0 || !invoiceNumber || !invoiceDate)}
                    >
                        {saving ? (
                            <>
                                <div style={styles.buttonSpinner}></div>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                <span>Complete Order</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Styles object
const styles = {
    container: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e9ecef',
        width: '100%',
        fontFamily: 'Inter, Arial, sans-serif',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: '2px solid #00796b',
    },
    title: {
        margin: 0,
        color: '#2c3e50',
        fontSize: '20px',
        fontWeight: '600',
    },
    errorContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        backgroundColor: '#ffebee',
        borderRadius: '8px',
        marginBottom: '16px',
        border: '1px solid #ffcdd2',
    },
    errorText: {
        color: '#d32f2f',
        fontSize: '14px',
        fontWeight: '500',
    },
    summaryCard: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '16px',
        backgroundColor: '#e0f2f1',
        borderRadius: '10px',
        marginBottom: '24px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    },
    summaryItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    summaryLabel: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#37474f',
    },
    summaryValue: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#00695c',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 0',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid rgba(0, 121, 107, 0.1)',
        borderRadius: '50%',
        borderTop: '4px solid #00796b',
        animation: 'spin 1s linear infinite',
    },
    buttonSpinner: {
        width: '18px',
        height: '18px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '50%',
        borderTop: '2px solid white',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        marginTop: '16px',
        color: '#607d8b',
        fontSize: '16px',
    },
    emptyCartContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 0',
        backgroundColor: '#f5f5f5',
        borderRadius: '10px',
        marginBottom: '24px',
    },
    emptyCartText: {
        marginTop: '16px',
        fontSize: '18px',
        fontWeight: '600',
        color: '#546e7a',
    },
    emptyCartSubtext: {
        fontSize: '14px',
        color: '#78909c',
        marginTop: '8px',
    },
    tableContainer: {
        marginBottom: '24px',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    },
    // New style for scrollable container
    tableScrollContainer: {
        maxHeight: '400px',  // Set maximum height for scroll
        overflowY: 'auto',   // Enable vertical scrolling
        borderRadius: '10px',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px',
    },
    tableHeader: {
        padding: '16px',
        backgroundColor: '#f5f5f5',
        borderBottom: '2px solid #e0e0e0',
        textAlign: 'left',
        color: '#546e7a',
        fontWeight: '600',
        position: 'sticky',  // Make headers sticky
        top: 0,              // Stick to top
        zIndex: 10,          // Ensure headers appear above content
    },
    tableRowEven: {
        backgroundColor: 'white',
    },
    tableRowOdd: {
        backgroundColor: '#f9f9f9',
    },
    tableCell: {
        padding: '16px',
        borderBottom: '1px solid #e0e0e0',
        color: '#37474f',
    },
    productNameContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    productName: {
        fontWeight: '500',
        color: '#263238',
    },
    quantityBadge: {
        display: 'inline-block',
        padding: '4px 8px',
        backgroundColor: '#e0f2f1',
        color: '#00796b',
        borderRadius: '16px',
        fontWeight: '600',
        fontSize: '12px',
    },
    deleteButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '6px 12px',
        backgroundColor: '#ffebee',
        color: '#d32f2f',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    buttonText: {
        fontSize: '12px',
        fontWeight: '600',
    },
    finalSummarySection: {
        backgroundColor: '#f9f9f9',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    },
    finalSummaryTitle: {
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: '600',
        color: '#37474f',
        marginBottom: '20px',
        borderBottom: '1px solid #e0e0e0',
        paddingBottom: '10px',
    },
    finalSummaryContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '24px',
    },
    finalSummaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 16px',
        borderBottom: '1px dashed #e0e0e0',
    },
    finalSummaryLabel: {
        color: '#546e7a',
        fontSize: '14px',
        fontWeight: '500',
    },
    finalSummaryValue: {
        color: '#263238',
        fontSize: '14px',
        fontWeight: '600',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '24px',
    },
    saveButton: (disabled) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        backgroundColor: disabled ? '#cccccc' : '#00796b',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        boxShadow: disabled ? 'none' : '0 4px 6px rgba(0, 0, 0, 0.1)',
        opacity: disabled ? 0.7 : 1,
    }),
};

export default CartListPage;