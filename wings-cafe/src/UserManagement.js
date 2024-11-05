// UserManagement.js
import React, { useState } from 'react';

const UserManagement = ({ users, onAddUser, onDeleteUser, onUpdateUser, onSwitchUser }) => {
    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [editUserIndex, setEditUserIndex] = useState(null);
    const [editUsername, setEditUsername] = useState('');
    const [editPassword, setEditPassword] = useState('');

    const handleAddUser = (e) => {
        e.preventDefault();
        if (newUsername && newPassword) {
            onAddUser(newUsername, newPassword);
            resetAddUserForm();
            setMessage('User added successfully!');
        } else {
            setMessage('Username and password are required.');
        }
    };

    const handleSwitchUser = (username) => {
        const password = window.prompt(`Enter password for user ${username}:`);
        const user = users.find(user => user.username === username);
        
        if (user && password === user.password) {
            onSwitchUser(username);
            setMessage(`Switched to user: ${username}`);
        } else {
            setMessage('Invalid username or password.');
        }
    };

    const handleEditUser = (index) => {
        const password = window.prompt(`Enter password for user ${users[index].username}:`);
        const user = users[index];
        
        if (user && password === user.password) {
            setEditUserIndex(index);
            setEditUsername(user.username);
            setEditPassword(user.password); // Pre-populate the password for editing
            setMessage('Editing user: ' + user.username);
        } else {
            setMessage('Invalid username or password.');
        }
    };

    const handleUpdateUser = (e) => {
        e.preventDefault();
        if (editUserIndex !== null) {
            const updatedUser = {
                username: editUsername,
                password: editPassword,
            };
            onUpdateUser(editUserIndex, updatedUser);
            setMessage(`User ${updatedUser.username} updated successfully!`);
            resetEditUserForm();
        }
    };

    const resetAddUserForm = () => {
        setNewUsername('');
        setNewPassword('');
        setShowAddUserForm(false);
        setMessage('');
    };

    const resetEditUserForm = () => {
        setEditUserIndex(null);
        setEditUsername('');
        setEditPassword('');
    };

    return (
        <div className="user-management">
            <h2>User Management Dashboard</h2>
            {message && <p className="message">{message}</p>}
            
            {!showAddUserForm ? (
                <button onClick={() => setShowAddUserForm(true)}>Add User</button>
            ) : (
                <form onSubmit={handleAddUser} className="user-form">
                    <h3>Add User</h3>
                    <input 
                        type="text" 
                        placeholder="Username" 
                        value={newUsername} 
                        onChange={(e) => setNewUsername(e.target.value)} 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        required 
                    />
                    <button type="submit">Add User</button>
                    <button type="button" onClick={resetAddUserForm}>Cancel</button>
                </form>
            )}

            <h3>User List</h3>
            {users.length > 0 ? (
                <table className="user-list">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={index}>
                                <td>{user.username}</td>
                                <td>
                                    <button onClick={() => handleSwitchUser(user.username)}>Switch User</button>
                                    <button onClick={() => handleEditUser(index)}>Edit</button>
                                    <button onClick={() => {
                                        if (window.confirm(`Are you sure you want to delete ${user.username}?`)) {
                                            onDeleteUser(index);
                                            setMessage('User deleted successfully!');
                                        }
                                    }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No users found.</p>
            )}

            {editUserIndex !== null && (
                <form onSubmit={handleUpdateUser}>
                    <h3>Edit User</h3>
                    <input 
                        type="text" 
                        placeholder="Username" 
                        value={editUsername} 
                        onChange={(e) => setEditUsername(e.target.value)} 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={editPassword} 
                        onChange={(e) => setEditPassword(e.target.value)} 
                        required 
                    />
                    <button type="submit">Update User</button>
                    <button type="button" onClick={resetEditUserForm}>Cancel</button>
                </form>
            )}
        </div>
    );
};

export default UserManagement;