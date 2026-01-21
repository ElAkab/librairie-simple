import * as esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { minify } from "html-minifier-terser";
import CleanCSS from "clean-css";

const distDir = "./dist";
const pagesDistDir = "./dist/pages";

// 1. Nettoyer et créer le dossier dist
if (fs.existsSync(distDir)) {
	fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir);
fs.mkdirSync(pagesDistDir);

// 2. Bundler chaque point d'entrée séparément
const entryPoints = {
	"bundle-main": "./src/main.js",
	"bundle-authors": "./src/authors.js",
	"bundle-loans": "./src/loans.js",
	"bundle-form": "./src/form.js",
	"bundle-login": "./src/login.js",
	"bundle-signup": "./src/signup.js",
};

// Bundler avec esbuild : Chacun dans un fichier minifié séparé
for (const [name, entry] of Object.entries(entryPoints)) {
	await esbuild.build({
		entryPoints: [entry],
		bundle: true,
		minify: true,
		outfile: `${distDir}/src/${name}.min.js`,
	});
}

// 3. Copier et modifier les fichiers HTML
async function updateHtmlScript(htmlPath, outputPath, scriptName) {
	let html = fs.readFileSync(htmlPath, "utf-8");

	// Remplacer les imports module par le bundle (supporte les 2 ordres d'attributs)
	html = html.replace(
		/<script\s+(?:src="[^"]*"[^>]*type="module"|type="module"[^>]*src="[^"]*")[^>]*><\/script>/g,
		`<script src="${scriptName}"></script>`,
	);

	// Minification HTML
	html = await minify(html, {
		collapseWhitespace: true,
		removeComments: true,
		removeRedundantAttributes: true,
		minifyCSS: true,
		minifyJS: true,
	});

	fs.writeFileSync(outputPath, html);
}

await updateHtmlScript(
	"./index.html",
	`${distDir}/index.html`,
	"./src/bundle-main.min.js",
);
await updateHtmlScript(
	"./pages/authors.html",
	`${pagesDistDir}/authors.html`,
	"../src/bundle-authors.min.js",
);
await updateHtmlScript(
	"./pages/loans.html",
	`${pagesDistDir}/loans.html`,
	"../src/bundle-loans.min.js",
);
await updateHtmlScript(
	"./pages/form.html",
	`${pagesDistDir}/form.html`,
	"../src/bundle-form.min.js",
);
// Pages de login et signup
await updateHtmlScript(
	"./pages/login.html",
	`${pagesDistDir}/login.html`,
	"../src/bundle-login.min.js",
);
await updateHtmlScript(
	"./pages/signup.html",
	`${pagesDistDir}/signup.html`,
	"../src/bundle-signup.min.js",
);

// 4. Minifier et copier les fichiers CSS depuis src/
const cssFiles = [
	"style.css",
	"authors.css",
	"loans.css",
	"form.css",
	"login.css",
	"signup.css",
];

const srcDistDir = `${distDir}/src`;
if (!fs.existsSync(srcDistDir)) {
	fs.mkdirSync(srcDistDir);
}

const cleanCSS = new CleanCSS({ level: 2 });

for (const cssFile of cssFiles) {
	const cssContent = fs.readFileSync(`./src/${cssFile}`, "utf-8");
	const minified = cleanCSS.minify(cssContent);

	if (minified.errors.length > 0) {
		console.error(`❌ Erreur CSS pour ${cssFile}:`, minified.errors);
	}

	fs.writeFileSync(`${srcDistDir}/${cssFile}`, minified.styles);
}

console.log("✅ Build terminé !");
console.log("📦 Fichiers générés dans /dist");
