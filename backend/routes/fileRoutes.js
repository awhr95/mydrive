const express = require("express");
const {
  uploadFile,
  downloadFile,
  getFiles,
  deleteFile,
  upload,
} = require("../controllers/fileController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, getFiles);
router.post("/upload", authenticate, upload.single("file"), uploadFile);
router.get("/download/:filename", authenticate, downloadFile);
router.delete("/:id", authenticate, deleteFile);

module.exports = router;
