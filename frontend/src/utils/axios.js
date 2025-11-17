// src/utils/axios.js

import axios from "axios";

const api = axios.create({
    baseURL: "https://louininventory-890420967859.asia-southeast2.run.app/api",
    withCredentials: true,
});

export default api;
