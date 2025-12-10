import React from "react";
import "../App.css"; // for .button and .button-container styles


export default function Navigation({ setSection, cartCount = 0 }) {
    return (
        <div className="nav-container">
            <button className="button" onClick={() => setSection("orders")}>
                Orders
            </button>
            <button className="button" onClick={() => setSection("recommended")}>
                Recommended
            </button>
            <button className="button" onClick={() => setSection("cart")}>
                Cart ({cartCount})
            </button>
            <button className="button" onClick={() => setSection("account")}>
                Account
            </button>
            <button className="button" onClick={() => setSection("categories")}>
                Browse Categories
            </button>
        </div>
    );
}
