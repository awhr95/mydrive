import "./UploadModal.scss";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FiUploadCloud, FiX } from "react-icons/fi";

const UploadModal = ({ isOpen, onClose, onUploadSuccess, flipUp }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const { token } = useAuth();

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
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
    } catch {
      setMessage("Upload failed. Please try again.");
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
          {file ? file.name : "Click or drag files here"}
        </span>
        <span className="upload-popover__dropzone-hint">
          {file ? `${(file.size / 1024).toFixed(1)} KB` : "Any file type"}
        </span>
        <input
          id="popover-file-input"
          className="upload-popover__input"
          type="file"
          onChange={handleFileChange}
        />
      </label>

      <button
        className="upload-popover__upload-btn"
        onClick={handleUpload}
        disabled={uploading}
      >
        <FiUploadCloud />
        {uploading ? "Uploading..." : "Upload"}
      </button>

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
