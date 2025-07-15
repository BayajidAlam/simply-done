import axios, { AxiosResponse } from "axios";

// Use environment variable for backend URL
const API_BASE_URL = import.meta.env.VITE_APP_BACKEND_ROOT_URL || "";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear local storage and redirect to login
      localStorage.removeItem("access-token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // Auth APIs
  register: (userData: { userName: string; email: string; password: string }) =>
    apiClient.post("/users", userData),

  login: (credentials: { email: string; password: string }) =>
    apiClient.post("/login", credentials),

  changePassword: (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => apiClient.post("/change-password", passwordData),

  // User APIs (protected)
  getUsers: () => apiClient.get("/users"),

  // Todo APIs (protected)
  getTodos: () => apiClient.get("/todos"),

  createTodo: (todoData: {
    title: string;
    description?: string;
    completed?: boolean;
  }) => apiClient.post("/todos", todoData),

  updateTodo: (
    id: string,
    todoData: { title?: string; description?: string; completed?: boolean }
  ) => apiClient.put(`/todos/${id}`, todoData),

  deleteTodo: (id: string) => apiClient.delete(`/todos/${id}`),

  // Health check
  health: () => apiClient.get("/health"),
};

export default apiClient;