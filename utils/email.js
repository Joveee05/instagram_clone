const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'no-reply@insta.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: '<h1> Welcome to Instagram </h1>',
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
