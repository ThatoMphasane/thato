import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const Header = ({ currentUser, onLogout }) => {
    const navigate = useNavigate();

    // Automatically updates the document title whenever the current user changes
    useEffect(() => {
        if (currentUser) {
            document.title = `Welcome, ${currentUser}`;
        } else {
            document.title = "Wings Cafe";
        }
    }, [currentUser]); // Re-run effect when currentUser changes

    const handleLogout = () => {
        onLogout();  // Ensure this function clears necessary data (e.g., token, user session)
        navigate('/home');  // Redirect to the home page or login page after logging out
    };

    return (
        <header className="header">
            <h1>Welcome to Wings Cafe</h1>
            {currentUser ? (
                <>
                    <h2>Welcome, {currentUser}!</h2>
                    <nav>
                        <button onClick={() => navigate('/dashboard')} aria-label="Go to Dashboard">
                            Dashboard
                        </button>
                        <button onClick={() => navigate('/product-management')} aria-label="Manage Products">
                            Product Management
                        </button>
                        <button onClick={() => navigate('/user-management')} aria-label="Manage Users">
                            User Management
                        </button>
                        <button onClick={handleLogout} aria-label="Logout">
                            Logout
                        </button>
                    </nav>
                </>
            ) : (
                <button onClick={() => navigate('/home')} aria-label="Go to Login or Signup">
                    Login / Signup
                </button>
            )}
        </header>
    );
};

export default Header;
