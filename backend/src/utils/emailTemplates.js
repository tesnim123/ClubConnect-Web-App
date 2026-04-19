export const staffWelcomeTemplate = ({ name, email, password, loginUrl, clubName, role }) => ({
  subject: `Votre acces ${role} - ${clubName}`,
  html: `
    <h2>Bienvenue sur ClubConnect</h2>
    <p>Bonjour ${name},</p>
    <p>Vous avez ete ajoute au club <strong>${clubName}</strong> en tant que <strong>${role}</strong>.</p>
    <p>Email: ${email}</p>
    <p>Mot de passe temporaire: ${password}</p>
    <p>Connexion: <a href="${loginUrl}">${loginUrl}</a></p>
    <p>Changez votre mot de passe apres votre premiere connexion.</p>
  `,
});

export const memberAcceptedTemplate = ({ name, clubName, loginUrl }) => ({
  subject: `Inscription acceptee - ${clubName}`,
  html: `
    <h2>Inscription acceptee</h2>
    <p>Bonjour ${name},</p>
    <p>Votre demande d'adhesion au club <strong>${clubName}</strong> a ete acceptee.</p>
    <p>Vous pouvez vous connecter ici: <a href="${loginUrl}">${loginUrl}</a></p>
  `,
});
