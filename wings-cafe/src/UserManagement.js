import React, { useState, useEffect } from 'react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [editUserIndex, setEditUserIndex] = useState(null);
    const [editUsername, setEditUsername] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [message, setMessage] = useState('');
    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [passwordPrompt, setPasswordPrompt] = useState({
        show: false,
        userId: null,
        action: '',
        enteredPassword: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/users');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (newUsername && newPassword) {
            try {
                const response = await fetch('http://localhost:5000/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username: newUsername, password: newPassword }),
                });

                if (response.ok) {
                    resetAddUserForm();
                    setMessage('User added successfully!');
                    fetchUsers(); // Re-fetch the users list to include the new user
                    setShowAddUserForm(false); // Hide the form after adding the user
                } else {
                    setMessage('Failed to add user.');
                }
            } catch (error) {
                console.error('Error adding user:', error);
            }
        } else {
            setMessage('Username and password are required.');
        }
    };

    const handleEditUser = (index) => {
        const user = users[index];
        setPasswordPrompt({ show: true, userId: user.id, action: 'edit' });
    };

    const handleSwitchUser = (index) => {
        const user = users[index];
        setPasswordPrompt({ show: true, userId: user.id, action: 'switch' });
    };

    const handlePasswordSubmit = async () => {
        const user = users.find((user) => user.id === passwordPrompt.userId);

        if (passwordPrompt.enteredPassword === user.password) {
            if (passwordPrompt.action === 'edit') {
                setEditUserIndex(users.findIndex((user) => user.id === passwordPrompt.userId));
                setEditUsername(user.username);
                setEditPassword(user.password);
                setPasswordPrompt({ show: false, userId: null, action: '', enteredPassword: '' });
            } else if (passwordPrompt.action === 'switch') {
                setMessage(`You have switched to ${user.username}`);
                setPasswordPrompt({ show: false, userId: null, action: '', enteredPassword: '' });
            }
        } else {
            setMessage('Incorrect password.');
            setPasswordPrompt({ ...passwordPrompt, enteredPassword: '' });
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (editUserIndex !== null) {
            const updatedUser = {
                username: editUsername,
                password: editPassword,
            };
            try {
                const response = await fetch(`http://localhost:5000/api/users/${users[editUserIndex].id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedUser),
                });

                if (response.ok) {
                    const newUserList = [...users];
                    newUserList[editUserIndex] = { ...newUserList[editUserIndex], ...updatedUser };
                    setUsers(newUserList);
                    resetEditUserForm();
                    setMessage(`User ${updatedUser.username} updated successfully!`);
                } else {
                    setMessage('Failed to update user.');
                }
            } catch (error) {
                console.error('Error updating user:', error);
            }
        }
    };

    const handleDeleteUser = async (index) => {
        const userId = users[index].id; // Get the user's ID from the users array

        // Reset message before each operation
        setMessage('');

        // Confirm with the user before proceeding
        if (window.confirm(`Are you sure you want to delete ${users[index].username}?`)) {
            try {
                const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    // Update the frontend list of users by removing the deleted user
                    setUsers((prevUsers) => prevUsers.filter((_, i) => i !== index));
                    setMessage('User deleted successfully!');
                } else {
                    // Handle failure in case the backend responds with a non-ok status
                    const errorData = await response.json();
                    setMessage(`Failed to delete user: ${errorData.message || 'Unknown error'}`);
                }
            } catch (error) {
                // Handle any network or request errors
                console.error('Error deleting user:', error);
                setMessage('An error occurred while deleting the user.');
            }
        }
    };

    const resetAddUserForm = () => {
        setNewUsername('');
        setNewPassword('');
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

            {/* Add User Button that toggles the form */}
            {!showAddUserForm && (
                <button onClick={() => setShowAddUserForm(true)}>Add User</button>
            )}

            {/* Add User Form */}
            {showAddUserForm && (
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
                    <button type="button" onClick={() => setShowAddUserForm(false)}>
                        Cancel
                    </button>
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
                                    <button onClick={() => handleEditUser(index)}>Edit</button>
                                    <button onClick={() => handleDeleteUser(index)}>Delete</button>
                                    <button onClick={() => handleSwitchUser(index)}>Switch User</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No users found.</p>
            )}

            {/* Password Prompt Modal */}
            {passwordPrompt.show && (
                <div className="password-prompt-modal">
                    <div className="password-prompt-content">
                        <h3>Enter password for {users.find((user) => user.id === passwordPrompt.userId)?.username}</h3>
                        <input 
                            type="password" 
                            value={passwordPrompt.enteredPassword} 
                            onChange={(e) => setPasswordPrompt({ ...passwordPrompt, enteredPassword: e.target.value })}
                            required 
                        />
                        <div>
                            <button onClick={handlePasswordSubmit}>Submit</button>
                            <button onClick={() => setPasswordPrompt({ show: false, userId: null, action: '', enteredPassword: '' })}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
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
                </form>
            )}
        </div>
    );
};

export default UserManagement;
