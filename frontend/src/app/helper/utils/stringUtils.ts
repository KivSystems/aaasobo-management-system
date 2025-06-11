// Utility function to convert plural role to singular (e.g., "customers" => "customer")
export const convertToSingular = (str: string) => str.replace(/s$/, "");

export const getLocalizedPrefecture = (
  prefecture: string,
  language: LanguageType,
): string => {
  const [ja, en] = prefecture.split(" / ");
  if (!ja || !en) return prefecture;

  return language === "ja" ? ja : en;
};
