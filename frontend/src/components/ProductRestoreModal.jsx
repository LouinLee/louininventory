// src/components/ProductRestoreModal.jsx

import React, { useEffect, useState } from "react";
import api from "../utils/axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrashRestore } from "react-icons/fa";
import ConfirmRestoreModal from "./ConfirmRestoreModal";

const ProductRestoreModal = ({ show, onClose }) => {
    const [deletedProducts, setDeletedProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showConfirmRestore, setShowConfirmRestore] = useState(false);

    const fetchDeleted = async () => {
        try {
            setLoading(true);
            const res = await api.get("/products/deleted", { withCredentials: true });
            setDeletedProducts(res.data);
        } catch (err) {
            toast.error("Failed to load deleted products");
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

    const openConfirmRestore = (product) => {
        setSelectedProduct(product);
        setShowConfirmRestore(true);
    };

    const handleConfirmRestore = async () => {
        if (!selectedProduct) return;
        try {
            await api.put(`/products/restore/${selectedProduct._id}`, {}, { withCredentials: true });
            toast.success("Product restored successfully");
            fetchDeleted();
            setShowConfirmRestore(false);
        }
        // catch (err) {
        //     toast.error("Failed to restore product");
        // }
        catch (error) {
            if (error.response?.status === 403) {
                toast.error("You don't have permission to perform this action.");
            } else if (error.response?.status === 401) {
                toast.error("Your session has expired. Please log in again.");
            } else {
                toast.error(error.response?.data?.message || "Failed to restore product.");
            }
            console.error("Restore product failed:", error);
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
            onClick={onClose} // ✅ close when clicking backdrop
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
                onClick={(e) => e.stopPropagation()} // ✅ prevent backdrop close
            >
                <div className="modal-content border-0 shadow-sm rounded overflow-hidden d-flex flex-column">

                    {/* Header */}
                    <div className="modal-header flex-column align-items-center bg-light border-0 pb-3">
                        <h5 className="modal-title fw-bold d-flex align-items-center">
                            <FaTrashRestore className="me-2 text-success" size={22} />
                            Restore Deleted Products
                        </h5>
                        <button type="button" className="btn-close position-absolute end-0 top-0 mt-3 me-3" onClick={onClose}></button>
                    </div>

                    {/* Body */}
                    <div className="modal-body px-4 pb-4" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                        {loading ? (
                            <p className="text-muted text-center my-3">Loading deleted products...</p>
                        ) : deletedProducts.length === 0 ? (
                            <p className="text-muted text-center my-3">No deleted products available.</p>
                        ) : (
                            // <div className="list-group">
                            //     {deletedProducts.map((prod) => (
                            //         <div
                            //             key={prod._id}
                            //             className="list-group-item d-flex justify-content-between align-items-center"
                            //         >
                            //             <span className="text-truncate">{prod.name}</span>
                            //             {/* <button
                            //                 className="btn btn-sm btn-outline-success"
                            //                 onClick={() => handleRestore(prod._id)}
                            //             >
                            //                 Restore
                            //             </button> */}
                            //         </div>
                            //     ))}
                            // </div>
                            <ul className="list-group">
                                {deletedProducts.map((product) => (
                                    <li
                                        key={product._id}
                                        className="list-group-item d-flex justify-content-between align-items-center"
                                    >
                                        <span>{product.name}</span>
                                        <button
                                            className="btn btn-sm btn-success"
                                            onClick={() => openConfirmRestore(product)}
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
                        message={`Are you sure you want to restore "${selectedProduct?.name}"?`}
                    />
                )}
            </AnimatePresence>

        </motion.div>

    ) : null;
};

export default ProductRestoreModal;

{/* Old function handleRestore  */ }
// const handleRestore = async (id) => {
//     try {
//         await api.put(`/products/restore/${id}`, {}, { withCredentials: true });
//         toast.success("Product restored successfully");
//         fetchDeleted();
//     } catch (err) {
//         toast.error("Failed to restore product");
//     }
// };

