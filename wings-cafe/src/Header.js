import React from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const Header = ({ currentUser, onLogout }) => {
    const navigate = useNavigate(); // Initialize the useNavigate hook

    return (
        <header>
            <h1>Welcome to Wings Cafe</h1>
            {currentUser && <h2>Welcome, {currentUser}!</h2>}
            {currentUser ? (
                <nav>
                    <button onClick={() => navigate('/dashboard')}>Dashboard</button>
                    <button onClick={() => navigate('/product-management')}>Product Management</button>
                    <button onClick={() => navigate('/user-management')}>User Management</button>
                    <button onClick={onLogout}>Logout</button>
                </nav>
            ) : (
                <button onClick={() => navigate('/home')}>Login / Signup</button>
            )}
        </header>
    );
};

export default Header;