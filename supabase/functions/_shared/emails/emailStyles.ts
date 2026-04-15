// Shared email styles for all Bara Afrika transactional emails.
// Keep style updates here so every template stays visually consistent.

export const baseUrl = "https://baraafrika.com";

export const main = {
    backgroundColor: "#ffffff",
    fontFamily: '"Comfortaa", "Helvetica Neue", Helvetica, Arial, sans-serif',
};

export const container = {
    margin: "0 auto",
    padding: "20px 0 48px",
    maxWidth: "560px",
};

export const logo = {
    margin: "0 auto",
    marginBottom: "24px",
};

export const h1 = {
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center" as const,
    margin: "30px 0",
    padding: "0",
    color: "#1a1a1a",
};

export const text = {
    fontSize: "16px",
    lineHeight: "26px",
    color: "#333",
    marginBottom: "20px",
};

export const btnContainer = {
    textAlign: "center" as const,
    marginTop: "32px",
    marginBottom: "32px",
};

export const button = {
    backgroundColor: "#000000",
    borderRadius: "100px",
    color: "#FFD700",
    fontSize: "16px",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    padding: "12px 24px",
    fontWeight: "bold",
};

export const footer = {
    color: "#8898aa",
    fontSize: "12px",
    marginBottom: "24px",
    textAlign: "center" as const,
};

export const footerLink = { color: "#8898aa" };
