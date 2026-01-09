# Instructions Copilot - Projet SQL Library

## Architecture

Application full-stack de gestion de bibliothèque :
- **Backend** : Express.js avec better-sqlite3 (SQLite synchrone)
- **Frontend** : HTML/CSS/JS vanilla (pas de framework)
- **Base de données** : SQLite avec 3 tables liées : `authors`, `books`, `loans`

Structure : [backend/src/app.js](backend/src/app.js) initialise Express et auto-seed la DB si vide via `Book.count() === 0`.

## Patterns Critiques

### Models (Classe avec méthodes statiques)
Tous les models utilisent **exclusivement des méthodes statiques** (pas d'instances) :
```javascript
class Book {
    static createBook(title, authorId, year) {
        const stmt = db.prepare(`INSERT INTO books...`).run(...);
        return stmt.lastInsertRowid;
    }
}
```
Voir [backend/src/models/book.js](backend/src/models/book.js), [author.js](backend/src/models/author.js), [loan.js](backend/src/models/loan.js).

### Requêtes SQL
- **Prepared statements** : Utiliser `db.prepare(sql).run()/.get()/.all()` (better-sqlite3 API)
- **Requêtes custom** : Utiliser `customQuery(sql)` de [backend/src/commands/query.js](backend/src/commands/query.js) pour du SQL brut
- **Synchronisation** : `Loan.createLoan()` appelle automatiquement `Book.updateAvailability()` pour maintenir cohérence

### Routes API
- Structure : `/api/{resource}` dans [backend/src/routes/api/](backend/src/routes/api/)
- Pattern : Utiliser try/catch avec status codes (400 validation, 404 not found, 500 erreur serveur)
- SQL injection : **Attention** - Voir [books.js:39](backend/src/routes/api/books.js#L39) utilise interpolation directe `${id}` (vulnérable)

## Workflows Essentiels

### Développement
```bash
cd backend
npm run dev          # Lance serveur avec --watch (auto-reload)
npm run seed         # Reset + re-seed la DB
npm run reset        # Vide la DB sans re-seed
```

Le serveur sert automatiquement le frontend depuis [backend/src/app.js:33](backend/src/app.js#L33) via `express.static`.

### Base de Données
- **Fichier** : `backend/app.db` (créé automatiquement)
- **Schéma** : Défini dans [backend/src/db/connection.js](backend/src/db/connection.js) avec contraintes (FOREIGN KEY CASCADE, UNIQUE, CHECK)
- **Reset** : Exécuter [backend/src/scripts/reset-db.js](backend/src/scripts/reset-db.js) pour vider sans re-seed

## Conventions Spécifiques

- **ES Modules** : Backend utilise `"type": "module"` - toujours `import/export`
- **Frontend** : CommonJS (`"type": "commonjs"`) avec scripts inline dans HTML
- **Logs** : `console.table()` utilisé partout pour affichage des résultats
- **Nommage** : 
  - Colonnes DB : snake_case (`author_id`, `birth_year`)
  - Variables JS : camelCase (`authorId`, `birthYear`)
- **Validation** : Vérifier champs requis côté route, contraintes DB dans schema

## Points d'Attention

- **SQL Injection** : Route `/available/:id` vulnerable - corriger en utilisant prepared statements
- **Seeding automatique** : La DB se seed au démarrage si vide - désactiver cette ligne si nécessaire
- **Disponibilité** : `Book.updateAvailability()` doit être appelée manuellement lors de modifications de loans
