import "./Dashboard.scss";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1>My Files</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {files.length === 0 ? (
        <p>No files uploaded yet.</p>
      ) : (
        <ul className="dashboard__file-list">
          {files.map((file) => (
            <li key={file.id} className="dashboard__file-item">
              <span className="dashboard__filename">{file.filename}</span>
              <span className="dashboard__date">
                {new Date(file.created_at).toLocaleDateString()}
              </span>
              <button onClick={() => handleDownload(file.filename)}>
                Download
              </button>
              <button onClick={() => handleDelete(file.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
