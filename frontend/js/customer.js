document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
  });
});

function statusBadge(status) {
  const map = {
    pending: "badge-pending",
    approved: "badge-available",
    completed: "badge-available",
    rejected: "badge-unavailable",
    cancelled: "badge-unavailable"
  };
  return `<span class="badge ${map[status] || ""}">${status}</span>`;
}

async function loadActiveBookings() {
  const container = document.getElementById("activeBookings");
  try {
    const bookings = await api.get("/bookings/customer/active", true);
    if (!bookings.length) {
      container.innerHTML = "<p class='form-sub'>No active or pending bookings.</p>";
      return;
    }
    container.innerHTML = bookings.map(b => `
      <div class="list-row">
        <div class="list-row-info">
          <span class="list-row-title">${b.make} ${b.model}</span>
          <span class="list-row-meta">${b.start_date} to ${b.end_date} · $${b.total_price}</span>
        </div>
        ${statusBadge(b.status)}
      </div>
    `).join("");
  } catch (err) {
    container.innerHTML = `<p class="form-error">${err.message}</p>`;
  }
}

async function loadPastBookings() {
  const container = document.getElementById("pastBookings");
  try {
    const bookings = await api.get("/bookings/customer/past", true);
    if (!bookings.length) {
      container.innerHTML = "<p class='form-sub'>No past rentals yet.</p>";
      return;
    }
    container.innerHTML = bookings.map(b => `
      <div class="list-row" data-booking-id="${b.id}">
        <div class="list-row-info">
          <span class="list-row-title">${b.make} ${b.model}</span>
          <span class="list-row-meta">${b.start_date} to ${b.end_date} · $${b.total_price}</span>
        </div>
        ${b.has_review
          ? statusBadge("completed")
          : `<button class="btn btn-outline leave-review" data-booking-id="${b.id}" data-car-id="${b.car_id}">Leave a review</button>`
        }
      </div>
    `).join("");
    attachReviewButtons();
  } catch (err) {
    container.innerHTML = `<p class="form-error">${err.message}</p>`;
  }
}

function attachReviewButtons() {
  document.querySelectorAll(".leave-review").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("reviewBookingId").value = btn.dataset.bookingId;
      document.getElementById("reviewCarId").value = btn.dataset.carId;
      document.getElementById("reviewModal").hidden = false;
    });
  });
}

document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("reviewModal").hidden = true;
});

document.getElementById("reviewForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("reviewError");
  errorEl.textContent = "";

  try {
    await api.post("/reviews", {
      bookingId: Number(document.getElementById("reviewBookingId").value),
      carId: Number(document.getElementById("reviewCarId").value),
      rating: Number(document.getElementById("rating").value),
      comment: document.getElementById("comment").value.trim()
    }, true);
    document.getElementById("reviewModal").hidden = true;
    loadPastBookings();
  } catch (err) {
    errorEl.textContent = err.message;
  }
});

renderNav();
loadActiveBookings();
loadPastBookings();