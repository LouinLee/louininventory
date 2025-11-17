// src/components/CategoryFormModal.jsx

import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { toast } from "react-toastify";

import { motion } from "framer-motion";
import { FaTags } from "react-icons/fa";

const CategoryFormModal = ({ show, onClose, category }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    // Populate form with existing category data for editing
    useEffect(() => {
        if (category) {
            setName(category.name || "");
            setDescription(category.description || "");
        } else {
            setName("");
            setDescription("");
        }
    }, [category]);

    // Form submission logic
    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            name,
            description,
        };

        try {
            if (category) {
                // Edit category
                await axios.put(`/categories/${category._id}`, payload, { withCredentials: true });
                toast.success("Category updated successfully");
            } else {
                // Create category
                await axios.post("/categories", payload, { withCredentials: true });
                toast.success("Category created successfully");
            }
            onClose(); // Close the modal
        } catch (error) {
            if (error.response) {
                // Handle specific backend errors
                if (error.response.status === 400) {
                    toast.error(error.response.data.message || "Validation error");
                } else if (error.response.status === 404) {
                    toast.error("Category not found");
                } else {
                    toast.error(error.response.data.message || "An error occurred");
                }
            } else {
                // Handle network or other errors
                toast.error("Failed to connect to the server");
            }
            console.error("Error saving category:", error);
        }
    };

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
            onClick={onClose} // ← close on backdrop click
        >
            <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="modal-dialog"
                // style={{ maxWidth: "600px", width: "100%" }}
                onClick={(e) => e.stopPropagation()}  // ✅ Prevent backdrop click when inside modal

            >
                <div className="modal-content border-0 shadow-sm rounded">
                    <form onSubmit={handleSubmit}>
                        {/* Header */}
                        {/* <div className="modal-header flex-column align-items-center"> */}
                        <div className="modal-header flex-column align-items-center bg-light border-0 pb-3">
                            <h5 className="modal-title fw-bold d-flex align-items-center justify-content-center">
                                <FaTags className="me-3" size={25} />
                                {category ? "Edit Category" : "Add Category"}
                            </h5>
                            <button
                                type="button"
                                className="btn-close position-absolute end-0 top-0 mt-3 me-3"
                                onClick={onClose}
                            ></button>
                        </div>

                        {/* Body */}
                        <div className="modal-body px-4 py-3">
                            <div className="mb-3">
                                <label className="form-label fw-bold text-muted small mb-2">Category Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter category name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold text-muted small mb-2">Description</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    placeholder="Enter category description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer border-0 px-4 py-3">
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary btn-sm">
                                {category ? "Update" : "Create"}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );

};

export default CategoryFormModal;

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
//                 <form onSubmit={handleSubmit}>
//                     <div className="modal-header">
//                         <h5 className="modal-title">
//                             <i className="bi bi-tags-fill me-2" style={{ color: "black" }}></i>
//                             <strong>{category ? "Edit Category" : "Add Category"}</strong>
//                         </h5>
//                         <button type="button" className="btn-close" onClick={onClose}></button>
//                     </div>
//                     <div className="modal-body">
//                         <div className="mb-3">
//                             <label className="form-label"><strong>Category Name</strong></label>
//                             <input
//                                 type="text"
//                                 className="form-control"
//                                 placeholder="Enter category name"
//                                 value={name}
//                                 onChange={(e) => setName(e.target.value)}
//                                 required
//                             />
//                         </div>
//                         <div className="mb-3">
//                             <label className="form-label"><strong>Description</strong></label>
//                             <textarea
//                                 className="form-control"
//                                 placeholder="Enter category description"
//                                 value={description}
//                                 onChange={(e) => setDescription(e.target.value)}
//                             ></textarea>
//                         </div>
//                     </div>
//                     <div className="modal-footer">
//                         <button type="button" className="btn btn-secondary" onClick={onClose}>
//                             Cancel
//                         </button>
//                         <button type="submit" className="btn btn-primary">
//                             {category ? "Update" : "Create"}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </motion.div>
//     </motion.div>
// );


