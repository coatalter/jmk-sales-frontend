import axios from 'axios';

const API_URL = "http://localhost:5001"; // Sesuaikan port backend

export const authenticate = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    const { user, token } = response.data.data;
    
    // Simpan User DAN Token
    localStorage.setItem("user_session", JSON.stringify(user));
    localStorage.setItem("auth_token", token);
    
    return user;
  } catch (error) {
    console.error("Login failed:", error.response?.data?.message || error.message);
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("user_session");
  localStorage.removeItem("auth_token");
};

export const getCurrentUser = () => {
  const session = localStorage.getItem("user_session");
  return session ? JSON.parse(session) : null;
};

// Fungsi helper untuk ambil token (dipakai di component lain)
export const getAuthToken = () => {
  return localStorage.getItem("auth_token");
};