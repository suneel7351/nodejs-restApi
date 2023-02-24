import User from "../models/user.js";
import ErrorHandler from "./errorHandler.js";
import jwt from "jsonwebtoken";
import AsyncError from "../utils/asyncError.js";
const Authenticated = AsyncError(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) return next(new ErrorHandler(401, "Unauthorized,Please Login"));
  const user = await User.findById(
    jwt.verify(token, process.env.JWT_SECRET)._id
  );
  req.user = user._id;
  next();
});

export default Authenticated;
