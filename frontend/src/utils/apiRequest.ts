import axios from 'axios';
const BASE_URL = 'http://localhost:3001/';


export async function apiRequest(
  method: string,
  endpoint: string,
  data?: Record<string, unknown>,
  params?: Record<string, unknown>,
  headers?: Record<string, string>
) {
  try {
    const response = await axios({
      method,
      url: `${BASE_URL}${endpoint}`,
      data,
      params,
      headers
    });
    return response;
  } catch (error) {
    console.error(`[API ERROR] ${method.toUpperCase()} ${endpoint}:`, error);
    throw error;
  }
}
