// src/components/ConfirmDeleteModal.jsx

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";

const ConfirmDeleteModal = ({ show, onClose, onConfirm, message }) => {
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
            onClick={onClose} // ← close on backdrop click
        >
            <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="modal-dialog"
                style={{ width: "100%", maxWidth: "420px" }}
                onClick={(e) => e.stopPropagation()} // ← prevent close if inside modal
            >
                <div
                    className="modal-content border-0 shadow-sm rounded"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        textAlign: "center",
                    }}
                >
                    {/* Header */}
                    <div className="modal-header border-0 flex-column align-items-center position-relative">
                        <FaExclamationTriangle className="text-warning mb-3" size={40} />
                        <h5 className="modal-title fw-bold">Confirm Delete</h5>
                        <button
                            type="button"
                            className="btn-close position-absolute end-0 top-0 mt-3 me-3"
                            onClick={onClose}
                        ></button>
                    </div>

                    {/* Body */}
                    <div className="modal-body px-4 pt-0 pb-4">
                        <p className="text-muted mb-0">{message}</p>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer border-0 d-flex justify-content-center gap-2 pb-4">
                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm px-4"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger btn-sm px-4"
                            onClick={onConfirm}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    ) : null;
};

export default ConfirmDeleteModal;
