export const toTitleCase = (str) => {
  if (typeof str !== "string") return "";
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};
