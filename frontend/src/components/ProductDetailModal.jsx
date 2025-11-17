// src/components/ProductDetailModal.jsx

import React, { useEffect, useState } from "react";
import api from "../utils/axios";
import { motion } from "framer-motion";
import { FaBoxOpen } from "react-icons/fa";

const ProductDetailModal = ({ show, onClose, productId }) => {
    const [productDetails, setProductDetails] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // if (!productDetails) return null;

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const res = await api.get(`/products/${productId}/details`);
                setProductDetails(res.data);
            } catch (error) {
                console.error("Failed to fetch product details:", error);
            }
        };

        if (show && productId) {
            fetchProductDetails();
        }
    }, [show, productId]);

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

    const filteredWarehouses = productDetails?.warehouses.filter((item) =>
        item.warehouse.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return show && productDetails ? (
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
            onClick={onClose}  // ✅ Close when clicking backdrop
        >
            <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="modal-dialog"
                style={{ width: "100%", maxWidth: "600px" }}
                onClick={(e) => e.stopPropagation()}  // ✅ Prevent backdrop click when inside modal
            >
                <div
                    className="modal-content border-0 shadow-sm rounded"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                    }}
                >
                    {/* Modal Header */}
                    {/* <div className="modal-header flex-column align-items-center mb-0"> */}
                    <div className="modal-header flex-column align-items-center bg-light border-0 pb-3">
                        <h5 className="modal-title fw-bold d-flex align-items-center justify-content-center">
                            <FaBoxOpen className="me-3" size={25} />
                            <span
                                className="text-truncate"
                                style={{
                                    maxWidth: "400px",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    display: "inline-block",
                                }}
                                title={productDetails.product.name}
                            >
                                Details for {productDetails.product.name}
                            </span>
                        </h5>
                        <button
                            type="button"
                            className="btn-close position-absolute end-0 top-0 mt-3 me-3"
                            onClick={onClose}
                        ></button>
                    </div>

                    {/* Search Bar */}
                    <div className="p-4 m-1 d-flex">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Search warehouse name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Modal Body */}
                    <div
                        className="modal-body pt-0 px-4 pb-5 m-1"
                        style={{ overflowY: "auto", flex: 1 }}
                    >
                        {filteredWarehouses.length > 0 ? (
                            <>
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="text-muted small border-bottom">
                                        <tr>
                                            <th style={{ width: "70%" }} className="text-truncate">Warehouse</th>
                                            <th style={{ width: "30%" }}>Quantity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredWarehouses.map((item, index) => (
                                            <tr key={index}>
                                                <td
                                                    className="text-truncate"
                                                    style={{
                                                        maxWidth: "1px",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }}
                                                >
                                                    {item.warehouse.name}
                                                </td>
                                                <td>{item.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Total */}
                                <div className="pt-4 mt-4">
                                    <div className="bg-white border rounded shadow-sm p-3 text-end">
                                        <div className="text-muted small">Total Quantity</div>
                                        <div className="fs-5 fw-semibold text-dark">
                                            {filteredWarehouses.reduce((total, item) => total + item.quantity, 0)}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-muted">No matching warehouses found.</p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="modal-footer border-0 pt-0 p-4 m-1">
                        <button className="btn btn-outline-secondary btn-sm m-0" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    ) : null;


};

export default ProductDetailModal;

// return show && productDetails ? (
//     <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         transition={{ duration: 0.2 }}
//         className="modal d-block"
//         style={{
//             backgroundColor: "rgba(0,0,0,0.5)",
//             position: "fixed",
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             zIndex: 1050,
//             overflowY: "auto",
//             padding: "3rem", // creates space from top/bottom
//             display: "flex",
//             justifyContent: "center",
//         }}
//     >
//         <motion.div
//             initial={{ y: -30, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: -30, opacity: 0 }}
//             transition={{ duration: 0.25 }}
//             className="modal-dialog"
//             style={{
//                 width: "100%",
//                 maxWidth: "600px",
//             }}
//         >
//             <div className="modal-content">
//                 <div className="modal-header">
//                     <h5 className="modal-title">
//                         <i className="bi bi-box-seam-fill me-2" style={{ color: "black" }}></i>
//                         <strong>Product Details for {productDetails.product.name}</strong>
//                     </h5>
//                     <button type="button" className="btn-close" onClick={onClose}></button>
//                 </div>
//                 <div className="modal-body">
//                     {productDetails.warehouses.length > 0 ? (
//                         <>
//                             <table className="table">
//                                 <thead>
//                                     <tr>
//                                         <th>Warehouse</th>
//                                         <th>Quantity</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {productDetails.warehouses.map((item, index) => (
//                                         <tr key={index}>
//                                             <td>{item.warehouse.name}</td>
//                                             <td>{item.quantity}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>

//                             {/* Total Quantity Row */}
//                             <div className="d-flex justify-content-end mt-3">
//                                 <table className="table w-auto">
//                                     <tbody>
//                                         <tr>
//                                             <td className="text-end">
//                                                 <strong>Total Quantity:</strong>
//                                             </td>
//                                             <td className="text-end">
//                                                 {productDetails.warehouses.reduce((total, item) => total + item.quantity, 0)}
//                                             </td>
//                                         </tr>
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </>
//                     ) : (
//                         <p>No warehouses found for this product.</p>
//                     )}
//                 </div>

//                 <div className="modal-footer">
//                     <button type="button" className="btn btn-secondary" onClick={onClose}>
//                         Close
//                     </button>
//                 </div>
//             </div>
//         </motion.div>
//     </motion.div>
// ) : null;
