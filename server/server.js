require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");


// Debug imports
console.log("routes:", typeof routes);
console.log("errorHandler:", typeof errorHandler);
console.log("logger:", typeof logger);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));


// Combined routes from both branches
app.use("/api", routes); // All legacy and modular endpoints
// Course/lesson/progress endpoints from feature/course
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/paths', require('./routes/paths.routes'));
app.use('/api/lessons', require('./routes/lessons.routes'));
app.use('/api/progress', require('./routes/progress.routes'));
app.use('/api/sessions', require('./routes/studySessions.routes'));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Scalio Backend is running",
    timestamp: new Date().toISOString(),
  });
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    message: "Scalio Server!",
    environment: process.env.NODE_ENV || "development",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info(`Base URL: http://localhost:${PORT}`);
});



module.exports = app;
