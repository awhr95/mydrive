import "./Breadcrumbs.scss";
import { FiChevronRight } from "react-icons/fi";

const Breadcrumbs = ({ path, onNavigate }) => {
  const isRoot = path.length === 0;

  return (
    <div className="dashboard__breadcrumb">
      {isRoot ? (
        <span className="dashboard__breadcrumb-item dashboard__breadcrumb-item--current">
          Home
        </span>
      ) : (
        <button
          className="dashboard__breadcrumb-item"
          onClick={() => onNavigate(null)}
        >
          Home
        </button>
      )}
      {path.map((crumb, index) => (
        <span key={crumb.id} className="dashboard__breadcrumb-segment">
          <FiChevronRight className="dashboard__breadcrumb-sep" />
          {index === path.length - 1 ? (
            <span className="dashboard__breadcrumb-item dashboard__breadcrumb-item--current">
              {crumb.name}
            </span>
          ) : (
            <button
              className="dashboard__breadcrumb-item"
              onClick={() => onNavigate(crumb.id)}
            >
              {crumb.name}
            </button>
          )}
        </span>
      ))}
    </div>
  );
};

export default Breadcrumbs;
