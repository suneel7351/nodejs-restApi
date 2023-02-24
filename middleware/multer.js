import multer from "multer";
const storage = multer.memoryStorage();
export const singleUpload = multer({ storage }).single("file");
export const multiUpload = multer({ storage }).array("file");
