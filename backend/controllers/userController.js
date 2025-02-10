const db = require("../db");

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    await db("users").insert({ email, password });
    res.status(200).send("User created successfully");
  } catch (error) {
    res.status(500).send("Error creating user");
  }
};

module.exports = { loginUser };
// In the above code, we have a loginUser function that reads the users.json file, parses the data, and appends the new user data to the file. The loginUser function is exported to be used in the userRoutes.js file.
