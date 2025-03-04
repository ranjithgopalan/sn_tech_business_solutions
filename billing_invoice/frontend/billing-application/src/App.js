import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import CustomerSelectionPage from './components/CustomerSelectionPage';
import ProductDetailsPage from './components/ProductDetailsPage';
import SummaryPage from './components/SummaryPage';
import BillsQueryPage from './components/BillsQueryPage';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/customer-selection" element={<CustomerSelectionPage />} />
                <Route path="/product-details" element={<ProductDetailsPage />} />
                <Route path="/summary" element={<SummaryPage />} />
                <Route path="/bills-query" element={<BillsQueryPage />} />
            </Routes>
        </Router>
    );
}

export default App;