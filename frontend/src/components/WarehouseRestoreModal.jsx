// src/components/WarehouseRestoreModal.jsx

import React, { useEffect, useState } from "react";
import api from "../utils/axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrashRestore } from "react-icons/fa";
import ConfirmRestoreModal from "./ConfirmRestoreModal";

const WarehouseRestoreModal = ({ show, onClose }) => {
    const [deletedWarehouses, setDeletedWarehouses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [showConfirmRestore, setShowConfirmRestore] = useState(false);

    const fetchDeleted = async () => {
        try {
            setLoading(true);
            const res = await api.get("/warehouses/deleted", { withCredentials: true });
            setDeletedWarehouses(res.data);
        } catch (err) {
            toast.error("Failed to load deleted warehouses");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show) fetchDeleted();
    }, [show]);

    // Handle body scroll
    useEffect(() => {
        if (show) {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.classList.add("modal-open");
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        } else {
            document.body.classList.remove("modal-open");
            document.body.style.paddingRight = "";
        }

        return () => {
            document.body.classList.remove("modal-open");
            document.body.style.paddingRight = "";
        };
    }, [show]);

    const openConfirmRestore = (warehouse) => {
        setSelectedWarehouse(warehouse);
        setShowConfirmRestore(true);
    };

    const handleConfirmRestore = async () => {
        if (!selectedWarehouse) return;
        try {
            await api.put(`/warehouses/restore/${selectedWarehouse._id}`, {}, { withCredentials: true });
            toast.success("Warehouse restored successfully");
            fetchDeleted();
            setShowConfirmRestore(false);
        } catch (error) {
            if (error.response?.status === 403) {
                toast.error("You don't have permission to perform this action.");
            } else if (error.response?.status === 401) {
                toast.error("Your session has expired. Please log in again.");
            } else {
                toast.error(error.response?.data?.message || "Failed to restore warehouse.");
            }
            console.error("Restore warehouse failed:", error);
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
                style={{
                    width: "100%",
                    maxWidth: "600px",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content border-0 shadow-sm rounded overflow-hidden d-flex flex-column">

                    {/* Header */}
                    <div className="modal-header flex-column align-items-center bg-light border-0 pb-3">
                        <h5 className="modal-title fw-bold d-flex align-items-center">
                            <FaTrashRestore className="me-2 text-success" size={22} />
                            Restore Deleted Warehouses
                        </h5>
                        <button type="button" className="btn-close position-absolute end-0 top-0 mt-3 me-3" onClick={onClose}></button>
                    </div>

                    {/* Body */}
                    <div className="modal-body px-4 pb-4" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                        {loading ? (
                            <p className="text-muted text-center my-3">Loading deleted warehouses...</p>
                        ) : deletedWarehouses.length === 0 ? (
                            <p className="text-muted text-center my-3">No deleted warehouses available.</p>
                        ) : (
                            <ul className="list-group">
                                {deletedWarehouses.map((wh) => (
                                    <li
                                        key={wh._id}
                                        className="list-group-item d-flex justify-content-between align-items-center"
                                    >
                                        <span>
                                            {wh.name} - <em>{wh.location || "No location"}</em>
                                        </span>
                                        <button
                                            className="btn btn-sm btn-success"
                                            onClick={() => openConfirmRestore(wh)}
                                        >
                                            Restore
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="modal-footer border-0 pt-0 pb-4 px-4">
                        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {showConfirmRestore && (
                    <ConfirmRestoreModal
                        show={showConfirmRestore}
                        onClose={() => setShowConfirmRestore(false)}
                        onConfirm={handleConfirmRestore}
                        message={`Are you sure you want to restore "${selectedWarehouse?.name}"?`}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    ) : null;
};

export default WarehouseRestoreModal;
