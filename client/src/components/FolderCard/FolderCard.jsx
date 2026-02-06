import "./FolderCard.scss";
import { FiFolder, FiEdit2, FiTrash2 } from "react-icons/fi";
import { formatDate } from "../../utils/fileUtils";
import RenameRow from "../RenameRow/RenameRow";

const FolderCard = ({ folder, isRenaming, renameProps, onClick, onStartRename, onDelete }) => (
  <div
    className="dashboard__card dashboard__card--folder"
    onClick={() => onClick(folder.id)}
  >
    <div className="dashboard__card-icon">
      <FiFolder />
    </div>
    <div className="dashboard__card-body">
      <div className="dashboard__card-name">
        {isRenaming ? (
          <RenameRow fileId={folder.id} {...renameProps} stopProp />
        ) : (
          folder.filename
        )}
      </div>
      <div className="dashboard__card-date">
        {formatDate(folder.created_at)}
      </div>
    </div>
    <div className="dashboard__card-actions">
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
    </div>
  </div>
);

export default FolderCard;
