// src/components/OutboundViewModal.jsx

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { FaTruckMoving } from "react-icons/fa";

const OutboundViewModal = ({ show, onClose, outbound }) => {
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

    const formatCurrency = (value) =>
        value !== undefined ? `Rp ${Number(value).toLocaleString()}` : "-";

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
                style={{ width: "100%", maxWidth: "900px" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="modal-content border-0 shadow-sm rounded"
                    style={{ display: "flex", flexDirection: "column", height: "100%" }}
                >
                    {/* Header */}
                    <div className="modal-header flex-column align-items-center bg-light border-0 pb-3">
                        <h5 className="modal-title fw-bold d-flex align-items-center justify-content-center">
                            <FaTruckMoving className="me-3" size={25} />
                            <span
                                className="text-truncate"
                                style={{
                                    maxWidth: "500px",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    display: "inline-block",
                                }}
                                title={outbound.warehouse?.name || "Outbound"}
                            >
                                Outbound Details - {outbound.warehouse?.name || "Unknown"}
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
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="bg-white border rounded shadow-sm p-3">
                                        <div className="text-muted small">Date</div>
                                        <div className="fs-6 fw-semibold text-dark text-truncate" style={{ maxWidth: "300px" }}>
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
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="bg-white border rounded shadow-sm p-3">
                                        <div className="text-muted small">Warehouse</div>
                                        <div className="fs-6 fw-semibold text-dark text-truncate" style={{ maxWidth: "300px" }}>
                                            {outbound.warehouse?.name || "-"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Products Table */}
                        {outbound.products?.length > 0 ? (
                            <>
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="text-muted small border-bottom">
                                        <tr>
                                            <th style={{ width: "35%" }} className="text-truncate">
                                                Product
                                            </th>
                                            <th style={{ width: "10%" }}>Qty</th>
                                            <th style={{ width: "15%" }}>Unit Price</th>
                                            <th style={{ width: "20%" }}>Discount</th>
                                            <th style={{ width: "20%" }}>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {outbound.products.map((item, index) => {
                                            const unitPrice = item.sellingPrice || 0;
                                            const lineSubtotal = unitPrice * item.quantity;
                                            let discountAmount = 0;

                                            if (item.discountType === "percent") {
                                                discountAmount = lineSubtotal * (item.discountValue / 100);
                                            } else if (item.discountType === "amount") {
                                                discountAmount = item.discountValue || 0;
                                            }
                                            if (discountAmount > lineSubtotal) discountAmount = lineSubtotal;

                                            const finalSubtotal = lineSubtotal - discountAmount;

                                            return (
                                                <tr key={index}>
                                                    <td className="text-truncate" style={{ maxWidth: "200px" }}>
                                                        {item.product?.name || "-"}
                                                    </td>
                                                    <td>{item.quantity}</td>
                                                    <td>{formatCurrency(unitPrice)}</td>
                                                    <td>
                                                        {item.discountType === "percent"
                                                            ? item.discountValue > 0
                                                                ? `${item.discountValue}%`
                                                                : "-" // show dash if 0%
                                                            : item.discountValue > 0
                                                                ? formatCurrency(item.discountValue)
                                                                : "-" // show dash if 0 amount
                                                        }
                                                    </td>
                                                    <td>{formatCurrency(finalSubtotal)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {/* Total Card */}
                                <div className="pt-4 mt-4">
                                    <div className="bg-white border rounded shadow-sm p-3 text-end">
                                        <div className="text-muted small">Total</div>
                                        <div className="fs-5 fw-semibold text-dark">
                                            {formatCurrency(outbound.total)}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-muted">No products found for this outbound.</p>
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

export default OutboundViewModal;
