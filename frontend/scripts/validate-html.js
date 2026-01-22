import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log("🔍 Validation des fichiers HTML...\n");

try {
	const indexPath = join(__dirname, "../dist/index.html");
	const content = readFileSync(indexPath, "utf-8");

	// Vérifications basiques
	if (
		!content.includes("<!DOCTYPE html>") &&
		!content.includes("<!doctype html>")
	) {
		throw new Error("DOCTYPE manquant");
	}

	if (!content.includes("./js/bundle-main.min.js")) {
		throw new Error("main.js non chargé");
	}

	if (!content.includes('type="module"')) {
		throw new Error("Scripts doivent être de type module");
	}

	console.log("✅ Structure HTML valide");
	console.log("✅ Fichiers JavaScript chargés");
	console.log("\n✨ Validation réussie !");
	process.exit(0);
} catch (error) {
	console.error("❌ Erreur:", error.message);
	process.exit(1);
}
