import "./FileList.scss";
import { FiFolder, FiLoader } from "react-icons/fi";
import FileRow from "../FileRow/FileRow";
import FolderRow from "../FolderRow/FolderRow";
import FileCard from "../FileCard/FileCard";
import FolderCard from "../FolderCard/FolderCard";

const FileList = ({
  files,
  viewMode,
  loading,
  renamingId,
  renameProps,
  onFolderClick,
  onDownload,
  onStartRename,
  onDelete,
  onUploadClick,
}) => {
  if (loading) {
    return (
      <div className="dashboard__loading">
        <FiLoader className="dashboard__loading-spinner" />
        <p className="dashboard__loading-text">Loading files...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="dashboard__empty">
        <FiFolder className="dashboard__empty-icon" />
        <p className="dashboard__empty-text">No files uploaded yet</p>
        <button className="dashboard__empty-link" onClick={onUploadClick}>
          Upload your first file
        </button>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
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
            <FolderRow
              key={file.id}
              folder={file}
              isRenaming={renamingId === file.id}
              renameProps={renameProps}
              onClick={onFolderClick}
              onStartRename={onStartRename}
              onDelete={onDelete}
            />
          ) : (
            <FileRow
              key={file.id}
              file={file}
              isRenaming={renamingId === file.id}
              renameProps={renameProps}
              onDownload={onDownload}
              onStartRename={onStartRename}
              onDelete={onDelete}
            />
          )
        )}
      </div>
    );
  }

  return (
    <div className="dashboard__grid">
      {files.map((file) =>
        file.type === "folder" ? (
          <FolderCard
            key={file.id}
            folder={file}
            isRenaming={renamingId === file.id}
            renameProps={renameProps}
            onClick={onFolderClick}
            onStartRename={onStartRename}
            onDelete={onDelete}
          />
        ) : (
          <FileCard
            key={file.id}
            file={file}
            isRenaming={renamingId === file.id}
            renameProps={renameProps}
            onDownload={onDownload}
            onStartRename={onStartRename}
            onDelete={onDelete}
          />
        )
      )}
    </div>
  );
};

export default FileList;
