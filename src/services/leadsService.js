import axios from 'axios';

// Pastikan port sesuai dengan backend kamu
const API_URL = "http://localhost:5001"; 

// Helper untuk ambil token dari LocalStorage
const getAuthToken = () => localStorage.getItem("auth_token");

// 1. FETCH ALL LEADS
export const fetchLeads = async (params) => {
  try {
    const response = await axios.get(`${API_URL}/leads`, { params });
    return response.data.data || []; 
  } catch (error) {
    console.error("Error fetching leads:", error);
    return []; 
  }
};

// 2. FETCH STATS
export const fetchLeadsStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/leads-stats`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching stats:", error);
    return null;
  }
};

// 3. UPDATE STATUS (DENGAN TOKEN)
export const updateLeadStatus = async (id, data) => {
  try {
    const token = getAuthToken(); // Ambil token sales yang login
    
    // Sertakan Token di Header Authorization
    const response = await axios.put(
      `${API_URL}/leads/${id}`, 
      data, 
      {
        headers: {
          Authorization: `Bearer ${token}` 
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating lead:", error);
    throw error;
  }
};

// 4. FETCH LOGS
export const fetchLogs = async () => {
  try {
    const response = await axios.get(`${API_URL}/logs`);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching logs:", error);
    return [];
  }
};

// 5. FETCH LEADERBOARD
export const fetchLeaderboard = async () => {
  try {
    const response = await axios.get(`${API_URL}/leaderboard`);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};