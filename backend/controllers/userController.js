const fs = require("fs");
const USER_FILE = "users.json";

const loginUser = (req, res) => {
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
};

module.exports = { loginUser };
// In the above code, we have a loginUser function that reads the users.json file, parses the data, and appends the new user data to the file. The loginUser function is exported to be used in the userRoutes.js file.
