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

const getLanguage = (req) => {
  const header = req.headers["accept-language"];

  if (!header) return "id";

  const langs = header.split(",").map((l) => l.split(";")[0]);

  if (langs.some((l) => l.startsWith("en"))) return "en";
  if (langs.some((l) => l.startsWith("id"))) return "id";

  return "id"; // default
};
