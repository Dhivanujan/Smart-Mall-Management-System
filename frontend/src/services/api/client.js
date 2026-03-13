import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
export const apiClient = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15_000,
});
apiClient.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        window.localStorage.removeItem("smartmall_auth");
        if (window.location.pathname !== "/login") {
            window.location.href = "/login";
        }
    }
    return Promise.reject(error);
});
