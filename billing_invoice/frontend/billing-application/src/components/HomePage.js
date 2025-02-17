import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; // Assuming you have a CSS file for styling

const HomePage = () => {
    const navigate = useNavigate();

    const handleCustomerClick = () => {
        navigate('/dashboard');
    };

    const handleBillingClick = () => {
        navigate('/customer-selection');
    };

    const handleBillsQueryClick = () => {
        navigate('/bills-query');
    };

    return (
        <div className="home-page-container" >
            <Header />
            <Main handleCustomerClick={handleCustomerClick} handleBillingClick={handleBillingClick} handleBillsQueryClick={handleBillsQueryClick} />
            <Footer />
        </div>
    );
};

const Header = () => (
    <header className="header">
        <h1>SN TECH BUSINESS SOLUTIONS</h1>
         <nav>
            <ul className="nav-list">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav> 
    </header>
);

const Main = ({ handleCustomerClick, handleBillingClick, handleBillsQueryClick }) => (
    <main className="main">
        <div className="button-container">
            <button onClick={handleCustomerClick} className="button">Customer</button>
            <button onClick={handleBillingClick} className="button">Billing</button>
            <button onClick={handleBillsQueryClick} className="button">Bills Query</button>
        </div>
    </main>
);

const Footer = () => (
    <footer className="footer">
        <p>&copy; 2025 SN TECH BUSINESS SOLUTIONS. All rights reserved.</p>
    </footer>
);

export default HomePage;
