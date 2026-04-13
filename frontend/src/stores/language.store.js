import { create } from "zustand";

export const useLanguageStore = create((set) => ({
  // default Indonesian
  lang: localStorage.getItem("lang") || "id",

  setLang: (lang) => {
    localStorage.setItem("lang", lang);
    set({ lang });
  },
}));
