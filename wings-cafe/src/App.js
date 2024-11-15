import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './Header';
import Login from './Login';
import Signup from './Signup';
import UserManagement from './UserManagement';
import ProductManagement from './ProductManagement';
import Dashboard from './Dashboard';
import './App.css';

const App = () => {
    const [currentUser, setCurrentUser] = useState(() => localStorage.getItem('currentUser') || null);
    const [isAuthenticated, setIsAuthenticated] = useState(!!currentUser);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [welcomeMessage, setWelcomeMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userResponse = await fetch('http://localhost:5000/api/users');
                const userData = await userResponse.json();
                setUsers(userData);

                const productResponse = await fetch('http://localhost:5000/api/products');
                const productData = await productResponse.json();
                setProducts(productData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        
        fetchData();
    }, []);

    const [loginError, setLoginError] = useState('');
    const [activeForm, setActiveForm] = useState(null);

    useEffect(() => {
        // Sync currentUser and products with localStorage
        localStorage.setItem('currentUser', isAuthenticated ? currentUser : '');
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('products', JSON.stringify(products));

        // Update the welcome message whenever currentUser changes
        if (currentUser) {
            setWelcomeMessage(`Welcome, ${currentUser}!`);
        } else {
            setWelcomeMessage('');
        }
    }, [currentUser, isAuthenticated, users, products]);

    const handleLogout = () => {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setWelcomeMessage('');  // Clear welcome message on logout
    };

    const handleSignup = (username, password) => {
        if (users.some(user => user.username === username)) {
            setLoginError('Username already exists. Please choose another.');
            return;
        }
        const newUser = { username, password };
        fetch('http://localhost:5000/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser),
        })
            .then(response => response.json())
            .then((data) => {
                setLoginError(data.message);
                setActiveForm('login'); // Redirect to login form after sign-up
            });
    };

    const handleLogin = (username, password) => {
        fetch('http://localhost:5000/api/users')
            .then(response => response.json())
            .then(data => {
                const foundUser = data.find(user => user.username === username && user.password === password);
                if (foundUser) {
                    setCurrentUser(foundUser.username);
                    setIsAuthenticated(true);
                    setLoginError('');
                    setActiveForm(null);
                } else {
                    setLoginError('Invalid credentials. Please try again.');
                }
            })
            .catch(error => {
                console.error("Error during login:", error);
                setLoginError('An error occurred during login. Please try again.');
            });
    };

    const handleAddProduct = (productData) => {
        setProducts(prevProducts => [...prevProducts, productData]);
    };

    const handleUpdateProduct = (updatedProduct, index) => {
        setProducts(prevProducts => {
            const updatedProducts = [...prevProducts];
            updatedProducts[index] = updatedProduct;
            return updatedProducts;
        });
    };

    const handleDeleteProduct = (index) => {
        setProducts(prevProducts => prevProducts.filter((_, i) => i !== index));
    };

    const handleAddUser = (username, password) => {
        setUsers(prevUsers => [...prevUsers, { username, password }]);
    };

    const handleUpdateUser = (updatedUser, index) => {
        setUsers(prevUsers => {
            const updatedUsers = [...prevUsers];
            updatedUsers[index] = updatedUser;
            return updatedUsers;
        });
    };

    const handleDeleteUser = (index) => {
        setUsers(prevUsers => prevUsers.filter((_, i) => i !== index));
    };

    const toggleForm = (formType) => {
        setActiveForm(formType);
    };

    // New function for switching users
    const handleSwitchUser = (username) => {
        setCurrentUser(username);
        setIsAuthenticated(true);
        setWelcomeMessage(`Welcome, ${username}!`); // Set the welcome message
    };

    return (
        <Router>
            <div>
                <Header currentUser={currentUser} onLogout={handleLogout} />
                {welcomeMessage && <p className="welcome-message">{welcomeMessage}</p>} {/* Display welcome message */}

                <Routes>
                    <Route path="/" element={<Navigate to="/home" />} />
                    
                    <Route path="/home" element={
                        isAuthenticated ? <Navigate to="/dashboard" /> : (
                            <div>
                                <button onClick={() => toggleForm('login')}>Login</button>
                                <button onClick={() => toggleForm('signup')}>Sign Up</button>

                                {/* Conditionally render forms based on state */}
                                {activeForm === 'login' && <Login onLogin={handleLogin} loginError={loginError} />}
                                {activeForm === 'signup' && <Signup onSignup={handleSignup} />}

                                {loginError && <p className="error-message">{loginError}</p>}
                            </div>
                        )
                    } />

                    <Route path="/dashboard" element={
                        isAuthenticated ? <Dashboard products={products} currentUser={currentUser} /> : <Navigate to="/home" />
                    } />

                    <Route path="/user-management" element={
                        isAuthenticated ? (
                            <UserManagement
                                users={users}
                                onAddUser={handleAddUser}
                                onUpdateUser={handleUpdateUser}
                                onDeleteUser={handleDeleteUser}
                                onSwitchUser={handleSwitchUser} // Pass the new function here
                            />
                        ) : <Navigate to="/home" />
                    } />

                    <Route path="/product-management" element={
                        isAuthenticated ? (
                            <ProductManagement
                                products={products}
                                onAddProduct={handleAddProduct}
                                onUpdateProduct={handleUpdateProduct}
                                onDeleteProduct={handleDeleteProduct}
                            />
                        ) : <Navigate to="/home" />
                    } />

                    <Route path="*" element={<Navigate to="/home" />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
