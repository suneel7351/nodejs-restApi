import UserModel from "../models/user.js";
import AsyncError from "../utils/asyncError.js";
import ErrorHandler from "../middleware/errorHandler.js";
import sendToken from "../utils/sendToken.js";
import cloudinary from "cloudinary";
import { dataUri } from "../utils/features.js";
import sendMail from "../utils/sendMail.js";
class User {
  // Register
  static register = AsyncError(async (req, res, next) => {
    const { name, email, password, address, city, pinCode, country, otp } =
      req.body;
    if (
      !name ||
      !email ||
      !password ||
      !address ||
      !city ||
      !pinCode ||
      !country
    ) {
      return next(new ErrorHandler(400, "All fields are required."));
    }
    const isExist = await UserModel.findOne({ email });
    if (isExist)
      return next(
        new ErrorHandler(400, "User with this email is already registered.")
      );

    let avatar = undefined;
    if (req.file) {
      const file = await dataUri(req.file);

      const upload = await cloudinary.v2.uploader.upload(file.content);
      avatar = {
        public_id: upload.public_id,
        url: upload.secure_url,
      };
    }

    const user = await UserModel.create({
      name,
      email,
      password,
      address,
      city,
      pinCode,
      country,
      avatar,
    });
    sendToken(user, res, "User Registered Successfully.", 201);
  });

  // Login

  static login = AsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password)
      return next(new ErrorHandler(400, "All fields are required."));
    const user = await UserModel.findOne({ email }).select("+password");

    if (!user)
      return next(new ErrorHandler(400, "Incorrect email or password."));
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return next(new ErrorHandler(400, "Incorrect email or password."));
    sendToken(user, res, `Logged in successfully`, 200);
  });

  static profile = AsyncError(async (req, res, next) => {
    const user = await UserModel.findById(req.user._id);
    res.status(200).json({ success: true, user });
  });

  // <----------------Logout----------------------------->

  static logout = AsyncError(async (req, res, next) => {
    res
      .status(200)
      .cookie("token", "", { expires: new Date(Date.now()) })
      .json({ success: true, message: "Logged out successfully." });
  });

  // <----------------Update Profile----------------------------->

  static updateProfile = AsyncError(async (req, res, next) => {
    const { name, email, address, city, pinCode, country } = req.body;
    const user = await UserModel.findById(req.user._id);
    if (name) user.name = name;
    if (email) user.email = email;
    if (address) user.address = address;
    if (city) user.city = city;
    if (pinCode) user.pinCode = pinCode;
    if (country) user.country = country;

    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Profile Updated Successfully." });
  });

  // <----------------Update Password----------------------------->

  static updatePassword = AsyncError(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return next(
        new ErrorHandler(
          400,
          "Old password and new password both are required."
        )
      );
    const user = await UserModel.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return next(new ErrorHandler(400, "Incorrect old password."));
    user.password = newPassword;
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Password Updated Successfully." });
  });

  // <----------------Update Picture----------------------------->

  static updatePicture = AsyncError(async (req, res, next) => {
    const user = await UserModel.findById(req.user._id);
    const file = dataUri(req.file);
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    const upload = await cloudinary.v2.uploader.upload(file.content);
    user.avatar = {
      public_id: upload.public_id,
      url: upload.secure_url,
    };

    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Picture updated successfully." });
  });

  // <----------------Forgot password----------------------------->

  static forgotPassword = AsyncError(async (req, res, next) => {
    const { email } = req.body;
    if (!email) return next(new ErrorHandler(400, "Email is required."));
    const user = await UserModel.findOne({ email });
    if (!user)
      return next(new ErrorHandler(404, "User not found with this email"));
    const otp = Math.floor(Math.random() * (999999 - 100000) + 100000);
    user.otp = otp;
    user.otp_expire = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();
    try {
      await sendMail(
        `Send Otp for reset Password`,
        `Your otp is ${otp} for reseting the password.`,
        user.email
      );
    } catch (error) {
      user.otp = undefined;
      user.otp_expire = undefined;
      await user.save();
      next(error);
    }
    res.status(200).json({ success: true, message: `Email send to ${email}` });
  });

  // <----------------Reset password----------------------------->

  static resetPassword = AsyncError(async (req, res, next) => {
    const { otp, password } = req.body;
    if (!otp || !password)
      return next(new ErrorHandler(400, "Otp and password both are required."));

    const user = await UserModel.findOne({
      otp,
      otp_expire: {
        $gt: Date.now(),
      },
    });

    if (!user)
      return next(new ErrorHandler(400, "Incorrect otp or has been expired."));
    user.password = password;
    user.otp = undefined;
    user.otp_expire = undefined;
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Password reset successfully." });
  });
}

export default User;
