const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

exports.sendReferralEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Referral Confirmation',
    text: `Hello ${name},\n\nThank you for the referral!`
  };

  return transporter.sendMail(mailOptions);
};
