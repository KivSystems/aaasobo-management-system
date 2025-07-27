// Utility function to convert plural role to singular (e.g., "customers" => "customer")
export const convertToSingular = (str: string) => str.replace(/s$/, "");

export const getLocalizedText = (
  text: string,
  language: LanguageType,
): string => {
  const [ja, en] = text.split(" / ");
  if (!ja || !en) return text;

  return language === "ja" ? ja : en;
};
