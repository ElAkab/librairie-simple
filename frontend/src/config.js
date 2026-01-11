// Configuration de l'URL de l'API backend
// En développement : utilise localhost
// En production : utilise la variable d'environnement VITE_API_URL si définie,
//                 sinon fallback sur l'URL Railway hardcodée
const API_URL =
	window.location.hostname === "localhost"
		? "http://localhost:3000"
		: import.meta.env?.VITE_API_URL || "https://librairie-simple-production-6ca3.up.railway.app";

export default API_URL;
