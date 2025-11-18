// src/pages/Login.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthService from "../services/AuthService";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await AuthService.login({ username, password });
            toast.success("Login successful!", { autoClose: 3000 });

            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 1000);
        } catch (err) {
            console.error("Login error:", err);

            if (err.response) {
                // Axios error with response
                const status = err.response.status;
                const message = err.response.data?.message || "Login failed";

                switch (status) {
                    case 401:
                        toast.error(message, { autoClose: 3000 });
                        break;
                    case 500:
                        toast.error("Server error. Please try again later.", { autoClose: 3000 });
                        break;
                    default:
                        toast.error(message, { autoClose: 3000 });
                }
            } else {
                // Network or other error
                toast.error(err.message || "Login failed. Please try again.", { autoClose: 3000 });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow-sm p-4" style={{ width: "350px" }}>
                <h3 className="text-center mb-4">Aneka Perabot</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
                {/* <div className="mt-3 text-center">
                    <p className="mb-0">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-primary">
                            Register
                        </Link>
                    </p>
                </div> */}
            </div>
        </div>
    );
}

export default Login;
