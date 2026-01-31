import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import FileUpload from "./pages/FileUpload/FileUpload";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <h1>MyDrive</h1>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />
        <Route
          path="/fileupload"
          element={
            <ProtectedRoute>
              <FileUpload />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
