const express = require("express");
const {
  uploadFile,
  downloadFile,
  upload,
} = require("../controllers/fileController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post("/upload", authenticate, upload.single("file"), uploadFile);
router.get("/download/:filename", authenticate, downloadFile);

module.exports = router;
