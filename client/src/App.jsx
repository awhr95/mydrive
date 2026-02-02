import "./App.scss";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import FileUpload from "./pages/FileUpload/FileUpload";
import Dashboard from "./pages/Dashboard/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/fileupload"
        element={
          <ProtectedRoute>
            <Layout>
              <FileUpload />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
