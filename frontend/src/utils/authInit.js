export async function isAuth() {
	const userId = localStorage.getItem("userId");
	if (!userId) return false;

	try {
		const response = await fetch(`/api/auth/${userId}`);

		if (!response.ok)
			throw new Error("Erreur lors de la vérification de l'authentification");

		const data = await response.json();

		console.log("Données d'authentification reçues :", data);
		return { isAuth: data.isAuth, user: data.result };
	} catch (error) {
		console.error(
			"Erreur lors de la vérification de l'authentification :",
			error,
		);
		return false;
	}
}
