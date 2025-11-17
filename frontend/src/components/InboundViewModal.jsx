// src/components/InboundViewModal.jsx

import React, { useEffect } from "react";

import { motion } from "framer-motion";
import { FaTruckLoading } from "react-icons/fa";

const InboundViewModal = ({ show, onClose, inbound }) => {

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
                            <FaTruckLoading className="me-3" size={25} />
                            <span
                                className="text-truncate"
                                style={{
                                    maxWidth: "500px",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    display: "inline-block",
                                }}
                                title={inbound.warehouse?.name || "Inbound"}
                            >
                                Inbound Details – {inbound.warehouse?.name || "Unknown"}
                            </span>
                        </h5>
                        <button
                            type="button"
                            className="btn-close position-absolute end-0 top-0 mt-3 me-3"
                            onClick={onClose}
                        ></button>
                    </div>

                    {/* Modal Body */}
                    <div
                        className="modal-body pt-0 px-4 pb-5 m-1"
                        style={{ overflowY: "auto", flex: 1 }}
                    >
                        {/* Date & Warehouse Info Cards */}
                        <div className="pt-4 pb-4 mb-4">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="bg-white border rounded shadow-sm p-3">
                                        <div className="text-muted small">Date</div>
                                        <div className="fs-6 fw-semibold text-dark text-truncate" style={{ maxWidth: "300px" }}>
                                            {inbound.date
                                                ? new Date(inbound.date).toLocaleDateString("en-US",
                                                    {
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
                                            {inbound.warehouse?.name || "-"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Products Table */}
                        {inbound.products?.length > 0 ? (
                            <>
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="text-muted small border-bottom">
                                        <tr>
                                            <th style={{ width: "40%" }} className="text-truncate">Product</th>
                                            <th style={{ width: "15%" }}>Quantity</th>
                                            <th style={{ width: "20%" }}>Buying Price</th>
                                            <th style={{ width: "25%" }}>Subtotal</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {inbound.products.map((item, index) => (
                                            <tr key={index}>
                                                <td className="text-truncate" style={{ maxWidth: "240px" }}>{item.product?.name || "-"}</td>
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
                                
                                {/* Total Card */}
                                <div className="pt-4 mt-4">
                                    <div className="bg-white border rounded shadow-sm p-3 text-end">
                                        <div className="text-muted small">Total</div>
                                        <div className="fs-5 fw-semibold text-dark">
                                            {inbound.total !== undefined
                                                ? `Rp ${Number(inbound.total).toLocaleString()}`
                                                : "-"}
                                        </div>
                                    </div>
                                </div>
                            </>

                        ) : (
                            <p className="text-muted">No products found for this inbound.</p>
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

export default InboundViewModal;

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
//                 maxWidth: "800px",
//             }}
//         >
//             <div className="modal-content">
//                 <div className="modal-header">
//                     <h5 className="modal-title">
//                         <strong>Inbound Details - {inbound.warehouse?.name}</strong>
//                     </h5>
//                     <button type="button" className="btn-close" onClick={onClose}></button>
//                 </div>
//                 <div className="modal-body">
//                     <p><strong>Date:</strong> {new Date(inbound.date).toLocaleDateString()}</p>
//                     <table className="table table-bordered">
//                         <thead>
//                             <tr>
//                                 <th>Product</th>
//                                 <th>Quantity</th>
//                                 <th>Buying Price</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {inbound.products.map((item, index) => (
//                                 <tr key={index}>
//                                     <td>{item.product?.name}</td>
//                                     <td>{item.quantity}</td>
//                                     <td>{item.buyingPrice !== undefined ? `Rp ${Number(item.buyingPrice).toLocaleString()}` : "-"}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
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
