# Étape 1 : Image de base Node (switch to Debian for glibc compatibility)
FROM node:20-slim

# Étape 2 : Dossier de travail
WORKDIR /app

# Étape 3 : Copier les fichiers nécessaires
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.* ./
COPY netlify.toml ./

# Étape 4 : Installer dépendances système (adjusted for Debian)
RUN apt-get update && apt-get install -y curl bash netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Étape 5 : Installer Netlify CLI et dépendances projet
RUN npm install -g netlify-cli && npm install

# Étape 6 : Copier le reste du code
COPY . .

# Étape 7 : Désactiver Edge Functions (Deno) - keep these, but they may not fully skip setup if functions are present
ENV NETLIFY_EXPERIMENTAL_DISABLE_EDGE_FUNCTIONS=true
ENV NETLIFY_EXPERIMENTAL_DISABLE_DENO=true

# Étape 8 : Exposer le port utilisé par Netlify dev
EXPOSE 8888

# Étape 9 : Commande par défaut
CMD ["sh", "-c", "npx prisma generate && npx prisma db push && netlify dev --offline"]