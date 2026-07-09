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

function renderNav() {
  const navLinks = document.getElementById("navLinks");
  const user = getCurrentUser();

  if (!user) {
    navLinks.innerHTML = `
      <a href="login.html">Log in</a>
      <a href="register.html" class="btn btn-primary">Sign up</a>
    `;
    return;
  }

  const dashboardMap = {
    customer: "customer-dashboard.html",
    owner: "owner-dashboard.html",
    admin: "admin-dashboard.html"
  };

  navLinks.innerHTML = `
    <span>${user.name}</span>
    <a href="${dashboardMap[user.role]}">Dashboard</a>
    <a href="#" id="logoutBtn" class="btn btn-secondary">Log out</a>
  `;

  document.getElementById("logoutBtn").addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });
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