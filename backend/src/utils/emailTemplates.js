export const staffWelcomeTemplate = ({ name, email, password, loginUrl, clubName, role }) => ({
  subject: `Votre accès ${role} - ${clubName}`,
  html: `
    <h2>Bienvenue sur ClubConnect</h2>
    <p>Bonjour ${name},</p>
    <p>Vous avez été ajouté au club <strong>${clubName}</strong> en tant que <strong>${role}</strong>.</p>
    <p>Email: ${email}</p>
    <p>Mot de passe temporaire: ${password}</p>
    <p>Connexion: <a href="${loginUrl}">${loginUrl}</a></p>
    <p>Changez votre mot de passe après votre première connexion.</p>
  `,
});

export const memberAcceptedTemplate = ({ name, clubName, loginUrl }) => ({
  subject: `Inscription acceptée - ${clubName}`,
  html: `
    <h2>Inscription acceptée</h2>
    <p>Bonjour ${name},</p>
    <p>Votre demande d'adhésion au club <strong>${clubName}</strong> a été acceptée.</p>
    <p>Vous pouvez vous connecter ici: <a href="${loginUrl}">${loginUrl}</a></p>
  `,
});
