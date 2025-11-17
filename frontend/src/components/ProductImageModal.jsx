// src/components/ProductImageModal.jsx

import React from "react";
import { motion } from "framer-motion";

const ProductImageModal = ({ show, onClose, imageSrc, alt }) => {
    if (!show) return null;

    return (
        <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0,0,0,0.6)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1050,
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                    position: "relative",
                    background: "white",
                    padding: "10px",
                    borderRadius: "8px",
                    maxWidth: "90vw",
                    maxHeight: "90vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
            >
                <img
                    src={imageSrc}
                    alt={alt || "Product Image"}
                    style={{
                        maxWidth: "100%",
                        maxHeight: "80vh",
                        objectFit: "contain",
                        borderRadius: "4px",
                    }}
                />
            </motion.div>
        </motion.div>
    );
};

export default ProductImageModal;
