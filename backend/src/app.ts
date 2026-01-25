// import Author from "./models/author.js";
// import Book from "./models/book.js";
// import User from "./models/user.js";
import pool, { seed } from "./db/connection.js";
import express from "express";
import session from "express-session";
import type { Session } from "express-session";
import connectPgSimple from "connect-pg-simple";
import authorsRouter from "./routes/api/authors.js";
import apiBookRouter from "./routes/api/books.js";
import loansRouter from "./routes/api/loans.js";
import { authRouter } from "./routes/api/auth.js";
import devRouter from "./routes/dev.js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const __dirname = import.meta.dirname;

// Initialiser la base de données avec seed si elle est vide
async function initializeDatabase() {
	try {
		const result = await pool.query("SELECT COUNT(*) FROM books");
		const count = parseInt(result.rows[0].count);

		if (count === 0) {
			console.log("📚 Base de données vide, exécution du seed...");
			await seed();
		} else {
			console.log(`✅ Base de données déjà peuplée (${count} livres)`);

			// Vérifier que la table users existe aussi
			try {
				const userCheck = await pool.query("SELECT COUNT(*) FROM users");
				console.log(
					`✅ Table users OK (${userCheck.rows[0].count} utilisateurs)`,
				);
			} catch (userErr) {
				if ((userErr as any).code === "42P01") {
					console.log("⚠️  Table users manquante, re-seed...");
					await seed();
				} else {
					throw userErr;
				}
			}
		}
	} catch (err) {
		console.error("❌ Erreur complète:", err);
		console.error("Code erreur:", (err as any).code);
		// Si les tables n'existent pas encore, exécuter le seed
		if ((err as any).code === "42P01") {
			// Code PostgreSQL pour "table inexistante"
			console.log("🔧 Tables inexistantes, création et seed...");
			await seed();
		} else {
			throw err;
		}
	}
}

console.log("🔍 DATABASE_URL présente:", !!process.env.DATABASE_URL);
console.log("🔍 NODE_ENV:", process.env.NODE_ENV);

await initializeDatabase();

const app = express();
app.use(express.json());

// Configurer le session store PostgreSQL
const PgSession = connectPgSimple(session);

// Configurer les sessions avec store PostgreSQL
app.use(
	session({
		store: new PgSession({
			pool: pool, // Utiliser le pool PostgreSQL existant
			tableName: "user_sessions", // Nom de la table pour stocker les sessions
			createTableIfMissing: true, // Créer automatiquement la table si elle n'existe pas
		}),
		secret: process.env.SESSION_SECRET || "default_secret_change_in_production",
		resave: false, // Ne pas sauvegarder la session si elle n'a pas été modifiée
		saveUninitialized: false, // Ne pas créer de session tant qu'on n'a rien stocké
		cookie: {
			secure: process.env.NODE_ENV === "production", // HTTPS uniquement en production
			httpOnly: true, // Empêche l'accès via JavaScript (protection XSS)
			maxAge: 1000 * 60 * 60 * 24 * 7, // 7 jours
			sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 'none' pour cross-origin en prod
		},
		name: "sessionId", // Nom du cookie (au lieu du défaut 'connect.sid')
	}),
);

// Configurer CORS pour autoriser les requêtes depuis le frontend
app.use(
	cors({
		origin:
			process.env.NODE_ENV === "production"
				? process.env.FRONTEND_URL
				: ["http://localhost:5173", "http://localhost:8080"],
		credentials: true, // Autoriser l'envoi des cookies si nécessaire
	}),
);

const PORT = process.env.PORT;

// Routes API
app.use("/api/authors", authorsRouter);
app.use("/api/books", apiBookRouter);
app.use("/api/loans", loansRouter);
app.use("/api/auth", authRouter);

// Routes de développement/debug
app.use(devRouter);

// Servir les fichiers statiques du frontend uniquement en développement
if (process.env.NODE_ENV !== "production") {
	app.use(express.static(path.join(__dirname, "../../frontend")));
	console.log("📁 Serving frontend files from /frontend");
}

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
