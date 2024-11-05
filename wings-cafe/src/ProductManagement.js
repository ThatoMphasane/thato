import React, { useState } from 'react';

// Sample initial products data for demonstration
const initialProducts = [
    {
        id: '1',
        name: 'Product 1',
        price: 19.99,
        quantity: 10,
        category: 'Category 1',
        description: 'Description of product 1',
    },
    {
        id: '2',
        name: 'Product 2',
        price: 29.99,
        quantity: 5,
        category: 'Category 2',
        description: 'Description of product 2',
    },
];

const ProductManagement = ({ products, onUpdateProduct, onDeleteProduct }) => {
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        const price = parseFloat(formData.price);
        if (!formData.name || isNaN(price) || !formData.category || !formData.description) {
            setErrorMessage('All fields are required with valid price.');
            return;
        }

        const newProduct = {
            id: formData.id || (products.length + 1).toString(),
            ...formData,
            price: price,
        };

        if (editingIndex !== null) {
            onUpdateProduct(newProduct, editingIndex);
            setSuccessMessage('Product updated successfully!');
        } else {
            onUpdateProduct(newProduct);
            setSuccessMessage('New product added successfully!');
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

    const handleDelete = (index) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            onDeleteProduct(index);
            setSuccessMessage('Product deleted successfully!');
        }
    };

    const handleAddStock = (index) => {
        const additionalQuantity = parseInt(prompt("Enter the quantity to add:"));
        if (!isNaN(additionalQuantity) && additionalQuantity > 0) {
            const updatedProduct = { ...products[index], quantity: products[index].quantity + additionalQuantity };
            onUpdateProduct(updatedProduct, index);
            const newTransaction = { type: 'Add Stock', product: products[index].name, quantity: additionalQuantity, date: new Date().toLocaleString() };
            setTransactions((prevTransactions) => {
                const updatedTransactions = [...prevTransactions, newTransaction];
                localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
                return updatedTransactions;
            });
            setSuccessMessage('Stock added successfully!');
        } else {
            setErrorMessage('Invalid quantity entered.');
        }
    };

    const handleSell = (index) => {
        const sellQuantity = parseInt(prompt("Enter the quantity to sell:"));
        if (!isNaN(sellQuantity) && sellQuantity > 0) {
            if (sellQuantity <= products[index].quantity) {
                const updatedProduct = { ...products[index], quantity: products[index].quantity - sellQuantity };
                onUpdateProduct(updatedProduct, index);
                const newTransaction = { type: 'Sell', product: products[index].name, quantity: sellQuantity, date: new Date().toLocaleString() };
                setTransactions((prevTransactions) => {
                    const updatedTransactions = [...prevTransactions, newTransaction];
                    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
                    return updatedTransactions;
                });
                setSuccessMessage('Product sold successfully!');
            } else {
                setErrorMessage('Not enough stock available.');
            }
        } else {
            setErrorMessage('Invalid quantity entered.');
        }
    };

    const handleDeleteTransaction = (index) => {
        setTransactions((prevTransactions) => {
            const updatedTransactions = prevTransactions.filter((_, i) => i !== index);
            localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
            return updatedTransactions;
        });
    };

    return (
        <section>
            <h2>Product Management</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

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
                {/* Quantity input removed from editing */}
                {editingIndex === null && (
                    <input
                        type="number"
                        name="quantity"
                        placeholder="Quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        required
                        min="0"
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
                <input
                    type="text"
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                />
                <button type="submit">{editingIndex !== null ? "Update Product" : "Add Product"}</button>
            </form>

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
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product, index) => (
                        <tr key={index}>
                            <td>{product.name}</td>
                            <td>M{Number(product.price).toFixed(2)}</td>
                            <td>{product.quantity}</td>
                            <td>{product.category}</td>
                            <td>{product.description}</td>
                            <td>M{(product.price * product.quantity).toFixed(2)}</td>
                            <td>
                                <div style={{ display: 'flex', gap: '5px' }}> {/* Use flex to create a horizontal layout */}
                                    <button style={{ fontSize: '0.75em' }} onClick={() => handleEdit(index)}>Edit</button>
                                    <button style={{ fontSize: '0.75em' }} onClick={() => handleDelete(index)}>Delete</button>
                                    <button style={{ fontSize: '0.75em' }} onClick={() => handleAddStock(index)}>Add Stock</button>
                                    <button style={{ fontSize: '0.75em' }} onClick={() => handleSell(index)}>Sell</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h3>Transaction History</h3>
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
                                <button style={{ fontSize: '0.75em' }} onClick={() => handleDeleteTransaction(index)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
};

const App = () => {
    const [products, setProducts] = useState(() => {
        const savedProducts = localStorage.getItem('products');
        return savedProducts ? JSON.parse(savedProducts) : initialProducts;
    });

    const updateProduct = (updatedProduct, index) => {
        let newProducts;

        if (index !== undefined) {
            newProducts = [...products];
            newProducts[index] = updatedProduct;
        } else {
            newProducts = [...products, updatedProduct];
        }

        setProducts(newProducts);
        localStorage.setItem('products', JSON.stringify(newProducts));
    };

    const deleteProduct = (index) => {
        const newProducts = products.filter((_, i) => i !== index);
        setProducts(newProducts);
        localStorage.setItem('products', JSON.stringify(newProducts));
    };

    return (
        <ProductManagement
            products={products}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
        />
    );
};

export default App;
