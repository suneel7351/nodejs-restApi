import express from "express";
import User from "../controllers/user.js";
import Authenticated from "../middleware/authenticate.js";
import { singleUpload } from "../middleware/multer.js";
const userRouter = express();

userRouter.post("/register", singleUpload, User.register);
userRouter.post("/login", User.login);
userRouter.get("/profile", Authenticated, User.profile);

userRouter.get("/logout", Authenticated, User.logout);
userRouter.put("/updateProfile", Authenticated, User.updateProfile);
userRouter.put("/updatePassword", Authenticated, User.updatePassword);
userRouter.put(
  "/updatePicture",
  Authenticated,
  singleUpload,
  User.updatePicture
);

userRouter
  .route("/forgetPassword")
  .post(User.forgotPassword)
  .put(User.resetPassword);
export default userRouter;
