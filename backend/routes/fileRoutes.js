const express = require("express");
const {
  uploadFile,
  downloadFile,
  upload,
} = require("../controllers/fileController");

const router = express.Router();

router.post("/upload", upload.single("file"), uploadFile);
router.get("/download/:filename", downloadFile);
