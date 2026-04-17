import { messages } from "../locales/index.js";

export const i18nMiddleware = (req, res, next) => {
  let lang = "id"; // DEFAULT LANGUAGE

  // If user sends language from frontend
  const clientLang = req.headers["x-lang"];

  if (clientLang && ["en", "id"].includes(clientLang)) {
    lang = clientLang;
  }

  req.lang = lang;

  req.t = (key) => {
    const keys = key.split(".");
    let value = messages[lang];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  };

  next();
};
