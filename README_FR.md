# Projet de Gestion - SitInfra

Application web de gestion complète développée avec React, TypeScript, Vite, Prisma et Netlify Functions.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé les outils suivants sur votre machine :

- **Node.js** (version 18 ou supérieure) - [Télécharger Node.js](https://nodejs.org/)
- **npm** ou **yarn** (généralement inclus avec Node.js)
- **MySQL** (version 8.0 ou supérieure) - [Télécharger MySQL](https://www.mysql.com/downloads/)
  - Vous devez avoir un serveur MySQL en cours d'exécution
  - Vous devez avoir créé une base de données MySQL vide
- **Git** (pour cloner le projet) - [Télécharger Git](https://git-scm.com/)

### Vérification des prérequis

Vous pouvez vérifier que Node.js et npm sont installés en exécutant dans votre terminal :

```bash
node --version
npm --version
```

## 🚀 Installation et Setup

### 1. Cloner le projet (si nécessaire)

```bash
git clone <url-du-repo>
cd netlify_v1
```

### 2. Installer les dépendances

```bash
npm install
```

Cette commande installe toutes les dépendances nécessaires listées dans `package.json`, notamment :
- React et React DOM
- TypeScript
- Vite
- Prisma Client
- Netlify Functions
- Et d'autres dépendances...

### 3. Configuration de la base de données

#### Créer un fichier `.env`

Créez un fichier `.env` à la racine du projet (au même niveau que `package.json`).

#### Configuration de la variable DATABASE_URL

La variable `DATABASE_URL` est utilisée par Prisma pour se connecter à votre base de données MySQL. Elle suit un format spécifique :

```
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
```

##### Explication des composants de l'URL :

- **`mysql://`** : Le protocole de connexion (toujours `mysql://` pour MySQL)
- **`USER`** : Le nom d'utilisateur MySQL qui a les droits sur la base de données
  - Exemple : `root`, `admin`, `mon_utilisateur`
- **`PASSWORD`** : Le mot de passe de l'utilisateur MySQL
  - ⚠️ **Important** : Si votre mot de passe contient des caractères spéciaux (comme `@`, `#`, `:`, `/`), vous devez les encoder en URL (URL encoding). Par exemple, `@` devient `%40`, `#` devient `%23`
- **`HOST`** : L'adresse du serveur MySQL
  - Pour une base locale : `localhost` ou `127.0.0.1`
  - Pour une base distante : l'IP ou le nom de domaine (ex: `db.example.com`)
- **`PORT`** : Le port sur lequel MySQL écoute (par défaut `3306` pour MySQL)
- **`DATABASE`** : Le nom de la base de données que vous avez créée

##### Exemples de DATABASE_URL :

**Exemple 1 - Base de données locale avec utilisateur root :**
```env
DATABASE_URL="mysql://root:monMotDePasse123@localhost:3306/sitinfra_db"
```

**Exemple 2 - Base de données locale avec mot de passe contenant des caractères spéciaux :**
Si votre mot de passe est `P@ssw0rd#123`, vous devez encoder les caractères spéciaux :
```env
DATABASE_URL="mysql://root:P%40ssw0rd%23123@localhost:3306/sitinfra_db"
```

**Exemple 3 - Base de données distante :**
```env
DATABASE_URL="mysql://admin:securepass@192.168.1.100:3306/production_db"
```

**Exemple 4 - Base de données hébergée (ex: PlanetScale, Railway, etc.) :**
```env
DATABASE_URL="mysql://user:password@hostname.provider.com:3306/database_name"
```

##### Table de référence pour l'encodage URL des caractères spéciaux :

| Caractère | Encodage URL |
|-----------|--------------|
| `@` | `%40` |
| `#` | `%23` |
| `:` | `%3A` |
| `/` | `%2F` |
| `%` | `%25` |
| `&` | `%26` |
| `+` | `%2B` |
| ` ` (espace) | `%20` |

#### Exemple de fichier `.env` complet

Créez un fichier `.env` à la racine du projet avec le contenu suivant (adaptez les valeurs selon votre configuration) :

```env
# Configuration de la base de données MySQL
DATABASE_URL="mysql://root:votre_mot_de_passe@localhost:3306/nom_de_votre_base"

```

### 4. Initialisation de la base de données avec Prisma

```

#### Générer le client Prisma

Après avoir configuré la base de données, générez le client Prisma :

```bash
npx prisma generate
```

Cette commande génère le client Prisma basé sur votre schéma (`prisma/schema.prisma`).

#### Syncroniser la BD avec les model Prisma

Après avoir configuré la base de données et  générez le client Prisma, il faut pousser Appliquer le schema prisma a la BD  :

```bash
npx prisma db push
```

## 🏃 Lancer le projet

### Mode développement

Pour lancer le projet en mode développement avec rechargement automatique :

```bash
netlify dev 
```





## 📚 Documentation supplémentaire

- [Prisma Documentation](https://www.prisma.io/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)

## 🏗️ Structure du projet

- `/src` - Code source de l'application React
- `/netlify/functions` - Fonctions serverless Netlify (backend API)
- `/prisma` - Schéma et migrations Prisma
- `/public` - Fichiers statiques (images, etc.)
- `netlify.toml` - Configuration Netlify
- `package.json` - Dépendances et scripts npm



