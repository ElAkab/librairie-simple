// import Author from "./models/author.js";
import Book from "./models/book.js";
// import { seedDatabase } from "./db/seeds/seed.js";
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

// TODO: Adapter seedDatabase() pour PostgreSQL (méthodes async)
// if (Book.count() === 0) seedDatabase();

const app = express();
app.use(express.json());

// Afficher les variables d'environnement pour le debug
console.log("NODE_ENV =", process.env.NODE_ENV);
console.log("FRONTEND_URL =", process.env.FRONTEND_URL);

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
	console.log(
		`Server is running on http://${
			process.env.NODE_ENV === "production"
				? process.env.FRONTEND_URL
				: "localhost"
		}:${PORT}`
	);
});
