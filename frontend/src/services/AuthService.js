// src/services/AuthService.js

import api from "../utils/axios";

const register = async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
};

const login = async (userData) => {
    const response = await api.post("/auth/login", userData);
    return response.data; // token is in cookie, so this is optional for UI
};

// Fetch logged-in user info from backend using cookie
const getMe = async () => {
    const response = await api.get("/auth/me"); // backend returns { id, username, role }
    return response.data;
};

export default { register, login, getMe };

// Old AuthService code, before using axios instance (utils/axios.js)

// const API_URL = "http://localhost:5000/api/auth"; // change port if needed

// const register = async (userData) => {
//     const response = await fetch(`${API_URL}/register`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include", // important for sending cookies
//         body: JSON.stringify(userData),
//     });
//     return response.json();
// };

// const login = async (userData) => {
//     const response = await fetch(`${API_URL}/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify(userData),
//     });
//     return response.json();
// };

// export default { register, login };
