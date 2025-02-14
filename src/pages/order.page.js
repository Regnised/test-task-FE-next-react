"use client";

import { useState, useEffect } from "react";

export default function OrderPage() {
  const apiUrl = 'https://orders-managment-test-38e61b2e2912.herokuapp.com'; 
//   const apiUrl = 'http://localhost:3001/'; 
  const [formData, setFormData] = useState({ name: "", email: "", productId: "", quantity: 1 });
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [token, setToken] = useState(null);

  useEffect(() => {
    fetchProducts();
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const fetchOrders = async () => {
    try {
        const tokenLocalStorage = localStorage.getItem("access_token");
        const tokenSelect = token || tokenLocalStorage;
      const response = await fetch(apiUrl + "/orders/me", {
        headers: { Authorization: `Bearer ${tokenSelect}` },
      });
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      console.log(data);
      
      setOrders(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(apiUrl + "/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();

      const products = data.map(i => ({...i, price: i.price['$numberDecimal']}))
      
      setProducts(products);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(apiUrl + "/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Order failed");
      console.log(data);
      
      localStorage.setItem("acces_token", data.token);
      setToken(data.token);
      fetchOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Create Order</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="mb-4">
        <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="border p-2 block w-full" />
        <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="border p-2 block w-full mt-2" />
        <input type="text" placeholder="Product ID" value={formData.productId} onChange={(e) => setFormData({ ...formData, productId: e.target.value })} required className="border p-2 block w-full mt-2" />
        <input type="number" placeholder="Quantity" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required className="border p-2 block w-full mt-2" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 mt-2">Submit Order</button>
      </form>
      <h2 className="text-xl font-bold mb-4">Available Products</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id} className="border p-2 mb-2">Product ID: {product._id} - {product.name} - Price: {product.price} - Stock: {product.stock}</li>
        ))}
      </ul>
      <h2 className="text-xl font-bold mb-4">Your Orders</h2>
      <ul>
        {orders.map((order) => (
          <li key={order.id} className="border p-2 mb-2">Product: {order.productId} - Quantity: {order.quantity} - Total: {parseFloat(order.totalPrice.$numberDecimal)}</li>
        ))}
      </ul>
    </div>
  );
}
