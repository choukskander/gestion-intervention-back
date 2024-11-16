require('dotenv').config();

module.exports = {
  EMAILJS_PUB_KEY: process.env.EMAILJS_PUB_KEY,
  EMAILJS_PRIV_KEY: process.env.EMAILJS_PRIV_KEY,
  EMAIL_JS_TEMPLATE_ID: process.env.EMAIL_JS_TEMPLATE_ID,
  EMAIL_JS_SERVICE_ID: process.env.EMAIL_JS_SERVICE_ID,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_SERVICE: process.env.SMTP_SERVICE,
};
