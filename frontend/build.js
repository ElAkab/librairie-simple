import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

const distDir = './dist';
const pagesDistDir = './dist/pages';

// 1. Nettoyer et créer le dossier dist
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir);
fs.mkdirSync(pagesDistDir);

// 2. Bundler chaque point d'entrée séparément
const entryPoints = {
    'bundle-main': './src/main.js',
    'bundle-authors': './src/authors.js',
    'bundle-loans': './src/loans.js',
    'bundle-form': './src/form.js'
};

for (const [name, entry] of Object.entries(entryPoints)) {
    await esbuild.build({
        entryPoints: [entry],
        bundle: true,
        minify: true,
        outfile: `${distDir}/${name}.min.js`
    });
}

// 3. Copier et modifier les fichiers HTML
function updateHtmlScript(htmlPath, outputPath, scriptName) {
    let html = fs.readFileSync(htmlPath, 'utf-8');
    
    // Remplacer les imports module par le bundle (supporte les 2 ordres d'attributs)
    html = html.replace(
        /<script\s+(?:src="[^"]*"[^>]*type="module"|type="module"[^>]*src="[^"]*")[^>]*><\/script>/g,
        `<script src="${scriptName}"></script>`
    );
    
    fs.writeFileSync(outputPath, html);
}

updateHtmlScript('./index.html', `${distDir}/index.html`, 'bundle-main.min.js');
updateHtmlScript('./pages/authors.html', `${pagesDistDir}/authors.html`, '../bundle-authors.min.js');
updateHtmlScript('./pages/loans.html', `${pagesDistDir}/loans.html`, '../bundle-loans.min.js');
updateHtmlScript('./pages/form.html', `${pagesDistDir}/form.html`, '../bundle-form.min.js');

// 4. Copier uniquement les fichiers CSS depuis src/
const cssFiles = ['style.css', 'authors.css', 'loans.css', 'form.css'];
const srcDistDir = `${distDir}/src`;
fs.mkdirSync(srcDistDir);

for (const cssFile of cssFiles) {
    fs.copyFileSync(`./src/${cssFile}`, `${srcDistDir}/${cssFile}`);
}

console.log('✅ Build terminé !');
console.log('📦 Fichiers générés dans /dist');
