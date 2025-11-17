// src/pages/ReportOutbound.jsx

import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "../utils/axios";
import currencyFormat from "../utils/formatCurrency";
import { FaChartPie } from "react-icons/fa";
import { motion } from "framer-motion";

import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import autoTable from "jspdf-autotable"; // ⬅️ import the function directly

const ReportOutbound = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(""); // active filter
    const [tempSelectedWarehouse, setTempSelectedWarehouse] = useState(""); // controlled dropdown
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reportData, setReportData] = useState({ items: [], globalTotals: {} });

    // Controlled temporary date values for motion.div animation
    const [tempStartDate, setTempStartDate] = useState("");
    const [tempEndDate, setTempEndDate] = useState("");

    useEffect(() => {
        axios.get("/warehouses").then((res) => setWarehouses(res.data));
    }, []);

    const fetchReport = () => {
        setSelectedWarehouse(tempSelectedWarehouse); // apply the filter
        setStartDate(tempStartDate);
        setEndDate(tempEndDate);

        let query = [];

        // *** Real time date filters (no animation) ***
        // if (startDate) query.push(`startDate=${startDate}`);
        // if (endDate) query.push(`endDate=${endDate}`);

        if (tempStartDate) query.push(`startDate=${tempStartDate}`);
        if (tempEndDate) query.push(`endDate=${tempEndDate}`);

        if (tempSelectedWarehouse && tempSelectedWarehouse.trim() !== "") {
            query.push(`warehouseId=${tempSelectedWarehouse}`);
        }

        const queryString = query.length ? `?${query.join("&")}` : "";

        axios.get(`/reports/outbound${queryString}`).then((res) => {
            setReportData(res.data);
        });
    };

    const warehouseOptions = [
        { value: "", label: "All Warehouses" },
        ...warehouses.map(w => ({ value: w._id, label: w.name })),
    ];

    const allMode = !selectedWarehouse; // true if showing all warehouses

    // const exportToExcel = async () => {
    //     if (!reportData.items.length) return;

    //     const workbook = new ExcelJS.Workbook();
    //     const worksheet = workbook.addWorksheet("Outbound Report");

    //     // === Title Row ===
    //     worksheet.mergeCells("A1", allMode ? "F1" : "E1");
    //     const titleCell = worksheet.getCell("A1");
    //     titleCell.value = "Outbound Report";
    //     titleCell.font = { size: 16, bold: true };
    //     titleCell.alignment = { horizontal: "center" };

    //     // === Generated At (top-right) ===
    //     const now = new Date();
    //     const generatedAt = now.toLocaleString("en-US", {
    //         year: "numeric",
    //         month: "2-digit",
    //         day: "2-digit",
    //         hour: "2-digit",
    //         minute: "2-digit",
    //     });
    //     const generatedCell = worksheet.getCell(allMode ? "F2" : "E2");
    //     generatedCell.value = `Generated: ${generatedAt}`;
    //     generatedCell.font = { size: 9, color: { argb: "777777" } };
    //     generatedCell.alignment = { horizontal: "right" };

    //     worksheet.addRow([]);

    //     // === Warehouse & Date Range Row ===
    //     const warehouseValue = selectedWarehouse
    //         ? warehouses.find((w) => w._id === selectedWarehouse)?.name || "Unknown"
    //         : "All Warehouses";

    //     const dateValue =
    //         startDate || endDate
    //             ? `${startDate ? new Date(startDate).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "Earliest"} - ${endDate ? new Date(endDate).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "Latest"}`
    //             : "All Time";

    //     const filterRow = worksheet.addRow([
    //         `Warehouse: ${warehouseValue}`,
    //         "",
    //         "",
    //         "",
    //         allMode ? "" : null,
    //         `Date: ${dateValue}`,
    //     ]);
    //     filterRow.font = { size: 10 };
    //     filterRow.alignment = { vertical: "middle" };

    //     // 🔹 Add one empty row before table (fix #1)
    //     worksheet.addRow([]);

    //     // === Table Header ===
    //     const headerRow = worksheet.addRow([
    //         "Date",
    //         ...(allMode ? ["Warehouse"] : []),
    //         "Product",
    //         "Quantity",
    //         "Unit Price",
    //         "Subtotal",
    //     ]);

    //     headerRow.eachCell((cell) => {
    //         cell.font = { bold: true };
    //         cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "DDDDDD" } };
    //         cell.alignment = { horizontal: "center", vertical: "middle" }; // 🔹 center headers
    //     });

    //     // === Table Body ===
    //     reportData.items.forEach((item) => {
    //         const row = worksheet.addRow([
    //             new Date(item.date),
    //             ...(allMode ? [item.warehouseName] : []),
    //             item.product,
    //             item.quantity,
    //             item.sellingPrice,
    //             item.sellingSubtotal,
    //         ]);

    //         row.eachCell((cell, colNumber) => {
    //             if (allMode) {
    //                 if (colNumber === 4) cell.alignment = { horizontal: "center" }; // Quantity
    //                 else if (colNumber === 5 || colNumber === 6) cell.alignment = { horizontal: "right" }; // Unit Price & Subtotal
    //                 else cell.alignment = { horizontal: "left" }; // Default
    //             } else {
    //                 if (colNumber === 3) cell.alignment = { horizontal: "center" }; // Quantity
    //                 else if (colNumber === 4 || colNumber === 5) cell.alignment = { horizontal: "right" }; // Unit Price & Subtotal
    //                 else cell.alignment = { horizontal: "left" }; // Default
    //             }
    //         });
    //     });

    //     // === Column Formatting ===
    //     const dateCol = worksheet.getColumn(1);
    //     dateCol.width = 12;
    //     dateCol.numFmt = "mm/dd/yyyy"; // fix #2

    //     let colIndex = 2;
    //     if (allMode) {
    //         worksheet.getColumn(colIndex).width = 18; // warehouse
    //         colIndex++;
    //     }
    //     worksheet.getColumn(colIndex).width = 20; colIndex++; // product
    //     worksheet.getColumn(colIndex).width = 12; worksheet.getColumn(colIndex).numFmt = "#,##0"; colIndex++; // quantity
    //     worksheet.getColumn(colIndex).width = 15; worksheet.getColumn(colIndex).numFmt = "#,##0"; colIndex++; // unit price (fix #3)
    //     worksheet.getColumn(colIndex).width = 15; worksheet.getColumn(colIndex).numFmt = "#,##0"; // subtotal (fix #3)

    //     // === AutoFit Column Widths === (fix #5)
    //     worksheet.columns.forEach((col) => {
    //         let maxLength = 0;
    //         col.eachCell({ includeEmpty: true }, (cell) => {
    //             const value = cell.value ? cell.value.toString() : "";
    //             maxLength = Math.max(maxLength, value.length);
    //         });
    //         col.width = Math.min(Math.max(maxLength + 2, 12), 40);
    //     });

    //     // === Totals Section ===
    //     worksheet.addRow([]);
    //     const totals = [
    //         { label: "Total Procurement Cost", value: reportData.globalTotals.totalBuying, color: "DC3545" }, // red
    //         { label: "Total Sales", value: reportData.globalTotals.totalSelling, color: "0D6EFD" }, // blue
    //         { label: "Total Profit", value: reportData.globalTotals.profit, color: "198754" }, // green
    //     ];

    //     totals.forEach((t) => {
    //         const row = worksheet.addRow([t.label, t.value]);
    //         row.getCell(1).font = { bold: true, color: { argb: t.color } }; // label colored
    //         row.getCell(2).font = { bold: true, color: { argb: t.color } }; // value bold + colored
    //         row.getCell(2).numFmt = "#,##0"; // fix #4
    //     });

    //     // === Export File ===
    //     const buffer = await workbook.xlsx.writeBuffer();
    //     saveAs(new Blob([buffer]), "Outbound_Report.xlsx");
    // };

    const exportToExcel = async () => {
        if (!reportData.items.length) return;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Outbound Report");

        // === Title Row ===
        worksheet.mergeCells("A1", allMode ? "G1" : "F1"); // one more col for discount
        const titleCell = worksheet.getCell("A1");
        titleCell.value = "Outbound Report";
        titleCell.font = { size: 16, bold: true };
        titleCell.alignment = { horizontal: "center" };

        // === Generated At (top-right) ===
        const now = new Date();
        const generatedAt = now.toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
        const generatedCell = worksheet.getCell(allMode ? "G2" : "F2");
        generatedCell.value = `Generated: ${generatedAt}`;
        generatedCell.font = { size: 9, color: { argb: "777777" } };
        generatedCell.alignment = { horizontal: "right" };

        worksheet.addRow([]);

        // === Warehouse & Date Range Row ===
        const warehouseValue = selectedWarehouse
            ? warehouses.find((w) => w._id === selectedWarehouse)?.name || "Unknown"
            : "All Warehouses";

        const dateValue =
            startDate || endDate
                ? `${startDate ? new Date(startDate).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "Earliest"} - ${endDate ? new Date(endDate).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "Latest"}`
                : "All Time";

        const filterRow = worksheet.addRow([
            `Warehouse: ${warehouseValue}`,
            "",
            "",
            "",
            allMode ? "" : null,
            "",
            `Date: ${dateValue}`,
        ]);
        filterRow.font = { size: 10 };
        filterRow.alignment = { vertical: "middle" };

        worksheet.addRow([]);

        // === Table Header ===
        const headerRow = worksheet.addRow([
            "Date",
            ...(allMode ? ["Warehouse"] : []),
            "Product",
            "Quantity",
            "Unit Price",
            "Discount",
            "Subtotal",
        ]);

        headerRow.eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "DDDDDD" } };
            cell.alignment = { horizontal: "center", vertical: "middle" };
        });

        // === Table Body ===
        reportData.items.forEach((item) => {
            // ✅ use discountValue
            let discountDisplay = "-";
            if (item.discountType === "percent") {
                discountDisplay = item.discountValue > 0 ? `${item.discountValue}%` : "-";
            } else if (item.discountType === "amount") {
                discountDisplay = item.discountValue > 0
                    ? item.discountValue.toLocaleString()
                    : "-";
            }

            const row = worksheet.addRow([
                new Date(item.date),
                ...(allMode ? [item.warehouseName] : []),
                item.product,
                item.quantity,
                item.sellingPrice,
                discountDisplay,
                item.sellingSubtotal,
            ]);

            row.eachCell((cell, colNumber) => {
                if (allMode) {
                    if (colNumber === 4) cell.alignment = { horizontal: "center" }; // Quantity
                    else if (colNumber === 5 || colNumber === 7) cell.alignment = { horizontal: "right" }; // Unit Price & Subtotal
                    else if (colNumber === 6) cell.alignment = { horizontal: "right" }; // Discount
                    else cell.alignment = { horizontal: "left" };
                } else {
                    if (colNumber === 3) cell.alignment = { horizontal: "center" }; // Quantity
                    else if (colNumber === 4 || colNumber === 6) cell.alignment = { horizontal: "right" }; // Unit Price & Subtotal
                    else if (colNumber === 5) cell.alignment = { horizontal: "right" }; // Discount
                    else cell.alignment = { horizontal: "left" };
                }
            });
        });

        // === Column Formatting ===
        const dateCol = worksheet.getColumn(1);
        dateCol.width = 12;
        dateCol.numFmt = "mm/dd/yyyy";

        let colIndex = 2;
        if (allMode) {
            worksheet.getColumn(colIndex).width = 18; colIndex++; // warehouse
        }
        worksheet.getColumn(colIndex).width = 20; colIndex++; // product
        worksheet.getColumn(colIndex).width = 12; worksheet.getColumn(colIndex).numFmt = "#,##0"; colIndex++; // qty
        worksheet.getColumn(colIndex).width = 15; worksheet.getColumn(colIndex).numFmt = "#,##0"; colIndex++; // unit price
        worksheet.getColumn(colIndex).width = 12; colIndex++; // discount (text/number, keep simple)
        worksheet.getColumn(colIndex).width = 15; worksheet.getColumn(colIndex).numFmt = "#,##0"; // subtotal

        // === AutoFit Column Widths ===
        worksheet.columns.forEach((col) => {
            let maxLength = 0;
            col.eachCell({ includeEmpty: true }, (cell) => {
                const value = cell.value ? cell.value.toString() : "";
                maxLength = Math.max(maxLength, value.length);
            });
            col.width = Math.min(Math.max(maxLength + 2, 12), 40);
        });

        // === Totals Section ===
        worksheet.addRow([]);
        const totals = [
            { label: "Total Procurement Cost", value: reportData.globalTotals.totalBuying, color: "DC3545" },
            { label: "Total Sales", value: reportData.globalTotals.totalSelling, color: "0D6EFD" },
            { label: "Total Profit", value: reportData.globalTotals.profit, color: "198754" },
        ];

        totals.forEach((t) => {
            const row = worksheet.addRow([t.label, t.value]);
            row.getCell(1).font = { bold: true, color: { argb: t.color } };
            row.getCell(2).font = { bold: true, color: { argb: t.color } };
            row.getCell(2).numFmt = "#,##0";
        });

        // === Export File ===
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "Outbound_Report.xlsx");
    };

    const exportToPDF = () => {
        if (!reportData.items.length) return;

        const doc = new jsPDF({
            orientation: "p",
            unit: "mm",
            format: "a4",
        });

        // === Layout constants ===
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 14;
        const contentWidth = pageWidth - margin * 2;

        // === HEADER ===
        const now = new Date();
        const generatedAt = now.toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });

        // --- Title (centered) ---
        doc.setFontSize(16);
        doc.setFont(undefined, "bold");
        doc.text("Outbound Report", pageWidth / 2, 18, { align: "center" });

        // --- Generated date/time (top-right corner) ---
        doc.setFontSize(9);
        doc.setFont(undefined, "normal");
        doc.setTextColor(120);
        doc.text(`Generated: ${generatedAt}`, pageWidth - margin, 18, { align: "right" });

        // --- Divider line ---
        doc.setDrawColor(200);
        doc.line(margin, 24, pageWidth - margin, 24);

        // --- Reset text style for filters ---
        doc.setTextColor(0);
        doc.setFontSize(10);

        const filterY = 32;
        const headerLabelSpacing = 2; // spacing between label and value in header

        // --- Warehouse (left side) ---
        const warehouseLabelText = "Warehouse: ";
        const warehouseValueText = selectedWarehouse
            ? warehouses.find((w) => w._id === selectedWarehouse)?.name || "Unknown"
            : "All Warehouses";

        doc.setFont(undefined, "bold");
        doc.text(warehouseLabelText, margin, filterY);

        doc.setFont(undefined, "normal");
        doc.text(
            warehouseValueText,
            margin + doc.getTextWidth(warehouseLabelText) + headerLabelSpacing,
            filterY
        );

        // --- Date Range (right side) ---
        const dateLabelText = "Date: ";
        const dateValueText =
            startDate || endDate
                ? `${startDate ? new Date(startDate).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }) : "Earliest"} - ${endDate ? new Date(endDate).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }) : "Latest"
                }`
                : "All Time";

        const totalDateWidth = doc.getTextWidth(dateLabelText) + doc.getTextWidth(dateValueText) + headerLabelSpacing;

        doc.setFont(undefined, "bold");
        doc.text(dateLabelText, pageWidth - margin - totalDateWidth, filterY);

        doc.setFont(undefined, "normal");
        doc.text(dateValueText, pageWidth - margin - doc.getTextWidth(dateValueText), filterY);

        // === TABLE ===
        const tableStartY = 42; // renamed from tableY
        autoTable(doc, {
            // head: [
            //     [
            //         "Date",
            //         ...(allMode ? ["Warehouse"] : []),
            //         "Product",
            //         "Qty",
            //         "Unit Price",
            //         "Subtotal",
            //     ],
            // ],

            // body: reportData.items.map((item, idx, arr) => {
            //     const prevItem = arr[idx - 1];
            //     const sameOutbound = prevItem && prevItem.outboundId === item.outboundId;

            //     const row = [
            //         sameOutbound
            //             ? ""
            //             : new Date(item.date).toLocaleDateString("en-US", {
            //                 year: "numeric",
            //                 month: "2-digit",
            //                 day: "2-digit",
            //             }),
            //     ];
            //     if (allMode) row.push(sameOutbound ? "" : item.warehouseName);
            //     row.push(item.product, item.quantity, currencyFormat(item.sellingPrice), currencyFormat(item.sellingSubtotal));
            //     return row;
            // }),

            head: [
                [
                    "Date",
                    ...(allMode ? ["Warehouse"] : []),
                    "Product",
                    "Qty",
                    "Unit Price",
                    "Discount",   // ✅ new column
                    "Subtotal",
                ],
            ],

            body: reportData.items.map((item, idx, arr) => {
                const prevItem = arr[idx - 1];
                const sameOutbound = prevItem && prevItem.outboundId === item.outboundId;

                // ✅ Format discount
                let discountDisplay = "-";
                if (item.discountType === "percent") {
                    discountDisplay = item.discountValue > 0 ? `${item.discountValue}%` : "-";
                } else if (item.discountType === "amount") {
                    discountDisplay = item.discountValue > 0 ? currencyFormat(item.discountValue) : "-";
                }

                const row = [
                    sameOutbound
                        ? ""
                        : new Date(item.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                        }),
                ];

                if (allMode) row.push(sameOutbound ? "" : item.warehouseName);

                row.push(
                    item.product,
                    item.quantity,
                    currencyFormat(item.sellingPrice),
                    discountDisplay, // ✅ inserted here
                    currencyFormat(item.sellingSubtotal)
                );

                return row;
            }),

            startY: tableStartY,
            margin: { left: margin, right: margin },
            styles: { fontSize: 9 },
            didDrawPage: (data) => {
                // Add footer with page numbers
                const pageCount = doc.internal.getNumberOfPages();
                const pageSize = doc.internal.pageSize;
                const pageHeightCurrent = pageSize.height ? pageSize.height : pageSize.getHeight();

                doc.setFontSize(9);
                doc.setTextColor(150);
                doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageWidth - margin, pageHeightCurrent - 10, { align: "right" });
            },
        });

        // // === FOOTER (Summary KPI Boxes) ===
        // const kpiBoxHeight = 20;
        // const kpiBoxSpacing = 8; // spacing between KPI boxes
        // const kpiBoxWidth = (contentWidth - 2 * kpiBoxSpacing) / 3;
        // let kpiStartY = doc.lastAutoTable.finalY + 14;

        // // ⚡ If not enough space, push to new page
        // if (kpiStartY + kpiBoxHeight + margin > pageHeight) {
        //     doc.addPage();
        //     kpiStartY = margin + 10;
        // }

        // const metrics = [
        //     { label: "Total Procurement Cost", value: currencyFormat(reportData.globalTotals.totalBuying), color: [220, 53, 69] }, // red
        //     { label: "Total Sales", value: currencyFormat(reportData.globalTotals.totalSelling), color: [13, 110, 253] }, // blue
        //     { label: "Total Profit", value: currencyFormat(reportData.globalTotals.profit), color: [25, 135, 84] }, // green
        // ];

        // metrics.forEach((metric, i) => {
        //     const x = margin + i * (kpiBoxWidth + kpiBoxSpacing);

        //     // Background
        //     doc.setFillColor(245, 245, 245);
        //     doc.roundedRect(x, kpiStartY, kpiBoxWidth, kpiBoxHeight, 3, 3, "F");

        //     // Label
        //     doc.setFontSize(9);
        //     doc.setTextColor(100);
        //     doc.setFont(undefined, "normal");
        //     doc.text(metric.label, x + 4, kpiStartY + 7);

        //     // Value
        //     doc.setFontSize(11);
        //     doc.setTextColor(...metric.color);
        //     doc.setFont(undefined, "bold");
        //     doc.text(metric.value, x + 4, kpiStartY + 14);
        // });

        // === GRAND TOTALS (Re-designed Footer with Flexible Width and Alignment) ===
        let totalsY = doc.lastAutoTable.finalY + 14;

        if (totalsY + 30 > pageHeight) { // Check if there's enough space for the totals block
            doc.addPage();
            totalsY = margin + 10;
        }

        const metrics = [
            { label: "Total Procurement", value: currencyFormat(reportData.globalTotals.totalBuying), color: [220, 53, 69] },
            { label: "Total Sales", value: currencyFormat(reportData.globalTotals.totalSelling), color: [13, 110, 253] },
            { label: "Total Profit", value: currencyFormat(reportData.globalTotals.profit), color: [25, 135, 84] },
        ];

        // --- Dynamic Column Width Calculation ---
        doc.setFontSize(9); // Set font for measurement
        const maxLabelWidth = Math.max(...metrics.map(m => doc.getTextWidth(m.label)));
        doc.setFontSize(10); // Set font for measurement
        const maxValueWidth = Math.max(...metrics.map(m => doc.getTextWidth(m.value)));

        const labelColWidth = maxLabelWidth;
        const valueColWidth = maxValueWidth;
        const colonGap = 5; // Space around the colon

        // Total width of the content block
        const totalBlockWidth = labelColWidth + colonGap + valueColWidth + colonGap;

        // --- Positioning ---
        const blockEndX = pageWidth - margin; // Right edge of the page margin
        const blockStartX = blockEndX - totalBlockWidth; // Dynamically calculated left edge

        const titleX = blockStartX + totalBlockWidth / 2; // Center of the dynamic block
        const labelX = blockStartX;
        const colonX = blockStartX + labelColWidth + colonGap;
        const valueX = blockEndX;

        // --- Drawing ---
        doc.setFontSize(11);
        doc.setFont(undefined, "bold");
        doc.text("Grand Totals", titleX, totalsY, { align: "center" });
        totalsY += 6;

        doc.setDrawColor(180);
        doc.line(blockStartX, totalsY, blockEndX, totalsY);
        totalsY += 8;

        metrics.forEach((metric, i) => {
            const currentY = totalsY + (i * 7);

            // Label
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.setFont(undefined, "normal");
            doc.text(metric.label, labelX, currentY, { align: "left" });

            // Colon
            doc.text(":", colonX, currentY, { align: "center" });

            // Value
            doc.setFontSize(10);
            doc.setTextColor(...metric.color);
            doc.setFont(undefined, "bold");
            doc.text(metric.value, valueX, currentY, { align: "right" });
        });

        doc.save("Outbound_Report.pdf");
    };

    return (
        <div className="container my-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold text-dark mb-0">Outbound Report</h4>
            </div>

            {/* Filters */}
            <div className="pt-4 mb-4">
                <div className="row g-3">
                    <div className="col-md-4">
                        <label className="form-label fw-semibold">Warehouse</label>
                        <Select
                            options={warehouseOptions}
                            value={warehouseOptions.find(o => o.value === tempSelectedWarehouse)}
                            onChange={(opt) => setTempSelectedWarehouse(opt ? opt.value : "")}
                            isClearable
                            isSearchable
                            placeholder="All Warehouses"
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label fw-semibold">Start Date</label>
                        <input
                            type="date"
                            value={tempStartDate}
                            onChange={(e) => setTempStartDate(e.target.value)}
                            className="form-control"
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label fw-semibold">End Date</label>
                        <input
                            type="date"
                            value={tempEndDate}
                            onChange={(e) => setTempEndDate(e.target.value)}
                            className="form-control"
                        />
                    </div>
                </div>
                <div className="d-flex justify-content-end mt-3">
                    <button className="btn btn-outline-success btn-sm me-3" onClick={exportToExcel}>
                        Export Excel
                    </button>
                    <button className="btn btn-outline-danger btn-sm me-3" onClick={exportToPDF}>
                        Export PDF
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={fetchReport}>
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* --- Report Results Section --- */}
            {reportData.items.length === 0 ? (
                <div className="text-center text-muted py-5">No report data available.</div>
            ) : (
                reportData.items.length > 0 && (
                    <motion.div
                        key={JSON.stringify(reportData.items)} // retrigger on data change
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Info Cards + Global Summary (shared border) */}
                        <div className="pt-4 pb-4 mb-4 border-bottom">
                            {/* Info Cards */}
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <div className="bg-white border rounded shadow-sm p-3">
                                        <div className="text-muted small">Date</div>
                                        <div
                                            className="fs-6 fw-semibold text-dark text-truncate"
                                            style={{ maxWidth: "300px" }}
                                        >
                                            {startDate || endDate
                                                ? `${startDate
                                                    ? new Date(startDate).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "2-digit",
                                                        day: "2-digit",
                                                    })
                                                    : "Earliest"} 
                            - ${endDate
                                                    ? new Date(endDate).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "2-digit",
                                                        day: "2-digit",
                                                    })
                                                    : "Latest"}`
                                                : "All Time"}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="bg-white border rounded shadow-sm p-3">
                                        <div className="text-muted small">Warehouse</div>
                                        <div
                                            className="fs-6 fw-semibold text-dark text-truncate"
                                            style={{ maxWidth: "300px" }}
                                        >
                                            {selectedWarehouse
                                                ? warehouses.find(w => w._id === selectedWarehouse)?.name || "Unknown"
                                                : "All Warehouses"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Global Summary */}
                            {reportData.globalTotals && (
                                <div className="bg-white rounded px-4 py-4 shadow-sm border">
                                    <div className="d-flex align-items-center mb-3">
                                        <FaChartPie className="text-primary me-2" size={22} />
                                        <span className="fw-semibold text-dark">Global Summary</span>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="text-muted small">Total Procurement</div>
                                            <div className="fs-6 fw-semibold text-danger">
                                                {currencyFormat(reportData.globalTotals.totalBuying)}
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="text-muted small">Total Sales</div>
                                            <div className="fs-6 fw-semibold text-primary">
                                                {currencyFormat(reportData.globalTotals.totalSelling)}
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="text-muted small">Total Profit</div>
                                            <div className="fs-6 fw-semibold text-success">
                                                {currencyFormat(reportData.globalTotals.profit)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Table */}
                        <div className="bg-white border rounded shadow-sm p-4">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="text-muted small border-bottom">
                                        <tr>
                                            <th style={{ width: "10%" }}>Date</th>
                                            {allMode && <th style={{ width: "15%" }}>Warehouse</th>}
                                            <th className="text-truncate" style={{ width: "25%" }}>Product</th>
                                            <th style={{ width: "8%" }}>Qty</th>
                                            <th style={{ width: "10%" }}>Unit Price</th>
                                            <th style={{ width: "12%" }}>Discount</th>
                                            <th style={{ width: "10%" }}>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.items.map((item, idx) => {
                                            const prevItem = reportData.items[idx - 1];
                                            const sameOutbound = prevItem && prevItem.outboundId === item.outboundId;
                                            const showDate = !sameOutbound;
                                            const showWarehouse = !sameOutbound;

                                            return (
                                                <tr key={idx}>
                                                    <td>
                                                        {showDate
                                                            ? new Date(item.date).toLocaleDateString("en-US", {
                                                                year: "numeric",
                                                                month: "2-digit",
                                                                day: "2-digit",
                                                            })
                                                            : ""}
                                                    </td>
                                                    {allMode && <td>{showWarehouse ? item.warehouseName : ""}</td>}
                                                    <td>{item.product}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>{currencyFormat(item.sellingPrice)}</td>
                                                    <td>
                                                        {item.discountType === "percent"
                                                            ? item.discountValue > 0
                                                                ? `${item.discountValue}%`
                                                                : "-" // show dash if 0%
                                                            : item.discountValue > 0
                                                                ? currencyFormat(item.discountValue)
                                                                : "-" // show dash if 0 amount
                                                        }
                                                    </td>
                                                    <td>{currencyFormat(item.sellingSubtotal)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )
            )}
        </div>
    );
};

export default ReportOutbound;


// return (
//     <div className="container my-5">
//         <div className="d-flex justify-content-between align-items-center mb-4">
//             <h4 className="fw-bold text-dark mb-0">Outbound Report</h4>
//         </div>

//         {/* Filters */}
//         <div className="pt-4 mb-4">
//             <div className="row g-3">
//                 <div className="col-md-4">
//                     <label className="form-label fw-semibold">Warehouse</label>
//                     <Select
//                         options={warehouseOptions}
//                         value={warehouseOptions.find(o => o.value === tempSelectedWarehouse)}
//                         onChange={(opt) => setTempSelectedWarehouse(opt ? opt.value : "")}
//                         isClearable
//                         isSearchable
//                         placeholder="All Warehouses"
//                     />
//                 </div>
//                 <div className="col-md-4">
//                     <label className="form-label fw-semibold">Start Date</label>
//                     <input
//                         type="date"
//                         value={tempStartDate}
//                         onChange={(e) => setTempStartDate(e.target.value)}
//                         className="form-control"
//                     />
//                 </div>
//                 <div className="col-md-4">
//                     <label className="form-label fw-semibold">End Date</label>
//                     <input
//                         type="date"
//                         value={tempEndDate}
//                         onChange={(e) => setTempEndDate(e.target.value)}
//                         className="form-control"
//                     />
//                 </div>
//             </div>
//             <div className="d-flex justify-content-end mt-3">
//                 <button className="btn btn-outline-success btn-sm me-3" onClick={exportToExcel}>
//                     Export Excel
//                 </button>
//                 <button className="btn btn-outline-danger btn-sm me-3" onClick={exportToPDF}>
//                     Export PDF
//                 </button>
//                 <button className="btn btn-primary btn-sm" onClick={fetchReport}>
//                     Apply Filters
//                 </button>
//             </div>
//         </div>

//         {/* Global Summary */}
//         {reportData.globalTotals && (
//             <div className="bg-light rounded px-4 py-4 shadow-sm border mb-4">
//                 <div className="d-flex align-items-center mb-3">
//                     <FaChartPie className="text-primary me-2" size={22} />
//                     <span className="fw-semibold text-dark">Global Summary</span>
//                 </div>
//                 <div className="row">
//                     <div className="col-md-4">
//                         <div className="text-muted small">Total Procurement Cost</div>
//                         <div className="fs-6 fw-semibold text-danger">
//                             {currencyFormat(reportData.globalTotals.totalBuying)}
//                         </div>
//                     </div>
//                     <div className="col-md-4">
//                         <div className="text-muted small">Total Sales</div>
//                         <div className="fs-6 fw-semibold text-primary">
//                             {currencyFormat(reportData.globalTotals.totalSelling)}
//                         </div>
//                     </div>
//                     <div className="col-md-4">
//                         <div className="text-muted small">Total Profit</div>
//                         <div className="fs-6 fw-semibold text-success">
//                             {currencyFormat(reportData.globalTotals.profit)}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         )}

//         {/* Info Cards */}
//         <div className="border-bottom pt-4 pb-4 mb-4">
//             <div className="row">
//                 <div className="col-md-6">
//                     <div className="bg-white border rounded shadow-sm p-3">
//                         <div className="text-muted small">Date</div>
//                         <div className="fs-6 fw-semibold text-dark text-truncate" style={{ maxWidth: "300px" }}>
//                             {/* {startDate || endDate
//                                 ? `${startDate ? new Date(startDate).toLocaleDateString() : "Earliest"} - ${endDate ? new Date(endDate).toLocaleDateString() : "Latest"}`
//                                 : "Any"} */}
//                             {startDate || endDate
//                                 ? `${startDate
//                                     ? new Date(startDate).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })
//                                     : "Earliest"} 
//                                     - ${endDate
//                                     ? new Date(endDate).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })
//                                     : "Latest"}`
//                                 : "All Time"}
//                         </div>
//                     </div>
//                 </div>
//                 <div className="col-md-6">
//                     <div className="bg-white border rounded shadow-sm p-3">
//                         <div className="text-muted small">Warehouse</div>
//                         <div className="fs-6 fw-semibold text-dark text-truncate" style={{ maxWidth: "300px" }}>
//                             {selectedWarehouse
//                                 ? warehouses.find(w => w._id === selectedWarehouse)?.name || "Unknown"
//                                 : "All Warehouses"}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>

//         {/* Table */}
//         {reportData.items.length === 0 ? (
//             <div className="text-center text-muted py-5">No report data available.</div>
//         ) : (
//             <motion.div
//                 key={JSON.stringify(reportData.items)} // 👈 New key whenever data changes so motion.div works everytime we click apply filters
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.3 }}
//             >
//                 <div className="bg-white border rounded shadow-sm p-4">
//                     <div className="table-responsive">
//                         <table className="table table-hover align-middle mb-0">
//                             <thead className="text-muted small border-bottom">
//                                 <tr>
//                                     <th style={{ width: "10%" }}>Date</th>
//                                     {allMode && <th style={{ width: "15%" }}>Warehouse</th>}
//                                     <th className="text-truncate" style={{ width: "30%" }}>Product</th>
//                                     <th style={{ width: "10%" }}>Qty</th>
//                                     {/* <th style={{ width: "12%" }}>Buy Price</th>
//                                     <th style={{ width: "12%" }}>Subtotal (Buy)</th> */}
//                                     <th style={{ width: "10%" }}>Unit Price</th>
//                                     <th style={{ width: "10%" }}>Subtotal</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {reportData.items.map((item, idx) => {
//                                     const prevItem = reportData.items[idx - 1];
//                                     const sameOutbound = prevItem && prevItem.outboundId === item.outboundId;
//                                     const showDate = !sameOutbound;
//                                     const showWarehouse = !sameOutbound;

//                                     return (
//                                         <tr key={idx}>
//                                             <td>{showDate ? new Date(item.date).toLocaleDateString("en-US", {
//                                                 year: "numeric",
//                                                 month: "2-digit",
//                                                 day: "2-digit",
//                                             }) : ""}</td>
//                                             {allMode && <td>{showWarehouse ? item.warehouseName : ""}</td>}
//                                             <td>{item.product}</td>
//                                             <td>{item.quantity}</td>
//                                             {/* <td>{currencyFormat(item.buyingPrice)}</td>
//                                             <td>{currencyFormat(item.buyingSubtotal)}</td> */}
//                                             <td>{currencyFormat(item.sellingPrice)}</td>
//                                             <td>{currencyFormat(item.sellingSubtotal)}</td>
//                                         </tr>
//                                     );
//                                 })}
//                             </tbody>

//                         </table>
//                     </div>
//                 </div>
//             </motion.div>
//         )}
//     </div>
// );

// Old Filters & Export
{/* <div className="row g-3 mb-4">
        <div className="col-md-3">
            <label className="form-label fw-semibold">Warehouse</label>
            <Select
                options={warehouseOptions}
                value={warehouseOptions.find(o => o.value === tempSelectedWarehouse)}
                onChange={(opt) => setTempSelectedWarehouse(opt ? opt.value : "")}
                isClearable
                isSearchable
                placeholder="All Warehouses"
            />
        </div>
        <div className="col-md-3">
            <label className="form-label fw-semibold">Start Date</label>
            <input type="date" value={tempStartDate} onChange={(e) => setTempStartDate(e.target.value)}
                className="form-control form-control-sm" />
        </div>
        <div className="col-md-3">
            <label className="form-label fw-semibold">End Date</label>
            <input type="date" value={tempEndDate} onChange={(e) => setTempEndDate(e.target.value)}
                className="form-control form-control-sm" />
        </div>
        <div className="col-md-3 d-flex align-items-end">
            <button className="btn btn-primary w-100 btn-sm" onClick={fetchReport}>Apply Filters</button>
        </div>
    </div> */}

// const exportToExcel = async () => {
//     if (!reportData.items.length) return;

//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Outbound Report");

//     // === Title Row ===
//     worksheet.mergeCells("A1", allMode ? "F1" : "E1");
//     const titleCell = worksheet.getCell("A1");
//     titleCell.value = "Outbound Report";
//     titleCell.font = { size: 16, bold: true };
//     titleCell.alignment = { horizontal: "center" };

//     // === Generated At (top-right) ===
//     const now = new Date();
//     const generatedAt = now.toLocaleString("en-US", {
//         year: "numeric",
//         month: "2-digit",
//         day: "2-digit",
//         hour: "2-digit",
//         minute: "2-digit",
//     });
//     const generatedCell = worksheet.getCell(allMode ? "F2" : "E2");
//     generatedCell.value = `Generated: ${generatedAt}`;
//     generatedCell.font = { size: 9, color: { argb: "777777" } };
//     generatedCell.alignment = { horizontal: "right" };

//     worksheet.addRow([]);

//     // === Warehouse & Date Range Row ===
//     const warehouseValue = selectedWarehouse
//         ? warehouses.find((w) => w._id === selectedWarehouse)?.name || "Unknown"
//         : "All Warehouses";

//     const dateValue =
//         startDate || endDate
//             ? `${startDate ? new Date(startDate).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "Earliest"} - ${endDate ? new Date(endDate).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "Latest"}`
//             : "All Time";

//     const filterRow = worksheet.addRow([`Warehouse: ${warehouseValue}`, "", "", "", allMode ? "" : null, `Date: ${dateValue}`]);
//     filterRow.font = { size: 10 };
//     filterRow.alignment = { vertical: "middle" };

//     // 🔹 Add one empty row before table (fix #1)
//     worksheet.addRow([]);

//     // === Table Header ===
//     const headerRow = worksheet.addRow([
//         "Date",
//         ...(allMode ? ["Warehouse"] : []),
//         "Product",
//         "Quantity",
//         "Unit Price",
//         "Subtotal",
//     ]);

//     headerRow.eachCell((cell) => {
//         cell.font = { bold: true };
//         cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "DDDDDD" } };
//         cell.alignment = { horizontal: "start", vertical: "middle" };
//     });

//     // === Table Body ===
//     reportData.items.forEach((item) => {
//         worksheet.addRow([
//             new Date(item.date),
//             ...(allMode ? [item.warehouseName] : []),
//             item.product,
//             item.quantity,
//             item.sellingPrice,
//             item.sellingSubtotal,
//         ]);
//     });

//     // === Column Formatting ===
//     const dateCol = worksheet.getColumn(1);
//     dateCol.width = 12;
//     dateCol.numFmt = "mm/dd/yyyy"; // fix #2

//     let colIndex = 2;
//     if (allMode) {
//         worksheet.getColumn(colIndex).width = 18; // warehouse
//         colIndex++;
//     }
//     worksheet.getColumn(colIndex).width = 20; colIndex++; // product
//     worksheet.getColumn(colIndex).width = 12; worksheet.getColumn(colIndex).numFmt = "#,##0"; colIndex++; // quantity
//     worksheet.getColumn(colIndex).width = 15; worksheet.getColumn(colIndex).numFmt = "#,##0"; colIndex++; // unit price (fix #3)
//     worksheet.getColumn(colIndex).width = 15; worksheet.getColumn(colIndex).numFmt = "#,##0"; // subtotal (fix #3)

//     // === AutoFit Column Widths === (fix #5)
//     worksheet.columns.forEach((col) => {
//         let maxLength = 0;
//         col.eachCell({ includeEmpty: true }, (cell) => {
//             const value = cell.value ? cell.value.toString() : "";
//             maxLength = Math.max(maxLength, value.length);
//         });
//         col.width = Math.min(Math.max(maxLength + 2, 12), 40);
//     });

//     // === Totals Section ===
//     worksheet.addRow([]);
//     const totals = [
//         { label: "Total Procurement Cost", value: reportData.globalTotals.totalBuying, color: "DC3545" }, // red
//         { label: "Total Sales", value: reportData.globalTotals.totalSelling, color: "0D6EFD" }, // blue
//         { label: "Total Profit", value: reportData.globalTotals.profit, color: "198754" }, // green
//     ];

//     totals.forEach((t) => {
//         const row = worksheet.addRow([t.label, t.value]);
//         row.getCell(1).font = { bold: true, color: { argb: t.color } }; // label colored
//         row.getCell(2).font = { bold: true, color: { argb: t.color } }; // value bold + colored
//         row.getCell(2).numFmt = "#,##0"; // fix #4
//     });

//     // === Export File ===
//     const buffer = await workbook.xlsx.writeBuffer();
//     saveAs(new Blob([buffer]), "Outbound_Report.xlsx");
// };

// const exportToPDF = () => {
//     if (!reportData.items.length) return;

//     const doc = new jsPDF();

//     doc.setFontSize(14);
//     doc.text("Outbound Report", 14, 15);

//     // Info about filters
//     doc.setFontSize(10);
//     const warehouseLabel = selectedWarehouse
//         ? warehouses.find(w => w._id === selectedWarehouse)?.name || "Unknown"
//         : "All Warehouses";
//     const dateLabel = startDate || endDate
//         ? `${startDate ? new Date(startDate).toLocaleDateString() : "Earliest"} - ${endDate ? new Date(endDate).toLocaleDateString() : "Latest"}`
//         : "Any";

//     doc.text(`Warehouse: ${warehouseLabel}`, 14, 22);
//     doc.text(`Date Range: ${dateLabel}`, 14, 28);

//     // Table headers
//     const tableColumn = [
//         "Date",
//         ...(allMode ? ["Warehouse"] : []),
//         "Product",
//         "Qty",
//         "Unit Price",
//         "Subtotal",
//     ];

//     // Table rows (suppress duplicate outbound date/warehouse)
//     const tableRows = [];
//     let lastOutboundId = null;

//     reportData.items.forEach(item => {
//         const sameOutbound = item.outboundId === lastOutboundId;

//         const row = [
//             sameOutbound
//                 ? ""
//                 : new Date(item.date).toLocaleDateString("en-US", {
//                     year: "numeric",
//                     month: "2-digit",
//                     day: "2-digit",
//                 }),
//         ];

//         if (allMode) {
//             row.push(sameOutbound ? "" : item.warehouseName);
//         }

//         row.push(
//             item.product,
//             item.quantity,
//             currencyFormat(item.sellingPrice),
//             currencyFormat(item.sellingSubtotal)
//         );

//         tableRows.push(row);
//         lastOutboundId = item.outboundId;
//     });

//     // ✅ autoTable
//     autoTable(doc, {
//         head: [tableColumn],
//         body: tableRows,
//         startY: 35,
//         styles: { fontSize: 9 },
//     });

//     // Totals at bottom
//     const finalY = doc.lastAutoTable.finalY + 10;
//     doc.setFontSize(11);
//     doc.text(
//         `Total Procurement Cost: ${currencyFormat(reportData.globalTotals.totalBuying)}`,
//         14,
//         finalY
//     );
//     doc.text(
//         `Total Sales: ${currencyFormat(reportData.globalTotals.totalSelling)}`,
//         14,
//         finalY + 6
//     );
//     doc.text(
//         `Total Profit: ${currencyFormat(reportData.globalTotals.profit)}`,
//         14,
//         finalY + 12
//     );

//     doc.save("Outbound_Report.pdf");
// };


