import "./UploadModal.scss";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FiUploadCloud, FiX, FiFile } from "react-icons/fi";

const maxSizeMB = parseInt(import.meta.env.VITE_MAX_FILE_SIZE_MB, 10) || 50;
const maxSizeBytes = maxSizeMB * 1024 * 1024;

const UploadModal = ({ isOpen, onClose, onUploadSuccess, flipUp, currentFolderId }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const { token } = useAuth();

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.size > maxSizeBytes) {
      setMessage(`File too large. Maximum size is ${maxSizeMB}MB.`);
      setIsError(true);
      setFile(null);
      e.target.value = "";
      return;
    }
    setFile(selected);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      setIsError(true);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    if (currentFolderId) {
      formData.append("parent_id", currentFolderId);
    }
    setUploading(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/files/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("File uploaded successfully.");
      setIsError(false);
      setFile(null);
      setTimeout(() => {
        setMessage("");
        onUploadSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      const serverMsg = err.response?.data?.error;
      setMessage(serverMsg || "Upload failed. Please try again.");
      setIsError(true);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={`upload-popover${flipUp ? " upload-popover--flip" : ""}`}
    >
      <button className="upload-popover__close" onClick={onClose}>
        <FiX />
      </button>
      <h2 className="upload-popover__heading">Upload a File</h2>

      <label className="upload-popover__dropzone" htmlFor="popover-file-input">
        <FiUploadCloud className="upload-popover__dropzone-icon" />
        <span className="upload-popover__dropzone-text">
          {file ? "Click to change file" : "Click or drag files here"}
        </span>
        <span className="upload-popover__dropzone-hint">
          {`Any file type, max ${maxSizeMB}MB`}
        </span>
        <input
          id="popover-file-input"
          className="upload-popover__input"
          type="file"
          onChange={handleFileChange}
        />
      </label>

      {file && (
        <div className="upload-popover__file-info">
          <FiFile className="upload-popover__file-info-icon" />
          <span className="upload-popover__file-info-name">{file.name}</span>
          <span className="upload-popover__file-info-size">
            {file.size < 1024 * 1024
              ? `${(file.size / 1024).toFixed(1)} KB`
              : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
          </span>
          <button
            className="upload-popover__file-info-remove"
            onClick={() => { setFile(null); setMessage(""); }}
            title="Remove"
          >
            <FiX />
          </button>
        </div>
      )}

      {file && (
        <button
          className="upload-popover__upload-btn"
          onClick={handleUpload}
          disabled={uploading}
        >
          <FiUploadCloud />
          {uploading ? "Uploading..." : "Upload"}
        </button>
      )}

      {message && (
        <p
          className={
            isError ? "upload-popover__error" : "upload-popover__success"
          }
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default UploadModal;
