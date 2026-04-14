import crypto from "crypto";

export const generateRandomPassword = (length = 12) => {
  const raw = crypto.randomBytes(length).toString("base64");
  return `${raw.slice(0, 8)}Aa1!`;
};
