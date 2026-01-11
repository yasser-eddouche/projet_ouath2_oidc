import axios, { AxiosInstance } from "axios";
import keycloak from "./keycloak";

const API_GATEWAY_URL = "http://localhost:8888";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_GATEWAY_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    if (keycloak.token) {
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh and errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshed = await keycloak.updateToken(5);
        if (refreshed) {
          originalRequest.headers.Authorization = `Bearer ${keycloak.token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        keycloak.login();
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 - Forbidden
    if (error.response?.status === 403) {
      console.error("Access forbidden: Insufficient permissions");
    }

    return Promise.reject(error);
  }
);

// Products API
export const productsAPI = {
  getAll: () => apiClient.get("/product-service/products"),
  getById: (id: number) => apiClient.get(`/product-service/products/${id}`),
  create: (product: any) =>
    apiClient.post("/product-service/products", product),
  update: (id: number, product: any) =>
    apiClient.put(`/product-service/products/${id}`, product),
  delete: (id: number) => apiClient.delete(`/product-service/products/${id}`),
};

// Orders API
export const ordersAPI = {
  getAll: () => apiClient.get("/order-service/orders"),
  getMyOrders: () => apiClient.get("/order-service/orders/me"),
  getById: (id: number) => apiClient.get(`/order-service/orders/${id}`),
  create: (order: any) => apiClient.post("/order-service/orders", order),
};

export default apiClient;
