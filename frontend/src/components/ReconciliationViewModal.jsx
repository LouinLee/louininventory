// src/components/ReconciliationViewModal.jsx

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { FaBalanceScale } from "react-icons/fa";

const ReconciliationViewModal = ({ show, onClose, reconciliation }) => {
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

    if (!show) return null;

    return (
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
                style={{ width: "100%", maxWidth: "800px" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="modal-content border-0 shadow-sm rounded"
                    style={{ display: "flex", flexDirection: "column", height: "100%" }}
                >
                    {/* Header */}
                    {/* <div className="modal-header flex-column align-items-center mb-0"> */}
                    <div className="modal-header flex-column align-items-center bg-light border-0 pb-3">
                        <h5 className="modal-title fw-bold d-flex align-items-center justify-content-center">
                            <FaBalanceScale className="me-3" size={25} />
                            <span
                                className="text-truncate"
                                style={{
                                    maxWidth: "500px",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    display: "inline-block",
                                }}
                                title={reconciliation.warehouse?.name || "Reconciliation"}
                            >
                                Reconciliation - {reconciliation.warehouse?.name || "Unknown"}
                            </span>
                        </h5>
                        <button
                            type="button"
                            className="btn-close position-absolute end-0 top-0 mt-3 me-3"
                            onClick={onClose}
                        ></button>
                    </div>

                    {/* Body */}
                    <div className="modal-body pt-0 px-4 pb-5 m-1" style={{ overflowY: "auto", flex: 1 }}>
                        {/* Info Cards */}
                        <div className="pt-4 pb-4 mb-4">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="bg-white border rounded shadow-sm p-3">
                                        <div className="text-muted small">Date</div>
                                        <div className="fs-6 fw-semibold text-dark">
                                            {reconciliation.date
                                                ? new Date(reconciliation.date).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "2-digit",
                                                    day: "2-digit",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                })
                                                : "-"}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="bg-white border rounded shadow-sm p-3">
                                        <div className="text-muted small">Warehouse</div>
                                        <div className="fs-6 fw-semibold text-dark">
                                            {reconciliation.warehouse?.name || "-"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Products Table */}
                        {reconciliation.products?.length > 0 ? (
                            <>
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="text-muted small border-bottom">
                                        <tr>
                                            <th style={{ width: "50%" }}>Product</th>
                                            <th style={{ width: "10%" }}>Quantity</th>
                                            <th style={{ width: "20%" }}>Buying Price</th>
                                            <th style={{ width: "20%" }}>Subtotal Loss</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reconciliation.products.map((item, index) => (
                                            <tr key={index}>
                                                <td className="text-truncate" style={{ maxWidth: "240px" }}>
                                                    {item.product?.name || "-"}
                                                </td>
                                                <td>{item.quantity}</td>
                                                <td>
                                                    {item.buyingPrice !== undefined
                                                        ? `Rp ${Number(item.buyingPrice).toLocaleString()}`
                                                        : "-"}
                                                </td>
                                                <td>
                                                    {item.subtotal !== undefined
                                                        ? `Rp ${Number(item.subtotal).toLocaleString()}`
                                                        : "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {/* Notes (light line) */}
                                <div className="pt-5 ps-2">
                                    <span className="text-muted small me-2">Notes:</span>
                                    <span className="fw-semibold">
                                        {reconciliation.notes ? reconciliation.notes : "-"}
                                    </span>
                                </div>

                                {/* Total Loss Card */}
                                <div className="pt-4 mt-4">
                                    <div className="bg-white border rounded shadow-sm p-3 text-end">
                                        <div className="text-muted small">Total Loss</div>
                                        <div className="fs-5 fw-semibold text-dark">
                                            {reconciliation.totalLoss !== undefined
                                                ? `Rp ${Number(reconciliation.totalLoss).toLocaleString()}`
                                                : "-"}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-muted">No products found for this reconciliation.</p>
                        )}

                    </div>

                    {/* Footer */}
                    <div className="modal-footer border-0 pt-0 p-4 m-1">
                        <button className="btn btn-outline-secondary m-0 btn-sm" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ReconciliationViewModal;
