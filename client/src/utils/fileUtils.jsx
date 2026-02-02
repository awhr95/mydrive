import {
  FiFile,
  FiImage,
  FiFileText,
  FiMusic,
  FiVideo,
} from "react-icons/fi";

export const getDisplayName = (file) => file.display_name || file.filename;

export const getFileIcon = (filename) => {
  const ext = filename.split(".").pop().toLowerCase();
  const imageExts = ["jpg", "jpeg", "png", "gif", "svg", "webp"];
  const docExts = ["pdf", "doc", "docx", "txt", "md", "csv", "xls", "xlsx"];
  const audioExts = ["mp3", "wav", "ogg", "flac"];
  const videoExts = ["mp4", "mov", "avi", "mkv", "webm"];

  if (imageExts.includes(ext)) return <FiImage />;
  if (docExts.includes(ext)) return <FiFileText />;
  if (audioExts.includes(ext)) return <FiMusic />;
  if (videoExts.includes(ext)) return <FiVideo />;
  return <FiFile />;
};

export const getFileType = (filename) => {
  const ext = filename.split(".").pop();
  return ext ? ext.toUpperCase() : "FILE";
};

export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
