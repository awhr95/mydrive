require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const USER_FILE = "users.json";

app.use(cors());
app.use(express.json());

app.post("/users/login", (req, res) => {
  const { email, password } = req.body;

  const userData = { email, password };
  fs.readFile(USER_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error reading data");
    const users = data ? JSON.parse(data) : [];
    users.push(userData);
    fs.writeFile(USER_FILE, JSON.stringify(users, null, 2), (err) => {
      if (err) return res.status(500).send("Error saving data");
      res.status(200).send("User signed up");
    });
  });
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
