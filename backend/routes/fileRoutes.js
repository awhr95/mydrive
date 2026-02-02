const express = require("express");
const {
  uploadFile,
  downloadFile,
  getFiles,
  deleteFile,
  createFolder,
  getFolderPath,
  renameFile,
  handleUpload,
} = require("../controllers/fileController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, getFiles);
router.post("/upload", authenticate, handleUpload, uploadFile);
router.get("/download/:filename", authenticate, downloadFile);
router.post("/folders", authenticate, createFolder);
router.get("/folders/:id/path", authenticate, getFolderPath);
router.patch("/:id/rename", authenticate, renameFile);
router.delete("/:id", authenticate, deleteFile);

module.exports = router;
