import i18n from "../locales/i18n";
import { create } from "zustand";

export const useLanguageStore = create((set) => ({
  // default Indonesian
  language: localStorage.getItem("lang") || "id",

  setLang: (lang) => {
    // console.log("Setting language to: ", lang);
    localStorage.setItem("lang", lang);
    i18n.changeLanguage(lang);
    set({ language: lang });
  },
}));
