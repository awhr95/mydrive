import "./Header.scss";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiCloud, FiLogOut, FiUser, FiLock, FiChevronDown } from "react-icons/fi";

const Header = () => {
  const { email, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initial = email ? email.charAt(0).toUpperCase() : "?";

  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__brand">
          <FiCloud className="header__icon" />
          <span className="header__title">MyDrive</span>
        </div>
        <div className="header__profile" ref={dropdownRef}>
          <button
            className="header__profile-btn"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <span className="header__avatar">{initial}</span>
            <FiChevronDown className="header__chevron" />
          </button>
          {dropdownOpen && (
            <div className="header__dropdown">
              <button className="header__dropdown-item header__dropdown-item--disabled" disabled>
                <FiUser />
                <span>Profile</span>
              </button>
              <button className="header__dropdown-item header__dropdown-item--disabled" disabled>
                <FiLock />
                <span>Change Password</span>
              </button>
              <div className="header__dropdown-divider" />
              <button className="header__dropdown-item" onClick={handleLogout}>
                <FiLogOut />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
