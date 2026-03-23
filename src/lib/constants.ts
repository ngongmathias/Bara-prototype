/** Shared constants for dropdowns across admin pages */

export const COUNTRIES = [
  "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cameroon", "Central African Republic", "Chad", "Comoros",
  "Congo (DRC)", "Congo (Republic)", "Côte d'Ivoire", "Djibouti", "Egypt",
  "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia",
  "Ghana", "Guinea", "Guinea-Bissau", "Kenya", "Lesotho", "Liberia", "Libya",
  "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco",
  "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", "São Tomé and Príncipe",
  "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa", "South Sudan",
  "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe",
  // Diaspora countries
  "United Kingdom", "United States", "Canada", "France", "Germany", "Belgium",
  "Netherlands", "Italy", "Spain", "Portugal", "Brazil", "Jamaica",
  "Trinidad and Tobago", "Haiti", "Australia", "India", "China", "Japan",
  "United Arab Emirates", "Saudi Arabia", "Other",
] as const;

export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "fr", name: "French" },
  { code: "sw", name: "Swahili" },
  { code: "ar", name: "Arabic" },
  { code: "pt", name: "Portuguese" },
  { code: "es", name: "Spanish" },
  { code: "rw", name: "Kinyarwanda" },
  { code: "am", name: "Amharic" },
  { code: "ha", name: "Hausa" },
  { code: "yo", name: "Yoruba" },
  { code: "ig", name: "Igbo" },
  { code: "zu", name: "Zulu" },
  { code: "af", name: "Afrikaans" },
  { code: "so", name: "Somali" },
  { code: "ti", name: "Tigrinya" },
  { code: "wo", name: "Wolof" },
  { code: "ln", name: "Lingala" },
  { code: "mg", name: "Malagasy" },
  { code: "rn", name: "Kirundi" },
  { code: "sn", name: "Shona" },
  { code: "xh", name: "Xhosa" },
] as const;
