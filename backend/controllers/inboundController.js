// controllers/inboundController.js

const Inbound = require("../models/Inbound");
const Product = require("../models/Product");
const Warehouse = require("../models/Warehouse");
const Inventory = require("../models/Inventory");

exports.createInbound = async (req, res) => {
    try {
        const { warehouseId, products, date  } = req.body;

        // Validate warehouse
        const warehouse = await Warehouse.findById(warehouseId);
        if (!warehouse) {
            return res.status(404).json({ message: "Warehouse not found" });
        }

        // Validate products
        for (let { product, quantity, buyingPrice } of products) {
            const found = await Product.findById(product);
            if (!found) {
                return res.status(404).json({ message: `Product with ID ${product} not found` });
            }
            if (quantity <= 0 || buyingPrice <= 0) {
                return res.status(400).json({ message: "Quantity and buying price must be greater than 0" });
            }
        }

        // ✅ Merge identical lines (same product + same price)
        const mergedProducts = [];
        for (let p of products) {
            const existing = mergedProducts.find(
                mp => mp.product === p.product && mp.buyingPrice === p.buyingPrice
            );
            if (existing) {
                existing.quantity += p.quantity;
            } else {
                mergedProducts.push({ ...p });
            }
        }

        // ✅ Calculate subtotals + total
        let totalAmount = 0;
        const inboundProducts = mergedProducts.map(p => {
            const subtotal = p.quantity * p.buyingPrice;
            totalAmount += subtotal;
            return { ...p, subtotal };
        });

        // Save Inbound
        const inbound = new Inbound({
            warehouse: warehouseId,
            products: inboundProducts,
            total: totalAmount,
            // date: new Date()
            date: date ? new Date(date) : new Date()  // ✅ use user input or fallback
        });
        await inbound.save();

        // Create Inventory records per merged line
        for (let { product, quantity, buyingPrice } of inboundProducts) {
            const newInventory = new Inventory({
                product,
                warehouse: warehouseId,
                quantity,
                buyingPrice,
                date: new Date(),
                inboundId: inbound._id
            });
            await newInventory.save();
        }

        res.status(201).json({ message: "Inbound created successfully", inbound });
    } catch (error) {
        console.error("Error creating inbound:", error);
        res.status(500).json({ message: "Error creating inbound", error: error.message });
    }
};

exports.getAllInbound = async (req, res) => {
    try {
        // Fetch all inbounds and populate related data (warehouse and products)
        const inbounds = await Inbound.find()
            .populate("warehouse", "name")  // Populate the warehouse name
            .populate("products.product", "name");  // Populate product names

        res.status(200).json(inbounds);
    } catch (error) {
        res.status(500).json({ message: "Error fetching inbounds", error });
    }
};

exports.reverseInbound = async (req, res) => {
    const { id } = req.params;

    try {
        const inbound = await Inbound.findById(id);
        if (!inbound) {
            return res.status(404).json({ message: "Inbound not found." });
        }

        if (inbound.reversed) {
            return res.status(400).json({ message: "This inbound has already been reversed." });
        }

        const { products } = inbound;

        for (const item of products) {
            const expectedQty = parseInt(item.quantity);

            // Sum total quantity in inventory (regardless of warehouse)
            const totalInventory = await Inventory.aggregate([
                {
                    $match: {
                        inboundId: inbound._id,
                        product: item.product,
                        buyingPrice: item.buyingPrice
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalQuantity: { $sum: "$quantity" }
                    }
                }
            ]);

            const currentQty = totalInventory[0]?.totalQuantity || 0;

            if (currentQty < expectedQty) {
                return res.status(400).json({
                    message: `Cannot reverse: Product ${item.product} has been sold or partially used.`
                });
            }
        }

        // Delete all inventory records from this inbound (even if split across warehouses)
        await Inventory.deleteMany({ inboundId: inbound._id });

        inbound.reversed = true;
        await inbound.save();

        res.status(200).json({ message: "Inbound reversed successfully." });
    } catch (error) {
        console.error("Error reversing inbound:", error);
        res.status(500).json({ message: "Error reversing inbound", error: error.message });
    }
};

// Old createInbound function, without subtotal and total fields
// exports.createInbound = async (req, res) => {
//     try {
//         const { warehouseId, products } = req.body;

//         // Validate warehouse
//         const warehouse = await Warehouse.findById(warehouseId);
//         if (!warehouse) {
//             return res.status(404).json({ message: "Warehouse not found" });
//         }

