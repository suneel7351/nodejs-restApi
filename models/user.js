import mongoose from "mongoose";
import validator from "validator";
import brcypt from "bcrypt";
import jwt from "jsonwebtoken";

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please enter name"],
  },
  email: {
    type: String,
    required: [true, "please enter email"],
    unique: true,
    validate: validator.isEmail,
  },
  password: {
    type: String,
    required: [true, "please enter password"],
    select: false,
    minLength: [6, "password must be atleast 6 character long"],
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  pinCode: {
    type: Number,
    required: true,
  },
  avatar: {
    public_id: String,
    url: String,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  otp: Number,
  otp_expire: Date,
});

schema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await brcypt.hash(this.password, 10);
  }
  next();
});

schema.methods.comparePassword = async function (password) {
  return await brcypt.compare(password, this.password);
};

schema.methods.generateJWTToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};
const User = mongoose.model("User", schema);
export default User;
