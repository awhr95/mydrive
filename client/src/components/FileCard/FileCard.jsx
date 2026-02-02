import "./FileCard.scss";
import { FiDownload, FiEdit2, FiTrash2 } from "react-icons/fi";
import { getDisplayName, getFileIcon, getFileType, formatDate } from "../../utils/fileUtils";
import RenameRow from "../RenameRow/RenameRow";

const FileCard = ({ file, isRenaming, renameProps, onDownload, onStartRename, onDelete }) => {
  const name = getDisplayName(file);

  return (
    <div className="dashboard__card">
      <div className="dashboard__card-icon">{getFileIcon(name)}</div>
      <div className="dashboard__card-body">
        <div className="dashboard__card-name">
          {isRenaming ? (
            <RenameRow fileId={file.id} {...renameProps} />
          ) : (
            name
          )}
        </div>
        <div className="dashboard__card-meta">
          <span className="dashboard__type-badge">{getFileType(name)}</span>
          <span className="dashboard__card-date">
            {formatDate(file.created_at)}
          </span>
        </div>
      </div>
      <div className="dashboard__card-actions">
        <button
          className="dashboard__action-btn dashboard__action-btn--download"
          onClick={() => onDownload(file.filename, name)}
          title="Download"
        >
          <FiDownload />
        </button>
        <button
          className="dashboard__action-btn dashboard__action-btn--rename"
          onClick={() => onStartRename(file)}
          title="Rename"
        >
          <FiEdit2 />
        </button>
        <button
          className="dashboard__action-btn dashboard__action-btn--delete"
          onClick={() => onDelete(file.id)}
          title="Delete"
        >
          <FiTrash2 />
        </button>
      </div>
    </div>
  );
};

export default FileCard;
