// src/components/StockMovementFormModal.jsx

import React, { useEffect, useState } from "react";
import Select from "react-select";
import api from "../utils/axios";
import { toast } from "react-toastify";

import { motion } from "framer-motion";
import { FaExchangeAlt, FaTrash, FaPlus } from "react-icons/fa";

const StockMovementFormModal = ({ show, onClose }) => {
    const [sourceWarehouse, setSourceWarehouse] = useState("");
    const [destinationWarehouse, setDestinationWarehouse] = useState("");
    const [warehouses, setWarehouses] = useState([]);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [products, setProducts] = useState([{ product: "", quantity: 0 }]);
    const [date, setDate] = useState("");

    const getLocalDateTimeValue = (d = new Date()) => {
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
            d.getHours()
        )}:${pad(d.getMinutes())}`;
    };

    useEffect(() => {
        fetchWarehouses();
        setDate(getLocalDateTimeValue()); // ✅ default to now
    }, []);

    useEffect(() => {
        if (sourceWarehouse) {
            fetchProductsByWarehouse(sourceWarehouse);
        }
    }, [sourceWarehouse]);

    const fetchWarehouses = async () => {
        try {
            const res = await api.get("/warehouses", { withCredentials: true });
            setWarehouses(res.data);
        } catch (error) {
            toast.error("Failed to fetch warehouses.");
        }
    };

    const fetchProductsByWarehouse = async (warehouseId) => {
        try {
            const res = await api.get(`/outbound/products/${warehouseId}`, { withCredentials: true });
            setAvailableProducts(res.data);
        } catch (error) {
            if (error.response?.status === 404) {
                // No products found in this warehouse, clear the list
                setAvailableProducts([]);
            } else {
                toast.error("Failed to fetch products.");
            }
        }
    };

    const handleAddProduct = () => {
        setProducts([...products, { product: "", quantity: 0 }]);
    };

    const handleRemoveProduct = (index) => {
        const updated = products.filter((_, i) => i !== index);
        setProducts(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!sourceWarehouse || !destinationWarehouse) {
            return toast.error("Both source and destination warehouses are required.");
        }

        if (sourceWarehouse === destinationWarehouse) {
            return toast.error("Source and destination cannot be the same.");
        }

        // ✅ Ensure at least one valid product exists
        if (
            products.length === 0 ||
            products.every((p) => !p.product || p.quantity <= 0)
        ) {
            return toast.error("Please add at least one product with a valid quantity to move.");
        }

        try {
            await api.post(
                "/stock-movement",
                {
                    fromWarehouseId: sourceWarehouse,
                    toWarehouseId: destinationWarehouse,
                    products,
                    date: new Date(date).toISOString(),  // ✅ same as inbound
                },
                { withCredentials: true }
            );

            toast.success("Stock moved successfully");
            onClose();
        } catch (error) {
            const msg = error.response?.data?.message || "Failed to move stock.";
            toast.error(msg);
        }
    };

    const warehouseOptions = warehouses.map(w => ({ value: w._id, label: w.name }));
    const productOptions = availableProducts.map(p => ({ value: p.productId, label: p.name }));

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
                                <FaExchangeAlt className="me-3" size={24} />
                                Move Stock
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
                            {/* Warehouse Selection */}
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <label className="form-label fw-bold text-muted small mb-2">
                                        Source Warehouse
                                    </label>
                                    <Select
                                        options={warehouseOptions}
                                        value={warehouseOptions.find((w) => w.value === sourceWarehouse)}
                                        onChange={(opt) => {
                                            setSourceWarehouse(opt.value);
                                            setProducts([{ product: "", quantity: 0 }]);
                                            setAvailableProducts([]);  // Optionally clear product list immediately
                                        }}
                                        placeholder="Select Source"
                                        isSearchable
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold text-muted small mb-2">
                                        Destination Warehouse
                                    </label>
                                    <Select
                                        options={warehouseOptions}
                                        value={warehouseOptions.find((w) => w.value === destinationWarehouse)}
                                        onChange={(opt) => setDestinationWarehouse(opt.value)}
                                        placeholder="Select Destination"
                                        isSearchable
                                        required
                                    />
                                </div>
                            </div>

                            {/* Product List */}
                            {products.map((p, index) => {
                                const selectedProductIds = products.map((p) => p.product).filter(Boolean);

                                const availableQty =
                                    availableProducts.find((ap) => ap.productId === p.product)?.quantity || 0;

                                const filteredOptions = productOptions.filter(
                                    (opt) => opt.value === p.product || !selectedProductIds.includes(opt.value)
                                );
                                return (
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
                                                    options={filteredOptions}
                                                    value={filteredOptions.find((opt) => opt.value === p.product) || null}
                                                    onChange={(opt) => {
                                                        const updated = [...products];
                                                        updated[index].product = opt.value;
                                                        setProducts(updated);
                                                    }}
                                                    placeholder="Select Product"
                                                    isSearchable
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label fw-bold text-muted small mb-2">
                                                    Available
                                                </label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={availableQty}
                                                    disabled
                                                />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label fw-bold text-muted small mb-2">
                                                    Quantity to Move
                                                </label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    min="1"
                                                    value={p.quantity}
                                                    onChange={(e) => {
                                                        const updated = [...products];
                                                        updated[index].quantity = parseInt(e.target.value) || 0;
                                                        setProducts(updated);
                                                    }}
                                                    required
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
                                );
                            })}

                            {/* Add Product Button */}
                            <div className="text-center">
                                <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 mx-auto"
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
                                Move Stock
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    ) : null;
};

export default StockMovementFormModal;
