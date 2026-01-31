import "./Dashboard.scss";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  FiUploadCloud,
  FiDownload,
  FiTrash2,
  FiFile,
  FiImage,
  FiFileText,
  FiMusic,
  FiVideo,
  FiFolder,
} from "react-icons/fi";

const getFileIcon = (filename) => {
  const ext = filename.split(".").pop().toLowerCase();
  const imageExts = ["jpg", "jpeg", "png", "gif", "svg", "webp"];
  const docExts = ["pdf", "doc", "docx", "txt", "md", "csv", "xls", "xlsx"];
  const audioExts = ["mp3", "wav", "ogg", "flac"];
  const videoExts = ["mp4", "mov", "avi", "mkv", "webm"];

  if (imageExts.includes(ext)) return <FiImage />;
  if (docExts.includes(ext)) return <FiFileText />;
  if (audioExts.includes(ext)) return <FiMusic />;
  if (videoExts.includes(ext)) return <FiVideo />;
  return <FiFile />;
};

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleAuthError = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/files`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFiles(response.data);
      } catch (error) {
        if (error.response?.status === 401) {
          handleAuthError();
        }
      }
    };

    fetchFiles();
  }, []);

  const handleDownload = async (filename) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/files/download/${filename}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (error.response?.status === 401) {
        handleAuthError();
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/files/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(files.filter((file) => file.id !== id));
    } catch (error) {
      if (error.response?.status === 401) {
        handleAuthError();
      }
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard__welcome">
        <div>
          <h1 className="dashboard__title">My Files</h1>
          <p className="dashboard__subtitle">
            {files.length} {files.length === 1 ? "file" : "files"} stored
          </p>
        </div>
        <Link to="/fileupload" className="dashboard__upload-btn">
          <FiUploadCloud />
          Upload File
        </Link>
      </div>

      {files.length === 0 ? (
        <div className="dashboard__empty">
          <FiFolder className="dashboard__empty-icon" />
          <p className="dashboard__empty-text">No files uploaded yet</p>
          <Link to="/fileupload" className="dashboard__empty-link">
            Upload your first file
          </Link>
        </div>
      ) : (
        <div className="dashboard__grid">
          {files.map((file) => (
            <div key={file.id} className="dashboard__card">
              <div className="dashboard__card-icon">{getFileIcon(file.filename)}</div>
              <div className="dashboard__card-info">
                <span className="dashboard__card-name">{file.filename}</span>
                <span className="dashboard__card-date">
                  {new Date(file.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="dashboard__card-actions">
                <button
                  className="dashboard__btn-download"
                  onClick={() => handleDownload(file.filename)}
                >
                  <FiDownload />
                  Download
                </button>
                <button
                  className="dashboard__btn-delete"
                  onClick={() => handleDelete(file.id)}
                >
                  <FiTrash2 />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
