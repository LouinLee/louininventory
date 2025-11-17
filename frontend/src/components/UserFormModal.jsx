// src/components/UserFormModal.jsx

import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaUserShield } from "react-icons/fa";
import Select from "react-select";

const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "purchasing", label: "Purchasing" },
    { value: "sales", label: "Sales" },
];

const UserFormModal = ({ show, onClose, user }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState(roleOptions[2]); // default: sales

    useEffect(() => {
        if (user) {
            setUsername(user.username || "");
            setRole(roleOptions.find((r) => r.value === user.role) || roleOptions[2]);
            setPassword(""); // don’t prefill password
        } else {
            setUsername("");
            setPassword("");
            setRole(roleOptions[2]);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            username,
            role: role.value,
            ...(password && { password }), // only include password if set
        };

        try {
            if (user) {
                // update
                await axios.put(`/users/${user._id}`, payload, { withCredentials: true });
                toast.success("User updated successfully");
            } else {
                // create
                await axios.post("/users", payload, { withCredentials: true });
                toast.success("User created successfully");
            }
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to save user");
        }
    };

    return show ? (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="modal d-block"
            style={{
                backgroundColor: "rgba(0,0,0,0.5)",
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1050,
                overflowY: "auto",
                padding: "3rem",
                display: "flex",
                justifyContent: "center",
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="modal-dialog"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content border-0 shadow-sm rounded">
                    <form onSubmit={handleSubmit}>
                        {/* Header */}
                        <div className="modal-header flex-column align-items-center bg-light border-0 pb-3">
                            <h5 className="modal-title fw-bold d-flex align-items-center justify-content-center">
                                <FaUserShield className="me-3" size={25} />
                                {user ? "Edit User" : "Add User"}
                            </h5>
                            <button
                                type="button"
                                className="btn-close position-absolute end-0 top-0 mt-3 me-3"
                                onClick={onClose}
                            ></button>
                        </div>

                        {/* Body */}
                        <div className="modal-body px-4 py-3">
                            <div className="mb-3">
                                <label className="form-label fw-bold text-muted small mb-2">Username</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>

                            {!user && (
                                <div className="mb-3">
                                    <label className="form-label fw-bold text-muted small mb-2">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="Enter password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            {user && (
                                <div className="mb-3">
                                    <label className="form-label fw-bold text-muted small mb-2">
                                        Reset Password (optional)
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="Leave blank to keep current password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="mb-3">
                                <label className="form-label fw-bold text-muted small mb-2">Role</label>
                                <Select
                                    options={roleOptions}
                                    value={role}
                                    onChange={(selectedOption) => setRole(selectedOption)}
                                    placeholder="Select role"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer border-0 px-3 py-3 m-1">
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary btn-sm">
                                {user ? "Update" : "Create"}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    ) : null;
};

export default UserFormModal;
