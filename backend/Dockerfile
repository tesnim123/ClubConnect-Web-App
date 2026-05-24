# Étape 1 : Construction et installation des dépendances
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copie uniquement package.json et package-lock.json pour utiliser le cache Docker
COPY package*.json ./

# Installation complète (incluant les devDependencies si nécessaire à ce stade)
RUN npm ci

# Copie du reste du code source
COPY . .

# Étape 2 : Image finale de production sécurisée et allégée
FROM node:20-alpine AS production

# Définir l'environnement de production
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Copie des fichiers package initiaux
COPY package*.json ./

# Installation uniquement des dépendances de production
RUN npm ci --omit=dev && npm cache clean --force

# Copie du code depuis l'image builder
# On suppose que le point d'entrée est dans /usr/src/app (votre src/)
COPY --from=builder /usr/src/app/src ./src

# Création/Utilisation de l'utilisateur non-root "node" existant dans l'image alpine
RUN chown -R node:node /usr/src/app

# Basculer vers l'utilisateur non-root pour des raisons de sécurité
USER node

# Le port d'écoute (Railway injecte la variable $PORT par défaut, on met 5000 ici)
EXPOSE 5000

# Commande de démarrage
CMD ["node", "src/server.js"]
