// src/components/WarehouseFormModal.jsx

import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { toast } from "react-toastify";

import { motion } from "framer-motion";
import { FaWarehouse } from "react-icons/fa";

const WarehouseFormModal = ({ show, onClose, warehouse }) => {
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");

    // Populate form with existing warehouse data for editing
    useEffect(() => {
        if (warehouse) {
            setName(warehouse.name || "");
            setLocation(warehouse.location || "");
        } else {
            setName("");
            setLocation("");
        }
    }, [warehouse]);

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

    // Form submission logic
    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            name,
            location,
        };

        try {
            if (warehouse) {
                // Edit warehouse
                await axios.put(`/warehouses/${warehouse._id}`, payload, { withCredentials: true });
                toast.success("Warehouse updated successfully");
            } else {
                // Create warehouse
                await axios.post("/warehouses", payload, { withCredentials: true });
                toast.success("Warehouse created successfully");
            }
            onClose(); // Close the modal
        }
        // catch (error) {
        //     if (error.response) {
        //         // Handle specific backend errors
        //         if (error.response.status === 400) {
        //             toast.error(error.response.data.message || "Validation error");
        //         } else if (error.response.status === 404) {
        //             toast.error("Warehouse not found");
        //         } else {
        //             toast.error(error.response.data.message || "An error occurred");
        //         }
        //     } else {
        //         // Handle network or other errors
        //         toast.error("Failed to connect to the server");
        //     }
        //     console.error("Error saving warehouse:", error);
        // }
        catch (error) {
            if (error.response?.status === 403) {
                toast.error("You don't have permission to perform this action.");
            } else if (error.response?.status === 401) {
                toast.error("Your session has expired. Please log in again.");
            } else {
                toast.error(error.response?.data?.message || "An error occurred");
            }
            console.error("Error saving warehouse:", error);
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
            onClick={onClose}  // ✅ Close when clicking backdrop
        >
            <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="modal-dialog"
                onClick={(e) => e.stopPropagation()}  // ✅ Prevent backdrop click when inside modal
            >
                <div className="modal-content border-0 shadow-sm rounded">
                    <form onSubmit={handleSubmit}>
                        {/* Header */}
                        {/* <div className="modal-header flex-column align-items-center"> */}
                        <div className="modal-header flex-column align-items-center bg-light border-0 pb-3">
                            <h5 className="modal-title fw-bold d-flex align-items-center justify-content-center">
                                <FaWarehouse className="me-3" size={25} />
                                {warehouse ? "Edit Warehouse" : "Add Warehouse"}
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
                                <label className="form-label fw-bold text-muted small mb-2">
                                    Warehouse Name
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter warehouse name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold text-muted small mb-2">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter location (optional)"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer border-0 px-3 py-3 m-1">
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary btn-sm">
                                {warehouse ? "Update" : "Create"}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    ) : null;

};

export default WarehouseFormModal;


// return show ? (
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
//         }}
//     >
//         <motion.div
//             initial={{ y: -30, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: -30, opacity: 0 }}
//             transition={{ duration: 0.25 }}
//             className="modal-dialog modal-dialog-centered"
//         >
//             <div className="modal-content">
//                 <form onSubmit={handleSubmit}>
//                     <div className="modal-header">
//                         <h5 className="modal-title">
//                             <i className="bi bi-box2-fill me-2" style={{ color: "black" }}></i>
//                             <strong>{warehouse ? "Edit Warehouse" : "Add Warehouse"}</strong>
//                         </h5>
//                         <button type="button" className="btn-close" onClick={onClose}></button>
//                     </div>
//                     <div className="modal-body">
//                         <div className="mb-3">
//                             <label className="form-label"><strong>Name</strong></label>
//                             <input
//                                 type="text"
//                                 className="form-control"
//                                 value={name}
//                                 onChange={(e) => setName(e.target.value)}
//                                 required
//                             />
//                         </div>
//                         <div className="mb-3">
//                             <label className="form-label"><strong>Location</strong></label>
//                             <input
//                                 type="text"
//                                 className="form-control"
//                                 value={location}
//                                 onChange={(e) => setLocation(e.target.value)}
//                             />
//                         </div>
//                     </div>
//                     <div className="modal-footer">
//                         <button type="button" className="btn btn-secondary" onClick={onClose}>
//                             Cancel
//                         </button>
//                         <button type="submit" className="btn btn-primary">
//                             {warehouse ? "Update" : "Create"}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </motion.div>
//     </motion.div>
// ) : null;

