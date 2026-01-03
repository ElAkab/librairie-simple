# Journal de bord - Apprentissage SQL avec better-sqlite3

## Vue d'ensemble du projet

Mini-projet d'apprentissage SQL utilisant **better-sqlite3** pour gérer une bibliothèque de livres et d'auteurs.

---

## Structure du projet

```
sql/
├── app.db                      # Base de données SQLite
├── package.json                # Configuration npm
└── src/
    ├── app.js                  # Point d'entrée principal
    ├── db/
    │   ├── connection.js       # Connexion DB et création des tables
    │   └── seeds/
    │       └── seed.js         # Données d'exemple
    ├── models/
    │   ├── author.js           # Modèle Author (CRUD)
    │   └── book.js             # Modèle Book (CRUD)
    │   └── loans.js             # Modèle Loans (CRUD)
    └── scripts/
        └── reset-db.js         # Script de réinitialisation
        └── test-updates.js     # Script de mise à jour des tests
```

---

## Concepts SQL implémentés

### 1. Création de tables (`connection.js`)

- Table `authors` avec auto-increment
- Table `books` avec clé étrangère vers `authors`
- Contrainte `UNIQUE(title, author_id)` pour éviter les doublons
- Relation **one-to-many** (un auteur → plusieurs livres -> un emprunt)

### 2. Opérations CRUD

#### Model Author

- `createAuthor()` - INSERT avec prepared statements
- `findAll()` - SELECT \*
- `findById(id)` - SELECT avec WHERE
- `deleteById(id)` - DELETE

#### Model Book

- `createBook()` - INSERT avec prepared statements
- `findAll()` - SELECT avec LEFT JOIN (récupère aussi les données auteur)
- `findById(id)` - SELECT simple
- `deleteById(id)` - DELETE
- `count()` - SELECT COUNT(\*)

### 3. Concepts avancés

- ✅ **Prepared statements** (protection SQL injection)
- ✅ **Foreign keys** (intégrité référentielle)
- ✅ **JOIN** (LEFT JOIN dans `Book.findAll()`)
- ✅ **AUTO INCREMENT** et récupération avec `lastInsertRowid`

---

## Scripts disponibles

```json
"dev": "node --watch src/app.js"    // Mode développement avec rechargement auto
"seed": "node src/scripts/reset-db.js"   // Réinitialiser la DB
"reset": "node src/scripts/reset-db.js"  // Alias de seed
```

---

## Fonctionnalités du code

### `src/db/connection.js`

- Initialisation de la connexion SQLite
- Création automatique des schémas au démarrage
- Export de l'instance `db` pour réutilisation

### `src/db/seeds/seed.js`

- Fonction `seedDatabase()` pour peupler avec des données test
- Auteurs : Tolkien, Rowling, Hugo
- Livres : The Hobbit, Harry Potter, Les Misérables, etc.

### `src/scripts/reset-db.js`

- Vide complètement les tables
- Réinitialise les compteurs auto-increment via `sqlite_sequence`
- Affiche l'état vide de la DB (actuellement commenté le re-seed)

### `src/app.js`

- Point d'entrée principal
- Appelle `seedDatabase()` au démarrage
- Affiche les tables avec `console.table()`
- Contient du code commenté d'une ancienne version

---

## Points d'apprentissage

### Réussites ✅

1. Séparation propre des responsabilités (models, db, scripts)
2. Utilisation correcte des prepared statements
3. Gestion des relations entre tables
4. Implémentation pattern DAO/Repository
5. Scripts utilitaires pour gérer la DB

### À améliorer 🔧

- Code commenté dans `app.js` à nettoyer
- Pas de gestion d'erreurs (try/catch)
- Pas de validation des données d'entrée
- Manque de méthodes UPDATE dans les models
- Pas de gestion des transactions

---

## Prochaines étapes suggérées

1. **Compléter les opérations CRUD** : Ajouter UPDATE
2. **Gestion d'erreurs** : try/catch, validation des données
3. **Transactions** : Apprendre `db.transaction()`
4. **Requêtes complexes** : GROUP BY, HAVING, sous-requêtes
5. **Relations many-to-many** : Ajouter une table de liaison (ex: genres)
6. **Indexes** : Optimisation des requêtes
7. **Migration system** : Gérer les changements de schéma

---

## Notes techniques

- **better-sqlite3** : Bibliothèque synchrone (pas de callbacks/promises)
- **ES Modules** : `"type": "module"` dans package.json
- **Watch mode** : Rechargement auto avec `--watch` (Node.js natif)
- **SQLite** : Base de données fichier unique (app.db)

---

_Journal créé le 31/12/2025_
