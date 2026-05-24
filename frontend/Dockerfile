# Étape 1 : Build de l'application React/Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Optimisation du cache Docker via package.json
COPY package*.json ./

# Installation propre des dépendances
RUN npm ci

# Copie du code source
COPY . .

# On déclare l'ARG pour que Railway puisse injecter la variable pendant le build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build de l'application pour la production (Vite génère habituellement un dossier `dist`)
RUN npm run build

# Étape 2 : Serveur NGINX pour la production
FROM nginx:alpine AS production

# Suppression des assets par défaut de NGINX
RUN rm -rf /usr/share/nginx/html/*

# Copie de notre configuration NGINX personnalisée pour la SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie des fichiers statiques générés depuis le stage "builder"
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposition du port NGINX
EXPOSE 80

# Lancer NGINX
CMD ["nginx", "-g", "daemon off;"]
