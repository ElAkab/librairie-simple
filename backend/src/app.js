// import Author from "./models/author.js";
import Book from "./models/book.js";
import pool, { seed } from "./db/connection.js";
import express from "express";
import authorsRouter from "./routes/api/authors.js";
import apiBookRouter from "./routes/api/books.js";
import loansRouter from "./routes/api/loans.js";
import devRouter from "./routes/dev.js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
		}
	} catch (err) {
		console.error("❌ Erreur complète:", err);
		console.error("Code erreur:", err.code);
		// Si les tables n'existent pas encore, exécuter le seed
		if (err.code === "42P01") {
			// Code PostgreSQL pour "table inexistante"
			console.log("🔧 Tables inexistantes, création et seed...");
			await seed();
		}
	}
}

console.log("🔍 DATABASE_URL présente:", !!process.env.DATABASE_URL);
console.log("🔍 NODE_ENV:", process.env.NODE_ENV);

await initializeDatabase();

const app = express();
app.use(express.json());

// Configurer CORS pour autoriser les requêtes depuis le frontend
app.use(
	cors({
		origin:
			process.env.NODE_ENV === "production"
				? process.env.FRONTEND_URL
				: "http://localhost:5173",
		credentials: true, // Autoriser l'envoi des cookies si nécessaire
	})
);

const PORT = process.env.PORT || 3000;

// Health check endpoint pour Railway et monitoring
app.get("/health", async (req, res) => {
	try {
		// Vérifier la connexion à la base de données
		await pool.query("SELECT 1");
		res.status(200).json({
			status: "healthy",
			timestamp: new Date().toISOString(),
			database: "connected",
			environment: process.env.NODE_ENV || "development",
		});
	} catch (error) {
		res.status(503).json({
			status: "unhealthy",
			timestamp: new Date().toISOString(),
			database: "disconnected",
			error: error.message,
		});
	}
});

// Routes API
app.use("/api/authors", authorsRouter);
app.use("/api/books", apiBookRouter);
app.use("/api/loans", loansRouter);

// Routes de développement/debug
app.use(devRouter);

// Servir les fichiers statiques du frontend
// app.use(express.static(path.join(__dirname, "../../frontend")));

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
