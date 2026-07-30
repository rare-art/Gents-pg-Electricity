// Central API Configuration
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Ensure trailing slashes are removed to prevent double slashes in API endpoints
const cleanApiUrl = API_URL.replace(/\/+$/, "");
export const API_BASE = `${cleanApiUrl}/api`;
