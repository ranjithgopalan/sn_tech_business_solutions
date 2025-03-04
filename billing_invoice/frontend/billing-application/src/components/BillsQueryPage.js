import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Loader, AlertCircle, DollarSign, Calendar, User, Search } from 'lucide-react';
import './BillsQueryPage.css';

const BillsQueryPage = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/bills/');
                setBills(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching bills:', err);
                setError('Error fetching bills. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchBills();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatAmount = (amount) => {
        return Number(amount).toFixed(2);
    };

    // Search functionality
    const filteredBills = bills.filter(bill => 
        bill.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.invoice_number.toString().includes(searchTerm)
    );

    // Sorting functionality
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortedBills = (bills) => {
        if (!sortConfig.key) return bills;
        
        return [...bills].sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];
            
            // Handle date sorting
            if (sortConfig.key === 'invoice_date') {
                aValue = new Date(aValue).getTime();
                bValue = new Date(bValue).getTime();
            }
            
            // Handle numeric sorting
            if (sortConfig.key === 'total_amount') {
                aValue = Number(aValue);
                bValue = Number(bValue);
            }
            
            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    };

    const sortedBills = getSortedBills(filteredBills);

    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <FileText size={28} color="#00796b" />
                <h1 style={styles.title}>Bills Overview</h1>
            </div>
            
            {/* Search bar */}
            <div style={styles.searchContainer}>
                <div style={styles.searchInputWrapper}>
                    <Search size={18} color="#666" style={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by customer name or invoice number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                </div>
                <div style={styles.resultsCount}>
                    {filteredBills.length} {filteredBills.length === 1 ? 'bill' : 'bills'} found
                </div>
            </div>

            {loading ? (
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <p style={styles.loadingText}>Loading bills...</p>
                </div>
            ) : error ? (
                <div style={styles.errorContainer}>
                    <AlertCircle size={24} color="#d32f2f" />
                    <p style={styles.errorText}>{error}</p>
                </div>
            ) : sortedBills.length === 0 ? (
                <div style={styles.emptyContainer}>
                    <FileText size={48} color="#ccc" />
                    <p style={styles.emptyText}>No bills found</p>
                    <p style={styles.emptySubtext}>Try adjusting your search criteria</p>
                </div>
            ) : (
                <div style={styles.tableContainer}>
                    <div style={styles.tableScrollContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th 
                                        style={styles.tableHeader}
                                        onClick={() => requestSort('invoice_number')}
                                    >
                                        <div style={styles.headerContent}>
                                            <span>Invoice Number</span>
                                            <span style={styles.sortIndicator}>{getSortIndicator('invoice_number')}</span>
                                        </div>
                                    </th>
                                    <th 
                                        style={styles.tableHeader}
                                        onClick={() => requestSort('invoice_date')}
                                    >
                                        <div style={styles.headerContent}>
                                            <Calendar size={16} />
                                            <span>Invoice Date</span>
                                            <span style={styles.sortIndicator}>{getSortIndicator('invoice_date')}</span>
                                        </div>
                                    </th>
                                    <th 
                                        style={styles.tableHeader}
                                        onClick={() => requestSort('customer_name')}
                                    >
                                        <div style={styles.headerContent}>
                                            <User size={16} />
                                            <span>Customer Name</span>
                                            <span style={styles.sortIndicator}>{getSortIndicator('customer_name')}</span>
                                        </div>
                                    </th>
                                    <th 
                                        style={styles.tableHeader}
                                        onClick={() => requestSort('total_amount')}
                                    >
                                        <div style={styles.headerContent}>
                                            <DollarSign size={16} />
                                            <span>Total Amount</span>
                                            <span style={styles.sortIndicator}>{getSortIndicator('total_amount')}</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedBills.map((bill, index) => (
                                    <tr key={bill.invoice_number} style={index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                                        <td style={styles.tableCell}>
                                            <div style={styles.invoiceNumber}>{bill.invoice_number}</div>
                                        </td>
                                        <td style={styles.tableCell}>{formatDate(bill.invoice_date)}</td>
                                        <td style={styles.tableCell}>
                                            <div style={styles.customerName}>{bill.customer_name}</div>
                                        </td>
                                        <td style={styles.tableCell}>
                                            <div style={styles.amount}>Rs. {formatAmount(bill.total_amount)}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            <div style={styles.summaryCard}>
                <div style={styles.summaryItem}>
                    <div style={styles.summaryLabel}>Total Bills</div>
                    <div style={styles.summaryValue}>{sortedBills.length}</div>
                </div>
                <div style={styles.summaryItem}>
                    <div style={styles.summaryLabel}>Total Amount</div>
                    <div style={styles.summaryValue}>
                        Rs. {formatAmount(sortedBills.reduce((sum, bill) => sum + Number(bill.total_amount), 0))}
                    </div>
                </div>
                {/* <div style={styles.summaryItem}>
                    <div style={styles.summaryLabel}>Average Amount</div>
                    <div style={styles.summaryValue}>
                        Rs. {formatAmount(sortedBills.length ? sortedBills.reduce((sum, bill) => sum + Number(bill.total_amount), 0) / sortedBills.length : 0)}
                    </div>
                </div> */}
            </div>
        </div>
    );
};

// Enhanced styles
const styles = {
    container: {
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
        fontFamily: 'Inter, Arial, sans-serif',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid #00796b',
    },
    title: {
        margin: 0,
        color: '#263238',
        fontSize: '24px',
        fontWeight: '600',
    },
    searchContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
    },
    searchInputWrapper: {
        position: 'relative',
        flex: 1,
        maxWidth: '500px',
    },
    searchIcon: {
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
    },
    searchInput: {
        width: '100%',
        padding: '12px 12px 12px 40px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '14px',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        outline: 'none',
        backgroundColor: 'white',
    },
    resultsCount: {
        fontSize: '14px',
        color: '#546e7a',
        fontWeight: '500',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 0',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid rgba(0, 121, 107, 0.1)',
        borderRadius: '50%',
        borderLeft: '4px solid #00796b',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        marginTop: '16px',
        color: '#546e7a',
        fontSize: '16px',
    },
    errorContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '20px',
        backgroundColor: '#ffebee',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #ffcdd2',
    },
    errorText: {
        color: '#d32f2f',
        fontSize: '15px',
        margin: 0,
    },
    emptyContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 0',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    },
    emptyText: {
        marginTop: '16px',
        fontSize: '18px',
        fontWeight: '600',
        color: '#546e7a',
    },
    emptySubtext: {
        fontSize: '14px',
        color: '#78909c',
        marginTop: '8px',
    },
    tableContainer: {
        marginBottom: '24px',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        backgroundColor: 'white',
    },
    tableScrollContainer: {
        maxHeight: '500px',
        overflowY: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px',
    },
    tableHeader: {
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #e0e0e0',
        textAlign: 'left',
        color: '#546e7a',
        fontWeight: '600',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        cursor: 'pointer',
        userSelect: 'none',
    },
    headerContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    sortIndicator: {
        fontWeight: 'bold',
    },
    tableRowEven: {
        backgroundColor: 'white',
    },
    tableRowOdd: {
        backgroundColor: '#f9fafb',
    },
    tableCell: {
        padding: '14px 16px',
        borderBottom: '1px solid #eee',
        color: '#37474f',
    },
    invoiceNumber: {
        fontWeight: '500',
        color: '#00796b',
        display: 'inline-block',
        padding: '2px 8px',
        backgroundColor: '#e0f2f1',
        borderRadius: '4px',
    },
    customerName: {
        fontWeight: '500',
    },
    amount: {
        fontWeight: '600',
        color: '#01579b',
    },
    summaryCard: {
        display: 'flex',
        justifyContent: 'space-around',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 3px 10px rgba(0,0,0,0.06)',
    },
    summaryItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: '14px',
        color: '#546e7a',
        marginBottom: '6px',
    },
    summaryValue: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#00796b',
    }
};

// Add this to your CSS file
/*
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
*/

export default BillsQueryPage;