// src/pages/Categories.jsx

import React, { useState, useEffect } from "react";
import api from "../utils/axios";
import CategoryFormModal from "../components/CategoryFormModal";
import CategoryViewModal from "../components/CategoryViewModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";

import { FaEye, FaPencilAlt, FaTrash, FaTags, FaSortUp, FaSortDown } from "react-icons/fa";

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [categoryProducts, setCategoryProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    const fetchCategories = async () => {
        try {
            const response = await api.get("/categories", { withCredentials: true });
            setCategories(response.data);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            toast.error("Failed to fetch categories.");
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleViewCategory = async (categoryId) => {
        try {
            const response = await api.get(`/categories/${categoryId}`, { withCredentials: true });
            setSelectedCategory(response.data.category);
            setCategoryProducts(response.data.products);
            setShowViewModal(true);
        } catch (error) {
            console.error("Failed to fetch category details:", error);
            toast.error("Failed to load category details.");
        }
    };

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setShowModal(true);
    };

    const handleDelete = (category) => {
        setCategoryToDelete(category);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/categories/${categoryToDelete._id}`, { withCredentials: true });
            toast.success("Category deleted successfully!");
            fetchCategories();
        }
        // catch (error) {
        //     console.error("Delete failed:", error);
        //     toast.error("Failed to delete category.");
        // }
        catch (error) {
            if (error.response?.status === 403) {
                toast.error("You don't have permission to perform this action.");
            } else if (error.response?.status === 401) {
                toast.error("Your session has expired. Please log in again.");
            } else {
                toast.error(error.response?.data?.message || "Failed to delete category.");
            }
            console.error("Delete category failed:", error);
        }
        setShowDeleteModal(false);
    };

    const handleCreate = () => {
        setSelectedCategory(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        fetchCategories();
    };

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
            }
            return { key, direction: "asc" };
        });
    };

    // Filtered + Sorted
    const filteredCategories = categories.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedCategories = [...filteredCategories].sort((a, b) => {
        if (!sortConfig.key) return 0;
        const valueA = a[sortConfig.key] || "";
        const valueB = b[sortConfig.key] || "";

        if (typeof valueA === "string") {
            return sortConfig.direction === "asc"
                ? valueA.localeCompare(valueB)
                : valueB.localeCompare(valueA);
        }
        return 0;
    });

    // Pagination
    const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);
    const paginatedCategories = sortedCategories.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="container my-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div style={{ width: "300px" }}>
                    <h4 className="fw-bold text-dark mb-0">Category List</h4>
                </div>

                {/* Search Bar */}
                <div className="px-4" style={{ width: "400px" }}>
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Search category name..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // Reset page on search
                        }}
                    />
                </div>

                {/* Add Button */}
                <div className="d-flex justify-content-end" style={{ width: "300px" }}>
                    <button className="btn btn-primary btn-sm" onClick={handleCreate}>
                        + Add Category
                    </button>
                </div>
            </div>

            {/* Count Chip */}
            <div className="mb-3">
                <div
                    className="d-inline-flex align-items-center bg-light rounded px-3 py-2 shadow-sm border"
                    style={{ fontSize: "0.9rem" }}
                >
                    <FaTags className="text-primary me-2" />
                    <span className="fw-semibold text-dark me-1">{sortedCategories.length}</span>
                    <span className="text-muted">
                        Categor{sortedCategories.length === 1 ? "y" : "ies"}
                    </span>
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
                                    style={{ width: "40%", cursor: "pointer" }}
                                    onClick={() => handleSort("name")}
                                >
                                    Name{" "}
                                    {sortConfig.key === "name" &&
                                        (sortConfig.direction === "asc"
                                            ? <FaSortUp className="ms-1" />
                                            : <FaSortDown className="ms-1" />)}
                                </th>
                                <th style={{ width: "50%" }}>Description</th>
                                <th className="text-center pe-4" style={{ width: "10%" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedCategories.length > 0 ? (
                                paginatedCategories.map((category) => (
                                    <tr
                                        key={category._id}
                                        className="align-middle"
                                        style={{ height: "70px" }}
                                    >
                                        {/* Name */}
                                        <td className="fw-semibold ps-5 text-truncate" style={{ maxWidth: "200px" }}>
                                            {category.name}
                                        </td>

                                        {/* Description */}
                                        <td className="text-muted small text-truncate" style={{ maxWidth: "300px" }}>
                                            {category.description || "-"}
                                        </td>

                                        {/* Actions */}
                                        <td className="text-center">
                                            <div className="d-flex pe-4 justify-content-center gap-2">
                                                <button
                                                    className="btn btn-light btn-sm border"
                                                    title="View"
                                                    onClick={() => handleViewCategory(category._id)}
                                                >
                                                    <FaEye className="text-primary" />
                                                </button>
                                                <button
                                                    className="btn btn-light btn-sm border"
                                                    title="Edit"
                                                    onClick={() => handleEdit(category)}
                                                >
                                                    <FaPencilAlt className="text-warning" />
                                                </button>
                                                <button
                                                    className="btn btn-light btn-sm border"
                                                    title="Delete"
                                                    onClick={() => handleDelete(category)}
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
                                        No categories available
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
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage((p) => p - 1)}
                                >
                                    Prev
                                </button>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <li
                                    key={i}
                                    className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                >
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
                    <CategoryFormModal
                        show={showModal}
                        onClose={handleCloseModal}
                        category={selectedCategory}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {showViewModal && (
                    <CategoryViewModal
                        show={showViewModal}
                        onClose={() => setShowViewModal(false)}
                        category={selectedCategory}
                        products={categoryProducts}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {showDeleteModal && (
                    <ConfirmDeleteModal
                        show={showDeleteModal}
                        onClose={() => setShowDeleteModal(false)}
                        onConfirm={confirmDelete}
                        message={`Are you sure you want to delete the category "${categoryToDelete?.name}"?`}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Categories;
