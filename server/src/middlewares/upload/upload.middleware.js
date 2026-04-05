import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    "./uploads/resumes",
    "./uploads/videos",
    "./uploads/portfolio",
    "./uploads/company-images", // Added company images directory here
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Initialize directories immediately
createUploadDirs();

// --- STORAGE CONFIGURATIONS ---

// 1. Resumes
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/resumes");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${req.user.id}_${Date.now()}`;
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(
      file.originalname.replaceAll(" ", ""),
      ext,
    );
    cb(null, `${nameWithoutExt}_${uniqueSuffix}${ext}`);
  },
});

// 2. Videos
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/videos");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${req.user.id}_${Date.now()}`;
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(
      file.originalname.replaceAll(" ", ""),
      ext,
    );
    cb(null, `${nameWithoutExt}_${uniqueSuffix}${ext}`);
  },
});

// 3. Portfolio Files
const portfolioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/portfolio");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${req.user.id}_${Date.now()}`;
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(
      file.originalname.replaceAll(" ", ""),
      ext,
    );
    cb(null, `${nameWithoutExt}_${uniqueSuffix}${ext}`);
  },
});

// 4. Company Images (Logos/Banners)
const companyImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Directory is now guaranteed to exist by createUploadDirs()
    cb(null, "./uploads/company-images");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${req.user.id}_${Date.now()}`;
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(
      file.originalname.replaceAll(" ", ""),
      ext,
    );
    cb(null, `${nameWithoutExt}_${uniqueSuffix}${ext}`);
  },
});

// --- FILE FILTERS ---

const resumeFileFilter = (req, file, cb) => {
  const allowedMimes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only PDF, DOC, and DOCX are allowed."),
      false,
    );
  }
};

const videoFileFilter = (req, file, cb) => {
  const allowedMimes = [
    "video/mp4",
    "video/x-msvideo",
    "video/quicktime",
    "video/webm",
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only MP4, AVI, MOV, and WebM are allowed."),
      false,
    );
  }
};

const portfolioFileFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "video/mp4",
    "video/webm",
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only images, PDFs, and videos are allowed.",
      ),
      false,
    );
  }
};

const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPG, PNG, GIF, and WEBP allowed."),
      false,
    );
  }
};

// --- MULTER INSTANCES (EXPORTS) ---

export const uploadResume = multer({
  storage: resumeStorage,
  fileFilter: resumeFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single("resume");

export const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
}).single("video");

export const uploadPortfolio = multer({
  storage: portfolioStorage,
  fileFilter: portfolioFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).single("portfolioFile");

export const uploadCompanyImage = multer({
  storage: companyImageStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single("image");

// --- UTILITIES ---

// Error handling middleware
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Please upload a smaller file.",
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};

// Delete file utility
export const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err && err.code !== "ENOENT") {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
