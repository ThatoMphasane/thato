
import React, { useState, useEffect, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProductManagement = () => {
    const apiBaseURL = 'http://localhost:5000/api/products'; // Ensure this is correct
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        price: '',
        quantity: '',
        category: '',
        description: '',
    });
    const [editingIndex, setEditingIndex] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [transactions, setTransactions] = useState(() => {
        const savedTransactions = localStorage.getItem('transactions');
        return savedTransactions ? JSON.parse(savedTransactions) : [];
    });

    // Fetch products from the API when the component mounts
    const fetchProducts = useCallback(async (retries = 3) => {
        try {
            const response = await fetch(apiBaseURL);
            if (!response.ok) {
                throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            if (retries > 0) {
                console.warn(`Retrying... remaining attempts: ${retries}. Error: ${error.message}`);
                fetchProducts(retries - 1);
            } else {
                handleError(error, 'fetching products');
            }
        }
    }, [apiBaseURL]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
        // Reset error and success messages when form data changes
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        const price = parseFloat(formData.price);
        if (!formData.name || isNaN(price) || !formData.category || !formData.description || 
            (editingIndex === null && !formData.quantity)) {
            setErrorMessage('All fields are required with valid price and quantity.');
            return;
        }

        try {
            let response;
            const productData = { ...formData, price };

            if (editingIndex !== null) {
                // Update existing product
                response = await fetch(`${apiBaseURL}/${formData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData),
                });
            } else {
                // Add new product
                response = await fetch(apiBaseURL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData),
                });
            }

            if (!response.ok) {
                throw new Error(`Failed to process request: ${response.status} ${response.statusText}`);
            }

            const processedProduct = await response.json();
            if (editingIndex !== null) {
                setProducts((prevProducts) => {
                    const updatedProducts = [...prevProducts];
                    updatedProducts[editingIndex] = processedProduct;
                    return updatedProducts;
                });
                setSuccessMessage('Product updated successfully!');
            } else {
                setProducts((prevProducts) => [...prevProducts, processedProduct]);
                setSuccessMessage('New product added successfully!');
            }
        } catch (error) {
            handleError(error, editingIndex !== null ? 'updating product' : 'adding product');
        }

        resetForm();
    };

    const resetForm = () => {
        setFormData({ id: '', name: '', price: '', quantity: '', category: '', description: '' });
        setEditingIndex(null);
    };

    const handleEdit = (index) => {
        const productToEdit = products[index];
        setEditingIndex(index);
        setFormData(productToEdit);
    };

    const handleDelete = async (index) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await fetch(`${apiBaseURL}/${products[index].id}`, {
                    method: 'DELETE',
                });
                setProducts((prevProducts) => prevProducts.filter((_, i) => i !== index));
                setSuccessMessage('Product deleted successfully!');
            } catch (error) {
                handleError(error, 'deleting product');
            }
        }
    };

    const handleDeleteTransaction = (index) => {
        const updatedTransactions = transactions.filter((_, i) => i !== index);
        setTransactions(updatedTransactions);
        localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    };

    const handleTransaction = (product, quantity) => {
        const newTransaction = {
            type: 'sale',
            product: product.name,
            quantity,
            date: new Date().toLocaleString(),
        };

        const updatedTransactions = [...transactions, newTransaction];
        setTransactions(updatedTransactions);
        localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    };

    const handleSell = (index) => {
        const product = products[index];
        const quantityToSell = parseInt(prompt("Enter quantity to sell:"));
    
        // Validate the entered quantity
        if (quantityToSell > 0 && quantityToSell <= product.quantity) {
            // Log the sale in transaction history (this would require a separate function or API call)
            handleTransaction(product, quantityToSell);
    
            // Update the product's quantity in the products list and in the backend
            setProducts((prevProducts) => {
                const updatedProducts = prevProducts.map((item, i) =>
                    i === index
                        ? { ...item, quantity: item.quantity - quantityToSell } // Update quantity
                        : item
                );
                
                // After updating local state, update the backend to keep the data synchronized
                const updatedProduct = updatedProducts[index];
                fetch(`http://localhost:5000/api/products/${updatedProduct.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...updatedProduct, // Send the updated product object
                        quantity: updatedProduct.quantity, // Ensure the quantity is correctly updated
                    }),
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Product updated in the database:', data);
                    // If the update was successful, return the updated products array
                    return updatedProducts;
                })
                .catch((error) => {
                    console.error('Error updating product in database:', error);
                    // Handle errors if needed, you could show an error message to the user
                });
    
                return updatedProducts; // Return the updated local product list
            });
        } else {
            alert("Invalid quantity entered. Please try again.");
        }
    };
    

    const handleAdd = (index) => {
        const product = products[index];
        const quantityToAdd = parseInt(prompt("Enter quantity to Add:"));
    
        // Validate the entered quantity
        if (quantityToAdd > 0) {
            // Log the addition in transaction history
            handleTransaction(product, quantityToAdd);
    
            // Update the product's quantity in the products list
            setProducts((prevProducts) => {
                return prevProducts.map((item, i) =>
                    i === index
                        ? { ...item, quantity: item.quantity + quantityToAdd } // Correctly add quantity
                        : item
                );
            });
    
            // Optionally, send the update to the backend
            fetch(`/api/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: product.quantity + quantityToAdd }), // New quantity
            })
            .then((response) => response.json())
            .then((data) => console.log('Stock added:', data))
            .catch((error) => console.error('Error updating stock:', error));
        } else {
            alert("Please enter a valid quantity to add.");
        }
    };
    
    const handleError = (error, context) => {
        let message = error.message.includes('NetworkError')
            ? 'Network error. Please check your internet connection and ensure the API server is running.'
            : error.message;

        console.error(`Error in ${context}:`, error);
        setErrorMessage(message);
    };

    // Prepare data for the stock level graph
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

    const graphOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
            },
            tooltip: {
                enabled: true,
            },
        },
    };

    return (
        <section>
            <h2>Product Management</h2>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

            <form onSubmit={handleSubmit}>
                <h3>{editingIndex !== null ? "Edit Product" : "Add Product"}</h3>
                <input
                    type="text"
                    name="name"
                    placeholder="Product Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                />
                {editingIndex === null && (
                    <input
                        type="number"
                        name="quantity"
                        placeholder="Quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        required
                    />
                )}
                <input
                    type="text"
                    name="category"
                    placeholder="Category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                />
                <textarea
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                ></textarea>
                <button type="submit">{editingIndex !== null ? 'Update Product' : 'Add Product'}</button>
            </form>

            <h3>Products List</h3>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product, index) => (
                        <tr key={index}>
                            <td>{product.name}</td>
                            <td>{product.price}</td>
                            <td>{product.quantity}</td>
                            <td>{product.category}</td>
                            <td>{product.description}</td>
                            <td>
                                <button onClick={() => handleEdit(index)}>Edit</button>
                                <button onClick={() => handleDelete(index)}>Delete</button>
                                <button onClick={() => handleSell(index)}>Sell</button>
                                <button onClick={() => handleAdd(index)}>Add Stock</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h3>Transactions</h3>
            <table>
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction, index) => (
                        <tr key={index}>
                            <td>{transaction.type}</td>
                            <td>{transaction.product}</td>
                            <td>{transaction.quantity}</td>
                            <td>{transaction.date}</td>
                            <td>
                                <button onClick={() => handleDeleteTransaction(index)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h3>Stock Level Graph</h3>
            <Bar data={graphData} options={graphOptions} />
        </section>
    );
};

export default ProductManagement;
