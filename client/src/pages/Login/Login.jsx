import "./Login.scss";
import axios from "axios";
import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

const Login = () => {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isRegister = location.pathname === "/register";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const email = event.target.email.value;
    const password = event.target.password.value;

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    const endpoint = isRegister ? "register" : "login";

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/${endpoint}`,
        { email, password }
      );
      login(response.data.token);
      navigate("/");
    } catch (error) {
      const message =
        error.response?.data?.error || "Something went wrong. Try again.";
      setError(message);
    }
  };

  return (
    <div className="login">
      <div className="login__card">
        <h1 className="login__heading">
          {isRegister ? "Create Account" : "Welcome Back"}
        </h1>
        <p className="login__subheading">
          {isRegister
            ? "Sign up to start using MyDrive"
            : "Sign in to your MyDrive account"}
        </p>

        <form className="login__form" onSubmit={handleSubmit}>
          <label className="login__label">
            <FiMail className="login__label-icon" />
            Email
          </label>
          <input
            className="login__input"
            type="text"
            name="email"
            placeholder="you@example.com"
          />

          <label className="login__label">
            <FiLock className="login__label-icon" />
            Password
          </label>
          <div className="login__password-wrapper">
            <input
              className="login__input"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="login__password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <button className="login__submit" type="submit">
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        {error && <p className="login__error">{error}</p>}

        <p className="login__toggle">
          {isRegister ? (
            <>
              Already have an account? <Link to="/login">Login</Link>
            </>
          ) : (
            <>
              Don&apos;t have an account? <Link to="/register">Register</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Login;
