// src/pages/Login.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthService from "../services/AuthService";
// import api from "../utils/axios";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await AuthService.login({ username, password });

            // Redirect to dashboard after login
            window.location.href = "/dashboard";
        } catch (err) {
            console.error("Login error:", err);
            setError(err.message || "Login failed. Please check your credentials.");
        }
    };

    return (
        <div className="container mt-5">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                        type="text"
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Login</button>
            </form>
            {/* <div className="mt-3">
                <p>
                    Don't have an account?{" "}
                    <Link to="/register" className="text-primary">
                        Register here
                    </Link>
                </p>
            </div> */}
        </div>
    );


    
}

export default Login;

// Old Login code, before using AuthService and axios instance

// const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     try {
//         const response = await api.post("/auth/login", {
//             username,
//             password,
//         });

//         console.log("Login success:", response.data);
//         window.location.href = "/dashboard";
//     } catch (err) {
//         console.error(err);
//         setError("Login failed. Please check your username or password.");
//     }
// };
