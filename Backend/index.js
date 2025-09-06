require("dotenv").config();
const mysql = require("mysql2");
const express = require("express");
const app = express();

const PORT = process.env.PORT || 5000;

let db;
let dbConnected = false;

// Try to connect to database
try {
  db = mysql.createConnection({
    host: process.env.HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
  });

  // Test database connection
  db.connect((err) => {
    if (err) {
      console.error("❌ Database connection failed:", err.message);
      console.log("🚀 Server will start without database connection");
      dbConnected = false;
    } else {
      console.log("✅ Connected to MySQL database successfully!");
      dbConnected = true;
    }
  });

  // Handle database connection errors
  db.on("error", (err) => {
    console.error("Database error:", err.message);
    dbConnected = false;
  });
} catch (error) {
  console.error("❌ Failed to create database connection:", error.message);
  console.log("🚀 Server will start without database connection");
  dbConnected = false;
}

// Middleware (to parse JSON)
app.use(express.json());

// Example route
app.get("/", (req, res) => {
  res.json({
    message: "Hello from Express backend!",
    database: dbConnected ? "Connected" : "Not Connected",
    timestamp: new Date().toISOString(),
  });
});

app.get("/users", (req, res) => {
  if (!dbConnected || !db) {
    return res.status(503).json({
      error: "Database not available",
      message: "Please check your database configuration and credentials",
    });
  }

  db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.error("Database query error:", err.message);
      return res.status(500).json({
        error: "Database query failed",
        message: err.message,
      });
    }
    res.json(results);
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    database: dbConnected ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
