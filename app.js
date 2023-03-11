import express from "express";
import { config } from "dotenv";
import error from "./middleware/error.js";
import cookieParser from "cookie-parser";
import cors from "cors";
config({ path: "./data/config.env" });

export const app = express();

import userRouter from "./routes/user.js";
import productRouter from "./routes/product.js";
import orderRouter from "./routes/order.js";
app.use(cookieParser());
app.use(express.json());
// app.use(
//   cors({
//     credentials: true,
//     methods: ["GET", "PUT", "POST", "DELETE"],
//     // origin: [process.env.CLIENT_URL_1, process.env.CLIENT_URL_2],
//   })
// );
app.use("/api/v1", userRouter);
app.use("/api/v2", productRouter);
app.use("/api/v3", orderRouter);

app.use(error);
