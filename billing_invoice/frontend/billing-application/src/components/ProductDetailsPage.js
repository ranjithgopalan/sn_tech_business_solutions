import React, { useState, useEffect } from 'react';
import { Package, PlusCircle } from 'lucide-react';
import axios from 'axios';

const ProductDetailsPage = ({ customerId, invoiceNumber, invoiceDate, onAddProduct,setProducts }) => {
    const [productName, setProductName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [perQuantityRate, setPerQuantityRate] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Calculate total amount when quantity or rate changes
    useEffect(() => {
        const qty = Number(quantity) || 0;
        const rate = Number(perQuantityRate) || 0;
        setTotalAmount(qty * rate);
    }, [quantity, perQuantityRate]);

    const validateFields = () => {
        setError('');

        if (!productName || productName.trim() === '') {
            setError('Product name is required');
            return false;
        }

        const parsedQuantity = Number(quantity);
        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
            setError('Quantity must be a positive number');
            return false;
        }

        const parsedRate = Number(perQuantityRate);
        if (isNaN(parsedRate) || parsedRate <= 0) {
            setError('Per quantity rate must be a positive number');
            return false;
        }

        return true;
    };

    const clearForm = () => {
        setProductName('');
        setQuantity('');
        setPerQuantityRate('');
        setTotalAmount('');
        setError('');
    };

    const handleAddToCart = async () => {
        if (!validateFields()) {
            return;
        }

        if (!customerId) {
            setError('Please select a customer first');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // First create the product
            const productData = {
                customer_id: customerId,
                product_name: productName.trim(),
                product_quantity: Number(quantity),
                product_price: Number(perQuantityRate),
                total_amount: Number(totalAmount)
            };
            console.log('Sending to API:', productData);

            const response = await axios.post(
                'http://localhost:8000/api/create-product/', 
                productData
            );

            // Then get updated products list
            const updatedProductsResponse = await axios.get(
                'http://localhost:8000/api/get-products-by-user/',
                {
                    params: { user_id: customerId }
                }
            );

            if (typeof onAddProduct === 'function') {
                onAddProduct(updatedProductsResponse.data);
            }
            
            // Also update products state if the function is passed
            if (typeof setProducts === 'function') {
                setProducts(updatedProductsResponse.data);
            }

            // Update cart and clear form
            // onProductAdded(updatedProductsResponse.data);
            // setProducts(updatedProductsResponse.data);
            clearForm();
            alert('Product added to cart successfully');

        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError('Failed to add product. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            {/* <div style={styles.header}>
                <Package size={30} color="#00796b" />
                <h3 style={styles.title}>Product Details</h3>
            </div> */}

            {error && (
                <div style={styles.errorMessage}>
                    {error}
                </div>
            )}

            <div style={styles.gridContainer}>
                <div style={styles.inputWrapper}>
                    <label style={styles.label}>Product Name</label>
                    <input 
                        type="text" 
                        value={productName} 
                        onChange={(e) => setProductName(e.target.value)} 
                        style={styles.input(isLoading || !customerId)} 
                        placeholder="Enter Product Name"
                        disabled={isLoading || !customerId}
                    />
                </div>

                <div style={styles.inputWrapper}>
                    <label style={styles.label}>Quantity</label>
                    <input 
                        type="number" 
                        value={quantity} 
                        onChange={(e) => setQuantity(e.target.value)} 
                        style={styles.input(isLoading || !customerId)} 
                        placeholder="Quantity"
                        min="1"
                        disabled={isLoading || !customerId}
                    />
                </div>

                <div style={styles.inputWrapper}>
                    <label style={styles.label}>Per Quantity Rate</label>
                    <input 
                        type="number" 
                        value={perQuantityRate} 
                        onChange={(e) => setPerQuantityRate(e.target.value)} 
                        style={styles.input(isLoading || !customerId)} 
                        placeholder="Rate"
                        min="0.01"
                        step="0.01"
                        disabled={isLoading || !customerId}
                    />
                </div>

                <div style={styles.inputWrapper}>
                    <label style={styles.label}>Total Amount</label>
                    <input 
                        type="number" 
                        value={totalAmount} 
                        readOnly 
                        style={styles.totalAmountInput} 
                    />
                </div>
            </div>

            <div style={styles.buttonWrapper}>
                <button 
                    onClick={handleAddToCart} 
                    style={styles.button(isLoading || !customerId)}
                    disabled={isLoading || !customerId}
                >
                    {isLoading ? (
                        <span style={styles.buttonContent}>
                            <div style={styles.spinner}></div>
                            Adding...
                        </span>
                    ) : (
                        <span style={styles.buttonContent}>
                            <PlusCircle size={20} />
                            Add to Cart
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e9ecef'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: '2px solid #00796b'
    },
    title: {
        margin: 0,
        color: '#2c3e50',
        fontSize: '20px',
        fontWeight: '600'
    },
    errorMessage: {
        backgroundColor: '#ffebee',
        color: '#d32f2f',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '600'
    },
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '15px',
        marginBottom: '20px'
    },
    inputWrapper: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#34495e'
    },
    input: (disabled) => ({
        padding: '12px 15px',
        borderRadius: '8px',
        border: '2px solid #e0e0e0',
        fontSize: '15px',
        backgroundColor: disabled ? '#f0f0f0' : '#ffffff',
        color: disabled ? '#9e9e9e' : '#333',
        cursor: disabled ? 'not-allowed' : 'text',
        transition: 'all 0.3s ease',
        outline: 'none'
    }),
    totalAmountInput: {
        padding: '12px 15px',
        borderRadius: '8px',
        border: '2px solid #e0e0e0',
        fontSize: '15px',
        backgroundColor: '#f0f0f0',
        color: '#333',
        cursor: 'not-allowed'
    },
    buttonWrapper: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '20px'
    },
    button: (disabled) => ({
        padding: '12px 25px',
        borderRadius: '8px',
        backgroundColor: disabled ? '#cccccc' : '#00796b',
        color: 'white',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        fontWeight: '600'
    }),
    buttonContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    spinner: {
        border: '3px solid rgba(255, 255, 255, 0.3)',
        borderTop: '3px solid white',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        animation: 'spin 1s linear infinite'
    }
};

export default ProductDetailsPage;