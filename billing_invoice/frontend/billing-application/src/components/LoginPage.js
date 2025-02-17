import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

const LoginPage = () => {
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const username = "admin";
        const password = "password";
        try {
            if (username === 'admin' || password === 'password') {
                navigate('/home');
            }
            // const response = await axios.post('/api/login', { username, password });
            // Handle successful login (e.g., redirect to home page)
            navigate('/home'); // Redirect to home page
        } catch (err) {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleLogin}>
                <div className="input-group">
                    <label>Username:</label>
                    <input
                        type="text"
                        value="admin"
                        readOnly
                    />
                </div>
                <div className="input-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        value="password"
                        readOnly
                    />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default LoginPage;