//         // Validate products
//         for (let { product, quantity, buyingPrice } of products) {
//             const found = await Product.findById(product);
//             if (!found) {
//                 return res.status(404).json({ message: `Product with ID ${product} not found` });
//             }
//             if (quantity <= 0 || buyingPrice <= 0) {
//                 return res.status(400).json({ message: "Quantity and buying price must be greater than 0" });
//             }
//         }

//         // ✅ Merge identical lines (same product + same price)
//         const mergedProducts = [];
//         for (let p of products) {
//             const existing = mergedProducts.find(
//                 mp => mp.product === p.product && mp.buyingPrice === p.buyingPrice
//             );
//             if (existing) {
//                 existing.quantity += p.quantity;
//             } else {
//                 mergedProducts.push({ ...p });
//             }
//         }

//         // Save Inbound
//         const inbound = new Inbound({
//             warehouse: warehouseId,
//             products: mergedProducts,
//             date: new Date()
//         });
//         await inbound.save();

//         // Create Inventory records per merged line
//         for (let { product, quantity, buyingPrice } of mergedProducts) {
//             const newInventory = new Inventory({
//                 product,
//                 warehouse: warehouseId,
//                 quantity,
//                 buyingPrice,
//                 date: new Date(),
//                 inboundId: inbound._id
//             });
//             await newInventory.save();
//         }

//         res.status(201).json({ message: "Inbound created successfully", inbound });
//     } catch (error) {
//         console.error("Error creating inbound:", error);
//         res.status(500).json({ message: "Error creating inbound", error: error.message });
//     }
// };


// Old createInbound function, without merging identical product and price lines
// exports.createInbound = async (req, res) => {
//     try {
//         const { warehouseId, products } = req.body;

//         // Validate warehouse
//         const warehouse = await Warehouse.findById(warehouseId);
//         if (!warehouse) {
//             return res.status(404).json({ message: "Warehouse not found" });
//         }

//         // Validate products
//         for (let { product, quantity, buyingPrice } of products) {
//             const found = await Product.findById(product);
//             if (!found) {
//                 return res.status(404).json({ message: `Product with ID ${product} not found` });
//             }
//             if (quantity <= 0 || buyingPrice <= 0) {
//                 return res.status(400).json({ message: "Quantity and buying price must be greater than 0" });
//             }
//         }

//         // Save Inbound first
//         const inbound = new Inbound({
//             warehouse: warehouseId,
//             products,
//             date: new Date()
//         });
//         await inbound.save();

//         // Create separate Inventory records for each inbound line
//         for (let { product, quantity, buyingPrice } of products) {
//             const newInventory = new Inventory({
//                 product,
//                 warehouse: warehouseId,
//                 quantity,
//                 buyingPrice,
//                 date: new Date(),
//                 inboundId: inbound._id // ✅ traceable
//             });
//             await newInventory.save();
//         }

//         res.status(201).json({ message: "Inbound created successfully", inbound });
//     } catch (error) {
//         console.error("Error creating inbound:", error);
//         res.status(500).json({ message: "Error creating inbound", error: error.message });
//     }
// };


// // Old reverseInbound, strict reference logic, quantity must not be moved to other warehouse even if unconsumed
// exports.reverseInbound = async (req, res) => {
//     const { id } = req.params; // Changed from inboundId to id

//     try {
//         const inbound = await Inbound.findById(id);
//         if (!inbound) {
//             return res.status(404).json({ message: "Inbound not found." });
//         }

//         const { warehouse, products } = inbound;

//         // Check each product line
//         for (const item of products) {
//             const inventory = await Inventory.findOne({
//                 inboundId: id,
//                 product: item.product,
//                 warehouse,
//                 buyingPrice: item.buyingPrice,
//                 quantity: item.quantity
//             });

//             if (!inventory) {
//                 return res.status(400).json({
//                     message: `Cannot reverse: Product ${item.product} has been used, moved, or changed.`
//                 });
//             }
//         }

//         // All checks passed — delete inventory entries
//         for (const item of products) {
//             await Inventory.deleteOne({
//                 inboundId: id,
//                 product: item.product,
//                 warehouse,
//                 buyingPrice: item.buyingPrice,
//                 quantity: item.quantity
//             });
//         }

//         inbound.reversed = true;
//         await inbound.save();

//         res.status(200).json({ message: "Inbound reversed successfully." });
//     } catch (error) {
//         console.error("Error reversing inbound:", error);
//         res.status(500).json({ message: "Error reversing inbound", error: error.message });
//     }
// };
