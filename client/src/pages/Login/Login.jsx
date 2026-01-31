import "./Login.scss";
import axios from "axios";
import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [error, setError] = useState("");
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
      navigate("/fileupload");
    } catch (error) {
      const message =
        error.response?.data?.error || "Something went wrong. Try again.";
      setError(message);
    }
  };

  return (
    <>
      <h1>{isRegister ? "Register" : "Login"}</h1>

      <form className="login__form" onSubmit={handleSubmit}>
        <label>Email</label>
        <input type="text" name="email" />
        <label>Password</label>
        <input type="password" name="password" />

        <button type="submit">{isRegister ? "Register" : "Login"}</button>
      </form>

      {error && <p className="login__error">{error}</p>}

      <p>
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
    </>
  );
};

export default Login;
