const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 5000; // or any port you like

// Middleware
app.use(cors()); // Allow all cross-origin requests
app.use(express.json()); // Allow parsing JSON bodies

// Test Route
app.get("/api/test", (req, res) => {
  res.json({ message: "Hello from the Server!" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
