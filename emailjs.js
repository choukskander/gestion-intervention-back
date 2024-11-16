const ejs = require("ejs");
const emailjs = require("@emailjs/nodejs");
const { EMAILJS_PUB_KEY, EMAILJS_PRIV_KEY, EMAIL_JS_TEMPLATE_ID, EMAIL_JS_SERVICE_ID } = require("./config/env.js");
const createPath = require("./pather.js");

/**
 * @param {String} to - Destinataire
 * @param {String} subject - Sujet de l'email
 * @param {any} data - Données pour le template
 * @param {String} template - Nom du template dans le dossier public
 * @returns {Object} - Objet de réponse contenant une erreur si quelque chose s'est mal passé
 */
async function sendEmailFromEmailJS(to, subject, data, template) {
  let resp = { error: null };
  const path = createPath(template);
  const content = await ejs.renderFile(path, { data }, { async: true });

  if (!content) return { error: "Erreur de lecture du template !" };

  try {
    await emailjs.send(
      EMAIL_JS_SERVICE_ID,
      EMAIL_JS_TEMPLATE_ID,
      {
        subject: subject,
        content: content,
        user_email: to,
      },
      {
        publicKey: EMAILJS_PUB_KEY,
        privateKey: EMAILJS_PRIV_KEY, // facultatif, fortement recommandé pour des raisons de sécurité
      }
    );
  } catch (err) {
    resp.error = err;
  }
  return resp;
}

module.exports = sendEmailFromEmailJS;
