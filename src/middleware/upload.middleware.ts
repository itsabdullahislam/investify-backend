import multer from 'multer';
import path from 'path';


// Set storage location and filename format
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// File filter (optional)
const fileFilter = (req: any, file: any, cb: any) => {
  cb(null, true); // accept all file types for now
};

export const upload = multer({ storage, fileFilter });
