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
