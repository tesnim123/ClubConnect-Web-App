import { memberAcceptedTemplate, staffWelcomeTemplate } from "../utils/emailTemplates.js";
import { sendEmail } from "../utils/sendEmail.js";

const loginUrl = () => `${process.env.FRONTEND_URL || "http://localhost:5173"}/login`;

export const sendTemporaryCredentialsEmail = async ({ name, email, password, clubName, role }) => {
  const template = staffWelcomeTemplate({
    name,
    email,
    password,
    loginUrl: loginUrl(),
    clubName,
    role,
  });

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
  });
};

export const sendMemberAcceptedEmail = async ({ name, email, clubName }) => {
  const template = memberAcceptedTemplate({
    name,
    clubName,
    loginUrl: loginUrl(),
  });

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
  });
};
