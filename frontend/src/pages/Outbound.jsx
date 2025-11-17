// src/pages/Outbound.jsx

import React, { useState, useEffect } from "react";
import api from "../utils/axios";
import OutboundFormModal from "../components/OutboundFormModal";
import OutboundViewModal from "../components/OutboundViewModal";
import ConfirmReverseModal from "../components/ConfirmReverseModal";

import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";

import {
    FaEye,
    FaUndo,
    FaBan,
    FaDolly,
    FaSortUp,
    FaSortDown
} from "react-icons/fa";

const Outbound = () => {
    const [outbounds, setOutbounds] = useState([]);
    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedOutbound, setSelectedOutbound] = useState(null);

    const [showReverseModal, setShowReverseModal] = useState(false);
    const [outboundToReverse, setOutboundToReverse] = useState(null);

    // Search, Sort, Pagination
    const [searchTerm, setSearchTerm] = useState("");
    // const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchOutbounds = async () => {
        try {
            const response = await api.get("/outbound", { withCredentials: true });
            setOutbounds(response.data);
        } catch (error) {
            console.error("Failed to fetch outbounds:", error);
            toast.error("Failed to fetch outbound records.");
        }
    };

    useEffect(() => {
        fetchOutbounds();
    }, []);

    const handleCreate = () => {
        setSelectedOutbound(null);
        setShowFormModal(true);
    };

    const handleView = (outbound) => {
        setSelectedOutbound(outbound);
    };

    const handleCloseModals = () => {
        setShowFormModal(false);
        setSelectedOutbound(null);
        fetchOutbounds();
    };

    const handleReverse = (outbound) => {
        setOutboundToReverse(outbound);
        setShowReverseModal(true);
    };

    const confirmReverse = async () => {
        try {
            await api.post(`/outbound/reverse/${outboundToReverse._id}`, {}, { withCredentials: true });
            toast.success("Outbound reversed successfully.");
            fetchOutbounds();
        }
        // catch (err) {
        //     console.error("Failed to reverse outbound:", err);
        //     toast.error(err.response?.data?.message || "Failed to reverse outbound.");
        // }
        catch (error) {
            if (error.response?.status === 403) {
                toast.error("You don't have permission to perform this action.");
            } else if (error.response?.status === 401) {
                toast.error("Your session has expired. Please log in again.");
            } else {
                toast.error(error.response?.data?.message || "Failed to reverse outbound.");
            }
            console.error("Reverse outbound failed:", error);
        }
        setShowReverseModal(false);
    };

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
            }
            return { key, direction: "asc" };
        });
    };

    // Filter + Sort
    const filteredOutbounds = outbounds.filter((outbound) => {
        const warehouseName = outbound.warehouse?.name?.toLowerCase() || "";
        const productNames = outbound.products.map((p) => p.product?.name?.toLowerCase()).join(", ");
        return (
            warehouseName.includes(searchTerm.toLowerCase()) ||
            productNames.includes(searchTerm.toLowerCase())
        );
    });

    const sortedOutbounds = [...filteredOutbounds].sort((a, b) => {
        if (!sortConfig.key) return 0;

        let valA, valB;
        if (sortConfig.key === "date") {
            valA = new Date(a.date);
            valB = new Date(b.date);
            return sortConfig.direction === "asc" ? valA - valB : valB - valA;
        } else if (sortConfig.key === "warehouse") {
            valA = a.warehouse?.name || "";
            valB = b.warehouse?.name || "";
            return sortConfig.direction === "asc"
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
        } else if (sortConfig.key === "total") {
            valA = a.total || 0;
            valB = b.total || 0;
            return sortConfig.direction === "asc" ? valA - valB : valB - valA;
        }

        return 0;
    });

    // Pagination
    const totalPages = Math.ceil(sortedOutbounds.length / itemsPerPage);
    const paginatedOutbounds = sortedOutbounds.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="container my-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div style={{ width: "300px" }}>
                    <h4 className="fw-bold text-dark mb-0">Outbound Shipment</h4>
                </div>

                {/* Search Bar */}
                <div className="px-4" style={{ width: "400px" }}>
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Search warehouse or product..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                {/* Button */}
                <div className="d-flex justify-content-end" style={{ width: "300px" }}>
                    <button className="btn btn-primary btn-sm" onClick={handleCreate}>
                        + Add Outbound
                    </button>
                </div>
            </div>

            {/* Count Chip */}
            <div className="mb-3">
                <div
                    className="d-inline-flex align-items-center bg-light rounded px-3 py-2 shadow-sm border"
                    style={{ fontSize: "0.9rem" }}
                >
                    <FaDolly className="text-primary me-2" />
                    <span className="fw-semibold text-dark me-1">{sortedOutbounds.length}</span>
                    <span className="text-muted">
                        Outbound{sortedOutbounds.length !== 1 && "s"}
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
                                    style={{ width: "25%", cursor: "pointer" }}
                                    onClick={() => handleSort("date")}
                                >
                                    Date{" "}
                                    {sortConfig.key === "date" &&
                                        (sortConfig.direction === "asc" ? <FaSortUp className="ms-1" /> : <FaSortDown className="ms-1" />)}
                                </th>
                                <th
                                    style={{ width: "20%", cursor: "pointer" }}
                                    onClick={() => handleSort("warehouse")}
                                >
                                    Warehouse{" "}
                                    {sortConfig.key === "warehouse" &&
                                        (sortConfig.direction === "asc" ? <FaSortUp className="ms-1" /> : <FaSortDown className="ms-1" />)}
                                </th>
                                <th style={{ width: "25%" }}>Products</th>

                                <th
                                    className="text-start"
                                    style={{ width: "20%", cursor: "pointer" }}
                                    onClick={() => handleSort("total")}
                                >
                                    Total Price{" "}
                                    {sortConfig.key === "total" &&
                                        (sortConfig.direction === "asc" ? <FaSortUp className="ms-1" /> : <FaSortDown className="ms-1" />)}
                                </th>
                                <th className="text-center" style={{ width: "10%" }}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedOutbounds.length > 0 ? (
                                paginatedOutbounds.map((outbound) => (
                                    <tr
                                        key={outbound._id}
                                        className={`align-middle ${outbound.reversed ? "bg-light" : ""}`}
                                        style={{
                                            height: "70px",
                                            opacity: outbound.reversed ? 0.85 : 1,
                                        }}
                                    >
                                        {/* Date with Reversed Badge */}
                                        <td className="text-muted small ps-5 text-truncate" style={{ maxWidth: "200px" }}>
                                            <div className="d-flex align-items-center gap-2">
                                                <span className={outbound.reversed ? "text-muted fst-italic" : ""}>
                                                    {outbound.date
                                                        ? new Date(outbound.date).toLocaleDateString("en-US", {
                                                            year: "numeric",
                                                            month: "2-digit",
                                                            day: "2-digit",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            hour12: true,
                                                        })
                                                        : "-"}
                                                </span>
                                                {outbound.reversed && (
                                                    <span className="badge bg-secondary small">Reversed</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Warehouse */}
                                        <td
                                            className={`fw-semibold text-truncate ${outbound.reversed ? "text-muted fst-italic" : ""}`}
                                            style={{ maxWidth: "200px" }}
                                        >
                                            {outbound.warehouse?.name || "-"}
                                        </td>

                                        {/* Products */}
                                        <td
                                            className={`text-muted small text-truncate ${outbound.reversed ? "fst-italic" : ""}`}
                                            style={{ maxWidth: "300px" }}
                                        >
                                            {outbound.products?.length > 0
                                                ? outbound.products.map((p) => p.product?.name || "-").join(", ")
                                                : "No Products"}
                                        </td>

                                        {/* Total */}
                                        <td
                                            className={`text-start fw-semibold text-truncate ${outbound.reversed ? "text-muted fst-italic" : ""}`}
                                            style={{ maxWidth: "150px" }}
                                        >
                                            {outbound.total !== undefined
                                                ? `Rp ${Number(outbound.total).toLocaleString()}`
                                                : "-"}
                                        </td>

                                        {/* Actions */}
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-2">
                                                <button
                                                    className="btn btn-light btn-sm border"
                                                    title="View"
                                                    onClick={() => handleView(outbound)}
                                                >
                                                    <FaEye className="text-primary" />
                                                </button>
                                                {!outbound.reversed ? (
                                                    <button
                                                        className="btn btn-light btn-sm border"
                                                        title="Reverse"
                                                        onClick={() => handleReverse(outbound)}
                                                    >
                                                        <FaUndo className="text-danger" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn btn-light btn-sm border disabled"
                                                        title="Already Reversed"
                                                    >
                                                        <FaBan className="text-muted" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center text-muted py-5">
                                        No outbounds available
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
                    <div className="text-muted small">Page {currentPage} of {totalPages}</div>
                    <nav>
                        <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                <button className="page-link" onClick={() => setCurrentPage((p) => p - 1)}>Prev</button>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
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
                {showFormModal && (
                    <OutboundFormModal
                        show={showFormModal}
                        onClose={handleCloseModals}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {selectedOutbound && (
                    <OutboundViewModal
                        show={!!selectedOutbound}
                        outbound={selectedOutbound}
                        onClose={handleCloseModals}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {showReverseModal && (
                    <ConfirmReverseModal
                        show={showReverseModal}
                        onClose={() => setShowReverseModal(false)}
                        onConfirm={confirmReverse}
                        message={`Are you sure you want to reverse this outbound from "${outboundToReverse?.warehouse?.name}"?`}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Outbound;
