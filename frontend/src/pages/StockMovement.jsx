// src/pages/StockMovement.jsx
import React, { useEffect, useState } from "react";
import api from "../utils/axios";
import { toast } from "react-toastify";
import StockMovementFormModal from "../components/StockMovementFormModal";
import ConfirmReverseModal from "../components/ConfirmReverseModal";
import StockMovementViewModal from "../components/StockMovementViewModal";

import { AnimatePresence, motion } from "framer-motion";
import { FaEye, FaUndo, FaExchangeAlt, FaSortUp, FaSortDown, FaBan } from "react-icons/fa";

const StockMovement = () => {
    const [movements, setMovements] = useState([]);
    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedMovement, setSelectedMovement] = useState(null);
    const [showReverseModal, setShowReverseModal] = useState(false);
    const [movementToReverse, setMovementToReverse] = useState(null);

    // Search, sort, pagination
    const [searchTerm, setSearchTerm] = useState("");
    // const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchMovements = async () => {
        try {
            const response = await api.get("/stock-movement", { withCredentials: true });
            setMovements(response.data);
        } catch (err) {
            toast.error("Failed to load stock movement records.");
            console.error(err);
        }
    };

    useEffect(() => {
        fetchMovements();
    }, []);

    const handleReverse = (movement) => {
        setMovementToReverse(movement);
        setShowReverseModal(true);
    };

    const handleView = (movement) => {
        setSelectedMovement(movement);
    };

    const confirmReverse = async () => {
        try {
            await api.post(`/stock-movement/reverse/${movementToReverse._id}`, {}, { withCredentials: true });
            toast.success("Stock movement reversed successfully.");
            fetchMovements();
        }
        // catch (err) {
        //     toast.error(err.response?.data?.message || "Failed to reverse movement.");
        //     console.error(err);
        // }
        catch (error) {
            if (error.response?.status === 403) {
                toast.error("You don't have permission to perform this action.");
            } else if (error.response?.status === 401) {
                toast.error("Your session has expired. Please log in again.");
            } else {
                toast.error(error.response?.data?.message || "Failed to reverse movement.");
            }
            console.error("Reverse movement failed:", error);
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
    const filteredMovements = movements.filter((m) => {
        const from = m.fromWarehouse?.name?.toLowerCase() || "";
        const to = m.toWarehouse?.name?.toLowerCase() || "";
        const products = m.products.map((p) => p.product?.name?.toLowerCase()).join(", ");
        return (
            from.includes(searchTerm.toLowerCase()) ||
            to.includes(searchTerm.toLowerCase()) ||
            products.includes(searchTerm.toLowerCase())
        );
    });

    const sortedMovements = [...filteredMovements].sort((a, b) => {
        if (!sortConfig.key) return 0;
        let valA, valB;

        switch (sortConfig.key) {
            case "date":
                valA = new Date(a.date);
                valB = new Date(b.date);
                return sortConfig.direction === "asc" ? valA - valB : valB - valA;
            case "from":
                valA = a.fromWarehouse?.name || "";
                valB = b.fromWarehouse?.name || "";
                return sortConfig.direction === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
            case "to":
                valA = a.toWarehouse?.name || "";
                valB = b.toWarehouse?.name || "";
                return sortConfig.direction === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
            default:
                return 0;
        }
    });

    // Pagination
    const totalPages = Math.ceil(sortedMovements.length / itemsPerPage);
    const paginatedMovements = sortedMovements.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="container my-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div style={{ width: "300px" }}>
                    <h4 className="fw-bold text-dark mb-0">Stock Movement</h4>
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
                    <button className="btn btn-primary btn-sm" onClick={() => setShowFormModal(true)}>
                        + Move Stock
                    </button>
                </div>
            </div>

            {/* Count Chip */}
            <div className="mb-3">
                <div
                    className="d-inline-flex align-items-center bg-light rounded px-3 py-2 shadow-sm border"
                    style={{ fontSize: "0.9rem" }}
                >
                    <FaExchangeAlt className="text-primary me-2" />
                    <span className="fw-semibold text-dark me-1">{sortedMovements.length}</span>
                    <span className="text-muted">
                        Movement{sortedMovements.length !== 1 && "s"}
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
                                    onClick={() => handleSort("from")}
                                >
                                    From{" "}
                                    {sortConfig.key === "from" &&
                                        (sortConfig.direction === "asc" ? <FaSortUp className="ms-1" /> : <FaSortDown className="ms-1" />)}
                                </th>
                                <th
                                    style={{ width: "20%", cursor: "pointer" }}
                                    onClick={() => handleSort("to")}
                                >
                                    To{" "}
                                    {sortConfig.key === "to" &&
                                        (sortConfig.direction === "asc" ? <FaSortUp className="ms-1" /> : <FaSortDown className="ms-1" />)}
                                </th>
                                <th style={{ width: "25%" }}>Products</th>
                                <th className="text-center" style={{ width: "10%" }}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedMovements.length > 0 ? (
                                paginatedMovements.map((move) => (
                                    <tr
                                        key={move._id}
                                        className={`align-middle ${move.reversed ? "bg-light" : ""}`}
                                        style={{
                                            height: "70px",
                                            opacity: move.reversed ? 0.85 : 1,
                                        }}
                                    >
                                        {/* Date with Reversed Badge */}
                                        <td className="text-muted small ps-5 text-truncate" style={{ maxWidth: "200px" }}>
                                            <div className="d-flex align-items-center gap-2">
                                                <span
                                                    className={`text-truncate ${move.reversed ? "text-muted fst-italic" : ""}`}
                                                    style={{ maxWidth: "180px" }}
                                                >
                                                    {move.date
                                                        ? new Date(move.date).toLocaleDateString("en-US", {
                                                            year: "numeric",
                                                            month: "2-digit",
                                                            day: "2-digit",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            hour12: true,
                                                        })
                                                        : "-"}
                                                </span>
                                                {move.reversed && <span className="badge bg-secondary small">Reversed</span>}
                                            </div>
                                        </td>

                                        {/* From */}
                                        <td
                                            className={`fw-semibold text-truncate ${move.reversed ? "text-muted fst-italic" : ""}`}
                                            style={{ maxWidth: "200px" }}
                                        >
                                            {move.fromWarehouse?.name || "-"}
                                        </td>

                                        {/* To */}
                                        <td
                                            className={`fw-semibold text-truncate ${move.reversed ? "text-muted fst-italic" : ""}`}
                                            style={{ maxWidth: "200px" }}
                                        >
                                            {move.toWarehouse?.name || "-"}
                                        </td>

                                        {/* Products */}
                                        <td
                                            className={`text-muted small text-truncate ${move.reversed ? "fst-italic" : ""}`}
                                            style={{ maxWidth: "400px" }}
                                        >
                                            {move.products.map((p) => `${p.product?.name} (${p.quantity})`).join(", ") || "-"}
                                        </td>

                                        {/* Actions */}
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-2">
                                                <button
                                                    className="btn btn-light btn-sm border"
                                                    title="View"
                                                    onClick={() => handleView(move)}
                                                >
                                                    <FaEye className="text-primary" />
                                                </button>
                                                {!move.reversed ? (
                                                    <button
                                                        className="btn btn-light btn-sm border"
                                                        title="Reverse"
                                                        onClick={() => handleReverse(move)}
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
                                        No stock movements available
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
                                    <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
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
                    <StockMovementFormModal
                        show={showFormModal}
                        onClose={() => {
                            setShowFormModal(false);
                            fetchMovements();
                        }}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {selectedMovement && (
                    <StockMovementViewModal
                        show={!!selectedMovement}
                        stockMovement={selectedMovement}
                        onClose={() => setSelectedMovement(null)}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {showReverseModal && (
                    <ConfirmReverseModal
                        show={showReverseModal}
                        onClose={() => setShowReverseModal(false)}
                        onConfirm={confirmReverse}
                        message={`Are you sure you want to reverse this stock movement from "${movementToReverse?.fromWarehouse?.name}" to "${movementToReverse?.toWarehouse?.name}"?`}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default StockMovement;
