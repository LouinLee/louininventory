import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../utils/axios";

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post("/auth/register", { username, password });
            toast.success("Admin registered successfully!", { autoClose: 3000 });

            setTimeout(() => {
                navigate("/login");
            }, 1000);
        } catch (err) {
            console.error("Registration error:", err);

            if (err.response) {
                const status = err.response.status;
                const message = err.response.data?.message || "Registration failed";

                switch (status) {
                    case 400:
                        toast.error("Username already exists. Choose another.", { autoClose: 3000 });
                        break;
                    case 500:
                        toast.error("Server error. Please try again later.", { autoClose: 3000 });
                        break;
                    default:
                        toast.error(message, { autoClose: 3000 });
                }
            } else {
                toast.error(err.message || "Registration failed. Please try again.", { autoClose: 3000 });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow-sm p-4" style={{ width: "350px" }}>
                <h3 className="text-center mb-4">Register (Admin)</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
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
                            placeholder="Enter password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>
                <div className="mt-3 text-center">
                    <p className="mb-0">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
