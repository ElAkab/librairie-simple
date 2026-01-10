# Migration vers PostgreSQL

## ✅ Restructuration terminée

### Architecture actuelle

```
backend/
├── archives/              # Ancienne version SQLite
│   ├── db/sqlite/        # Connection et schéma SQLite
│   ├── models/sqlite/    # Models SQLite (synchrones)
│   └── app.db            # Base de données SQLite
│
├── src/
│   ├── db/
│   │   ├── connection.js     # Connection PostgreSQL (pool)
│   │   └── seeds/            # TODO: À adapter pour async
│   ├── models/
│   │   ├── author.js         # Model PostgreSQL (async) - À COMPLÉTER
│   │   ├── book.js           # Model PostgreSQL (async) - À COMPLÉTER
│   │   └── loan.js           # Model PostgreSQL (async) - À COMPLÉTER
│   ├── routes/api/           # Routes API - À ADAPTER pour async
│   └── app.js                # Point d'entrée principal
```

## 🚧 Ce qu'il vous reste à faire

### 1. Configuration PostgreSQL locale

Dans [`.env`](.env), configurez vos identifiants PostgreSQL :
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe
DB_DATABASE=library_db
```

### 2. Créer la base de données PostgreSQL

```bash
# Installer PostgreSQL si ce n'est pas fait
sudo apt install postgresql postgresql-contrib  # Linux
# ou brew install postgresql                    # macOS

# Créer la base de données
createdb library_db

# Ou via psql
psql -U postgres
CREATE DATABASE library_db;
```

### 3. Implémenter les méthodes des models

Les models dans [`src/models/`](src/models/) sont des squelettes. Vous devez implémenter :

- `findById(id)` - Récupérer par ID
- `create(...)` - Créer une entrée
- `update(id, ...)` - Mettre à jour
- `delete(id)` - Supprimer

**Important** : Toutes les méthodes doivent être **async** et utiliser `await pool.query()`.

### 4. Adapter les routes API

Les routes dans [`src/routes/api/`](src/routes/api/) doivent être mises à jour :

```javascript
// Avant (SQLite - synchrone)
const books = Book.findAll();

// Après (PostgreSQL - asynchrone)
const books = await Book.findAll();
```

**Attention** : Ajoutez `async` sur toutes les fonctions de route.

### 5. Adapter le seeding

Le fichier [`src/db/seeds/seed.js`](src/db/seeds/seed.js) doit être converti en async.

## 📚 Différences clés SQLite ↔ PostgreSQL

| Aspect | SQLite (archives) | PostgreSQL (actuel) |
|--------|-------------------|---------------------|
| **Syntaxe** | Synchrone (`db.prepare().run()`) | Asynchrone (`await pool.query()`) |
| **Auto-increment** | `AUTOINCREMENT` | `SERIAL` |
| **Retour valeur** | `lastInsertRowid` | `RETURNING id` |
| **Transactions** | `db.transaction()` | `BEGIN/COMMIT` |
| **Types** | `TEXT`, `INTEGER` | `VARCHAR`, `INTEGER`, `DATE` |

## 🧪 Pour tester

```bash
npm run dev  # Lance le serveur (créera les tables)
```

Les tables seront créées automatiquement au démarrage grâce à [`connection.js`](src/db/connection.js).

---

**Note** : L'ancienne version SQLite est dans [`archives/`](archives/) si vous avez besoin de référence.
