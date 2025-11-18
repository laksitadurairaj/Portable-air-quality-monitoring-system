const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "air_quality",
  password: "2004",
  port: 5432,
});

pool
  .connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ Database connection error:", err));

// Ensure table exists
(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sensor_data (
      id SERIAL PRIMARY KEY,
      location VARCHAR(50),
      co REAL,
      co2 REAL,
      smoke REAL,
      lpg REAL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Table "sensor_data" ready');
})();

// ✅ Manual insert endpoint (if ESP32 POSTs)
app.post("/upload", async (req, res) => {
  try {
    const { location, co, co2, smoke, lpg } = req.body;
    if (![location, co, co2, smoke, lpg].every(v => v !== undefined)) {
      return res.status(400).json({ error: "Missing one or more fields" });
    }
    await pool.query(
      `INSERT INTO sensor_data (location, co, co2, smoke, lpg)
       VALUES ($1, $2, $3, $4, $5);`,
      [location, co, co2, smoke, lpg]
    );
    console.log("✅ Inserted:", { location, co, co2, smoke, lpg });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ error: "Database insert failed" });
  }
});

// ✅ Auto-generate and insert dummy data every 15 s
setInterval(async () => {
  try {
    const randomData = {
      location: "TestLab",
      co: (Math.random() * 1).toFixed(2),
      co2: (400 + Math.random() * 100).toFixed(1),
      smoke: (Math.random() * 50).toFixed(1),
      lpg: (Math.random() * 40).toFixed(1),
    };
    await pool.query(
      `INSERT INTO sensor_data (location, co, co2, smoke, lpg)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        randomData.location,
        randomData.co,
        randomData.co2,
        randomData.smoke,
        randomData.lpg,
      ]
    );
    console.log("⏱️ Auto inserted:", randomData);
  } catch (err) {
    console.error("❌ Auto insert failed:", err);
  }
}, 15000);

// ✅ Fetch list of available dates
app.get("/api/dates", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT to_char(timestamp::date, 'YYYY-MM-DD') AS date
      FROM sensor_data
      ORDER BY date DESC;
    `);
    res.json(result.rows.map(r => r.date));
  } catch (err) {
    console.error("❌ Error fetching dates:", err);
    res.status(500).json({ error: "Failed to fetch dates" });
  }
});

// ✅ Fetch data for selected date
app.get("/api/data/:date", async (req, res) => {
  const { date } = req.params;
  try {
    const result = await pool.query(`
      SELECT co, co2, smoke, lpg, timestamp AS local_timestamp
      FROM sensor_data
      WHERE timestamp::date = $1
      ORDER BY local_timestamp ASC;
    `, [date]);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching data:", err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// ✅ Serve dashboard
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
