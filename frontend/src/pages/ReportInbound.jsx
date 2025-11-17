import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "../utils/axios";
import currencyFormat from "../utils/formatCurrency";
import { FaChartPie } from "react-icons/fa";
import { motion } from "framer-motion";

import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import autoTable from "jspdf-autotable";

const ReportInbound = () => {
    // All state and functions (fetchReport, exportToExcel, exportToPDF) remain unchanged...
    const [warehouses, setWarehouses] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState("");
    const [tempSelectedWarehouse, setTempSelectedWarehouse] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reportData, setReportData] = useState({ items: [], globalTotals: {} });
    const [tempStartDate, setTempStartDate] = useState("");
    const [tempEndDate, setTempEndDate] = useState("");

    useEffect(() => {
        axios.get("/warehouses").then((res) => setWarehouses(res.data));
    }, []);

    const fetchReport = () => {
        setSelectedWarehouse(tempSelectedWarehouse);
        setStartDate(tempStartDate);
        setEndDate(tempEndDate);

        let query = [];
        if (tempStartDate) query.push(`startDate=${tempStartDate}`);
        if (tempEndDate) query.push(`endDate=${tempEndDate}`);
        if (tempSelectedWarehouse && tempSelectedWarehouse.trim() !== "") {
            query.push(`warehouseId=${tempSelectedWarehouse}`);
        }
        const queryString = query.length ? `?${query.join("&")}` : "";
        axios.get(`/reports/inbound${queryString}`).then((res) => {
            setReportData(res.data);
        });
    };

    const warehouseOptions = [
        { value: "", label: "All Warehouses" },
        ...warehouses.map(w => ({ value: w._id, label: w.name })),
    ];

    const allMode = !selectedWarehouse;

    const exportToExcel = async () => {
        if (!reportData.items.length) return;

        // ... Excel export logic is unchanged
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Inbound Report");

        worksheet.mergeCells("A1", allMode ? "F1" : "E1");
        const titleCell = worksheet.getCell("A1");
        titleCell.value = "Inbound Report";
        titleCell.font = { size: 16, bold: true };
        titleCell.alignment = { horizontal: "center" };

        const now = new Date();
        const generatedAt = now.toLocaleString("en-US", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
        const generatedCell = worksheet.getCell(allMode ? "F2" : "E2");
        generatedCell.value = `Generated: ${generatedAt}`;
        generatedCell.font = { size: 9, color: { argb: "777777" } };
        generatedCell.alignment = { horizontal: "right" };
        worksheet.addRow([]);
        const warehouseValue = selectedWarehouse ? warehouses.find((w) => w._id === selectedWarehouse)?.name || "Unknown" : "All Warehouses";
        const dateValue = startDate || endDate ? `${startDate ? new Date(startDate).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "Earliest"} - ${endDate ? new Date(endDate).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "Latest"}` : "All Time";
        const filterRow = worksheet.addRow([`Warehouse: ${warehouseValue}`, "", "", "", allMode ? "" : null, `Date: ${dateValue}`]);
        filterRow.font = { size: 10 };
        filterRow.alignment = { vertical: "middle" };
        worksheet.addRow([]);
        const headerRow = worksheet.addRow(["Date", ...(allMode ? ["Warehouse"] : []), "Product", "Quantity", "Unit Price", "Subtotal"]);
        headerRow.eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "DDDDDD" } };
            cell.alignment = { horizontal: "center", vertical: "middle" };
        });
        reportData.items.forEach((item) => {
            const row = worksheet.addRow([new Date(item.date), ...(allMode ? [item.warehouseName] : []), item.product, item.quantity, item.buyingPrice, item.buyingSubtotal]);
            row.eachCell((cell, colNumber) => {
                if (allMode) {
                    if (colNumber === 4) cell.alignment = { horizontal: "center" };
                    else if (colNumber === 5 || colNumber === 6) cell.alignment = { horizontal: "right" };
                    else cell.alignment = { horizontal: "left" };
                } else {
                    if (colNumber === 3) cell.alignment = { horizontal: "center" };
                    else if (colNumber === 4 || colNumber === 5) cell.alignment = { horizontal: "right" };
                    else cell.alignment = { horizontal: "left" };
                }
            });
        });
        worksheet.columns.forEach((col) => {
            let maxLength = 0;
            col.eachCell({ includeEmpty: true }, (cell) => {
                const value = cell.value ? cell.value.toString() : "";
                maxLength = Math.max(maxLength, value.length);
            });
            col.width = Math.min(Math.max(maxLength + 2, 12), 40);
        });
        worksheet.getColumn(1).numFmt = "mm/dd/yyyy";
        let priceColIndex = allMode ? 5 : 4;
        worksheet.getColumn(priceColIndex).numFmt = "#,##0";
        worksheet.getColumn(priceColIndex + 1).numFmt = "#,##0";
        worksheet.addRow([]);
        const totalRow = worksheet.addRow(["Total Procurement Cost", reportData.globalTotals.totalBuying]);
        totalRow.getCell(1).font = { bold: true, color: { argb: "DC3545" } };
        totalRow.getCell(2).font = { bold: true, color: { argb: "DC3545" } };
        totalRow.getCell(2).numFmt = "#,##0";
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "Inbound_Report.xlsx");
    };

    const exportToPDF = () => {
        // ... PDF export logic is unchanged
        if (!reportData.items.length) return;
        const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 14;
        const now = new Date();
        const generatedAt = now.toLocaleString("en-US", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
        doc.setFontSize(16); doc.setFont(undefined, "bold"); doc.text("Inbound Report", pageWidth / 2, 18, { align: "center" });
        doc.setFontSize(9); doc.setFont(undefined, "normal"); doc.setTextColor(120); doc.text(`Generated: ${generatedAt}`, pageWidth - margin, 18, { align: "right" });
        doc.setDrawColor(200); doc.line(margin, 24, pageWidth - margin, 24);
        doc.setTextColor(0); doc.setFontSize(10);
        const warehouseValueText = selectedWarehouse ? warehouses.find((w) => w._id === selectedWarehouse)?.name || "Unknown" : "All Warehouses";
        doc.setFont(undefined, "bold"); doc.text("Warehouse:", margin, 32);
        doc.setFont(undefined, "normal"); doc.text(warehouseValueText, margin + 22, 32);
        const dateValueText = startDate || endDate ? `${startDate ? new Date(startDate).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }) : "Earliest"} - ${endDate ? new Date(endDate).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }) : "Latest"}` : "All Time";
        doc.setFont(undefined, "bold");
        const dateLabelWidth = doc.getTextWidth("Date:");
        const dateValueWidth = doc.getTextWidth(dateValueText);
        doc.text("Date:", pageWidth - margin - dateValueWidth - dateLabelWidth - 2, 32);
        doc.setFont(undefined, "normal"); doc.text(dateValueText, pageWidth - margin - dateValueWidth, 32);
        autoTable(doc, {
            head: [["Date", ...(allMode ? ["Warehouse"] : []), "Product", "Qty", "Unit Price", "Subtotal"]],
            body: reportData.items.map((item, idx, arr) => {
                const prevItem = arr[idx - 1];
                const sameInbound = prevItem && prevItem.inboundId === item.inboundId;
                const row = [sameInbound ? "" : new Date(item.date).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })];
                if (allMode) row.push(sameInbound ? "" : item.warehouseName);
                row.push(item.product, item.quantity, currencyFormat(item.buyingPrice), currencyFormat(item.buyingSubtotal));
                return row;
            }),
            startY: 42, margin: { left: margin, right: margin }, styles: { fontSize: 9 },
            didDrawPage: (data) => {
                const pageCount = doc.internal.getNumberOfPages();
                doc.setFontSize(9);
                doc.setTextColor(150);
                doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: "right" });
            },
        });
        let totalsY = doc.lastAutoTable.finalY + 14;
        if (totalsY + 20 > pageHeight) {
            doc.addPage();
            totalsY = margin + 10;
        }
        const metrics = [{ label: "Total Procurement", value: currencyFormat(reportData.globalTotals.totalBuying), color: [220, 53, 69] }];
        doc.setFontSize(9);
        const maxLabelWidth = Math.max(...metrics.map(m => doc.getTextWidth(m.label)));
        doc.setFontSize(10);
        const maxValueWidth = Math.max(...metrics.map(m => doc.getTextWidth(m.value)));
        const labelColWidth = maxLabelWidth;
        const valueColWidth = maxValueWidth;
        const colonGap = 5;
        const totalBlockWidth = labelColWidth + colonGap + valueColWidth + colonGap;
        const blockEndX = pageWidth - margin;
        const blockStartX = blockEndX - totalBlockWidth;
        const titleX = blockStartX + totalBlockWidth / 2;
        const labelX = blockStartX;
        const colonX = blockStartX + labelColWidth + colonGap;
        const valueX = blockEndX;
        doc.setFontSize(11);
        doc.setFont(undefined, "bold");
        doc.text("Grand Totals", titleX, totalsY, { align: "center" });
        totalsY += 6;
        doc.setDrawColor(180);
        doc.line(blockStartX, totalsY, blockEndX, totalsY);
        totalsY += 8;
        metrics.forEach((metric, i) => {
            const currentY = totalsY + (i * 7);
            doc.setFontSize(9); doc.setTextColor(100); doc.setFont(undefined, "normal");
            doc.text(metric.label, labelX, currentY, { align: "left" });
            doc.text(":", colonX, currentY, { align: "center" });
            doc.setFontSize(10); doc.setTextColor(...metric.color); doc.setFont(undefined, "bold");
            doc.text(metric.value, valueX, currentY, { align: "right" });
        });
        doc.save("Inbound_Report.pdf");
    };

    return (
        <div className="container my-5">
            <h4 className="fw-bold text-dark mb-4">Inbound Report</h4>

            {/* Filters */}
            <div className="pt-4 mb-4">
                <div className="row g-3">
                    <div className="col-md-4">
                        <label className="form-label fw-semibold">Warehouse</label>
                        <Select
                            options={warehouseOptions}
                            value={warehouseOptions.find(o => o.value === tempSelectedWarehouse)}
                            onChange={(opt) => setTempSelectedWarehouse(opt ? opt.value : "")}
                            isClearable isSearchable placeholder="All Warehouses"
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label fw-semibold">Start Date</label>
                        <input type="date" value={tempStartDate} onChange={(e) => setTempStartDate(e.target.value)} className="form-control" />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label fw-semibold">End Date</label>
                        <input type="date" value={tempEndDate} onChange={(e) => setTempEndDate(e.target.value)} className="form-control" />
                    </div>
                </div>
                <div className="d-flex justify-content-end mt-3">
                    <button className="btn btn-outline-success btn-sm me-3" onClick={exportToExcel}>Export Excel</button>
                    <button className="btn btn-outline-danger btn-sm me-3" onClick={exportToPDF}>Export PDF</button>
                    <button className="btn btn-primary btn-sm" onClick={fetchReport}>Apply Filters</button>
                </div>
            </div>

            {/* --- Report Results Section --- */}
            {/* Show message only if the report has been run and returned no items */}
            {reportData.items.length === 0 ? (
                <div className="text-center text-muted py-5">No report data available.</div>
            ) : (
                // Animate this entire block when data is available
                reportData.items.length > 0 &&
                <motion.div
                    key={JSON.stringify(reportData.items)} // Re-trigger animation on data change
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
                                <div className="text-muted small">Total Procurement</div>
                                <div className="fs-6 fw-semibold text-danger">
                                    {currencyFormat(reportData.globalTotals.totalBuying)}
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
                                        <th className="text-truncate" style={{ width: "30%" }}>Product</th>
                                        <th style={{ width: "10%" }}>Qty</th>
                                        <th style={{ width: "10%" }}>Unit Price</th>
                                        <th style={{ width: "10%" }}>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.items.map((item, idx) => {
                                        const prevItem = reportData.items[idx - 1];
                                        const sameInbound = prevItem && prevItem.inboundId === item.inboundId;
                                        const showDate = !sameInbound;
                                        return (
                                            <tr key={idx}>
                                                <td>{showDate ? new Date(item.date).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }) : ""}</td>
                                                {allMode && <td>{showDate ? item.warehouseName : ""}</td>}
                                                <td>{item.product}</td>
                                                <td>{item.quantity}</td>
                                                <td>{currencyFormat(item.buyingPrice)}</td>
                                                <td>{currencyFormat(item.buyingSubtotal)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default ReportInbound;

