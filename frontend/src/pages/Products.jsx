// src/pages/Products.jsx

import React, { useState, useEffect } from "react";
import api from "../utils/axios";
import ProductFormModal from "../components/ProductFormModal";
import ProductDetailModal from "../components/ProductDetailModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import ProductRestoreModal from "../components/ProductRestoreModal";
import ProductImageModal from "../components/ProductImageModal";
import { toast } from "react-toastify";
import formatCurrency from "../utils/formatCurrency";
import { AnimatePresence, motion } from "framer-motion";

import { FaEye, FaPencilAlt, FaTrash, FaSortUp, FaSortDown, FaBoxOpen, FaBoxes } from "react-icons/fa";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [showRestoreModal, setShowRestoreModal] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Adjust rows per page here

    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const fetchProducts = async () => {
        try {
            const response = await api.get("/products", { withCredentials: true });
            setProducts(response.data);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            toast.error("Failed to fetch products.");
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleViewDetails = (productId) => {
        setSelectedProduct(productId);
        setShowDetailModal(true);
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    const handleDelete = (product) => {
        setProductToDelete(product);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/products/${productToDelete._id}`, { withCredentials: true });
            toast.success("Product deleted successfully!");
            fetchProducts();
        }
        // catch (error) {
        //     console.error("Delete failed:", error);
        //     toast.error(error.response?.data?.message || "Failed to delete product.");
        // }
        catch (error) {
            if (error.response?.status === 403) {
                toast.error("You don't have permission to perform this action.");
            } else if (error.response?.status === 401) {
                toast.error("Your session has expired. Please log in again.");
            } else {
                toast.error(error.response?.data?.message || "Failed to delete product.");
            }
            console.error("Delete product failed:", error);
        }
        setShowDeleteModal(false);
    };

    const handleCreate = () => {
        setSelectedProduct(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        fetchProducts();
    };

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                // Toggle direction
                return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
            } else {
                // Default to ascending
                return { key, direction: "asc" };
            }
        });
    };

    const sortedProducts = [...products]
        .filter((p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
            if (typeof valueA === "number") {
                return sortConfig.direction === "asc" ? valueA - valueB : valueB - valueA;
            }
            return 0;
        });

    const paginatedProducts = sortedProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

    return (
        <div className="container my-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                {/* Left: Title */}
                <div style={{ width: "300px" }}>
                    <h4 className="fw-bold text-dark mb-0">Product List</h4>
                </div>

                {/* Middle: Search Bar */}
                <div className="px-4" style={{ width: "400px" }}>
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Search product name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Right: Buttons */}
                <div className="d-flex gap-2 justify-content-end" style={{ width: "300px" }}>
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setShowRestoreModal(true)}
                    >
                        Show Deleted
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={handleCreate}>
                        + Add Product
                    </button>
                </div>
            </div>

            {/* Product Count */}
            <div className="mb-3">
                <div
                    className="d-inline-flex align-items-center bg-light rounded px-3 py-2 shadow-sm border"
                    style={{ fontSize: "0.9rem" }}
                >
                    <FaBoxes className="text-primary me-2" />
                    <span className="fw-semibold text-dark me-1">
                        {sortedProducts.length}
                    </span>
                    <span className="text-muted">
                        Product{sortedProducts.length !== 1 && "s"}
                    </span>
                </div>
            </div>

            {/* Product Table in a card */}
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
                                {/* <th className="text-center" style={{ width: "10%" }}>Image</th> */}
                                <th
                                    className="ps-5"
                                    style={{ width: "55%", cursor: "pointer" }}
                                    onClick={() => handleSort("name")}
                                >
                                    Name{" "}
                                    {sortConfig.key === "name" &&
                                        (sortConfig.direction === "asc"
                                            ? <FaSortUp className="ms-1" />
                                            : <FaSortDown className="ms-1" />)}
                                </th>
                                {/* <th style={{ width: "20%" }}>Description</th> */}
                                <th
                                    className="text-start"
                                    style={{ width: "15%", cursor: "pointer" }}
                                    onClick={() => handleSort("price")}
                                >
                                    Price{" "}
                                    {sortConfig.key === "price" &&
                                        (sortConfig.direction === "asc"
                                            ? <FaSortUp className="ms-1" />
                                            : <FaSortDown className="ms-1" />)}
                                </th>
                                <th style={{ width: "15%" }}>Category</th>
                                <th className="text-center pe-4" style={{ width: "10%" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedProducts.length > 0 ? (
                                paginatedProducts.map((product) => (
                                    <tr key={product._id} className="align-middle" style={{ height: "70px" }}>
                                        {/* Image */}
                                        {/* <td className="text-center">
                                            <div
                                                className="d-flex justify-content-center align-items-center rounded shadow-sm"
                                                style={{
                                                    width: "50px",
                                                    height: "50px",
                                                    margin: "auto",
                                                    overflow: "hidden",
                                                    backgroundColor: product.image ? "transparent" : "#f8f9fa",
                                                    border: product.image ? "none" : "1px solid #dee2e6",
                                                }}
                                                onClick={() => {
                                                    if (product.image) {
                                                        setSelectedImage(`http://localhost:5000${product.image}`);
                                                        setShowImageModal(true);
                                                    }
                                                }}
                                            >
                                                {product.image ? (
                                                    <img
                                                        src={`http://localhost:5000${product.image}`}
                                                        alt={product.name}
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="text-secondary small">None</span>
                                                )}
                                            </div>
                                        </td> */}

                                        {/* Name */}
                                        <td className="fw-semibold ps-5 text-truncate" style={{ maxWidth: "150px" }}>
                                            {product.name}
                                        </td>

                                        {/* Description */}
                                        {/* <td className="text-muted small text-truncate" style={{ maxWidth: "200px" }}>
                                            {product.description || "-"}
                                        </td> */}

                                        {/* Price */}
                                        <td className="text-start fw-semibold text-truncate" style={{ maxWidth: "100px" }}>
                                            {formatCurrency(product.price)}
                                        </td>

                                        {/* Category */}
                                        <td className="text-muted text-truncate" style={{ maxWidth: "120px" }}>
                                            {product.category?.name || "-"}
                                        </td>

                                        {/* Actions */}
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center pe-4 gap-2">
                                                <button
                                                    className="btn btn-light btn-sm border"
                                                    title="View"
                                                    onClick={() => handleViewDetails(product._id)}
                                                >
                                                    <FaEye className="text-primary" />
                                                </button>
                                                <button
                                                    className="btn btn-light btn-sm border"
                                                    title="Edit"
                                                    onClick={() => handleEdit(product)}
                                                >
                                                    <FaPencilAlt className="text-warning" />
                                                </button>
                                                <button
                                                    className="btn btn-light btn-sm border"
                                                    title="Delete"
                                                    onClick={() => handleDelete(product)}
                                                >
                                                    <FaTrash className="text-danger" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted py-5">
                                        No products available
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </div>
            </motion.div>
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
                                <li
                                    key={i}
                                    className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                                >
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
                    <ProductFormModal
                        show={showModal}
                        onClose={handleCloseModal}
                        product={selectedProduct}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showDetailModal && (
                    <ProductDetailModal
                        show={showDetailModal}
                        onClose={() => setShowDetailModal(false)}
                        productId={selectedProduct}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showDeleteModal && (
                    <ConfirmDeleteModal
                        show={showDeleteModal}
                        onClose={() => setShowDeleteModal(false)}
                        onConfirm={confirmDelete}
                        message={`Are you sure you want to delete "${productToDelete?.name}"?`}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showRestoreModal && (
                    <ProductRestoreModal
                        show={showRestoreModal}
                        onClose={() => {
                            setShowRestoreModal(false);
                            fetchProducts();
                        }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showImageModal && (
                    <ProductImageModal
                        show={showImageModal}
                        onClose={() => setShowImageModal(false)}
                        imageSrc={selectedImage}
                        alt={selectedProduct?.name}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Products;
