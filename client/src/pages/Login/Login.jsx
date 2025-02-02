import "./Login.scss";

const Login = () => {
  return (
    <>
      <h1>Login Page</h1>

      <form className="login__form">
        <label>Email</label>
        <input type="text" />
        <label>Password</label>
        <input type="text" name="" id="" />

        <button type="submit">Login/Sign up</button>
      </form>
    </>
  );
};

export default Login;
