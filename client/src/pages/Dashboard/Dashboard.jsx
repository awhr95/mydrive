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
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";

const getDefaultView = () => {
  const saved = localStorage.getItem("mydrive-view-mode");
  if (saved === "grid" || saved === "list") return saved;
  return window.innerWidth < 768 ? "list" : "grid";
};

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [flipUp, setFlipUp] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState([]);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [folderError, setFolderError] = useState("");
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [viewMode, setViewMode] = useState(getDefaultView);
  const [deleteTarget, setDeleteTarget] = useState(null);
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
    setLoading(true);
    try {
      const params = currentFolderId ? `?parent_id=${currentFolderId}` : "";
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/files${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFiles(response.data);
    } catch (error) {
      if (error.response?.status === 401) handleAuthError();
    } finally {
      setLoading(false);
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

  const handleDownload = async (diskFilename) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/files/download/${diskFilename}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = response.data.url;
    } catch (error) {
      if (error.response?.status === 401) handleAuthError();
    }
  };

  const handleDeleteClick = (file) => {
    setDeleteTarget(file);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    const originalFiles = files;
    setFiles(files.filter((file) => file.id !== id));
    setDeleteTarget(null);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/files/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      setFiles(originalFiles);
      if (error.response?.status === 401) handleAuthError();
    }
  };

  const handleDeleteCancel = () => {
    setDeleteTarget(null);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || creatingFolder) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticFolder = {
      id: tempId,
      filename: newFolderName.trim(),
      type: "folder",
      parent_id: currentFolderId,
      created_at: new Date().toISOString(),
    };

    setFiles((prev) => [optimisticFolder, ...prev]);
    setNewFolderName("");
    setShowNewFolder(false);
    setFolderError("");
    setCreatingFolder(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/files/folders`,
        { name: optimisticFolder.filename, parent_id: currentFolderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFiles((prev) =>
        prev.map((f) => (f.id === tempId ? { ...f, id: response.data.id } : f))
      );
    } catch (error) {
      setFiles((prev) => prev.filter((f) => f.id !== tempId));
      if (error.response?.status === 401) {
        handleAuthError();
      } else if (error.response?.status === 409) {
        setFolderError("A folder with that name already exists");
        setShowNewFolder(true);
        setNewFolderName(optimisticFolder.filename);
      } else {
        setFolderError("Failed to create folder");
        setShowNewFolder(true);
        setNewFolderName(optimisticFolder.filename);
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
  const subtitle = loading ? "Loading..." : (subtitleParts.length > 0 ? subtitleParts.join(", ") : "No items");

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
            onClick={() => { setShowNewFolder((prev) => !prev); setNewFolderName(""); setFolderError(""); }}
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
          onCancel={() => { setShowNewFolder(false); setNewFolderName(""); setFolderError(""); }}
          creating={creatingFolder}
          error={folderError}
        />
      )}

      <FileList
        files={files}
        viewMode={viewMode}
        loading={loading}
        renamingId={renamingId}
        renameProps={renameProps}
        onFolderClick={setCurrentFolderId}
        onDownload={handleDownload}
        onStartRename={handleStartRename}
        onDelete={handleDeleteClick}
        onUploadClick={() => setShowUploadModal(true)}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title={deleteTarget?.type === "folder" ? "Delete folder?" : "Delete file?"}
        message={
          deleteTarget?.type === "folder"
            ? `"${getDisplayName(deleteTarget)}" and all its contents will be permanently deleted.`
            : `"${deleteTarget ? getDisplayName(deleteTarget) : ""}" will be permanently deleted.`
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        danger
      />
    </div>
  );
};

export default Dashboard;
