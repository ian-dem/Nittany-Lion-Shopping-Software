import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("http://localhost:5000/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            // Handle non-200 errors (fetch doesn’t throw automatically)
            if (!res.ok) {
                setError(data.message || "Invalid email or password.");
                return;
            }

            // Successful login
            localStorage.setItem("userToken", data.token);
            localStorage.setItem("userEmail", email);
            localStorage.setItem("userRole", data.role);

            // Redirect based on role
            if (data.role === "helpdesk") navigate("/helpdesk");
            else if (data.role === "seller") navigate("/seller");
            else if (data.role === "buyer") navigate("/buyer");
            else setError("Unrecognized role.");
        } catch (err) {
            console.error("Login error:", err);
            setError("Server error. Please try again.");
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Nittany Business</h1>
                <p>User Login Page</p>
            </header>

            <main>
                <div className="login-container">
                    <h2>Sign In</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button type="submit" className="button">Login</button>
                    </form>

                    {error && <p className="error">{error}</p>}

                    <div className="register-link">
                        <p>New user? <span onClick={() => navigate("/registerUser")}>Register here</span></p>
                    </div>
                </div>
            </main>

            <footer className="App-footer">
                © {new Date().getFullYear()} Team Progress | Penn State
            </footer>
        </div>
    );
}
