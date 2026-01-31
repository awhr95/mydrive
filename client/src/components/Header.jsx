import "./Header.scss";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiCloud, FiLogOut } from "react-icons/fi";

const Header = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__brand">
          <FiCloud className="header__icon" />
          <span className="header__title">MyDrive</span>
        </div>
        <button className="header__logout" onClick={handleLogout}>
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
