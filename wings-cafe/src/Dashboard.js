import React, { useState } from 'react';

const Dashboard = ({ products }) => {
    const [selectedCategory, setSelectedCategory] = useState('');

    // Extracts unique categories from the products
    const categories = [...new Set(products.map((product) => product.category))]; // Unique categories

    // Filters products based on the selected category
    const filteredProducts = selectedCategory ? products.filter((product) => product.category === selectedCategory) : products;

    // Calculates the total cost of filtered products
    const totalCost = filteredProducts.reduce((sum, product) => sum + product.price * product.quantity, 0).toFixed(2);
    const lowStockProducts = filteredProducts.filter((product) => product.quantity < 10); // Identify low stock products

    return (
        <div>
            <h2>Product Dashboard</h2>

            <h4>Filter by Category</h4>
            <label htmlFor="category-filter">Select Category:</label>
            <select id="category-filter" onChange={(e) => setSelectedCategory(e.target.value)} value={selectedCategory}>
                <option value="">All Categories</option>
                {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                ))}
            </select>

            <h3>Total Cost of Available Stock: M{totalCost}</h3>

            <h3>Product List</h3>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Total Cost</th> {/* Added Total Cost column */}
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <tr key={product.id}>  {/* Ensure product.id is unique */}
                                <td>{product.name}</td>
                                <td>M{parseFloat(product.price).toFixed(2)}</td>
                                <td>{product.quantity}</td>
                                <td>{product.category}</td>
                                <td>{product.description}</td>
                                <td>M{(product.price * product.quantity).toFixed(2)}</td> {/* Calculate Total Cost */}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center' }}>No products available.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {lowStockProducts.length > 0 && (
                <div className="alert alert-warning">
                    <strong>Low Stock Alert!</strong>
                    <ul>
                        {lowStockProducts.map((product) => (
                            <li key={product.id}>{product.name} (Quantity: {product.quantity})</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Dashboard;