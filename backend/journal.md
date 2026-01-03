# Journal de bord - Apprentissage SQL avec better-sqlite3

## Vue d'ensemble du projet

Mini-projet d'apprentissage SQL utilisant **better-sqlite3** pour gérer une bibliothèque de livres et d'auteurs.

---

## Procédure

1. `connexion.js` : Configuration des tables `authors`, `books` et `loans`.
2. models - `author.js`, `book.js` et `loan.js` - : Fonctions pour gérer des opérations CRUD sur les _auteurs, livres_ et _emprunts_.
3. `seed.js` : Script de peuplement initial de la base de données.
4. `app.js` : Point d'entrée backend principal.

---

## Fonctionnements back-end

- **commands/query.js** : Contient des fonctions de requête suppémentaires.
- **API RESTful** : Routes pour gérer les ressources `authors`, `books` et `loans`.
