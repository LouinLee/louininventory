// src/components/ReconciliationFormModal.jsx

import React, { useEffect, useState } from "react";
import Select from "react-select";
import api from "../utils/axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaBalanceScale, FaTrash, FaPlus } from "react-icons/fa";
import formatCurrency from "../utils/formatCurrency";

const ReconciliationFormModal = ({ show, onClose, reconciliation }) => {
    const [warehouseId, setWarehouseId] = useState("");
    const [products, setProducts] = useState([{ product: "", quantity: 0, price: 0 }]);
    const [warehouses, setWarehouses] = useState([]);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [notes, setNotes] = useState("");
    const [date, setDate] = useState("");

    const getLocalDateTimeValue = (d = new Date()) => {
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
            d.getHours()
        )}:${pad(d.getMinutes())}`;
    };

    useEffect(() => {
        if (reconciliation) {
            setWarehouseId(reconciliation.warehouse._id);
            setProducts(
                reconciliation.products.map((p) => ({
                    product: p.product._id,
                    quantity: p.quantity,
                    price: p.buyingPrice || 0,
                }))

            );
            setNotes(reconciliation.notes || "");
            setDate(
                reconciliation.date ? getLocalDateTimeValue(new Date(reconciliation.date)) : getLocalDateTimeValue()
            );
        } else {
            setWarehouseId("");
            setProducts([{ product: "", quantity: 0, price: 0 }]);
            setNotes("");
            setDate(getLocalDateTimeValue()); // ✅ default to now (local)
        }
        fetchWarehouses();
    }, [reconciliation]);

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
            console.error("Failed to fetch warehouses:", error);
            toast.error("Failed to fetch warehouses.");
        }
    };

    const fetchProductsByWarehouse = async (warehouseId) => {
        try {
            const response = await api.get(`/outbound/products/${warehouseId}`, { withCredentials: true });
            setAvailableProducts(response.data);
        } catch (error) {
            if (error.response?.status === 404) {
                setAvailableProducts([]); // empty warehouse
            } else {
                console.error("Failed to fetch products:", error);
                toast.error("Failed to fetch products for the selected warehouse.");
            }
        }
    };

    const handleWarehouseChange = (selectedOption) => {
        const selectedWarehouseId = selectedOption.value;
        setWarehouseId(selectedWarehouseId);
        setProducts([{ product: "", quantity: 0, price: 0 }]);
        fetchProductsByWarehouse(selectedWarehouseId);
    };

    const handleProductChange = (index, selectedOption) => {
        const newProducts = [...products];
        const selectedProduct = availableProducts.find((p) => p.productId === selectedOption.value);

        newProducts[index].product = selectedOption.value;
        newProducts[index].price = selectedProduct?.price || 0;

        setProducts(newProducts);
    };

    const handleQuantityChange = (index, value) => {
        const newProducts = [...products];
        newProducts[index].quantity = parseInt(value, 10) || 0;
        setProducts(newProducts);
    };

    const handleAddProduct = () => {
        setProducts([...products, { product: "", quantity: 0, price: 0 }]);
    };

    const handleRemoveProduct = (index) => {
        const newProducts = products.filter((_, i) => i !== index);
        setProducts(newProducts);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!warehouseId) {
            toast.error("Please select a warehouse.");
            return;
        }

        if (
            products.length === 0 ||
            products.every((p) => !p.product || p.quantity <= 0)
        ) {
            toast.error("Please add at least one product with a valid quantity.");
            return;
        }

        const payload = {
            warehouseId,
            date: new Date(date).toISOString(),  // ✅ send ISO string
            products,
            notes,
        };

        try {
            if (reconciliation) {
                await api.put(`/reconciliation/${reconciliation._id}`, payload, { withCredentials: true });
                toast.success("Reconciliation updated successfully");
            } else {
                await api.post("/reconciliation", payload, { withCredentials: true });
                toast.success("Reconciliation created successfully");
            }
            onClose();
        } catch (error) {
            if (error.response) {
                toast.error(error.response.data.message || "An error occurred.");
            } else {
                toast.error("Failed to connect to the server.");
            }
            console.error("Error saving reconciliation record:", error);
        }
    };

    const warehouseOptions = warehouses.map((warehouse) => ({
        value: warehouse._id,
        label: warehouse.name,
    }));

    const totalLoss = products.reduce(
        (sum, item) => sum + (item.quantity || 0) * (item.price || 0),
        0
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
            onClick={onClose}
        >
            <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="modal-dialog"
                style={{ width: "100%", maxWidth: "850px" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content border-0 shadow-sm rounded">
                    <form onSubmit={handleSubmit}>
                        {/* Header */}
                        {/* <div className="modal-header flex-column align-items-center"> */}
                        <div className="modal-header flex-column align-items-center bg-light border-0 pb-3">
                            <h5 className="modal-title fw-bold d-flex align-items-center justify-content-center">
                                <FaBalanceScale className="me-3" size={25} />
                                {reconciliation ? "Edit Reconciliation" : "Add Reconciliation"}
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
                            <div className="mb-4">
                                <label className="form-label fw-bold text-muted small mb-2">
                                    Select Warehouse
                                </label>
                                <Select
                                    options={warehouseOptions}
                                    value={warehouseOptions.find((opt) => opt.value === warehouseId)}
                                    onChange={handleWarehouseChange}
                                    placeholder="Select Warehouse"
                                    isSearchable
                                    required
                                />
                            </div>

                            {/* Product List */}
                            {products.map((item, index) => {
                                const selectedProducts = products.map(p => p.product);

                                const productOptions = availableProducts
                                    .filter(p => !selectedProducts.includes(p.productId) || p.productId === item.product)
                                    .map(p => ({
                                        value: p.productId,
                                        label: p.name,
                                    }));
                                const productInfo = availableProducts.find((p) => p.productId === item.product);
                                const availableQty = productInfo?.quantity || 0;
                                // const price = productInfo?.price || item.price || 0;
                                // const subtotal = (item.quantity || 0) * price;

                                return (
                                    <div key={index} className="border rounded p-3 mb-3 bg-light position-relative">
                                        <div className="row g-3 align-items-end">
                                            <div className="col">
                                                <label className="form-label fw-bold text-muted small mb-2">
                                                    Product
                                                </label>
                                                <Select
                                                    options={productOptions}
                                                    value={productOptions.find((opt) => opt.value === item.product) || null}
                                                    onChange={(opt) => handleProductChange(index, opt)}
                                                    placeholder="Select Product"
                                                    isSearchable
                                                    required
                                                />
                                            </div>
                                            <div className="col-auto" style={{ width: "150px" }}>
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
                                            <div className="col-auto" style={{ width: "150px" }}>
                                                <label className="form-label fw-bold text-muted small mb-2">
                                                    Loss Quantity
                                                </label>
                                                <input
                                                    type="number"
                                                    className="form-control text-danger"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                                                    required
                                                />
                                            </div>
                                            {/* <div className="col-md-2">
                                                <label className="form-label fw-bold text-muted small mb-2">
                                                    Buying Price
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formatCurrency(price)}
                                                    readOnly
                                                />
                                            </div>
                                            <div className="col-md-2">
                                                <label className="form-label fw-bold text-muted small mb-2">
                                                    Loss Value
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formatCurrency(subtotal)}
                                                    readOnly
                                                />
                                            </div> */}
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

                            {/* Notes */}
                            <div className="mt-4">
                                <label className="form-label fw-bold text-muted small mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    placeholder="Reason for adjustment (e.g. damage, stolen, miscount)"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                ></textarea>
                            </div>

                            {/* Total Loss */}
                            {/* <div className="border-top pt-4 mt-4">
                                <div className="row justify-content-end">
                                    <div className="col-md-6">
                                        <div className="bg-white border rounded shadow-sm p-3 text-end">
                                            <div className="text-muted small">Total Loss</div>
                                            <div className="fs-5 fw-semibold text-dark">
                                                {formatCurrency(totalLoss)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div> */}
                        </div>

                        {/* Footer */}
                        <div className="modal-footer border-0 px-3 py-3 m-1">
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary btn-sm">
                                Save Reconciliation
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    ) : null;
};

export default ReconciliationFormModal;
