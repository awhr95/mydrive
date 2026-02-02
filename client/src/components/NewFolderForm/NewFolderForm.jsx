import "./NewFolderForm.scss";
import { FiFolder } from "react-icons/fi";

const NewFolderForm = ({ name, onChange, onSubmit, onCancel, creating }) => (
  <div className="dashboard__new-folder-form">
    <FiFolder style={{ fontSize: 18, color: "#f59e0b", flexShrink: 0 }} />
    <input
      className="dashboard__new-folder-input"
      type="text"
      placeholder="Folder name"
      value={name}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSubmit();
        if (e.key === "Escape") onCancel();
      }}
      autoFocus
    />
    <button
      className="dashboard__new-folder-submit"
      onClick={onSubmit}
      disabled={creating}
    >
      {creating ? "Creating..." : "Create"}
    </button>
    <button className="dashboard__new-folder-cancel" onClick={onCancel}>
      Cancel
    </button>
  </div>
);

export default NewFolderForm;
