import "./Login.scss";
import axios from "axios";

const Login = () => {
  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = event.target.email.value;
    const password = event.target.password.value;

    if (!email || !password) {
      console.log("Email and password are required.");
      return;
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/login`,
        {
          email,
          password,
        }
      );
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <h1>Login Page</h1>

      <form className="login__form" onSubmit={handleSubmit}>
        <label>Email</label>
        <input type="text" name="email" />
        <label>Password</label>
        <input type="password" name="password" id="" />

        <button type="submit">Login/Sign up</button>
      </form>
    </>
  );
};

export default Login;
