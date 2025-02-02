import "./Login.scss";
import axios from "axios";

const Login = () => {
  //   const handleSubmit = async (event) =>{
  //     event.preventDefault();

  //     try {
  //       const response = await axios.post(
  //         'http://localhost:5173/'
  //       )
  //     }

  // return repson;
  //   }
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
