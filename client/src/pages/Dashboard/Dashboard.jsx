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
  FiPlus,
  FiChevronRight,
  FiEdit2,
} from "react-icons/fi";

const getDisplayName = (file) => file.display_name || file.filename;

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
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState([]);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const uploadWrapperRef = useRef(null);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleAuthError = () => {
    logout();
    navigate("/login");
  };

  const fetchFiles = useCallback(async () => {
    try {
      const params = currentFolderId ? `?parent_id=${currentFolderId}` : "";
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/files${params}`,
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
  }, [token, currentFolderId]);

  const fetchBreadcrumb = useCallback(async () => {
    if (!currentFolderId) {
      setBreadcrumbPath([]);
      return;
    }
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/files/folders/${currentFolderId}/path`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBreadcrumbPath(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        handleAuthError();
      }
    }
  }, [token, currentFolderId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    fetchBreadcrumb();
  }, [fetchBreadcrumb]);

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

  const handleDownload = async (diskFilename, displayName) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/files/download/${diskFilename}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = displayName;
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

  const handleFolderClick = (id) => {
    setCurrentFolderId(id);
  };

  const handleBreadcrumbClick = (id) => {
    setCurrentFolderId(id);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || creatingFolder) return;
    setCreatingFolder(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/files/folders`,
        {
          name: newFolderName.trim(),
          parent_id: currentFolderId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewFolderName("");
      setShowNewFolder(false);
      fetchFiles();
    } catch (error) {
      if (error.response?.status === 401) {
        handleAuthError();
      }
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleStartRename = (file) => {
    setRenamingId(file.id);
    setRenameValue(getDisplayName(file));
  };

  const handleRename = async (id) => {
    if (!renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/files/${id}/rename`,
        { name: renameValue.trim() },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRenamingId(null);
      fetchFiles();
      if (currentFolderId) fetchBreadcrumb();
    } catch (error) {
      if (error.response?.status === 401) {
        handleAuthError();
      }
    }
  };

  const folderCount = files.filter((f) => f.type === "folder").length;
  const fileCount = files.filter((f) => f.type === "file").length;

  const subtitleParts = [];
  if (folderCount > 0)
    subtitleParts.push(`${folderCount} ${folderCount === 1 ? "folder" : "folders"}`);
  if (fileCount > 0)
    subtitleParts.push(`${fileCount} ${fileCount === 1 ? "file" : "files"}`);
  const subtitle = subtitleParts.length > 0 ? subtitleParts.join(", ") : "No items";

  return (
    <div className="dashboard">
      <div className="dashboard__welcome">
        <div>
          <h1 className="dashboard__title">My Files</h1>
          <p className="dashboard__subtitle">{subtitle}</p>
        </div>
        <div className="dashboard__actions">
          <button
            className="dashboard__new-folder-btn"
            onClick={() => {
              setShowNewFolder((prev) => !prev);
              setNewFolderName("");
            }}
          >
            <FiPlus />
            New Folder
          </button>
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
              currentFolderId={currentFolderId}
            />
          </div>
        </div>
      </div>

      {currentFolderId && (
        <div className="dashboard__breadcrumb">
          <button
            className="dashboard__breadcrumb-item"
            onClick={() => handleBreadcrumbClick(null)}
          >
            Home
          </button>
          {breadcrumbPath.map((crumb) => (
            <span key={crumb.id} style={{ display: "flex", alignItems: "center" }}>
              <FiChevronRight className="dashboard__breadcrumb-sep" />
              <button
                className="dashboard__breadcrumb-item"
                onClick={() => handleBreadcrumbClick(crumb.id)}
              >
                {crumb.name}
              </button>
            </span>
          ))}
        </div>
      )}

      {showNewFolder && (
        <div className="dashboard__new-folder-form">
          <FiFolder style={{ fontSize: 18, color: "#f59e0b" }} />
          <input
            className="dashboard__new-folder-input"
            type="text"
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateFolder();
              if (e.key === "Escape") {
                setShowNewFolder(false);
                setNewFolderName("");
              }
            }}
            autoFocus
          />
          <button
            className="dashboard__new-folder-submit"
            onClick={handleCreateFolder}
            disabled={creatingFolder}
          >
            {creatingFolder ? "Creating..." : "Create"}
          </button>
          <button
            className="dashboard__new-folder-cancel"
            onClick={() => {
              setShowNewFolder(false);
              setNewFolderName("");
            }}
          >
            Cancel
          </button>
        </div>
      )}

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
          {files.map((file) =>
            file.type === "folder" ? (
              <div
                key={file.id}
                className="dashboard__table-row dashboard__table-row--folder"
                onClick={() => handleFolderClick(file.id)}
              >
                <span className="dashboard__col-icon dashboard__file-icon">
                  <FiFolder />
                </span>
                <span className="dashboard__col-name dashboard__file-name">
                  {renamingId === file.id ? (
                    <input
                      className="dashboard__rename-input"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(file.id);
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  ) : (
                    file.filename
                  )}
                </span>
                <span className="dashboard__col-type">
                  <span className="dashboard__type-badge">FOLDER</span>
                </span>
                <span className="dashboard__col-size">&mdash;</span>
                <span className="dashboard__col-date">
                  {formatDate(file.created_at)}
                </span>
                <span className="dashboard__col-actions">
                  <button
                    className="dashboard__action-btn dashboard__action-btn--rename"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartRename(file);
                    }}
                    title="Rename"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="dashboard__action-btn dashboard__action-btn--delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file.id);
                    }}
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </span>
              </div>
            ) : (
              <div key={file.id} className="dashboard__table-row">
                <span className="dashboard__col-icon dashboard__file-icon">
                  {getFileIcon(getDisplayName(file))}
                </span>
                <span className="dashboard__col-name dashboard__file-name">
                  {renamingId === file.id ? (
                    <input
                      className="dashboard__rename-input"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(file.id);
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      autoFocus
                    />
                  ) : (
                    getDisplayName(file)
                  )}
                </span>
                <span className="dashboard__col-type">
                  <span className="dashboard__type-badge">
                    {getFileType(getDisplayName(file))}
                  </span>
                </span>
                <span className="dashboard__col-size">&mdash;</span>
                <span className="dashboard__col-date">
                  {formatDate(file.created_at)}
                </span>
                <span className="dashboard__col-actions">
                  <button
                    className="dashboard__action-btn dashboard__action-btn--download"
                    onClick={() => handleDownload(file.filename, getDisplayName(file))}
                    title="Download"
                  >
                    <FiDownload />
                  </button>
                  <button
                    className="dashboard__action-btn dashboard__action-btn--rename"
                    onClick={() => handleStartRename(file)}
                    title="Rename"
                  >
                    <FiEdit2 />
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
            )
          )}
        </div>
      )}

    </div>
  );
};

export default Dashboard;
