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


// Routes
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const authRoutes = require('./routes/auth.routes');
const pathRoutes = require("./routes/paths.routes");
const lessonRoutes = require("./routes/lessons.routes");
const progressRoutes = require("./routes/progress.routes");
const studySessionRoutes = require("./routes/studySessions.routes");


app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/paths", pathRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/sessions", studySessionRoutes);

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

// Mount all API routes
app.use("/api", routes);

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
