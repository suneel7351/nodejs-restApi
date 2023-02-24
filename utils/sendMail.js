import { createTransport } from "nodemailer";
import AsyncError from "./asyncError.js";

const sendMail = AsyncError(async (subject, text, to) => {
  const transporter = createTransport({
    host: process.env.MAIL_HOST,
    port: 2525,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    text,
    subject,
    to,
    from: process.env.MAIL_USER,
  });
});

export default sendMail;
