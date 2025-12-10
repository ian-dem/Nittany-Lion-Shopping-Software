import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function RegisterSeller() {
    const navigate = useNavigate();
    const loggedInEmail = localStorage.getItem("userEmail");

    const [form, setForm] = useState({
        email: loggedInEmail || "",
        password: "",
        fname: "",
        lname: "",
        street_num: "",
        streetname: "",
        zipcode: "",
        city: "",
        state: "",
        business_id: ""
    });

    const [businessList, setBusinessList] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Load Businesses
    useEffect(() => {
        async function loadBusinesses() {
            try {
                const res = await axios.get("http://localhost:5000/business/list");
                setBusinessList(res.data.businesses || []);
            } catch (err) {
                console.error("Failed to load businesses:", err);
                setBusinessList([]);
            }
        }
        loadBusinesses();
    }, []);

    // Handle input changes + ZIP autofill
    const handleChange = async (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        // Autofill when zipcode hits length 5
        if (name === "zipcode" && value.length === 5) {
            try {
                const res = await axios.get(`http://localhost:5000/zipcode/lookup/${value}`);

                if (res.data?.success) {
                    setForm((prev) => ({
                        ...prev,
                        city: res.data.city,
                        state: res.data.state
                    }));
                } else {
                    setForm((prev) => ({
                        ...prev,
                        city: "",
                        state: ""
                    }));
                }
            } catch (err) {
                console.error("Zip lookup error:", err);
            }
        }
    };

    // Submit handler
    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!form.business_id) {
            setError("Please select a business.");
            return;
        }

        try {
            const endpoint = loggedInEmail
                ? "http://localhost:5000/users/upgradeToSeller"
                : "http://localhost:5000/users/registerSeller";

            const res = await axios.post(endpoint, form);

            if (res.data.success) {
                setSuccess(
                    loggedInEmail
                        ? "Your account has been upgraded to a Seller!"
                        : "Seller account created! You can now log in."
                );

                if (loggedInEmail) {
                    localStorage.setItem("userRole", "seller");
                    setTimeout(() => navigate("/seller"), 1500);
                } else {
                    setTimeout(() => navigate("/login"), 1500);
                }
            } else {
                setError(res.data.error || "Validation failed.");
            }
        } catch (err) {
            console.error(err);
            setError("Server error, please try again.");
        }
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>Register as Seller</h1>
                <p>Link your account to an existing business</p>
            </header>

            <main>
                <div className="login-container">
                    <form onSubmit={handleSubmit}>

                        {/* If user NOT logged in, require full account information */}
                        {!loggedInEmail && (
                            <>
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="Email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    name="password"
                                    type="password"
                                    placeholder="Password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    name="fname"
                                    type="text"
                                    placeholder="First Name"
                                    value={form.fname}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    name="lname"
                                    type="text"
                                    placeholder="Last Name"
                                    value={form.lname}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    name="street_num"
                                    type="number"
                                    placeholder="Street Number"
                                    value={form.street_num}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    name="streetname"
                                    type="text"
                                    placeholder="Street Name"
                                    value={form.streetname}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    name="zipcode"
                                    type="number"
                                    placeholder="Zipcode"
                                    value={form.zipcode}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    name="city"
                                    type="text"
                                    placeholder="City"
                                    value={form.city}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    name="state"
                                    type="text"
                                    placeholder="State"
                                    value={form.state}
                                    onChange={handleChange}
                                    required
                                />
                            </>
                        )}

                        {/* Business selection dropdown */}
                        <select
                            name="business_id"
                            value={form.business_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Business</option>
                            {businessList.map((b) => (
                                <option key={b.BusinessID} value={b.BusinessID}>
                                    {b.BusinessName} (ID: {b.BusinessID})
                                </option>
                            ))}
                        </select>

                        <button type="submit" className="button">
                            {loggedInEmail ? "Upgrade Account" : "Register Seller"}
                        </button>
                    </form>

                    {error && <p className="error">{error}</p>}
                    {success && <p style={{ color: "green" }}>{success}</p>}
                </div>
            </main>

            <footer className="App-footer">
                © {new Date().getFullYear()} Team Progress | Penn State
            </footer>
        </div>
    );
}
