import React, { useState, useEffect } from "react";

export default function EditListing({ listing, onSubmit }) {
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        quantity: "",
        category: "",
    });

    useEffect(() => {
        if (listing) {
            setForm({
                name: listing.Name || listing.name || "",
                description: listing.Description || listing.description || "",
                price: listing.Price || listing.price || "",
                quantity: listing.Quantity || listing.quantity || "",
                category:
                    listing.CategoryName ||
                    listing.category ||
                    listing.Category ||
                    `Category ID: ${listing.CategoryID || "N/A"}`,
            });
        }
    }, [listing]);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const res = await fetch(
                `http://localhost:5000/products/update/${listing.ProductID}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: form.name,
                        description: form.description,
                        price: form.price,
                        quantity: form.quantity,
                    }),
                }
            );
            const data = await res.json();
            if (res.ok && data.success) {
                alert("Listing updated successfully!");
                onSubmit(form);
                window.location.reload();
            } else {
                alert(data.error || "Failed to update listing.");
            }
        } catch (err) {
            console.error("Edit listing error:", err);
            alert("Server error — please try again later.");
        }
    }

    return (
                <div>
            <h2>Edit Product Listing</h2>
            <form onSubmit={handleSubmit}>
                <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    required
                />
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    style={{ minHeight: "80px" }}
                />
                <input
                    type="text"
                    name="category"
                    value={form.category}
                    readOnly
                    style={{
                        backgroundColor: "#fefefe",
                        border: "2px solid #b30000",
                        color: "#333",
                    }}
                />
                <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    required
                />
                <input
                    name="quantity"
                    type="number"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                />
                <button type="submit" className="button">
                    Save Changes
                </button>
            </form>
        </div>
    );
}
