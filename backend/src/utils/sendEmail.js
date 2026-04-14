import nodemailer from "nodemailer";

const buildTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== "false",
    },
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = buildTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || "ClubConnect <no-reply@clubconnect.local>",
    to,
    subject,
    html,
  });

  if (info.message) {
    console.log(`Mock email generated for ${to}`);
    console.log(info.message.toString());
  }

  return info;
};
