import React from "react";

const StatisticsCard = ({ title, value, icon }) => {
    return (
        <div className="card shadow-sm text-center">
            <div className="card-body">
                <div className="mb-3">{icon}</div>
                <h5 className="card-title">{title}</h5>
                <p className="card-text fs-4 fw-bold">{value}</p>
            </div>
        </div>
    );
};

export default StatisticsCard;