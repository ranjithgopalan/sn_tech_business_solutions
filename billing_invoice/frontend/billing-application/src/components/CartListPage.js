import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CartListPage.css'; // Import the CSS file

const CartListPage = ({ customerId, products, setProducts }) => {
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        if (customerId) {
            const fetchProducts = async () => {
                try {
                    const response = await axios.get(`http://localhost:8000/api/get-products-by-user/?user_id=${customerId}`);
                    setProducts(response.data);
                    calculateTotals(response.data);
                } catch (error) {
                    console.error('Error fetching products:', error);
                }
            };

            fetchProducts();
        }
    }, [customerId, setProducts]);

    useEffect(() => {
        calculateTotals(products);
    }, [products]);

    const calculateTotals = (products) => {
        const totalQuantity = products.reduce((sum, product) => sum + product.product_quantity, 0);
        const totalAmount = products.reduce((sum, product) => sum + product.total_amount, 0);
        setTotalQuantity(totalQuantity);
        setTotalAmount(totalAmount);
    };

    const handleDelete = async (productId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this product?');
        if (confirmDelete) {
            try {
                await axios.delete(`http://localhost:8000/api/products/${productId}/`);
                const updatedProducts = products.filter(product => product.id !== productId);
                setProducts(updatedProducts);
                calculateTotals(updatedProducts);
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    return (
        <div className="container" style={{ marginTop: '10px',width: '600px',alignItems: 'center',justifyContent: 'center',marginLeft: '20%'}}>
            <h3 style={{paddingLeft:'250px'}}>Cart Items</h3>
            <div className="table-container" style={{ width: '110%', marginTop: '-10px' }}>
                <table className="product-table" >
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Quantity</th>
                            <th>Per Quantity Rate</th>
                            <th>Total Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center' }}>No products found</td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id}>
                                    <td>{product.product_name}</td>
                                    <td>{product.product_quantity}</td>
                                    <td>{product.product_price}</td>
                                    <td>{product.total_amount}</td>
                                    <td>
                                        <button onClick={() => handleDelete(product.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CartListPage;