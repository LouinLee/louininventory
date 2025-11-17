// src/components/ProductFormModal.jsx

import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { toast } from "react-toastify";
import Select from "react-select";

import { motion } from "framer-motion";
import { FaBoxOpen, FaBoxes } from "react-icons/fa";

const ProductFormModal = ({ show, onClose, product }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [priceError, setPriceError] = useState(""); // For price validation error
    const [image, setImage] = useState(null); // 🆕 new state for file
    const [preview, setPreview] = useState(null);    // For showing image preview

    // Populate form when editing product
    useEffect(() => {
        if (product) {
            setName(product.name || "");
            setDescription(product.description || "");
            setPrice(product.price || "");
            setCategory(product.category?._id || "");

            // 🖼 If product already has an image, show it in preview
            if (product.image) {
                setPreview(`http://localhost:5000${product.image}`);
            } else {
                setPreview(null);
            }

            setImage(null); // Reset selected file
        } else {
            setName("");
            setDescription("");
            setPrice("");
            setCategory("");
            setPreview(null);
            setImage(null);
        }
    }, [product]);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get("/categories", { withCredentials: true });
                setCategories(res.data);
            } catch (err) {
                console.error("Failed to fetch categories", err);
                toast.error("Failed to fetch categories");
            }
        };
        fetchCategories();
    }, []);

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

    // Validate price input
    const handlePriceChange = (e) => {
        const value = e.target.value;
        setPrice(value);
        if (isNaN(value) || value <= 0) {
            setPriceError("Price must be a positive number");
        } else {
            setPriceError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (priceError) {
            toast.error(priceError);
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("price", price);

        // ✅ Only append category if it’s actually selected
        if (category) {
            formData.append("category", category);
        }

        // ✅ Only append image if a file is selected
        if (image) {
            formData.append("image", image);
        }

        // ✅ If user removed image (no preview, but product had image)
        if (!preview && product?.image) {
            formData.append("removeImage", true);
        }

        try {
            if (product) {
                // Edit product
                await axios.put(`/products/${product._id}`, formData, {
                    withCredentials: true,
                });
                toast.success("Product updated successfully");
            } else {
                // Create new product
                await axios.post("/products", formData, {
                    withCredentials: true,
                });
                toast.success("Product created successfully");
            }
            onClose();
            setImage(null);
            setPreview(null);
        }
        // catch (error) {
        //     toast.error(error.response?.data?.message || "An error occurred");
        //     console.error("Error saving product:", error);
        // }
        catch (error) {
            if (error.response?.status === 403) {
                toast.error("You don't have permission to perform this action.");
            } else if (error.response?.status === 401) {
                toast.error("Your session has expired. Please log in again.");
            } else {
                toast.error(error.response?.data?.message || "An error occurred");
            }
            console.error("Error saving product:", error);
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
                                <FaBoxOpen className="me-3" size={25} />
                                {product ? "Edit Product" : "Add Product"}
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
                                <label className="form-label fw-bold text-muted small mb-2">Product Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter product name"
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
                                    placeholder="Enter product description (optional)"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold text-muted small mb-2">Price</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Enter price"
                                    value={price}
                                    onChange={handlePriceChange}
                                    required
                                    step="0.01"
                                />
                                {priceError && <div className="text-danger small mt-1">{priceError}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold text-muted small mb-2">Category</label>
                                <Select
                                    options={categories.map((cat) => ({
                                        value: cat._id,
                                        label: cat.name,
                                    }))}
                                    value={categories
                                        .map((cat) => ({ value: cat._id, label: cat.name }))
                                        .find((option) => option.value === category)}
                                    onChange={(selectedOption) =>
                                        setCategory(selectedOption ? selectedOption.value : "")
                                    }
                                    placeholder="Select Category"
                                    isSearchable
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold text-muted small mb-2">Product Image</label>
                                {preview && (
                                    <div className="mb-3 text-center">
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="img-thumbnail mb-2"
                                            style={{ maxHeight: "150px" }}
                                        />
                                        <div>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => {
                                                    setImage(null);
                                                    setPreview(null);
                                                }}
                                            >
                                                Remove Image
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setImage(file);
                                            setPreview(URL.createObjectURL(file)); // 🖼 Preview the file
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer border-0 px-3 py-3 m-1">
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary btn-sm">
                                {product ? "Update" : "Create"}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    ) : null;
};

export default ProductFormModal;

{/* Old return */ }
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
//             className="modal-dialog modal-dialog-centered"
//         >
//             <div className="modal-content">
//                 <form onSubmit={handleSubmit}>
//                     <div className="modal-header">
//                         <h5 className="modal-title">
//                             <i className="bi bi-box-seam-fill me-2" style={{ color: "black" }}></i>
//                             <strong>{product ? "Edit Product" : "Add Product"}</strong>
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
//                             <label className="form-label"><strong>Description</strong></label>
//                             <textarea
//                                 className="form-control"
//                                 value={description}
//                                 onChange={(e) => setDescription(e.target.value)}
//                             ></textarea>
//                         </div>
//                         <div className="mb-3">
//                             <label className="form-label"><strong>Price</strong></label>
//                             <input
//                                 type="number"
//                                 className="form-control"
//                                 value={price}
//                                 onChange={handlePriceChange}
//                                 required
//                                 step="0.01"
//                             />
//                             {priceError && <div className="text-danger">{priceError}</div>}
//                         </div>
//                         <div className="mb-3">
//                             <label className="form-label"><strong>Category</strong></label>
//                             <Select
//                                 options={categories.map((cat) => ({
//                                     value: cat._id,
//                                     label: cat.name,
//                                 }))}
//                                 value={categories
//                                     .map((cat) => ({ value: cat._id, label: cat.name }))
//                                     .find((option) => option.value === category)}
//                                 onChange={(selectedOption) => setCategory(selectedOption ? selectedOption.value : "")}
//                                 placeholder="Select Category"
//                                 isSearchable
//                             />
//                         </div>
//                     </div>
//                     <div className="modal-footer">
//                         <button type="button" className="btn btn-secondary" onClick={onClose}>
//                             Cancel
//                         </button>
//                         <button type="submit" className="btn btn-primary">
//                             {product ? "Update" : "Create"}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </motion.div>
//     </motion.div>
// ) : null;

{/* Old handleSubmit */ }
// const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (priceError) {
//         toast.error(priceError);
//         return;
//     }

//     const payload = {
//         name,
//         description,
//         price,
//         category: category || null,
//     };

//     try {
//         if (product) {
//             // Edit product
//             await axios.put(`/products/${product._id}`, payload, { withCredentials: true });
//             toast.success("Product updated successfully");
//         } else {
//             // Create new product
//             await axios.post("/products", payload, { withCredentials: true });
//             toast.success("Product created successfully");
//         }
//         onClose(); // Close modal
//     } catch (error) {
//         if (error.response) {
//             // Handle specific backend errors
//             if (error.response.status === 400) {
//                 toast.error(error.response.data.message || "Validation error");
//             } else if (error.response.status === 404) {
//                 toast.error("Product not found");
//             } else {
//                 toast.error(error.response.data.message || "An error occurred");
//             }
//         } else {
//             // Handle network or other errors
//             toast.error("Failed to connect to the server");
//         }
//         console.error("Error saving product:", error);
//     }
// };

{/* Old useEffect */ }
// useEffect(() => {
//     if (show) {
//         document.body.classList.add("modal-open");
//     } else {
//         document.body.classList.remove("modal-open");
//     }

//     return () => document.body.classList.remove("modal-open");
// }, [show]);
