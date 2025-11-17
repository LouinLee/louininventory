// src/components/CategoryViewModal.jsx

import React, { useEffect, useState } from "react";

import { motion } from "framer-motion";

import formatCurrency from "../utils/formatCurrency";
import { FaTags } from "react-icons/fa";

const CategoryViewModal = ({ show, onClose, category, products }) => {
    // if (!category) return null;

    const [searchTerm, setSearchTerm] = useState("");

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

    const filteredProducts = products?.filter(product =>
        product.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );

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
            onClick={onClose}  // ✅ Close when clicking backdrop
        >
            <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="modal-dialog"
                style={{ width: "100%", maxWidth: "800px" }}
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
                            <FaTags className="me-3" size={25} />
                            <span
                                className="text-truncate"
                                style={{
                                    maxWidth: "500px", // Adjust as needed
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    display: "inline-block",
                                }}
                                title={category?.name}
                            >
                                Details for {category?.name}
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
                            placeholder="Search product name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Modal Body */}
                    <div
                        className="modal-body pt-0 px-4 pb-5 m-1"
                        style={{ overflowY: "auto", flex: 1 }}
                    >
                        {filteredProducts?.length > 0 ? (
                            <table className="table table-hover align-middle mb-0">
                                <thead className="text-muted small border-bottom">
                                    <tr>
                                        <th style={{ width: "70%" }} className="text-truncate">Product Name</th>
                                        <th style={{ width: "30%" }}>Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((product, index) => (
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
                                                {product.name}
                                            </td>
                                            <td>{product.price != null ? formatCurrency(product.price) : "N/A"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-muted">No products found for this category.</p>
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
    ) : null;

};

export default CategoryViewModal;

// return (
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
//         >
//             <div className="modal-content">
//                 <div className="modal-header">
//                     <h5 className="modal-title">
//                         <i className="bi bi-tags-fill me-2" style={{ color: "black" }}></i>
//                         <strong>Category Details for {category.name}</strong>
//                     </h5>
//                     <button type="button" className="btn-close" onClick={onClose}></button>
//                 </div>
//                 <div className="modal-body">
//                     {products && products.length > 0 ? (
//                         <table className="table">
//                             <thead>
//                                 <tr>
//                                     <th>Product Name</th>
//                                     <th>Description</th>
//                                     <th>Price</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {products.map((product, index) => (
//                                     <tr key={index}>
//                                         <td>{product.name}</td>
//                                         <td>{product.description || "No description"}</td>
//                                         <td>{product.price ? product.price.toLocaleString("id-ID") : "N/A"}</td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     ) : (
//                         <p>No products found for this category.</p>
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
// );


