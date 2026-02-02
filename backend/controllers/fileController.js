const db = require("../db");
const multer = require("multer");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucket = process.env.S3_BUCKET_NAME;

const maxFileSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 50;
const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxFileSizeBytes },
});

const handleUpload = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(413)
        .json({ error: `File too large. Maximum size is ${maxFileSizeMB}MB.` });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

const uploadFile = async (req, res) => {
  const { originalname, buffer, mimetype } = req.file;
  const userId = req.user.id;
  const parentId = req.body.parent_id || null;
  const filename = `${Date.now()}-${originalname}`;
  const s3Key = `uploads/${userId}/${filename}`;

  try {
    if (parentId) {
      const parent = await db("files")
        .where({ id: parentId, type: "folder", user_id: userId })
        .first();
      if (!parent) {
        return res.status(400).send("Invalid parent folder");
      }
    }

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: s3Key,
        Body: buffer,
        ContentType: mimetype,
      })
    );

    await db("files").insert({
      filename,
      display_name: originalname,
      user_id: userId,
      type: "file",
      parent_id: parentId,
    });

    res.status(200).send("File uploaded successfully");
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).send("Error uploading file");
  }
};

const downloadFile = async (req, res) => {
  const { filename } = req.params;
  const userId = req.user.id;

  try {
    const file = await db("files").where({ filename, user_id: userId }).first();
    if (!file) {
      return res.status(404).send("File not found");
    }

    const displayName = file.display_name || file.filename;
    const s3Key = `uploads/${userId}/${file.filename}`;
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(displayName)}"`,
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 300 });

    res.status(200).json({ url, filename: displayName });
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).send("Error downloading file");
  }
};

const getFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const { parent_id } = req.query;

    let query = db("files")
      .select("id", "filename", "display_name", "type", "parent_id", "created_at")
      .where({ user_id: userId });

    if (!parent_id || parent_id === "null") {
      query = query.whereNull("parent_id");
    } else {
      query = query.where({ parent_id: parseInt(parent_id, 10) });
    }

    const files = await query
      .orderByRaw("CASE WHEN type = 'folder' THEN 0 ELSE 1 END")
      .orderBy("created_at", "desc");

    res.status(200).json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).send("Error fetching files");
  }
};

const createFolder = async (req, res) => {
  const userId = req.user.id;
  const { name, parent_id } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).send("Folder name is required");
  }

  try {
    if (parent_id) {
      const parent = await db("files")
        .where({ id: parent_id, type: "folder", user_id: userId })
        .first();
      if (!parent) {
        return res.status(400).send("Invalid parent folder");
      }
    }

    const existingQuery = db("files").where({
      filename: name.trim(),
      type: "folder",
      user_id: userId,
    });
    if (parent_id) {
      existingQuery.where({ parent_id });
    } else {
      existingQuery.whereNull("parent_id");
    }
    const existing = await existingQuery.first();

    if (existing) {
      return res.status(409).send("A folder with that name already exists");
    }

    const [id] = await db("files").insert({
      filename: name.trim(),
      type: "folder",
      user_id: userId,
      parent_id: parent_id || null,
    });

    res.status(201).json({
      id,
      filename: name.trim(),
      type: "folder",
      parent_id: parent_id || null,
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).send("Error creating folder");
  }
};

const getFolderPath = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const breadcrumb = [];
    let currentId = parseInt(id, 10);

    while (currentId) {
      const folder = await db("files")
        .where({ id: currentId, user_id: userId })
        .first();
      if (!folder) break;
      breadcrumb.unshift({ id: folder.id, name: folder.filename });
      currentId = folder.parent_id;
    }

    res.status(200).json(breadcrumb);
  } catch (error) {
    console.error("Error fetching folder path:", error);
    res.status(500).send("Error fetching folder path");
  }
};

const renameFile = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).send("Name is required");
  }

  try {
    const file = await db("files").where({ id, user_id: userId }).first();
    if (!file) {
      return res.status(404).send("File not found");
    }

    if (file.type === "folder") {
      const dupQuery = db("files")
        .where({
          filename: name.trim(),
          type: "folder",
          user_id: userId,
        })
        .whereNot({ id });

      if (file.parent_id) {
        dupQuery.where({ parent_id: file.parent_id });
      } else {
        dupQuery.whereNull("parent_id");
      }

      const dup = await dupQuery.first();
      if (dup) {
        return res.status(409).send("A folder with that name already exists");
      }

      await db("files")
        .where({ id, user_id: userId })
        .update({ filename: name.trim() });
    } else {
      await db("files")
        .where({ id, user_id: userId })
        .update({ display_name: name.trim() });
    }

    res.status(200).json({ id: file.id, name: name.trim() });
  } catch (error) {
    console.error("Error renaming file:", error);
    res.status(500).send("Error renaming file");
  }
};

const collectChildS3Keys = async (folderId, userId) => {
  const keys = [];
  const children = await db("files").where({
    parent_id: folderId,
    user_id: userId,
  });

  for (const child of children) {
    if (child.type === "folder") {
      const childKeys = await collectChildS3Keys(child.id, userId);
      keys.push(...childKeys);
    } else {
      keys.push(`uploads/${userId}/${child.filename}`);
    }
  }
  return keys;
};

const deleteFile = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const file = await db("files").where({ id, user_id: userId }).first();
    if (!file) {
      return res.status(404).send("File not found");
    }

    if (file.type === "folder") {
      const keys = await collectChildS3Keys(file.id, userId);
      if (keys.length > 0) {
        await s3
          .send(
            new DeleteObjectsCommand({
              Bucket: bucket,
              Delete: { Objects: keys.map((Key) => ({ Key })) },
            })
          )
          .catch((err) =>
            console.error("Error deleting child files from S3:", err)
          );
      }
    } else {
      const s3Key = `uploads/${userId}/${file.filename}`;
      await s3
        .send(new DeleteObjectCommand({ Bucket: bucket, Key: s3Key }))
        .catch((err) => console.error("Error deleting file from S3:", err));
    }

    await db("files").where({ id, user_id: userId }).del();
    res.status(200).send("File deleted successfully");
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).send("Error deleting file");
  }
};

module.exports = {
  uploadFile,
  downloadFile,
  getFiles,
  deleteFile,
  createFolder,
  getFolderPath,
  renameFile,
  handleUpload,
};
