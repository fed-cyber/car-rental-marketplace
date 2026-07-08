document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
  });
});

async function loadUsers() {
  const container = document.getElementById("usersList");
  try {
    const users = await api.get("/admin/users", true);
    container.innerHTML = users.map(u => `
      <div class="list-row" data-user-id="${u.id}">
        <div class="list-row-info">
          <span class="list-row-title">${u.name} <span class="badge badge-pending">${u.role}</span></span>
          <span class="list-row-meta">${u.email}</span>
        </div>
        <div class="list-row-actions">
          <span class="badge ${u.is_active ? "badge-available" : "badge-unavailable"}">${u.is_active ? "Active" : "Deactivated"}</span>
          ${u.role !== "admin" ? `
            <button class="btn ${u.is_active ? "btn-danger" : "btn-teal"} toggle-user" data-id="${u.id}" data-active="${u.is_active}">
              ${u.is_active ? "Deactivate" : "Reactivate"}
            </button>
          ` : ""}
        </div>
      </div>
    `).join("");
    attachUserActions();
  } catch (err) {
    container.innerHTML = `<p class="form-error">${err.message}</p>`;
  }
}

function attachUserActions() {
  document.querySelectorAll(".toggle-user").forEach(btn => {
    btn.addEventListener("click", async () => {
      const isActive = btn.dataset.active === "true";
      try {
        await api.put(`/admin/users/${btn.dataset.id}/status`, { isActive: !isActive }, true);
        loadUsers();
      } catch (err) {
        alert(err.message);
      }
    });
  });
}

async function loadListings() {
  const container = document.getElementById("listingsList");
  try {
    const cars = await api.get("/admin/cars", true);
    if (!cars.length) {
      container.innerHTML = "<p class='form-sub'>No listings.</p>";
      return;
    }
    container.innerHTML = cars.map(c => `
      <div class="list-row" data-car-id="${c.id}">
        <div class="list-row-info">
          <span class="list-row-title">${c.make} ${c.model} (${c.year})</span>
          <span class="list-row-meta">${c.location} · $${c.price_per_day}/day · owner: ${c.owner_name}</span>
        </div>
        <button class="btn btn-danger remove-listing" data-id="${c.id}">Remove</button>
      </div>
    `).join("");
    attachListingActions();
  } catch (err) {
    container.innerHTML = `<p class="form-error">${err.message}</p>`;
  }
}

function attachListingActions() {
  document.querySelectorAll(".remove-listing").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!confirm("Remove this listing from the platform?")) return;
      try {
        await api.delete(`/admin/cars/${btn.dataset.id}`, true);
        loadListings();
      } catch (err) {
        alert(err.message);
      }
    });
  });
}

async function loadReviews() {
  const container = document.getElementById("reviewsList");
  try {
    const reviews = await api.get("/admin/reviews", true);
    if (!reviews.length) {
      container.innerHTML = "<p class='form-sub'>No reviews.</p>";
      return;
    }
    container.innerHTML = reviews.map(r => `
      <div class="list-row" data-review-id="${r.id}">
        <div class="list-row-info">
          <span class="list-row-title">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)} — ${r.car_name}</span>
          <span class="list-row-meta">${r.comment || "(no comment)"} · by ${r.customer_name}</span>
        </div>
        <button class="btn btn-danger delete-review" data-id="${r.id}">Delete</button>
      </div>
    `).join("");
    attachReviewActions();
  } catch (err) {
    container.innerHTML = `<p class="form-error">${err.message}</p>`;
  }
}

function attachReviewActions() {
  document.querySelectorAll(".delete-review").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this review?")) return;
      try {
        await api.delete(`/admin/reviews/${btn.dataset.id}`, true);
        loadReviews();
      } catch (err) {
        alert(err.message);
      }
    });
  });
}

renderNav();
loadUsers();
loadListings();
loadReviews();