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
const jsDistDir = `${distDir}/js`;
if (!fs.existsSync(jsDistDir)) {
	fs.mkdirSync(jsDistDir);
}

// 2. Bundler chaque point d'entrée séparément
const entryPoints = {
	"bundle-main": "./src/js/main.js",
	"bundle-authors": "./src/js/authors.js",
	"bundle-loans": "./src/js/loans.js",
	"bundle-form": "./src/js/form.js",
	"bundle-login": "./src/js/login.js",
	"bundle-signup": "./src/js/signup.js",
};

// Bundler avec esbuild : Chacun dans un fichier minifié séparé
for (const [name, entry] of Object.entries(entryPoints)) {
	await esbuild.build({
		entryPoints: [entry],
		bundle: true,
		minify: true,
		outfile: `${jsDistDir}/${name}.min.js`,
		format: "esm",
	});
}

// 3. Copier et modifier les fichiers HTML
async function updateHtmlScript(htmlPath, outputPath, scriptName) {
	       let html = fs.readFileSync(htmlPath, "utf-8");

			 // Remplacer les chemins JS dev par les bundles minifiés
			 html = html.replace(
				 /<script\s+[^>]*src=["'][.]{1,2}\/src\/js\/([a-zA-Z0-9_-]+)\.js"[^>]*type="module"[^>]*><\/script>/g,
				 (match, name) => {
					 let bundleName = name
						 .replace("main", "bundle-main.min")
						 .replace("authors", "bundle-authors.min")
						 .replace("loans", "bundle-loans.min")
						 .replace("form", "bundle-form.min")
						 .replace("login", "bundle-login.min")
						 .replace("signup", "bundle-signup.min");
					 let prefix = outputPath.includes("/pages/") ? "../js/" : "./js/";
					 return `<script src="${prefix}${bundleName}.js" type="module"></script>`;
				 },
			 );

	       // Remplacer les chemins CSS dev par les minifiés
	       html = html.replace(
		       /<link rel="stylesheet" href="([.]{1,2}\/)src\/css\/([a-zA-Z0-9_-]+)\.css"\s*\/>/g,
		       (match, prefix, name) => {
			       let cssPrefix = outputPath.includes("/pages/") ? "../css/" : "./css/";
			       return `<link rel="stylesheet" href="${cssPrefix}${name}.css" />`;
		       },
	       );

	       // Injecter style.css en premier (pour les styles communs)
	       let cssPrefix = outputPath.includes("/pages/") ? "../css/" : "./css/";
	       if (!html.includes(`${cssPrefix}style.css`)) {
		       html = html.replace(
			       /(<head[^>]*>)/i,
			       `$1\n<link rel="stylesheet" href="${cssPrefix}style.css" />`
		       );
	       }

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
	"./js/bundle-main.min.js",
);
await updateHtmlScript(
	"./pages/authors.html",
	`${pagesDistDir}/authors.html`,
	"../js/bundle-authors.min.js",
);
await updateHtmlScript(
	"./pages/loans.html",
	`${pagesDistDir}/loans.html`,
	"../js/bundle-loans.min.js",
);
await updateHtmlScript(
	"./pages/form.html",
	`${pagesDistDir}/form.html`,
	"../js/bundle-form.min.js",
);
// Pages de login et signup
await updateHtmlScript(
	"./pages/login.html",
	`${pagesDistDir}/login.html`,
	"../js/bundle-login.min.js",
);
await updateHtmlScript(
	"./pages/signup.html",
	`${pagesDistDir}/signup.html`,
	"../js/bundle-signup.min.js",
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

const cssDistDir = `${distDir}/css`;
if (!fs.existsSync(cssDistDir)) {
  fs.mkdirSync(cssDistDir);
}

const cleanCSS = new CleanCSS({ level: 2 });

for (const cssFile of cssFiles) {
	const cssContent = fs.readFileSync(`./src/css/${cssFile}`, "utf-8");
	const minified = cleanCSS.minify(cssContent);

	if (minified.errors.length > 0) {
		console.error(`❌ Erreur CSS pour ${cssFile}:`, minified.errors);
	}

	fs.writeFileSync(`${cssDistDir}/${cssFile}`, minified.styles);
}

console.log("✅ Build terminé !");
console.log("📦 Fichiers générés dans /dist");
