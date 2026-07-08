const params = new URLSearchParams(window.location.search);
const carId = params.get("id");

async function loadCarDetails() {
  const page = document.getElementById("detailPage");

  if (!carId) {
    page.innerHTML = "<p>No car specified.</p>";
    return;
  }

  try {
    const car = await api.get(`/cars/${carId}`);
    const reviews = await api.get(`/reviews/car/${carId}`);
    renderCar(car, reviews);
  } catch (err) {
    page.innerHTML = `<p class="form-error">${err.message}</p>`;
  }
}

function renderCar(car, reviews) {
  const page = document.getElementById("detailPage");
  const image = car.image_url || "https://placehold.co/500x320?text=No+Image";
  const user = getCurrentUser();

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  let bookingSection = "";
  if (user && user.role === "customer") {
    bookingSection = `
      <div class="booking-box">
        <h3>Request to book</h3>
        <form id="bookingForm">
          <div class="form-group">
            <label for="startDate">Start date</label>
            <input type="date" id="startDate" required>
          </div>
          <div class="form-group">
            <label for="endDate">End date</label>
            <input type="date" id="endDate" required>
          </div>
          <p class="booking-total" id="bookingTotal"></p>
          <button type="submit" class="btn btn-primary" style="width:100%">Send booking request</button>
          <p class="form-error" id="bookingError"></p>
        </form>
      </div>
    `;
  } else if (!user) {
    bookingSection = `<p class="form-sub"><a href="login.html">Log in</a> as a customer to book this car.</p>`;
  }

  page.innerHTML = `
    <div class="detail-grid">
      <div class="detail-image"><img src="${image}" alt="${car.make} ${car.model}"></div>
      <div class="detail-info">
        <h1>${car.make} ${car.model} (${car.year})</h1>
        <p class="car-card-meta">${car.location} · ${car.vehicle_type}${avgRating ? ` · ${avgRating}★ (${reviews.length} review${reviews.length === 1 ? "" : "s"})` : ""}</p>
        <p class="detail-price">$${car.price_per_day}/day</p>
        <p class="detail-description">${car.description || "No description provided."}</p>
        ${bookingSection}
      </div>
    </div>

    <div class="reviews-section">
      <h2>Reviews</h2>
      ${reviews.length ? reviews.map(reviewCardHTML).join("") : "<p class='form-sub'>No reviews yet.</p>"}
    </div>
  `;

  attachBookingHandlers(car);
}

function reviewCardHTML(review) {
  return `
    <div class="review-card">
      <div class="review-rating">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
      <div class="review-comment">${review.comment || ""}</div>
    </div>
  `;
}

function attachBookingHandlers(car) {
  const form = document.getElementById("bookingForm");
  if (!form) return;

  const startInput = document.getElementById("startDate");
  const endInput = document.getElementById("endDate");
  const totalEl = document.getElementById("bookingTotal");

  function updateTotal() {
    const start = new Date(startInput.value);
    const end = new Date(endInput.value);
    if (start && end && end > start) {
      const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
      totalEl.textContent = `${days} day${days === 1 ? "" : "s"} × $${car.price_per_day} = $${(days * car.price_per_day).toFixed(2)}`;
    } else {
      totalEl.textContent = "";
    }
  }

  startInput.addEventListener("change", updateTotal);
  endInput.addEventListener("change", updateTotal);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("bookingError");
    errorEl.textContent = "";

    try {
      await api.post("/bookings", {
        carId: car.id,
        startDate: startInput.value,
        endDate: endInput.value
      }, true);
      alert("Booking request sent! The owner will review it.");
      window.location.href = "customer-dashboard.html";
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
}

renderNav();
loadCarDetails();