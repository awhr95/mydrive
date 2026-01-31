import "./FileUpload.scss";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      setIsError(true);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/files/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("File uploaded successfully.");
      setIsError(false);
      setFile(null);
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }
      setMessage("Upload failed. Please try again.");
      setIsError(true);
    }
  };

  return (
    <div className="file-upload">
      <h1>File Upload</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {message && (
        <p className={isError ? "file-upload__error" : "file-upload__success"}>
          {message}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
