import nodemailer from "nodemailer";
import credentials from "../config/config.js";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: credentials.email_user,
    pass: credentials.passkey,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
export default transporter;