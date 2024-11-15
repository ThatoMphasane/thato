import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './image.css';

import image1 from './image1.jpg';
import image2 from './image2.jpg';
import image3 from './image3.jpg';
import image4 from './image4.jpg';
// Import additional images at the top of your file
import image5 from './image5.jpg';
import image6 from './image6.jpg';
import image7 from './image7.jpg';
import image8 from './image8.jpg';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/products');
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, []);

    const categories = [...new Set(products.map((product) => product.category))];
    const filteredProducts = selectedCategory ? products.filter((product) => product.category === selectedCategory) : products;
    const totalCost = filteredProducts.reduce((sum, product) => sum + product.price * product.quantity, 0).toFixed(2);
    const lowStockProducts = filteredProducts.filter((product) => product.quantity < 10);

    const graphData = {
        labels: products.map(product => product.name),
        datasets: [
            {
                label: 'Stock Level',
                data: products.map(product => product.quantity),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="dashboard-container">
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
                        <th>Total Cost</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <tr key={product.id}> 
                                <td>{product.name}</td>
                                <td>M{parseFloat(product.price).toFixed(2)}</td>
                                <td>{product.quantity}</td>
                                <td>{product.category}</td>
                                <td>{product.description}</td>
                                <td>M{(product.price * product.quantity).toFixed(2)}</td>
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

            <h3>Product Stock Levels</h3>
            <Bar data={graphData} options={{ responsive: true }} />

            {/* Moving images positioned below the graph */}
            <div className="moving-images">
               <img src={image1} className="moving-image" alt="Image 1" />
               <img src={image2} className="moving-image" alt="Image 2" />
               <img src={image3} className="moving-image" alt="Image 3" />
               <img src={image4} className="moving-image" alt="Image 4" />
               <img src={image5} className="moving-image" alt="Image 5" />
               <img src={image6} className="moving-image" alt="Image 6" />
               <img src={image7} className="moving-image" alt="Image 7" />
               <img src={image8} className="moving-image" alt="Image 8" />
            </div>
        </div>
    );
};

export default Dashboard;
