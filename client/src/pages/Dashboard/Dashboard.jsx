import "./Dashboard.scss";
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import UploadModal from "../../components/UploadModal";
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

const getFileType = (filename) => {
  const ext = filename.split(".").pop();
  return ext ? ext.toUpperCase() : "FILE";
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [flipUp, setFlipUp] = useState(false);
  const uploadWrapperRef = useRef(null);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleAuthError = () => {
    logout();
    navigate("/login");
  };

  const fetchFiles = useCallback(async () => {
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
  }, [token]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    if (!showUploadModal) return;
    const handleClickOutside = (e) => {
      if (
        uploadWrapperRef.current &&
        !uploadWrapperRef.current.contains(e.target)
      ) {
        setShowUploadModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUploadModal]);

  useEffect(() => {
    if (showUploadModal && uploadWrapperRef.current) {
      const rect = uploadWrapperRef.current.getBoundingClientRect();
      setFlipUp(window.innerHeight - rect.bottom < 400);
    }
  }, [showUploadModal]);

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
        <div className="dashboard__upload-wrapper" ref={uploadWrapperRef}>
          <button
            className="dashboard__upload-btn"
            onClick={() => setShowUploadModal((prev) => !prev)}
          >
            <FiUploadCloud />
            Upload File
          </button>
          <UploadModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            onUploadSuccess={fetchFiles}
            flipUp={flipUp}
          />
        </div>
      </div>

      {files.length === 0 ? (
        <div className="dashboard__empty">
          <FiFolder className="dashboard__empty-icon" />
          <p className="dashboard__empty-text">No files uploaded yet</p>
          <button
            className="dashboard__empty-link"
            onClick={() => setShowUploadModal(true)}
          >
            Upload your first file
          </button>
        </div>
      ) : (
        <div className="dashboard__table">
          <div className="dashboard__table-header">
            <span className="dashboard__col-icon" />
            <span className="dashboard__col-name">Name</span>
            <span className="dashboard__col-type">Type</span>
            <span className="dashboard__col-size">Size</span>
            <span className="dashboard__col-date">Date</span>
            <span className="dashboard__col-actions">Actions</span>
          </div>
          {files.map((file) => (
            <div key={file.id} className="dashboard__table-row">
              <span className="dashboard__col-icon dashboard__file-icon">
                {getFileIcon(file.filename)}
              </span>
              <span className="dashboard__col-name dashboard__file-name">
                {file.filename}
              </span>
              <span className="dashboard__col-type">
                <span className="dashboard__type-badge">
                  {getFileType(file.filename)}
                </span>
              </span>
              <span className="dashboard__col-size">&mdash;</span>
              <span className="dashboard__col-date">
                {formatDate(file.created_at)}
              </span>
              <span className="dashboard__col-actions">
                <button
                  className="dashboard__action-btn dashboard__action-btn--download"
                  onClick={() => handleDownload(file.filename)}
                  title="Download"
                >
                  <FiDownload />
                </button>
                <button
                  className="dashboard__action-btn dashboard__action-btn--delete"
                  onClick={() => handleDelete(file.id)}
                  title="Delete"
                >
                  <FiTrash2 />
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Dashboard;
