// src/utils/axios.js

import axios from "axios";

const api = axios.create({
    // baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
    baseURL: process.env.REACT_APP_API_URL || "http://louininventory-890420967859.asia-southeast2.run.app/api",
    withCredentials: true,
});

export default api;
