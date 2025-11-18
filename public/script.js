const baseUrl = "http://localhost:3000";
let chart;

function timeFromLocalTimestamp(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

// 🗓 Load date list
async function loadDates() {
  try {
    const res = await fetch(`${baseUrl}/api/dates`);
    const dates = await res.json();
    const sel = document.getElementById("dateSelect");
    sel.innerHTML = "";

    if (!dates.length) {
      sel.innerHTML = `<option>No data</option>`;
      return;
    }

    dates.forEach(d => {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = d;
      sel.appendChild(opt);
    });

    sel.value = dates[0];
    fetchDataForDate(dates[0]);
  } catch (e) {
    console.error("❌ Error loading dates:", e);
  }
}

// 📈 Fetch and plot + populate table
async function fetchDataForDate(date) {
  try {
    const res = await fetch(`${baseUrl}/api/data/${date}`);
    if (!res.ok) return;
    const data = await res.json();
    if (!data?.length) return;

    const valid = data.filter(r =>
      ["co", "co2", "smoke", "lpg"].every(k => isFinite(Number(r[k])))
    );

    const labels = valid.map(r => timeFromLocalTimestamp(r.local_timestamp));
    const co2 = valid.map(r => +r.co2);
    const co = valid.map(r => +r.co);
    const smoke = valid.map(r => +r.smoke);
    const lpg = valid.map(r => +r.lpg);

    // 🧮 Table update
    // 🧮 Table update (show recent first)
const tableBody = document.querySelector("#dataTable tbody");
tableBody.innerHTML = "";
const recentData = valid.slice(-50).reverse(); // newest data at top

recentData.forEach(r => {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${timeFromLocalTimestamp(r.local_timestamp)}</td>
    <td>${r.co2}</td>
    <td>${r.co}</td>
    <td>${r.smoke}</td>
    <td>${r.lpg}</td>
  `;
  tableBody.appendChild(row);
});

    // 🎨 Chart
    const ctx = document.getElementById("chart").getContext("2d");
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "CO₂ (ppm)", data: co2, borderColor: "green", yAxisID: "y1", tension: 0.35, pointRadius: 2 },
          { label: "CO (ppm)", data: co, borderColor: "red", yAxisID: "y2", tension: 0.35, pointRadius: 2 },
          { label: "Smoke (ppm)", data: smoke, borderColor: "blue", yAxisID: "y2", tension: 0.35, pointRadius: 2 },
          { label: "LPG (ppm)", data: lpg, borderColor: "orange", yAxisID: "y2", tension: 0.35, pointRadius: 2 }
        ]
      },
      options: {
        responsive: true,
        animation: { duration: 700, easing: "easeInOutCubic" },
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            position: "top",
            labels: { usePointStyle: true },
            onClick: (e, legendItem, legend) => {
              const ci = legend.chart;
              const idx = legendItem.datasetIndex;
              const dsList = ci.data.datasets;

              // "ALL" button toggle
              if (legendItem.text === "ALL") {
                dsList.forEach((_, i) => (ci.getDatasetMeta(i).hidden = false));
              } else {
                const meta = ci.getDatasetMeta(idx);
                meta.hidden = !meta.hidden;
              }

              const visible = dsList.filter((_, i) => !ci.getDatasetMeta(i).hidden);
              const y1 = ci.options.scales.y1;
              const y2 = ci.options.scales.y2;

              const hasCO2 = visible.some(d => d.label.includes("CO₂"));
              const hasOthers = visible.some(d =>
                ["CO", "Smoke", "LPG"].some(k => d.label.includes(k))
              );

              if (hasCO2 && hasOthers) {
                y1.display = true;
                y1.min = 0; y1.max = 1000;
                y2.display = true;
                y2.min = 0; y2.max = 100;
              } else if (hasCO2) {
                y1.display = true;
                y1.min = 0;
                y1.max = Math.ceil(Math.max(...visible[0].data) * 1.2);
                y2.display = false;
              } else if (hasOthers) {
                y1.display = false;
                y2.display = true;
                const combined = visible.flatMap(d => d.data);
                y2.min = 0;
                y2.max = Math.ceil(Math.max(...combined) * 1.2);
              } else {
                y1.display = false; y2.display = false;
              }

              ci.update();
            }
          },
          title: { display: true, text: `Air Quality — ${date}` }
        },
        scales: {
          x: { title: { display: true, text: "Time (HH:MM)" } },
          y1: {
            type: "linear",
            position: "left",
            title: { display: true, text: "CO₂ (ppm)" },
            min: 0, max: 1000
          },
          y2: {
            type: "linear",
            position: "right",
            title: { display: true, text: "CO / Smoke / LPG (ppm)" },
            min: 0, max: 100,
            grid: { drawOnChartArea: false }
          }
        }
      },
      plugins: [{
        id: 'addAllButton',
        afterInit: (chart) => {
          const allItem = { text: 'ALL', fillStyle: 'gray', hidden: false };
          chart.legend.legendItems.push(allItem);
        }
      }]
    });
  } catch (e) {
    console.error("❌ Error fetching data:", e);
  }
}

// 🔁 Auto refresh + dropdown listener
// 🔁 Auto-refresh setup
document.addEventListener("DOMContentLoaded", () => {
  loadDates();

  // When user changes the date manually
  document.getElementById("dateSelect").addEventListener("change", (e) => {
    if (e.target.value) fetchDataForDate(e.target.value);
  });

  // 🕒 Refresh chart every 60 seconds (1 min)
  setInterval(() => {
    const d = document.getElementById("dateSelect").value;
    if (d) fetchDataForDate(d);
  }, 60000);

  // 🕒 Refresh table every 15 seconds (faster updates)
  setInterval(async () => {
    const d = document.getElementById("dateSelect").value;
    if (!d) return;

    try {
      const res = await fetch(`${baseUrl}/api/data/${d}`);
      if (!res.ok) return;
      const data = await res.json();
      const valid = data.filter(r =>
        ["co", "co2", "smoke", "lpg"].every(k => isFinite(Number(r[k])))
      );

      // 🧮 Update table only (no chart)
      const tableBody = document.querySelector("#dataTable tbody");
      tableBody.innerHTML = "";
      valid
        .slice(-50) // show last 50 entries
        .reverse()  // recent ones first
        .forEach(r => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${timeFromLocalTimestamp(r.local_timestamp)}</td>
            <td>${r.co2}</td>
            <td>${r.co}</td>
            <td>${r.smoke}</td>
            <td>${r.lpg}</td>
          `;
          tableBody.appendChild(row);
        });
    } catch (err) {
      console.error("❌ Error refreshing table:", err);
    }
  }, 15000);

  // ⏰ Refresh date list every 5 minutes (to include new dates)
  setInterval(loadDates, 300000);
});


