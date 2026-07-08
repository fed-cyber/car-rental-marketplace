
const API_BASE_URL = "http://localhost:5000/api";

/**
 * Core request helper.
 * @param {string} path - e.g. "/auth/login"
 * @param {string} method - GET, POST, PUT, DELETE
 * @param {object|null} body - request payload
 * @param {boolean} authRequired - attach JWT if true
 */
async function apiRequest(path, method = "GET", body = null, authRequired = false) {
  const headers = { "Content-Type": "application/json" };

  if (authRequired) {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "login.html";
      return;
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, config);
  } catch (networkErr) {
    throw new Error("Could not reach the server. Is the backend running?");
  }

  if (response.status === 401 && authRequired) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
    return;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

const api = {
  get: (path, authRequired = false) => apiRequest(path, "GET", null, authRequired),
  post: (path, body, authRequired = false) => apiRequest(path, "POST", body, authRequired),
  put: (path, body, authRequired = false) => apiRequest(path, "PUT", body, authRequired),
  delete: (path, authRequired = false) => apiRequest(path, "DELETE", null, authRequired),
};