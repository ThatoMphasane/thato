import React, { useState } from 'react';

const Login = ({ onLogin, loginError }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
        setErrorMessage(''); // Clear error message on input change
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username && password) {
            onLogin(username, password); // Call onLogin
        } else {
            setErrorMessage('Please enter both username and password.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>
            <div>
                <label>Username:</label>
                <input
                    type="text"
                    value={username}
                    onChange={handleInputChange(setUsername)}
                    required
                />
            </div>
            <div>
                <label>Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={handleInputChange(setPassword)}
                    required
                />
            </div>
            <button type="submit">Login</button>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
        </form>
    );
};

export default Login;