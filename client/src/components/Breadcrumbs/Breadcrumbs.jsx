import "./Breadcrumbs.scss";
import { FiChevronRight } from "react-icons/fi";

const Breadcrumbs = ({ path, onNavigate }) => (
  <div className="dashboard__breadcrumb">
    <button
      className="dashboard__breadcrumb-item"
      onClick={() => onNavigate(null)}
    >
      Home
    </button>
    {path.map((crumb) => (
      <span key={crumb.id} className="dashboard__breadcrumb-segment">
        <FiChevronRight className="dashboard__breadcrumb-sep" />
        <button
          className="dashboard__breadcrumb-item"
          onClick={() => onNavigate(crumb.id)}
        >
          {crumb.name}
        </button>
      </span>
    ))}
  </div>
);

export default Breadcrumbs;
