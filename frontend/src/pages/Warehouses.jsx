// src/pages/Warehouses.jsx

import React, { useState, useEffect } from "react";
import api from "../utils/axios";
import WarehouseFormModal from "../components/WarehouseFormModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import WarehouseInventoryModal from "../components/WarehouseInventoryModal";
import WarehouseRestoreModal from "../components/WarehouseRestoreModal";

import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";

import { FaEye, FaPencilAlt, FaTrash, FaWarehouse, FaSortUp, FaSortDown } from "react-icons/fa";

const Warehouses = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [warehouseToDelete, setWarehouseToDelete] = useState(null);
    const [showInventoryModal, setShowInventoryModal] = useState(false);
    const [warehouseToView, setWarehouseToView] = useState(null);
    const [showRestoreModal, setShowRestoreModal] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    const fetchWarehouses = async () => {
        try {
            const response = await api.get("/warehouses", { withCredentials: true });
            setWarehouses(response.data);
        } catch (error) {
            console.error("Failed to fetch warehouses:", error);
            toast.error("Failed to fetch warehouses.");
        }
    };

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const handleEdit = (warehouse) => {
        setSelectedWarehouse(warehouse);
        setShowModal(true);
    };

    const handleDelete = (warehouse) => {
        setWarehouseToDelete(warehouse);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/warehouses/${warehouseToDelete._id}`, { withCredentials: true });
            toast.success("Warehouse deleted successfully!");
            fetchWarehouses();
        }
        // catch (error) {
        //     console.error("Delete failed:", error);
        //     toast.error(error.response?.data?.message || "Failed to delete warehouse.");
        // }
        catch (error) {
            if (error.response?.status === 403) {
                toast.error("You don't have permission to perform this action.");
            } else if (error.response?.status === 401) {
                toast.error("Your session has expired. Please log in again.");
            } else {
                toast.error(error.response?.data?.message || "Failed to delete warehouse.");
            }
            console.error("Delete warehouse failed:", error);
        }
        setShowDeleteModal(false);
    };

    const handleCreate = () => {
        setSelectedWarehouse(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        fetchWarehouses();
    };

    const handleViewInventory = (warehouse) => {
        setWarehouseToView(warehouse);
        setShowInventoryModal(true);
    };

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
            }
            return { key, direction: "asc" };
        });
        setCurrentPage(1);
    };

    // Filter + Sort
    const filteredWarehouses = warehouses.filter((w) =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedWarehouses = [...filteredWarehouses].sort((a, b) => {
        if (!sortConfig.key) return 0;
        const valueA = a[sortConfig.key] || "";
        const valueB = b[sortConfig.key] || "";
        return sortConfig.direction === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
    });

    // Pagination
    const totalPages = Math.ceil(sortedWarehouses.length / itemsPerPage);
    const paginatedWarehouses = sortedWarehouses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="container my-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div style={{ width: "300px" }}>
                    <h4 className="fw-bold text-dark mb-0">Warehouse</h4>
                </div>

                {/* Search */}
                <div className="px-4" style={{ width: "400px" }}>
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Search warehouse..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                {/* Buttons */}
                <div className="d-flex gap-2 justify-content-end" style={{ width: "300px" }}>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowRestoreModal(true)}>
                        Show Deleted
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={handleCreate}>
                        + Add Warehouse
                    </button>
                </div>
            </div>

            {/* Count Chip */}
            <div className="mb-3">
                <div
                    className="d-inline-flex align-items-center bg-light rounded px-3 py-2 shadow-sm border"
                    style={{ fontSize: "0.9rem" }}
                >
                    <FaWarehouse className="text-primary me-2" />
                    <span className="fw-semibold text-dark me-1">{sortedWarehouses.length}</span>
                    <span className="text-muted">
                        Warehous{sortedWarehouses.length === 1 ? "e" : "es"}
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
                                    style={{ width: "50%", cursor: "pointer" }}
                                    onClick={() => handleSort("name")}
                                >
                                    Name{" "}
                                    {sortConfig.key === "name" &&
                                        (sortConfig.direction === "asc"
                                            ? <FaSortUp className="ms-1" />
                                            : <FaSortDown className="ms-1" />)}
                                </th>
                                <th style={{ width: "40%" }}>Location</th>
                                <th className="text-center pe-4" style={{ width: "10%" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedWarehouses.length > 0 ? (
                                paginatedWarehouses.map((wh) => (
                                    <tr
                                        key={wh._id}
                                        className="align-middle"
                                        style={{ height: "70px" }}
                                    >
                                        {/* Name */}
                                        <td className="fw-semibold ps-5 text-truncate" style={{ maxWidth: "200px" }}>
                                            {wh.name}
                                        </td>

                                        {/* Location */}
                                        <td className="text-muted small text-truncate" style={{ maxWidth: "300px" }}>
                                            {wh.location || "-"}
                                        </td>

                                        {/* Actions */}
                                        <td className="text-center">
                                            <div className="d-flex pe-4 justify-content-center gap-2">
                                                <button
                                                    className="btn btn-light btn-sm border"
                                                    title="View Inventory"
                                                    onClick={() => handleViewInventory(wh)}
                                                >
                                                    <FaEye className="text-primary" />
                                                </button>
                                                <button
                                                    className="btn btn-light btn-sm border"
                                                    title="Edit"
                                                    onClick={() => handleEdit(wh)}
                                                >
                                                    <FaPencilAlt className="text-warning" />
                                                </button>
                                                <button
                                                    className="btn btn-light btn-sm border"
                                                    title="Delete"
                                                    onClick={() => handleDelete(wh)}
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
                                        No warehouses available
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
                                <button className="page-link" onClick={() => setCurrentPage((p) => p - 1)}>Prev</button>
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
                                <button className="page-link" onClick={() => setCurrentPage((p) => p + 1)}>Next</button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}

            {/* Modals */}
            <AnimatePresence>
                {showModal && (
                    <WarehouseFormModal
                        show={showModal}
                        onClose={handleCloseModal}
                        warehouse={selectedWarehouse}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {showDeleteModal && (
                    <ConfirmDeleteModal
                        show={showDeleteModal}
                        onClose={() => setShowDeleteModal(false)}
                        onConfirm={confirmDelete}
                        message={`Are you sure you want to delete "${warehouseToDelete?.name}"?`}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {showInventoryModal && warehouseToView && (
                    <WarehouseInventoryModal
                        show={showInventoryModal}
                        onClose={() => setShowInventoryModal(false)}
                        warehouse={warehouseToView}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {showRestoreModal && (
                    <WarehouseRestoreModal
                        show={showRestoreModal}
                        onClose={() => {
                            setShowRestoreModal(false);
                            fetchWarehouses();
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Warehouses;
