import "./ViewToggle.scss";
import { FiGrid, FiList } from "react-icons/fi";

const ViewToggle = ({ viewMode, onViewChange }) => (
  <div className="dashboard__view-toggle">
    <button
      className={`dashboard__view-toggle-btn${viewMode === "list" ? " dashboard__view-toggle-btn--active" : ""}`}
      onClick={() => onViewChange("list")}
      title="List view"
    >
      <FiList />
    </button>
    <button
      className={`dashboard__view-toggle-btn${viewMode === "grid" ? " dashboard__view-toggle-btn--active" : ""}`}
      onClick={() => onViewChange("grid")}
      title="Grid view"
    >
      <FiGrid />
    </button>
  </div>
);

export default ViewToggle;
