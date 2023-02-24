import UserModel from "../models/user.js";
import AsyncError from "../utils/asyncError.js";
import ErrorHandler from "../middleware/errorHandler.js";
const isAdmin = AsyncError(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id);

  if (user.role !== "admin")
    return next(new ErrorHandler(400, "Only Admin can access this resources."));
  next();
});
export default isAdmin;
