
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "GATE Analytics API is running!"
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    project: "GATE Analytics",
    status: "Online"
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
