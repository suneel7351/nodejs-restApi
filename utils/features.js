import DataUriParser from "datauri/parser.js";
import path from "path";
export const dataUri = (file) => {
  const extName = path.extname(file.originalname);
  const parser = new DataUriParser();
  return parser.format(extName, file.buffer);
};
