const { createTransport } = require("nodemailer");
 const { SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USER, SMTP_SERVICE } = require("./config/env.js");

const transporter = createTransport({
  service: SMTP_SERVICE,
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
  requireTLS: true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

const sendEmail = (to, subject, body) => {
  let resp = {};

  transporter.sendMail(
    {
      from: SMTP_USER,
      to: to,
      subject: subject,
      text: body,
    },
    (error) => {
      resp = { error: error };
    }
  );

  return resp;
};

const sendTemplatedEmail = (to, subject, body) => {
  let resp = {};

  transporter.sendMail(
    {
      from: SMTP_USER,
      to: to,
      subject: subject,
      html: body,
    },
    (error) => {
      resp = { error: error };
    }
  );

  return resp;
};

module.exports = {
  sendEmail,
  sendTemplatedEmail,
};
