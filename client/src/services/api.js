import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getSubjects = () => api.get("/subjects");

export const getPYQs = (filters = {}) =>
  api.get("/pyq", {
    params: filters,
  });
  export const explainWithAI = (payload) =>
  api.post("/ai/explain", payload);
export const getPYQStats = () => api.get("/pyq/stats");
export const getHealth = () => api.get("/health");

export default api;