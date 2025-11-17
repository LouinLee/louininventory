// src/components/WarehouseInventoryModal.jsx

import React, { useEffect, useState } from "react";
import api from "../utils/axios";
import { toast } from "react-toastify";

import formatCurrency from "../utils/formatCurrency";
import { motion } from "framer-motion";
import { FaWarehouse } from "react-icons/fa";

const WarehouseInventoryModal = ({ show, onClose, warehouse }) => {
    const [inventory, setInventory] = useState([]);
    const [expanded, setExpanded] = useState({});

    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const res = await api.get(`/inventory/warehouse/${warehouse._id}`, {
                    withCredentials: true,
                });
                setInventory(res.data);
            } catch (err) {
                console.error("Failed to fetch inventory:", err);
                toast.error("Failed to load inventory.");
            }
        };

        if (show && warehouse) {
            fetchInventory();
        }
    }, [show, warehouse]);

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

    const toggleExpand = (productId) => {
        setExpanded((prev) => ({
            ...prev,
            [productId]: !prev[productId],
        }));
    };

    const groupedInventory = inventory.reduce((acc, item) => {
        const key = item.product?._id || "unknown";
        if (!acc[key]) {
            const sellingPrice = item.product?.price || 0;
            acc[key] = {
                product: item.product,
                totalQty: 0,
                totalValue: 0, // procurement
                totalValuation: 0, // selling price valuation
                details: [],
                sellingPrice,
            };
        }

        const price = item.buyingPrice || 0;
        const subtotal = item.quantity * price;

        acc[key].totalQty += item.quantity;
        acc[key].totalValue += subtotal;
        acc[key].totalValuation += item.quantity * acc[key].sellingPrice;
        acc[key].details.push({
            quantity: item.quantity,
            price,
            subtotal,
            date: item.date,
        });

        return acc;
    }, {});

    const totalProcurement = Object.values(groupedInventory).reduce(
        (sum, group) => sum + group.totalValue,
        0
    );

    const totalValuation = Object.values(groupedInventory).reduce(
        (sum, group) => sum + group.totalValuation,
        0
    );

    const visibleInventory = Object.entries(groupedInventory).filter(
        ([, group]) =>
            group.product?.name?.toLowerCase().includes(searchTerm.trim().toLowerCase())
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
                padding: "3rem", // creates space from top/bottom
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
                style={{
                    width: "100%",
                    maxWidth: "800px",
                }}
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
                            <FaWarehouse className="me-3" size={25} />
                            <span
                                className="text-truncate"
                                style={{
                                    maxWidth: "300px", // Adjust based on layout
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    display: "inline-block",
                                }}
                                title={warehouse?.name}
                            >
                                Inventory {warehouse?.name}
                            </span>
                        </h5>
                        <button type="button" className="btn-close position-absolute end-0 top-0 mt-3 me-3" onClick={onClose}></button>
                    </div>


                    {/* Search bar */}
                    <div className="p-4 m-1 d-flex">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Search product name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Modal Body with Scroll */}
                    <div
                        className="modal-body pt-0 pb-5 px-4 py-4 m-1"
                        // className="modal-body"
                        style={{
                            overflowY: "auto",
                            flex: 1,
                            // padding: "2rem",
                        }}
                    >
                        {visibleInventory.length === 0 ? (
                            <p className="text-muted">No products found.</p>
                        ) : (
                            <>
                                <table className="table table-hover align-middle mb-4">
                                    <thead className="text-muted small border-bottom">
                                        <tr>
                                            <th style={{ width: "40%" }} className="text-truncate">Product</th>
                                            <th style={{ width: "20%" }} className="text-start">Total Quantity</th>
                                            <th style={{ width: "20%" }} className="text-start">Sell Price</th>
                                            <th style={{ width: "20%" }} className="text-start">Total Valuation</th>
                                            <th style={{ width: "0%" }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visibleInventory.map(([productId, group]) => (
                                            <React.Fragment key={productId}>
                                                <tr
                                                    className="align-middle border-bottom"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => toggleExpand(productId)}
                                                >
                                                    <td className="text-truncate" style={{ maxWidth: "240px" }}>
                                                        {group.product?.name || "Unknown"}
                                                    </td>
                                                    <td className="text-start">{group.totalQty}</td>
                                                    <td className="text-start">{formatCurrency(group.sellingPrice)}</td>
                                                    <td className="text-start">{formatCurrency(group.totalValuation)}</td>
                                                    <td className="text-muted text-end">{expanded[productId] ? "▾" : "▸"}</td>
                                                </tr>

                                                {expanded[productId] && (
                                                    <tr>
                                                        <td colSpan="5" className="p-0">
                                                            <div className="bg-light rounded p-3 mx-3 my-3">
                                                                <table className="table table-sm table-borderless mb-2">
                                                                    <thead className="small text-muted border-bottom">
                                                                        <tr>
                                                                            <th style={{ width: "40%" }}>Date</th>
                                                                            <th className="text-start" style={{ width: "20%" }}>Quantity</th>
                                                                            <th className="text-start" style={{ width: "20%" }}>Buy Price</th>
                                                                            <th className="text-start" style={{ width: "20%" }}>Subtotal</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {group.details.map((detail, idx) => (
                                                                            <tr key={idx}>
                                                                                <td>
                                                                                    {new Date(detail.date).toLocaleString("en-US", {
                                                                                        year: "numeric",
                                                                                        month: "2-digit",
                                                                                        day: "2-digit",
                                                                                        hour: "2-digit",
                                                                                        minute: "2-digit",
                                                                                        hour12: true,
                                                                                    })}
                                                                                </td>
                                                                                <td className="text-start">{detail.quantity}</td>
                                                                                <td className="text-start">{formatCurrency(detail.price)}</td>
                                                                                <td className="text-start">{formatCurrency(detail.subtotal)}</td>
                                                                            </tr>
                                                                        ))}
                                                                        <tr className="fw-semibold border-top">
                                                                            <td colSpan="3" className="pt-3 text-end text-muted">Total Cost:</td>
                                                                            <td className="pt-3 text-start">
                                                                                {formatCurrency(group.totalValue)}
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="border-top pt-4 mt-4">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="bg-white border rounded shadow-sm p-3">
                                                <div className="text-muted small">Inventory Procurement Cost</div>
                                                <div className="fs-5 fw-semibold text-dark">{formatCurrency(totalProcurement)}</div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="bg-white border rounded shadow-sm p-3">
                                                <div className="text-muted small">Inventory Valuation</div>
                                                <div className="fs-5 fw-semibold text-dark">{formatCurrency(totalValuation)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </>

                        )}
                    </div>

                    {/* Modal Footer */}
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

export default WarehouseInventoryModal;
