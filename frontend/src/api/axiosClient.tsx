import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:8080/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
});

axiosClient.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    const isAuthRequest =
        config.url === "/auth/login" ||
        config.url === "/auth/register";

    if (token && !isAuthRequest) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});
export default axiosClient;