import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import api from "../utils/axios";

// Registrasi skala dan elemen yang diperlukan
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const WarehouseChart = () => {
    const [chartData, setChartData] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get("/warehouses");
                const warehouses = response.data;

                if (Array.isArray(warehouses)) {
                    const labels = warehouses.map((wh) => wh.name || "Unknown");
                    const inboundData = warehouses.map((wh) => wh.inboundCount || 0);
                    const outboundData = warehouses.map((wh) => wh.outboundCount || 0);

                    setChartData({
                        labels,
                        datasets: [
                            {
                                label: "Inbound Count",
                                data: inboundData,
                                backgroundColor: "rgba(75, 192, 192, 0.6)",
                                borderColor: "rgba(75, 192, 192, 1)",
                                borderWidth: 1,
                            },
                            {
                                label: "Outbound Count",
                                data: outboundData,
                                backgroundColor: "rgba(255, 99, 132, 0.6)",
                                borderColor: "rgba(255, 99, 132, 1)",
                                borderWidth: 1,
                            },
                        ],
                    });
                } else {
                    console.error("Invalid data format: warehouses is not an array");
                }
            } catch (error) {
                console.error("Error fetching chart data:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <h5 className="card-title">Warehouse Inbound and Outbound</h5>
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    {chartData.labels ? (
                        <Bar
                            data={chartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { position: "top" },
                                },
                            }}
                            height={300} // Atur tinggi chart
                        />
                    ) : (
                        <p>Loading chart data...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WarehouseChart;