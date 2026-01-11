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
		const result = await pool.query('SELECT COUNT(*) FROM books');
		const count = parseInt(result.rows[0].count);
		
		if (count === 0) {
			console.log('📚 Base de données vide, exécution du seed...');
			await seed();
		} else {
			console.log(`✅ Base de données déjà peuplée (${count} livres)`);
		}
	} catch (err) {
		console.error('❌ Erreur lors de l\'initialisation de la DB:', err.message);
		// Si les tables n'existent pas encore, exécuter le seed
		if (err.code === '42P01') { // Code PostgreSQL pour "table inexistante"
			console.log('🔧 Tables inexistantes, création et seed...');
			await seed();
		}
	}
}

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

// Routes API
app.use("/api/authors", authorsRouter);
app.use("/api/books", apiBookRouter);
app.use("/api/loans", loansRouter);

// Routes de développement/debug
app.use(devRouter);

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, "../../frontend")));

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
