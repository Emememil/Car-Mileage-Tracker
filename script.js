// script.js

let trips = [];
let baselineOdometer = null;

function setBaseline() {
  const baselineInput = document.getElementById("baselineOdometer");
  const baselineStatus = document.getElementById("baselineStatus");
  const baselineValue = Number(baselineInput.value);

  if (baselineValue <= 0 || isNaN(baselineValue)) {
    alert("Please enter a valid baseline odometer reading.");
    return;
  }

  baselineOdometer = baselineValue;
  localStorage.setItem("baselineOdometer", baselineOdometer);

  baselineStatus.innerText = `Baseline set at ${baselineOdometer} km.`;
  baselineInput.disabled = true;
  document.getElementById("setBaseline").disabled = true;

  // Enable trip inputs
  document.getElementById("currentOdometer").disabled = false;
  document.getElementById("fuel").disabled = false;
  document.getElementById("startingdate").disabled = false;
  document.getElementById("addEntry").disabled = false;
}

function addEntry() {
  const fuel = Number(document.getElementById("fuel").value);
  const currentOdometer = Number(document.getElementById("currentOdometer").value);
  const date = document.getElementById("startingdate").value;

  if (!baselineOdometer) {
    alert("Please set the baseline odometer reading first.");
    return;
  }

  if (fuel <= 0 || currentOdometer <= baselineOdometer || date === "") {
    alert("Please enter valid current odometer reading (greater than baseline), fuel used, and date.");
    return;
  }

  const distance = currentOdometer - baselineOdometer;
  const mileage = distance / fuel;

  const trip = {
    fuel,
    distance,
    date,
    averageMileage: mileage.toFixed(2),
  };

  trips.push(trip);
  localStorage.setItem("trips", JSON.stringify(trips));

  // Update baseline to current odometer for next entry
  baselineOdometer = currentOdometer;
  localStorage.setItem("baselineOdometer", baselineOdometer);

  document.getElementById("baselineStatus").innerText = `Baseline updated to ${baselineOdometer} km.`;

  // Clear inputs
  document.getElementById("fuel").value = "";
  document.getElementById("currentOdometer").value = "";
  document.getElementById("startingdate").value = "";

  renderTable();
}

function renderTable() {
  const tbody = document.getElementById("tripTableBody");
  tbody.innerHTML = "";

  for (const trip of trips) {
    const tr = document.createElement("tr");

    const dateTd = document.createElement("td");
    dateTd.textContent = trip.date;

    const distanceTd = document.createElement("td");
    distanceTd.textContent = trip.distance;

    const fuelTd = document.createElement("td");
    fuelTd.textContent = trip.fuel;

    const mileageTd = document.createElement("td");
    mileageTd.textContent = trip.averageMileage;

    tr.appendChild(dateTd);
    tr.appendChild(distanceTd);
    tr.appendChild(fuelTd);
    tr.appendChild(mileageTd);

    tbody.appendChild(tr);
  }
}

function calculateRangeAverageMileage() {
  const startDate = document.getElementById("rangeStart").value;
  const endDate = document.getElementById("rangeEnd").value;
  const result = document.getElementById("rangeresult");

  if (!startDate || !endDate) {
    alert("Please select both start and end dates.");
    return;
  }

  if (startDate > endDate) {
    alert("Start date cannot be later than end date.");
    return;
  }

  const filteredTrips = trips.filter((trip) => trip.date >= startDate && trip.date <= endDate);

  if (filteredTrips.length === 0) {
    result.innerText = "No trip entries found in the selected date range.";
    return;
  }

  const totalDistance = filteredTrips.reduce((sum, trip) => sum + trip.distance, 0);
  const totalFuel = filteredTrips.reduce((sum, trip) => sum + trip.fuel, 0);

  const avgMileage = totalDistance / totalFuel;

  result.innerText = `Average mileage between ${startDate} and ${endDate}: ${avgMileage.toFixed(2)} km/l`;
}

function resetAllData() {
  if (confirm("Are you sure you want to reset all data? This action cannot be undone.")) {
    trips = [];
    baselineOdometer = null;
    localStorage.removeItem("trips");
    localStorage.removeItem("baselineOdometer");

    // Reset UI
    document.getElementById("baselineOdometer").disabled = false;
    document.getElementById("baselineOdometer").value = "";
    document.getElementById("setBaseline").disabled = false;

    document.getElementById("currentOdometer").disabled = true;
    document.getElementById("currentOdometer").value = "";
    document.getElementById("fuel").disabled = true;
    document.getElementById("fuel").value = "";
    document.getElementById("startingdate").disabled = true;
    document.getElementById("startingdate").value = "";
    document.getElementById("addEntry").disabled = true;

    document.getElementById("rangeresult").innerText = "";
    document.getElementById("rangeStart").value = "";
    document.getElementById("rangeEnd").value = "";

    document.getElementById("baselineStatus").innerText = "";

    renderTable();
  }
}

function loadData() {
  const savedTrips = localStorage.getItem("trips");
  if (savedTrips) {
    trips = JSON.parse(savedTrips);
  }

  const savedBaseline = localStorage.getItem("baselineOdometer");
  if (savedBaseline) {
    baselineOdometer = Number(savedBaseline);
    document.getElementById("baselineOdometer").value = baselineOdometer;
    document.getElementById("baselineOdometer").disabled = true;
    document.getElementById("setBaseline").disabled = true;

    document.getElementById("currentOdometer").disabled = false;
    document.getElementById("fuel").disabled = false;
    document.getElementById("startingdate").disabled = false;
    document.getElementById("addEntry").disabled = false;

    document.getElementById("baselineStatus").innerText = `Baseline set at ${baselineOdometer} km.`;
  }

  renderTable();
}

document.getElementById("setBaseline").addEventListener("click", setBaseline);
document.getElementById("addEntry").addEventListener("click", addEntry);
document.getElementById("calcRangeMileage").addEventListener("click", calculateRangeAverageMileage);
document.getElementById("resetData").addEventListener("click", resetAllData);

window.addEventListener("load", loadData);
