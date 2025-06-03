const nodemailer = require("nodemailer");
const AppError = require("../AppError");
//used mail trap
async function sendEmail(options) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.SMTP_USERNAME,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };
    // send mail with defined transport object
    const info = await transporter.sendMail(mailOptions);
  } catch (err) {
    return new (AppError("Cant send mail", 401))();
  }
}
module.exports = sendEmail;
