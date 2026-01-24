import API_URL from "./config.js";

const submitBtn = document.querySelector("button[type='submit']");

submitBtn.addEventListener("click", async (e) => {
	e.preventDefault();

	const username = document.getElementById("username").value;
	const email = document.getElementById("email").value;
	const password = document.getElementById("password").value;

	if (!username || !email || !password) {
		return alert("Champ manquant :/");
	}

	const payload = {
		username: username,
		email: email,
		password: password,
	};

	await sendData(payload);
});

async function sendData(data) {
	try {
		const req = await fetch(`${API_URL}/api/auth/signup`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(data),
		});

		if (!req.ok) throw new Error(`Erreur serveur: ${req.status}`);

		const response = await req.json();

		console.log("Réponse du serveur :", response);
		alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");

		window.location.href = "/";
	} catch (error) {
		console.error("Erreur lors de l'envoie des données :", error);
		alert(`Erreur: ${error.message}`);
	}
}
