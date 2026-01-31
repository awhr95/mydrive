const db = require("../db");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const uploadDir = path.join(__dirname, "../uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const uploadFile = async (req, res) => {
  const { filename } = req.file;
  const userId = req.user.id;

  try {
    await db("files").insert({ filename, user_id: userId });
    res.status(200).send("File uploaded successfully");
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).send("Error uploading file");
  }
};

const downloadFile = async (req, res) => {
  const { filename } = req.params;
  const userId = req.user.id;

  try {
    const file = await db("files").where({ filename, user_id: userId }).first();
    if (!file) {
      return res.status(404).send("File not found");
    }
    const filePath = path.join(uploadDir, file.filename);
    res.download(filePath, file.filename);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).send("Error downloading file");
  }
};

const getFiles = async (req, res) => {
  try {
    const files = await db("files")
      .select("id", "filename", "created_at")
      .orderBy("created_at", "desc");
    res.status(200).json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).send("Error fetching files");
  }
};

const deleteFile = async (req, res) => {
  const { id } = req.params;

  try {
    const file = await db("files").where({ id }).first();
    if (!file) {
      return res.status(404).send("File not found");
    }

    const filePath = path.join(uploadDir, file.filename);
    await fs.promises.unlink(filePath).catch(() => {});
    await db("files").where({ id }).del();
    res.status(200).send("File deleted successfully");
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).send("Error deleting file");
  }
};

module.exports = { uploadFile, downloadFile, getFiles, deleteFile, upload };
