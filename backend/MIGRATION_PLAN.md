# Plan de Migration Backend : JavaScript vers TypeScript

## Objectif

Refactoriser le backend existant (Express + PostgreSQL) pour utiliser TypeScript. L'objectif principal est de sécuriser les interactions avec la base de données et d'éliminer les erreurs d'exécution courantes (ex: accès à des propriétés inexistantes).

## Phase 1 : Environnement & Configuration (Fondations)

Cette étape prépare le terrain sans toucher au code métier.

1.  **Installation des dépendances de développement**
    - Installer TypeScript et le moteur d'exécution : `typescript`, `ts-node` (ou `tsx`).
    - Installer les définitions de types (@types) : `@types/node`, `@types/express`, `@types/pg`, `@types/bcryptjs`, `@types/express-session`, `@types/cors`, `@types/validator`.
2.  **Harmonisation de la configuration Modules**
    - _Audit_ : Ton `package.json` est en `"type": "module"` (ESM) mais `tsconfig.json` est en `"module": "commonjs"`.
    - _Action_ : Ajuster `tsconfig.json` pour utiliser `"module": "NodeNext"` (recommandé pour Node moderne) pour s'aligner sur le `package.json`.
3.  **Scripts de lancement**
    - Créer un script `dev:ts` pour lancer le projet sans compilation manuelle.

## Phase 2 : Typage de la Donnée (Le Cœur)

C'est ici que nous sécurisons tes données PostgreSQL.

1.  **Création du dictionnaire de types (`src/types/database.ts`)**
    - Analyser le fichier `src/db/schema.sql`.
    - Créer une interface TypeScript pour chaque table :
      - `User` (id, username, password_hash, role, is_active...)
      - `Author`
      - `Book`
      - `Loan`
    - _Bénéfice_ : TypeScript criera si tu essaies de faire `user.name` au lieu de `user.username`.

## Phase 3 : Migration Fichier par Fichier (Exécution)

Nous convertirons les fichiers dans l'ordre de dépendance (du plus bas niveau vers le plus haut).

1.  **Niveau 1 : Infrastructure (`src/db/`)**
    - Renommer `connection.js` -> `connection.ts`.
    - Typer la connexion `Pool` de `pg`.
    - Gérer les variables d'environnement avec types (process.env...).
2.  **Niveau 2 : Modèles (`src/models/`)**
    - Renommer et typer les modèles (ex: `User.js` -> `User.ts`).
    - Utiliser les interfaces de la Phase 2 dans les requêtes SQL.
    - Exemple : `pool.query<User>('SELECT...')` garantira que le retour est bien un `User`.
3.  **Niveau 3 : Contrôleurs (`src/controllers/`)**
    - Renommer et typer (ex: `login.js` -> `login.ts`).
    - Typer explicitement `req` (`Request`) et `res` (`Response`) d'Express.
    - **Défi Session** : Étendre l'interface `SessionData` pour que `req.session.user` soit reconnu et typé correctement.
4.  **Niveau 4 : Point d'entrée (`src/app.js` -> `src/app.ts`)**
    - Convertir le fichier principal.
    - Corriger les imports (ajout d'extensions .js ou configuration TS adaptée).

## Phase 4 : Validation

1.  **Type Checking** : Lancer `tsc --noEmit` pour vérifier qu'il ne reste aucune erreur cachée.
2.  **Test Runtime** : Lancer le serveur et tester le flux de connexion et une requête API pour s'assurer que tout fonctionne comme avant (mais en plus solide).
