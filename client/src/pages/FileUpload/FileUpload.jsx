import "./FileUpload.scss";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { FiUploadCloud, FiArrowLeft } from "react-icons/fi";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
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
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }
      setMessage("Upload failed. Please try again.");
      setIsError(true);
    }
  };

  return (
    <div className="file-upload">
      <Link to="/" className="file-upload__back">
        <FiArrowLeft />
        Back to Dashboard
      </Link>

      <div className="file-upload__card">
        <h1 className="file-upload__heading">Upload a File</h1>

        <label className="file-upload__dropzone" htmlFor="file-input">
          <FiUploadCloud className="file-upload__dropzone-icon" />
          <span className="file-upload__dropzone-text">
            {file ? file.name : "Click to choose a file"}
          </span>
          <span className="file-upload__dropzone-hint">
            {file ? `${(file.size / 1024).toFixed(1)} KB` : "Any file type"}
          </span>
          <input
            id="file-input"
            className="file-upload__input"
            type="file"
            onChange={handleFileChange}
          />
        </label>

        <button className="file-upload__button" onClick={handleUpload}>
          <FiUploadCloud />
          Upload
        </button>

        {message && (
          <p
            className={
              isError ? "file-upload__error" : "file-upload__success"
            }
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
