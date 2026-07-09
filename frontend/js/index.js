function carCardHTML(car) {
  const badgeClass = car.is_available ? "badge-available" : "badge-unavailable";
  const badgeText = car.is_available ? "Available" : "Unavailable";
  const image = car.image_url || "https://placehold.co/400x250?text=No+Image";

  return `
    <a href="car-details.html?id=${car.id}" class="car-card">
      <img src="${image}" alt="${car.make} ${car.model}">
      <div class="car-card-body">
        <span class="badge ${badgeClass}">${badgeText}</span>
        <div class="car-card-title">${car.make} ${car.model} (${car.year})</div>
        <div class="car-card-meta">${car.location} · ${car.vehicle_type}</div>
        <div class="car-card-price">$${car.price_per_day}/day</div>
      </div>
    </a>
  `;
}

async function loadCars(filters = {}) {
  const grid = document.getElementById("carGrid");
  const emptyState = document.getElementById("emptyState");
  const resultCount = document.getElementById("resultCount");

  const params = new URLSearchParams();
  if (filters.location) params.set("location", filters.location);
  if (filters.vehicleType) params.set("vehicleType", filters.vehicleType);
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);

  try {
    const cars = await api.get(`/cars?${params.toString()}`);

    grid.querySelectorAll(".car-card").forEach(el => el.remove());

    if (!cars.length) {
      emptyState.hidden = false;
      resultCount.textContent = "";
      return;
    }

    emptyState.hidden = true;
    resultCount.textContent = `${cars.length} car${cars.length === 1 ? "" : "s"} found`;
    grid.insertAdjacentHTML("beforeend", cars.map(carCardHTML).join(""));
  } catch (err) {
    emptyState.hidden = false;
    emptyState.textContent = "Could not load cars. Try again shortly.";
  }
}

document.getElementById("searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  loadCars({
    location: document.getElementById("searchLocation").value.trim(),
    vehicleType: document.getElementById("searchType").value,
    maxPrice: document.getElementById("searchMaxPrice").value
  });
});

renderNav();
loadCars();