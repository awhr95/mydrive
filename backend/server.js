require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5002;

app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
    methods: "GET,POST,PUT,DELETE",
    credentials: true, // If sending cookies or authentication headers
  })
);
app.options("*", cors());
app.use(express.json());

const userRoutes = require("./routes/userRoutes");
app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
