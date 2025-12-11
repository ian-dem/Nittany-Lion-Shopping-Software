import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import CreateTicket from "../components/CreateTicket";
import CreateListing from "../components/CreateListing";
import EditListing from "../components/EditListing";
import DashboardSwitcher from "../components/DashboardSwitch";
import "../App.css";

export default function SellerDashboard() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [showTicketForm, setShowTicketForm] = useState(false);
    const [showListingForm, setShowListingForm] = useState(false);
    const [editingListing, setEditingListing] = useState(null);
    const [categoryList, setCategoryList] = useState([]);
    const [businessID, setBusinessID] = useState(null);
    const userEmail = localStorage.getItem("userEmail");

    useEffect(() => {
        const checkAccess = async () => {
            const email = localStorage.getItem("userEmail");
            if (!email) {
                navigate("/noselleraccess");
                return;
            }
            try {
                const res = await fetch(`http://localhost:5000/users/role/${email}`);
                const data = await res.json();
                if (data.role !== "seller" && data.role !== "helpdesk") navigate("/noaccess");
            } catch {
                navigate("/noaccess");
            }
        };
        checkAccess();
    }, [navigate]);

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                if (userEmail) {
                    const bRes = await fetch(`http://localhost:5000/sellers/${userEmail}`);
                    const bData = await bRes.json();
                    if (bData.BusinessID) {
                        setBusinessID(bData.BusinessID);
                        localStorage.setItem("businessID", bData.BusinessID);
                    }
                    const catRes = await fetch("http://localhost:5000/category/categories");
                    const catData = await catRes.json();
                    setCategoryList(catData || []);
                }
            } catch (err) {
                console.error("Init fetch error:", err);
            }
        };
        fetchInfo();
    }, [userEmail]);
        useEffect(() => {
        const fetchData = async () => {
            try {
                const prodRes = await fetch(`http://localhost:5000/products/seller/${userEmail}`);
                const productData = await prodRes.json();
                setProducts(productData);
                const orderRes = await fetch(`http://localhost:5000/orders/seller/${userEmail}`);
                const orderData = await orderRes.json();
                setOrders(orderData);
            } catch (err) {
                console.error("Error fetching:", err);
            }
        };
        if (userEmail) fetchData();
    }, [userEmail]);

    function handleLogout() {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/");
    }

    async function handleDelete(id) {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            const res = await fetch(`http://localhost:5000/products/delete/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert("Listing deleted successfully!");
                setProducts((prev) => prev.filter((p) => p.ProductID !== id));
            } else alert(data.error || "Failed to delete listing.");
        } catch (err) {
            alert("Server error — try again later.");
        }
    }

    return (
        <div className="App">
            <header className="App-header">Seller Dashboard</header>
            <main>
                <div className="seller-content">
                    <section className="product-list">
                        <h2>Your Listings</h2>
                        {products.length > 0 ? (
                            products.map((p) => (
                                <div key={p.ProductID || p.id} className="product-card">
                                    <h3>{p.Name}</h3>
                                    <p>${p.Price} | Qty: {p.Quantity}</p>
                                    <div>
                                        <button className="button" onClick={() => setEditingListing(p)}>Edit</button>
                                        <button
                                            className="button"
                                            style={{ backgroundColor: "#b30000" }}
                                            onClick={() => handleDelete(p.ProductID)}
                                        >Delete</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No products listed yet.</p>
                        )}
                    </section>
                    <section className="order-history">
                                                <h2>Order History</h2>
                        {orders.length > 0 ? (
                            [...orders].reverse().map((o) => (
                                <div key={o.OrderID || o.id} className="order-card">
                                    <p>
                                         <strong>{o.ProductName}</strong> — bought by {o.BuyerEmail}
                                    </p>
                                    <p>Quantity: {o.Quantity}</p>
                                    <p>Total: ${o.TransactionTotal?.toFixed(2)}</p>
                                    <p>Status: {o.OrderStatus}</p>
                                    {o.DateCreated && (
                                        <p>Date: {new Date(o.DateCreated).toLocaleString()}</p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>No orders yet.</p>
                        )}
                    </section>
                </div>
                <div className="tooltip" style={{ position: "fixed", bottom: "180px", right: "20px" }}>
                    <button
                        className="button"
                        style={{ borderRadius: "50%", width: "60px", height: "60px", fontSize: "1.5em" }}
                        onClick={() => setShowListingForm(true)}
                    >+</button>
                    <span className="tooltip-text">Create New Listing</span>
                </div>
                <Modal show={showListingForm} onClose={() => setShowListingForm(false)}>
                    <CreateListing
                        categories={categoryList}
                        businessID={businessID}
                        onSubmit={(newListing) => {
                            setProducts((prev) => [...prev, newListing]);
                            setShowListingForm(false);
                            window.location.reload();
                        }}
                    />
                </Modal>
            </main>
            <div className="tooltip" style={{ position: "fixed", bottom: "20px", right: "20px" }}>
                <button
                    className="button"
                    style={{ borderRadius: "50%", width: "60px", height: "60px", fontSize: "1.5em" }}
                    onClick={() => setShowTicketForm(true)}
                >?</button>
                <span className="tooltip-text">Contact Helpdesk</span>
            </div>
            <Modal show={showTicketForm} onClose={() => setShowTicketForm(false)}>
                <CreateTicket
                    sellerEmail={userEmail}
                    businessID={businessID}
                    onSubmit={() => setShowTicketForm(false)}
                />
            </Modal>
            <Modal show={!!editingListing} onClose={() => setEditingListing(null)}>
                {editingListing && (
                    <EditListing
                        listing={editingListing}
                                                onSubmit={(updated) => {
                            setEditingListing(null);
                        }}
                    />
                )}
            </Modal>
            <div className="tooltip tooltip-left" style={{ position: "fixed", bottom: "20px", left: "20px" }}>
                <button
                    className="button"
                    style={{
                        borderRadius: "50%",
                        width: "60px",
                        height: "60px",
                        fontSize: "1.3em",
                        backgroundColor: "#b30000",
                    }}
                    onClick={handleLogout}
                >↩</button>
                <span className="tooltip-text">Sign Out</span>
            </div>
            <DashboardSwitcher />
        </div>
    );
}
