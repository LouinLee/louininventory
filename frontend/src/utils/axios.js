// src/utils/axios.js

import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "https://louininventory-890420967859.asia-southeast2.run.app/api",
    withCredentials: true,
});

export default api;
