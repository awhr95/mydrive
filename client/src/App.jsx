import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import FileUpload from "./pages/FileUpload/FileUpload";

function App() {
  return (
    <>
      <h1>MyDrive</h1>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/fileupload" element={<FileUpload />} />
      </Routes>
    </>
  );
}

export default App;
