const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection pool configuration
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', // Replace with your MySQL user
    password: 'Taittmndell210702', // Replace with your MySQL password
    database: 'my_database', // Replace with your database name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Test MySQL connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1); // Exit the process if the DB connection fails
    }
    if (connection) connection.release();
    console.log('Connected to the database.');
});

// API Routes

// Get all products
app.get('/api/products', (req, res) => {
    pool.query('SELECT * FROM products', (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            return res.status(500).json({ error: 'Error fetching products' });
        }
        res.json(results);
    });
});

// Get all users
app.get('/api/users', (req, res) => {
    pool.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error('Error fetching Users:', err);
            return res.status(500).json({ error: 'Error fetching users' });
        }
        res.json(results);
    });
});

// Add new product
app.post('/api/products', (req, res) => {
    const { name, price, quantity, category, description } = req.body;
    if (!name || !price || !quantity || !category || !description) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    pool.query(
        'INSERT INTO products (name, price, quantity, category, description) VALUES (?, ?, ?, ?, ?)',
        [name, price, quantity, category, description],
        (err, results) => {
            if (err) {
                console.error('Error adding product:', err);
                return res.status(500).json({ error: 'Error adding product' });
            }
            res.status(201).json({ id: results.insertId, name, price, quantity, category, description });
        }
    );
});

// Add new user
app.post('/api/users', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    pool.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, password],
        (err, results) => {
            if (err) {
                console.error('Error adding user:', err);
                return res.status(500).json({ error: 'Error adding user' });
            }
            res.status(201).json({ message: 'User added successfully' });
        }
    );
});

// Update product
app.put('/api/products/:id', (req, res) => {
    const { name, price, quantity, category, description } = req.body;
    const productId = req.params.id;

    if (!name || !price || !quantity || !category || !description) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    pool.query(
        'UPDATE products SET name = ?, price = ?, quantity = ?, category = ?, description = ? WHERE id = ?',
        [name, price, quantity, category, description, productId],
        (err, results) => {
            if (err) {
                console.error('Error updating product:', err);
                return res.status(500).json({ error: 'Error updating product' });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.json({ id: productId, name, price, quantity, category, description });
        }
    );
});

// Add stock

app.put('/api/products/:id', (req, res) => {
    const { quantity } = req.body;
    const productId = req.params.id;

    if (quantity == null) {
        return res.status(400).json({ error: 'Quantity field is required' });
    }

    pool.query(
        'UPDATE products SET quantity = ? WHERE id = ?',
        [quantity, productId], // Use productId in query
        (err, results) => {
            if (err) {
                console.error('Error updating stock:', err);
                return res.status(500).json({ error: 'Error updating stock' });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.json({ id: productId, newQuantity: quantity });
        }
    );
});



// Delete product
app.delete('/api/products/:id', (req, res) => {
    const productId = req.params.id;

    pool.query('DELETE FROM products WHERE id = ?', [productId], (err, results) => {
        if (err) {
            console.error('Error deleting product:', err);
            return res.status(500).json({ error: 'Error deleting product' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    });
});

// Update user
app.put('/api/users/:id', (req, res) => {
    const { username, password } = req.body;
    const userId = req.params.id;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    pool.query(
        'UPDATE users SET username = ?, password = ? WHERE id = ?',
        [username, password, userId],
        (err, results) => {
            if (err) {
                console.error('Error updating user:', err);
                return res.status(500).json({ error: 'Error updating user' });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json({ id: userId, username, password });
        }
    );
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
    const userId = req.params.id;

    pool.query('DELETE FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json({ error: 'Error deleting user' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    });
});

// Default route (optional)
app.get('/', (req, res) => {
    res.send('Product and User Management API');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Cleanup MySQL pool on app shutdown
process.on('SIGINT', () => {
    pool.end((err) => {
        if (err) {
            console.error('Error during pool cleanup', err);
        }
        console.log('MySQL pool closed.');
        process.exit(0);
    });
});
