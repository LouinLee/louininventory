// src/pages/Users.jsx
import React, { useState, useEffect } from "react";
import api from "../utils/axios";
import UserFormModal from "../components/UserFormModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { FaEye, FaPencilAlt, FaTrash, FaSortUp, FaSortDown, FaUser, FaUsers, FaUsersSlash } from "react-icons/fa";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchUsers = async () => {
        try {
            const response = await api.get("/users", { withCredentials: true });
            setUsers(response.data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            toast.error("Failed to fetch users.");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEdit = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleDelete = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/users/${userToDelete._id}`, { withCredentials: true });
            toast.success("User deleted successfully!");
            fetchUsers();
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error(error.response?.data?.error || "Failed to delete user.");
        }
        setShowDeleteModal(false);
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        fetchUsers();
    };

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
            } else {
                return { key, direction: "asc" };
            }
        });
    };

    const sortedUsers = [...users]
        .filter((u) =>
            u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.role.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (!sortConfig.key) return 0;
            const valueA = a[sortConfig.key];
            const valueB = b[sortConfig.key];

            if (typeof valueA === "string") {
                return sortConfig.direction === "asc"
                    ? valueA.localeCompare(valueB)
                    : valueB.localeCompare(valueA);
            }
            return 0;
        });

    const paginatedUsers = sortedUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

    return (
        <div className="container my-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div style={{ width: "300px" }}>
                    <h4 className="fw-bold text-dark mb-0">User Management</h4>
                </div>

                <div className="px-4" style={{ width: "400px" }}>
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Search username or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="d-flex gap-2 justify-content-end" style={{ width: "300px" }}>
                    <button className="btn btn-primary btn-sm" onClick={handleCreate}>
                        + Add User
                    </button>
                </div>
            </div>

            {/* Count */}
            <div className="mb-3">
                <div className="d-inline-flex align-items-center bg-light rounded px-3 py-2 shadow-sm border" style={{ fontSize: "0.9rem" }}>
                    <FaUsers className="text-primary me-2" />
                    <span className="fw-semibold text-dark me-1">{sortedUsers.length}</span>
                    <span className="text-muted">User{sortedUsers.length !== 1 && "s"}</span>
                </div>
            </div>

            {/* Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white border rounded-3 shadow-sm overflow-hidden"
            >
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="text-muted small bg-light">
                            <tr>
                                <th
                                    className="ps-5"
                                    style={{ width: "50%", cursor: "pointer" }}
                                    onClick={() => handleSort("username")}
                                >
                                    Username{" "}
                                    {sortConfig.key === "username" &&
                                        (sortConfig.direction === "asc"
                                            ? <FaSortUp className="ms-1" />
                                            : <FaSortDown className="ms-1" />)}
                                </th>
                                <th
                                    style={{ width: "40%", cursor: "pointer" }}
                                    onClick={() => handleSort("role")}
                                >
                                    Role{" "}
                                    {sortConfig.key === "role" &&
                                        (sortConfig.direction === "asc"
                                            ? <FaSortUp className="ms-1" />
                                            : <FaSortDown className="ms-1" />)}
                                </th>
                                <th className="text-center pe-4" style={{ width: "10%" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.length > 0 ? (
                                paginatedUsers.map((user) => (
                                    <tr key={user._id} className="align-middle" style={{ height: "60px" }}>
                                        <td className="fw-semibold ps-5 text-truncate">{user.username}</td>
                                        <td>
                                            <span className={`badge bg-${user.role === "admin"
                                                ? "danger"
                                                : user.role === "sales"
                                                    ? "success"
                                                    : "warning"}-subtle text-dark`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center pe-4 gap-2">
                                                <button
                                                    className="btn btn-light btn-sm border"
                                                    title="Edit"
                                                    onClick={() => handleEdit(user)}
                                                >
                                                    <FaPencilAlt className="text-warning" />
                                                </button>
                                                <button
                                                    className="btn btn-light btn-sm border"
                                                    title="Delete"
                                                    onClick={() => handleDelete(user)}
                                                >
                                                    <FaTrash className="text-danger" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center text-muted py-5">
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <div className="text-muted small">
                        Page {currentPage} of {totalPages}
                    </div>
                    <nav>
                        <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                <button className="page-link" onClick={() => setCurrentPage((p) => p - 1)}>
                                    Prev
                                </button>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                                        {i + 1}
                                    </button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                <button className="page-link" onClick={() => setCurrentPage((p) => p + 1)}>
                                    Next
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}

            {/* Modals */}
            <AnimatePresence>
                {showModal && (
                    <UserFormModal
                        show={showModal}
                        onClose={handleCloseModal}
                        user={selectedUser}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showDeleteModal && (
                    <ConfirmDeleteModal
                        show={showDeleteModal}
                        onClose={() => setShowDeleteModal(false)}
                        onConfirm={confirmDelete}
                        message={`Are you sure you want to delete user "${userToDelete?.username}"?`}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Users;
