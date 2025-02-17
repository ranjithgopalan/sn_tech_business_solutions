import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BillsQueryPage = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/bills/');
                setBills(response.data);
            } catch (err) {
                setError('Error fetching bills');
            } finally {
                setLoading(false);
            }
        };

        fetchBills();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="bills-query-page">
            <h1>Bills</h1>
            <table className="bills-table">
                <thead>
                    <tr>
                        <th>Invoice Number</th>
                        <th>Invoice Date</th>
                        <th>Customer Name</th>
                        <th>Total Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {bills.map((bill) => (
                        <tr key={bill.invoice_number}>
                            <td>{bill.invoice_number}</td>
                            <td>{bill.invoice_date}</td>
                            <td>{bill.customer_name}</td>
                            <td>${bill.total_amount.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default BillsQueryPage;