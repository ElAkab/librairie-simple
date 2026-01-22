import API_URL from "./config.js";

const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
	e.preventDefault();

	const username = document.querySelector("#username").value.trim();
	const password = document.querySelector("#password").value.trim();

	if (!username || !password) {
		alert("Champ requis");
		return;
	}

	const payload = {
		username,
		password,
	};

	console.log("Payload de connexion :", payload);

	await sendData(payload);
});

async function sendData(data) {
	try {
		const req = await fetch(`${API_URL}/api/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});

		const res = await req.json();

		if (!res.ok) throw new Error("Erreur API");

		console.log("Réponse du serveur :", res);
		alert("Connexion réussie ! Vous pouvez maintenant vous connecter.");

		window.location.href = "/";
	} catch (error) {
		console.error("Erreur lors de l'envoie des données :", error);
		alert(`Erreur: ${error.message}`);
	}
}
