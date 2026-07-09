document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
  });
});

async function loadMyListings() {
  const grid = document.getElementById("ownerCarGrid");
  try {
    const cars = await api.get("/cars/owner/mine", true);
    if (!cars.length) {
      grid.innerHTML = "<p class='form-sub'>You haven't listed any cars yet.</p>";
      return;
    }
    grid.innerHTML = cars.map(ownerCarCardHTML).join("");
    attachListingActions();
  } catch (err) {
    grid.innerHTML = `<p class="form-error">${err.message}</p>`;
  }
}

function ownerCarCardHTML(car) {
  const image = car.image_url || "https://placehold.co/400x250?text=No+Image";
  const badgeClass = car.is_available ? "badge-available" : "badge-unavailable";
  const badgeText = car.is_available ? "Available" : "Unavailable";

  return `
    <div class="car-card" data-car-id="${car.id}">
      <img src="${image}" alt="${car.make} ${car.model}">
      <div class="car-card-body">
        <span class="badge ${badgeClass}">${badgeText}</span>
        <div class="car-card-title">${car.make} ${car.model} (${car.year})</div>
        <div class="car-card-meta">${car.location} · $${car.price_per_day}/day</div>
        <div class="list-row-actions" style="margin-top:8px; flex-wrap: wrap;">
          <button class="btn btn-outline edit-car"
            data-id="${car.id}" data-make="${car.make}" data-model="${car.model}"
            data-year="${car.year}" data-type="${car.vehicle_type}" data-price="${car.price_per_day}"
            data-location="${car.location}" data-image="${car.image_url || ""}"
            data-description="${(car.description || "").replace(/"/g, "&quot;")}">
            Edit
          </button>
          <button class="btn btn-outline toggle-availability" data-id="${car.id}" data-available="${car.is_available}">
            ${car.is_available ? "Mark unavailable" : "Mark available"}
          </button>
          <button class="btn btn-danger delete-car" data-id="${car.id}">Delete</button>
        </div>
      </div>
    </div>
  `;
}

function attachListingActions() {
  document.querySelectorAll(".toggle-availability").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const isAvailable = btn.dataset.available === "true";
      try {
        await api.put(`/cars/${id}`, { isAvailable: !isAvailable }, true);
        loadMyListings();
      } catch (err) {
        alert(err.message);
      }
    });
  });

  document.querySelectorAll(".delete-car").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!confirm("Remove this listing? This cannot be undone.")) return;
      try {
        await api.delete(`/cars/${btn.dataset.id}`, true);
        loadMyListings();
      } catch (err) {
        alert(err.message);
      }
    });
  });

  document.querySelectorAll(".edit-car").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("editCarId").value = btn.dataset.id;
      document.getElementById("editMake").value = btn.dataset.make;
      document.getElementById("editModel").value = btn.dataset.model;
      document.getElementById("editYear").value = btn.dataset.year;
      document.getElementById("editVehicleType").value = btn.dataset.type;
      document.getElementById("editPricePerDay").value = btn.dataset.price;
      document.getElementById("editLocation").value = btn.dataset.location;
      document.getElementById("editImageUrl").value = btn.dataset.image;
      document.getElementById("editDescription").value = btn.dataset.description;
      document.getElementById("editCarModal").hidden = false;
    });
  });
}

document.getElementById("addCarForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("addCarError");
  errorEl.textContent = "";

  const payload = {
    make: document.getElementById("make").value.trim(),
    model: document.getElementById("model").value.trim(),
    year: Number(document.getElementById("year").value),
    vehicleType: document.getElementById("vehicleType").value,
    pricePerDay: Number(document.getElementById("pricePerDay").value),
    location: document.getElementById("location").value.trim(),
    imageUrl: document.getElementById("imageUrl").value.trim(),
    description: document.getElementById("description").value.trim()
  };

  try {
    await api.post("/cars", payload, true);
    e.target.reset();
    document.querySelector('[data-tab="listings"]').click();
    loadMyListings();
  } catch (err) {
    errorEl.textContent = err.message;
  }
});

document.getElementById("closeEditModal").addEventListener("click", () => {
  document.getElementById("editCarModal").hidden = true;
});

document.getElementById("editCarForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("editCarError");
  errorEl.textContent = "";

  const id = document.getElementById("editCarId").value;
  const payload = {
    make: document.getElementById("editMake").value.trim(),
    model: document.getElementById("editModel").value.trim(),
    year: Number(document.getElementById("editYear").value),
    vehicleType: document.getElementById("editVehicleType").value,
    pricePerDay: Number(document.getElementById("editPricePerDay").value),
    location: document.getElementById("editLocation").value.trim(),
    imageUrl: document.getElementById("editImageUrl").value.trim(),
    description: document.getElementById("editDescription").value.trim()
  };

  try {
    await api.put(`/cars/${id}`, payload, true);
    document.getElementById("editCarModal").hidden = true;
    loadMyListings();
  } catch (err) {
    errorEl.textContent = err.message;
  }
});

async function loadBookingRequests() {
  const container = document.getElementById("requestsList");
  try {
    const bookings = await api.get("/bookings/owner/pending", true);
    if (!bookings.length) {
      container.innerHTML = "<p class='form-sub'>No pending requests.</p>";
      return;
    }
    container.innerHTML = bookings.map(bookingRequestRowHTML).join("");
    attachRequestActions();
  } catch (err) {
    container.innerHTML = `<p class="form-error">${err.message}</p>`;
  }
}

function bookingRequestRowHTML(b) {
  return `
    <div class="list-row" data-booking-id="${b.id}">
      <div class="list-row-info">
        <span class="list-row-title">${b.make} ${b.model} — ${b.customer_name}</span>
        <span class="list-row-meta">${b.start_date} to ${b.end_date} · $${b.total_price}</span>
      </div>
      <div class="list-row-actions">
        <button class="btn btn-teal approve-booking" data-id="${b.id}">Approve</button>
        <button class="btn btn-danger reject-booking" data-id="${b.id}">Reject</button>
      </div>
    </div>
  `;
}

function attachRequestActions() {
  document.querySelectorAll(".approve-booking").forEach(btn => {
    btn.addEventListener("click", async () => {
      try {
        await api.put(`/bookings/${btn.dataset.id}/approve`, {}, true);
        loadBookingRequests();
      } catch (err) {
        alert(err.message);
      }
    });
  });

  document.querySelectorAll(".reject-booking").forEach(btn => {
    btn.addEventListener("click", async () => {
      try {
        await api.put(`/bookings/${btn.dataset.id}/reject`, {}, true);
        loadBookingRequests();
      } catch (err) {
        alert(err.message);
      }
    });
  });
}

async function loadHistory() {
  const container = document.getElementById("historyList");
  try {
    const bookings = await api.get("/bookings/owner/history", true);
    if (!bookings.length) {
      container.innerHTML = "<p class='form-sub'>No rental history yet.</p>";
      return;
    }
    container.innerHTML = bookings.map(b => `
      <div class="list-row">
        <div class="list-row-info">
          <span class="list-row-title">${b.make} ${b.model} — ${b.customer_name}</span>
          <span class="list-row-meta">${b.start_date} to ${b.end_date} · $${b.total_price} · ${b.status}</span>
        </div>
      </div>
    `).join("");
  } catch (err) {
    container.innerHTML = `<p class="form-error">${err.message}</p>`;
  }
}

renderNav();
loadMyListings();
loadBookingRequests();
loadHistory();