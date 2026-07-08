function getCurrentUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

function redirectToDashboard(role) {
  if (role === "customer") window.location.href = "customer-dashboard.html";
  else if (role === "owner") window.location.href = "owner-dashboard.html";
  else if (role === "admin") window.location.href = "admin-dashboard.html";
  else window.location.href = "index.html";
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("loginError");
    errorEl.textContent = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const data = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      redirectToDashboard(data.user.role);
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("registerError");
    errorEl.textContent = "";

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    try {
      const data = await api.post("/auth/register", { name, email, password, role });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      redirectToDashboard(data.user.role);
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
}