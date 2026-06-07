import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req, file, cb) => {
    /*
        What req.file Looks Like After Multer
        req.file = {
                        fieldname: 'image',           // form field name
                        originalname: 'pasta.jpg',    // original filename
                        mimetype: 'image/jpeg',       // content type
                        size: 204800,                 // bytes
                        buffer: <Buffer ff d8 ff ...> // actual binary data (memoryStorage)
                    }
        */
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG and WebP images allowed"));
    }
  },
});

export default upload;
