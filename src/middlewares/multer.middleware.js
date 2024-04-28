import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    //TODO : Imrovement can be done in file name as multiple files with same name can be uploaded
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });
