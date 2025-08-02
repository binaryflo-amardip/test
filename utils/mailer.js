const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: process.env.SERVICE,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const mailer = async (customerEmail, emailSubject, emailText) => {
  const mailOptions = {
    from: process.env.MYMAIL,
    to: customerEmail,
    subject: emailSubject,
    text: emailText,
  };

  await transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

const mailerHtml = async (customerEmail, emailSubject, emailHtml) => {
  const mailOptions = {
    from: process.env.MYMAIL,
    to: customerEmail,
    subject: emailSubject,
    html: emailHtml,
  };

  await transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = {
  mailer,
  mailerHtml,
};
