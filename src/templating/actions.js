const fetch = require("node-fetch");
const TEMPLATES_BASE_REPO =
  "https://github.com/vernig/plugin-twilio-infra/raw/";
const TEMPLATES_BRANCH = "templates";
const TEMPLATES_BASE_PATH = "templates";

function getTemplateFile(templateName) {
  return fetch(
    `${TEMPLATES_BASE_REPO}/${TEMPLATES_BRANCH}/${TEMPLATES_BASE_PATH}/${templateName}/index.js`
  )
    .then((res) => {
      if (res.ok) {
        return res.text();
      } else {
        return Promise.reject(res.status);
      }
    })
    .then((body) => Promise.resolve(body));
}

module.exports = {
  getTemplateFile,
};
