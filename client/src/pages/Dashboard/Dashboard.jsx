import "./Dashboard.scss";
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { getDisplayName } from "../../utils/fileUtils";
import { FiUploadCloud, FiPlus } from "react-icons/fi";
import UploadModal from "../../components/UploadModal/UploadModal";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import ViewToggle from "../../components/ViewToggle/ViewToggle";
import NewFolderForm from "../../components/NewFolderForm/NewFolderForm";
import FileList from "../../components/FileList/FileList";

const getDefaultView = () => {
  const saved = localStorage.getItem("mydrive-view-mode");
  if (saved === "grid" || saved === "list") return saved;
  return window.innerWidth < 768 ? "list" : "grid";
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
  const [viewMode, setViewMode] = useState(getDefaultView);
  const uploadWrapperRef = useRef(null);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleAuthError = () => {
    logout();
    navigate("/login");
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem("mydrive-view-mode", mode);
  };

  const fetchFiles = useCallback(async () => {
    try {
      const params = currentFolderId ? `?parent_id=${currentFolderId}` : "";
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/files${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFiles(response.data);
    } catch (error) {
      if (error.response?.status === 401) handleAuthError();
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBreadcrumbPath(response.data);
    } catch (error) {
      if (error.response?.status === 401) handleAuthError();
    }
  }, [token, currentFolderId]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);
  useEffect(() => { fetchBreadcrumb(); }, [fetchBreadcrumb]);

  useEffect(() => {
    if (!showUploadModal) return;
    const handleClickOutside = (e) => {
      if (uploadWrapperRef.current && !uploadWrapperRef.current.contains(e.target)) {
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
        { headers: { Authorization: `Bearer ${token}` }, responseType: "blob" }
      );
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = displayName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (error.response?.status === 401) handleAuthError();
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/files/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(files.filter((file) => file.id !== id));
    } catch (error) {
      if (error.response?.status === 401) handleAuthError();
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || creatingFolder) return;
    setCreatingFolder(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/files/folders`,
        { name: newFolderName.trim(), parent_id: currentFolderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewFolderName("");
      setShowNewFolder(false);
      fetchFiles();
    } catch (error) {
      if (error.response?.status === 401) handleAuthError();
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRenamingId(null);
      fetchFiles();
      if (currentFolderId) fetchBreadcrumb();
    } catch (error) {
      if (error.response?.status === 401) handleAuthError();
    }
  };

  const folderCount = files.filter((f) => f.type === "folder").length;
  const fileCount = files.filter((f) => f.type === "file").length;
  const subtitleParts = [];
  if (folderCount > 0) subtitleParts.push(`${folderCount} ${folderCount === 1 ? "folder" : "folders"}`);
  if (fileCount > 0) subtitleParts.push(`${fileCount} ${fileCount === 1 ? "file" : "files"}`);
  const subtitle = subtitleParts.length > 0 ? subtitleParts.join(", ") : "No items";

  const renameProps = {
    value: renameValue,
    onChange: setRenameValue,
    onSave: handleRename,
    onCancel: () => setRenamingId(null),
  };

  return (
    <div className="dashboard">
      <div className="dashboard__welcome">
        <div>
          <h1 className="dashboard__title">My Files</h1>
          <p className="dashboard__subtitle">{subtitle}</p>
        </div>
        <div className="dashboard__actions">
          <ViewToggle viewMode={viewMode} onViewChange={toggleViewMode} />
          <button
            className="dashboard__new-folder-btn"
            onClick={() => { setShowNewFolder((prev) => !prev); setNewFolderName(""); }}
          >
            <FiPlus />
            <span className="dashboard__btn-label">New Folder</span>
          </button>
          <div className="dashboard__upload-wrapper" ref={uploadWrapperRef}>
            <button
              className="dashboard__upload-btn"
              onClick={() => setShowUploadModal((prev) => !prev)}
            >
              <FiUploadCloud />
              <span className="dashboard__btn-label">Upload</span>
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
        <Breadcrumbs path={breadcrumbPath} onNavigate={setCurrentFolderId} />
      )}

      {showNewFolder && (
        <NewFolderForm
          name={newFolderName}
          onChange={setNewFolderName}
          onSubmit={handleCreateFolder}
          onCancel={() => { setShowNewFolder(false); setNewFolderName(""); }}
          creating={creatingFolder}
        />
      )}

      <FileList
        files={files}
        viewMode={viewMode}
        renamingId={renamingId}
        renameProps={renameProps}
        onFolderClick={setCurrentFolderId}
        onDownload={handleDownload}
        onStartRename={handleStartRename}
        onDelete={handleDelete}
        onUploadClick={() => setShowUploadModal(true)}
      />
    </div>
  );
};

export default Dashboard;
