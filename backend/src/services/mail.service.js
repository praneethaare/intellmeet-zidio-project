import  transporter from "../utils/email.js";
import credentials from "../config/config.js";

const sendVerificationEmail = async (email, otp) => {
  const mailOptions = {
    from: credentials.email_user,
    to: email,
    subject: "Email Verification",
    text: `Your OTP for email verification is: ${otp}`,
  };
  await transporter.sendMail(mailOptions);
}


export default sendVerificationEmail;