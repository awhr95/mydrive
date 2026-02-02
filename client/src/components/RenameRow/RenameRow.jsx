import "./RenameRow.scss";
import { FiCheck, FiX } from "react-icons/fi";

const RenameRow = ({ fileId, value, onChange, onSave, onCancel, stopProp }) => (
  <span
    className="dashboard__rename-row"
    onClick={stopProp ? (e) => e.stopPropagation() : undefined}
  >
    <input
      className="dashboard__rename-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSave(fileId);
        if (e.key === "Escape") onCancel();
      }}
      autoFocus
    />
    <button
      className="dashboard__rename-save"
      onClick={() => onSave(fileId)}
      title="Save"
    >
      <FiCheck />
    </button>
    <button
      className="dashboard__rename-cancel"
      onClick={() => onCancel()}
      title="Cancel"
    >
      <FiX />
    </button>
  </span>
);

export default RenameRow;
