const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // or Mailtrap, etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendEmailOTP = async (to, otp) => {
  return transporter.sendMail({
    from: `"Incident Reporter" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify Your Email - OTP",
    text: `Your verification code is: ${otp}`,
    html: `<h2>Your OTP is: ${otp}</h2><p>It expires in 10 minutes.</p>`,
  });
};
