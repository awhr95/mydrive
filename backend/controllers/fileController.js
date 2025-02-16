const db = require("../db");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const uploadFile = async (req, res) => {
  const { filename, file } = req.body;

  try {
    await db("files").insert({ filename, file });
    res.status(200).send("File uploaded successfully");
  } catch (error) {
    res.status(500).send("Error uploading file");
  }
};

const downloadFile = async (req, res) => {
  const { filename } = req.params;

  try {
    const file = await db("files").where({ filename }).first();
    res.status(200).send(file); // Send the file back to the client as a response
  } catch (error) {
    res.status(500).send("Error downloading file");
  }
};

module.exports = { uploadFile, downloadFile, upload };
