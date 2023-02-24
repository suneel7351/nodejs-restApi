import { app } from "./app.js";
const PORT = process.env.PORT || 4999;
import dbConnection from "./data/dbConnect.js";
import cloudinary from "cloudinary";
import Stripe from "stripe";
dbConnection();

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT} in ${process.env.NODE_ENV}`);
});
