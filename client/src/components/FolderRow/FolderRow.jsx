import "./FolderRow.scss";
import { FiFolder, FiEdit2, FiTrash2 } from "react-icons/fi";
import { formatDate } from "../../utils/fileUtils";
import RenameRow from "../RenameRow/RenameRow";

const FolderRow = ({ folder, isRenaming, isClicked, renameProps, onClick, onStartRename, onDelete }) => (
  <div
    className={`dashboard__table-row dashboard__table-row--folder${isClicked ? " dashboard__table-row--clicked" : ""}`}
    onClick={() => onClick(folder.id)}
  >
    <span className="dashboard__col-icon dashboard__file-icon">
      <FiFolder />
    </span>
    <span className="dashboard__col-name dashboard__file-name">
      {isRenaming ? (
        <RenameRow fileId={folder.id} {...renameProps} stopProp />
      ) : (
        folder.filename
      )}
    </span>
    <span className="dashboard__col-type">
      <span className="dashboard__type-badge">FOLDER</span>
    </span>
    <span className="dashboard__col-size">&mdash;</span>
    <span className="dashboard__col-date">{formatDate(folder.created_at)}</span>
    <span className="dashboard__col-actions">
      <button
        className="dashboard__action-btn dashboard__action-btn--rename"
        onClick={(e) => {
          e.stopPropagation();
          onStartRename(folder);
        }}
        title="Rename"
      >
        <FiEdit2 />
      </button>
      <button
        className="dashboard__action-btn dashboard__action-btn--delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(folder);
        }}
        title="Delete"
      >
        <FiTrash2 />
      </button>
    </span>
  </div>
);

export default FolderRow;
