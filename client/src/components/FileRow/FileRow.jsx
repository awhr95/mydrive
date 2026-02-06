import "./FileRow.scss";
import { FiDownload, FiEdit2, FiTrash2 } from "react-icons/fi";
import { getDisplayName, getFileIcon, getFileType, formatDate } from "../../utils/fileUtils";
import RenameRow from "../RenameRow/RenameRow";

const FileRow = ({ file, isRenaming, renameProps, onDownload, onStartRename, onDelete }) => {
  const name = getDisplayName(file);

  return (
    <div className="dashboard__table-row">
      <span className="dashboard__col-icon dashboard__file-icon">
        {getFileIcon(name)}
      </span>
      <span className="dashboard__col-name dashboard__file-name">
        {isRenaming ? (
          <RenameRow fileId={file.id} {...renameProps} />
        ) : (
          name
        )}
      </span>
      <span className="dashboard__col-type">
        <span className="dashboard__type-badge">{getFileType(name)}</span>
      </span>
      <span className="dashboard__col-size">&mdash;</span>
      <span className="dashboard__col-date">{formatDate(file.created_at)}</span>
      <span className="dashboard__col-actions">
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
          onClick={() => onDelete(file)}
          title="Delete"
        >
          <FiTrash2 />
        </button>
      </span>
    </div>
  );
};

export default FileRow;
