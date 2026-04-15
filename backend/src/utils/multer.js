const multer = require("multer");
const path = require("path");
const AppError = require("./AppError");

const storage = multer.memoryStorage();

function createFileFilter(allowedMimeTypes, allowedExtensions) {
  return function (req, res, cb) {
    const mimetype = allowedMimeTypes.includes(file.mimetype);
    const extension = allowedExtensions.includes(
      path.extname(file.originalname).toLowerCase(),
    );

    if (!mimetype) {
      return cb(new AppError("Invalid file type. Upload failed.", 400));
    }

    if (!extension) {
      return cb(new AppError("Invalid file extension. Upload failed.", 400));
    }

    cb(null, true);
  };
}

const imageFilter = createFileFilter(
  ["image/jpeg", "image/png", "image/webp"],
  [".jpg", ".jpeg", ".png", ".webp"],
);

const documentFilter = createFileFilter(["application/pdf"], [".pdf"]);

const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter,
});

const uploadCover = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: documentFilter,
});

const uploadResume = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: documentFilter,
});

module.exports = { uploadAvatar, uploadCover, uploadResume };
