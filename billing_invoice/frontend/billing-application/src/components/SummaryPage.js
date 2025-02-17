import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SummaryPage.css';

const SummaryPage = ({ customerId, totalQuantity = 0, totalAmount = 0 }) => {
    const navigate = useNavigate();
    const handleSave = async () => {
        try {
            await axios.post('http://localhost:8000/api/save-summary/', {
                customer_id: customerId,
                total_products: totalQuantity,
                total_amount: totalAmount,
            });
            alert('Summary saved successfully');
            navigate('/home');
        } catch (error) {
            console.error('Error saving summary:', error);
            alert('Failed to save summary');
        }
    };

    return (
        <div className="summary-page" style={{ width: '50%',alignItems: 'center' ,marginLeft: '20%',marginBlock: '1px',
            
        }}>
            <h3 style={{marginTop:'8px',paddingLeft:'50px'}}>Summary</h3>
            <table className="summary-table" style={{width: '60%',alignItems: 'center',marginLeft: '10%',marginBlock: '1px',marginTop:'-5px'}}>
                <thead>
                    <tr>
                        <th>Total Product Quantity</th>
                        <th>Total Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style={{width:'500%'}}>
                        <td>{totalQuantity}</td>
                        <td>${totalAmount.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
            <button onClick={handleSave}>Save</button>
        </div>
    );
};

export default SummaryPage;