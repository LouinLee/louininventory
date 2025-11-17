// src/components/InboundFormModal.jsx

import React, { useEffect, useState } from "react";
import Select from "react-select";
import api from "../utils/axios";
import { toast } from "react-toastify";

import { motion } from "framer-motion";
import { FaTruckLoading, FaTrash, FaPlus } from "react-icons/fa";

const InboundFormModal = ({ show, onClose, inbound }) => {
    const [warehouseId, setWarehouseId] = useState("");
    const [products, setProducts] = useState([{ product: "", quantity: 0, buyingPrice: 0 }]);
    const [warehouses, setWarehouses] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [date, setDate] = useState("");

    const getLocalDateTimeValue = (d = new Date()) => {
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
            d.getHours()
        )}:${pad(d.getMinutes())}`;
    };

    useEffect(() => {
        if (inbound) {
            setWarehouseId(inbound.warehouse._id);
            setProducts(
                inbound.products.map((p) => ({
                    product: p.product._id,
                    quantity: p.quantity,
                    buyingPrice: p.buyingPrice || 0,
                }))
            );
            setDate(
                inbound.date ? getLocalDateTimeValue(new Date(inbound.date)) : getLocalDateTimeValue()
            );
        } else {
            setWarehouseId("");
            setProducts([{ product: "", quantity: 0, buyingPrice: 0 }]);
            setDate(getLocalDateTimeValue()); // ✅ default to now (local)
        }
        fetchWarehouses();
        fetchAllProducts();
    }, [inbound]);

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

    const fetchWarehouses = async () => {
        try {
            const response = await api.get("/warehouses", { withCredentials: true });
            setWarehouses(response.data);
        } catch (error) {
            toast.error("Failed to fetch warehouses.");
        }
    };

    const fetchAllProducts = async () => {
        try {
            const response = await api.get("/products", { withCredentials: true });
            setAllProducts(response.data);
        } catch (error) {
            toast.error("Failed to fetch products.");
        }
    };

    const handleProductChange = (index, field, value) => {
        const updated = [...products];
        updated[index][field] = field === "product" ? value.value : value;
        setProducts(updated);
    };

    const handleAddProduct = () => {
        setProducts([...products, { product: "", quantity: 0, buyingPrice: 0 }]);
    };

    const handleRemoveProduct = (index) => {
        const updated = products.filter((_, i) => i !== index);
        setProducts(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!warehouseId) {
            toast.error("Please select a warehouse.");
            return;
        }

        // ✅ Check if there is at least 1 valid product row
        if (
            products.length === 0 ||
            products.every((p) => !p.product || p.quantity <= 0 || p.buyingPrice < 0)
        ) {
            toast.error("Please add at least one product with a valid quantity and price.");
            return;
        }

        const payload = {
            warehouseId,
            date: new Date(date).toISOString(),  // ✅ send ISO string
            products: products.map((p) => ({
                product: p.product,
                quantity: Number(p.quantity),
                buyingPrice: Number(p.buyingPrice),
            })),
        };

        try {
            await api.post("/inbound", payload, { withCredentials: true });
            toast.success("Inbound created successfully");
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error saving inbound.");
        }
    };

    const warehouseOptions = warehouses.map((w) => ({ value: w._id, label: w.name }));
    const productOptions = allProducts.map((p) => ({ value: p._id, label: p.name }));

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
                style={{ width: "100%", maxWidth: "850px" }}
                onClick={(e) => e.stopPropagation()}  // ✅ Prevent backdrop click when inside modal
            >
                <div className="modal-content border-0 shadow-sm rounded">
                    <form onSubmit={handleSubmit}>
                        {/* Header */}
                        {/* <div className="modal-header flex-column align-items-center"> */}
                        <div className="modal-header flex-column align-items-center bg-light border-0 pb-3">
                            <h5 className="modal-title fw-bold d-flex align-items-center justify-content-center">
                                <FaTruckLoading className="me-3" size={25} />
                                {inbound ? "Edit Inbound" : "Add Inbound"}
                            </h5>
                            <button
                                type="button"
                                className="btn-close position-absolute end-0 top-0 mt-3 me-3"
                                onClick={onClose}
                            ></button>
                        </div>

                        {/* Body */}
                        <div className="modal-body px-4 py-3">
                            <div className="mb-4">
                                <label className="form-label fw-bold text-muted small mb-2">
                                    Date & Time
                                </label>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-bold text-muted small mb-2">
                                    Select Warehouse
                                </label>
                                <Select
                                    options={warehouseOptions}
                                    value={warehouseOptions.find((opt) => opt.value === warehouseId)}
                                    onChange={(opt) => setWarehouseId(opt.value)}
                                    placeholder="Select Warehouse"
                                />
                            </div>

                            {products.map((p, index) => (
                                <div
                                    key={index}
                                    className="border rounded p-3 mb-3 bg-light position-relative"
                                >
                                    <div className="row g-3 align-items-end">
                                        <div className="col-md-5">
                                            <label className="form-label fw-bold text-muted small mb-2">
                                                Product
                                            </label>
                                            <Select
                                                options={productOptions}
                                                value={productOptions.find(
                                                    (opt) => opt.value === p.product
                                                )}
                                                onChange={(val) =>
                                                    handleProductChange(index, "product", val)
                                                }
                                                placeholder="Select Product"
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold text-muted small mb-2">
                                                Quantity
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={p.quantity}
                                                onChange={(e) =>
                                                    handleProductChange(index, "quantity", e.target.value)
                                                }
                                                className="form-control"
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold text-muted small mb-2">
                                                Buying Price
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={p.buyingPrice}
                                                onChange={(e) =>
                                                    handleProductChange(index, "buyingPrice", e.target.value)
                                                }
                                                className="form-control"
                                            />
                                        </div>
                                        <div className="col-md-1 d-flex justify-content-center">
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => handleRemoveProduct(index)}
                                                title="Remove Product"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="text-center">
                                <button
                                    type="button"
                                    className="btn btn-outline-primary d-flex align-items-center gap-2 mx-auto btn-sm"
                                    onClick={handleAddProduct}
                                >
                                    <FaPlus /> Add Product
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer border-0 px-3 py-3 m-1">
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary btn-sm">
                                Save Inbound
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    ) : null;
};

export default InboundFormModal;
