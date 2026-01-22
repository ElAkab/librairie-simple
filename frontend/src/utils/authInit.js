import API_URL from "../js/config.js";

export async function isAuth() {
	const userId = localStorage.getItem("userId");
	if (!userId) return false;

	try {
		const response = await fetch(`${API_URL}/api/auth/${userId}`, {
			credentials: "include",
		});

		if (!response.ok) return false;

		const contentType = response.headers.get("content-type");
		if (!contentType || !contentType.includes("application/json")) {
			console.warn(
				"Vérification auth : réponses non-JSON (HTML ou autre), API inaccessible.",
			);
			return false;
		}

		const data = await response.json();
		return { isAuth: data.isAuth, user: data.result };
	} catch (error) {
		console.warn(
			"Vérification auth échouée (réseau ou parse) :",
			error?.message ?? error,
		);
		return false;
	}
}
