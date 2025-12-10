import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function RegisterUser() {
    const [form, setForm] = useState({
        email: "",
        password: "",
        fname: "",
        lname: "",
        street_num: "",
        streetname: "",
        zipcode: "",
        city: "",
        state: ""
    });

    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = async (e) => {
        const { name, value } = e.target;

        // Always set form first
        setForm(prev => ({ ...prev, [name]: value }));

        // ZIPCODE AUTOFILL
        if (name === "zipcode" && value.length === 5) {
            console.log("Attempting ZIP lookup:", value);

            try {
                const res = await axios.get(
                    `http://localhost:5000/zipcode/lookup/${value}`
                );

                if (res.data.success) {
                    console.log("ZIP found:", res.data);
                    setForm(prev => ({
                        ...prev,
                        city: res.data.city,
                        state: res.data.state
                    }));
                } else {
                    console.log("ZIP not found");
                    setForm(prev => ({ ...prev, city: "", state: "" }));
                }
            } catch (err) {
                console.error("Zip lookup error:", err);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(
                "http://localhost:5000/users/registerUser",
                form
            );

            if (res.data.success) {
                alert("Account created! You can now log in.");
                navigate("/login");
            } else {
                setError(res.data.message || "Registration failed.");
            }
        } catch (err) {
            console.error(err);
            setError("Server error, please try again.");
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Nittany Business</h1>
                <p>User Registration</p>
            </header>

            <main>
                <div className="login-container">
                    <h2>Create Account</h2>

                    <form onSubmit={handleSubmit}>
                        <input name="email" type="email" placeholder="Email"
                            value={form.email} onChange={handleChange} required />

                        <input name="password" type="password" placeholder="Password"
                            value={form.password} onChange={handleChange} required />

                        <input name="fname" type="text" placeholder="First Name"
                            value={form.fname} onChange={handleChange} required />

                        <input name="lname" type="text" placeholder="Last Name"
                            value={form.lname} onChange={handleChange} required />

                        <input name="street_num" type="number" placeholder="Street Number"
                            value={form.street_num} onChange={handleChange} required />

                        <input name="streetname" type="text" placeholder="Street Name"
                            value={form.streetname} onChange={handleChange} required />

                        {/* IMPORTANT: zipcode must be text */}
                        <input
                            name="zipcode"
                            type="text"
                            placeholder="Zipcode"
                            maxLength={5}
                            value={form.zipcode}
                            onChange={handleChange}
                            required
                        />

                        <input name="city" type="text" placeholder="City"
                            value={form.city} onChange={handleChange} required />

                        <input name="state" type="text" placeholder="State"
                            value={form.state} onChange={handleChange} required />

                        <button type="submit" className="button">Register</button>
                    </form>

                    {error && <p className="error">{error}</p>}
                </div>
            </main>

            <footer className="App-footer">
                © {new Date().getFullYear()} Team Progress | Penn State
            </footer>
        </div>
    );
}
