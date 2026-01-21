import API_URL from "./config.js";

const forms = document.querySelectorAll(".add");

// Récupération des données de la db

// Ajout des écouteurs d'événements sur chaque formulaire
forms.forEach((form) => {
	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		// Récupération des données
		const formData = new FormData(form);

		const data = Object.fromEntries(formData.entries()); // Conversion en objet (entries() retourne un tableau de paires clé/valeur)

		// Routage selon la classe
		if (form.classList.contains("add-author")) {
			// * Vérification si un auteur similaire existe déjà
			const isDuplicate = await checkDuplicateAuthor(
				data.fullName,
				data.birthYear
			);

			// ! Si l'auteur existe déjà, alerter et arrêter
			if (isDuplicate) {
				alert(
					`Un auteur "${data.fullName}" (${data.birthYear}) existe déjà dans la base de données.`
				);
				return;
			}

			// ? Création de l'auteur
			const result = await createAuthor(data);
			if (result) {
				alert("✅ Auteur créé avec succès !");
				form.reset();
			}
		} else if (form.classList.contains("add-book")) {
			// * Vérification si le livre existe déjà pour cet auteur
			const isDuplicate = await checkDuplicateBook(data.title, data.authorId);

			// ! Si le livre existe déjà, alerter et arrêter
			if (isDuplicate) {
				alert(
					`Le livre "${data.title}" existe déjà pour cet auteur dans la base de données.`
				);
				return;
			}

			// ? Création du livre
			const result = await createBook(data);
			if (result) {
				alert("✅ Livre créé avec succès !");
				form.reset();
			}
		} else if (form.classList.contains("add-loan")) {
			// * Vérifier si le livre est disponible
			const availableBooks = await fetchAvailableBooks(data.bookId);
			if (availableBooks.length === 0) {
				alert(
					"Le livre n'est pas disponible pour l'emprunt. Veuillez choisir un autre livre."
				);
				return;
			}

			// ? Création de l'emprunt
			const result = await createLoan(data);
			if (result) {
				alert("✅ Emprunt créé avec succès !");
				form.reset();
			}
		} else {
			console.log("Formulaire non reconnu");
		}

		console.log("Form data submitted:", data);
	});
});

// Auteur : fonction d'envoi des données
async function createAuthor(obj) {
	try {
		const payload = {
			full_name: obj.fullName,
			birth_year: obj.birthYear,
			nationality: obj.nationality,
		};

		const req = await fetch(`${API_URL}/api/authors`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (!req.ok) throw new Error("Erreur API");

		const result = await req.json();

		return result;
	} catch (error) {
		console.error("Erreur serveur", error);
		alert("Auteur : Erreur");
	}
}

// Livre : fonction d'envoi des données
async function createBook(obj) {
	try {
		const payload = {
			title: obj.title,
			authorId: obj.authorId,
			year: obj.publicationYear,
		};

		const req = await fetch(`${API_URL}/api/books`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (!req.ok) {
			const error = await req.json();
			throw new Error(error.message || "Erreur API");
		}

		const result = await req.json();
		return result;
	} catch (error) {
		console.error("Erreur serveur", error);
		alert("Livre : Erreur");
	}
}

// Emprunt : fonction d'envoi des données
async function createLoan(obj) {
	try {
		const payload = {
			book_id: obj.bookId,
			borrower_name: obj.borrowerName,
			borrowed_date: obj.fromDate,
			return_date: obj.toDate || null,
		};

		const req = await fetch(`${API_URL}/api/loans`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (!req.ok) {
			const error = await req.json();
			throw new Error(error.message || "Erreur API");
		}

		const result = await req.json();
		return result;
	} catch (error) {
		console.error("Erreur serveur", error);
		alert("Emprunt : " + error.message);
	}
}

// Vérifier si un auteur similaire existe déjà
async function checkDuplicateAuthor(fullName, birthYear) {
	try {
		const req = await fetch(`${API_URL}/api/authors`, {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		});

		if (!req.ok) throw new Error("Erreur API");

		const authors = await req.json();

		// Vérifier si un auteur avec le même nom complet/année existe
		return authors.some(
			(author) =>
				author.full_name.toLowerCase() === fullName.toLowerCase() &&
				author.birth_year == birthYear
		);
	} catch (error) {
		console.error("Erreur serveur", error);
		return false;
	}
}

// Vérifier si un livre existe déjà pour un auteur
async function checkDuplicateBook(title, authorId) {
	try {
		const req = await fetch(`${API_URL}/api/books`, {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		});

		if (!req.ok) throw new Error("Erreur API");

		const books = await req.json();

		// Vérifier si un livre avec le même titre et auteur existe
		return books.some(
			(book) =>
				book.title.toLowerCase() === title.toLowerCase() &&
				book.author_id == authorId
		);
	} catch (error) {
		console.error("Erreur serveur", error);
		return false;
	}
}

// Récupérer les livres disponibles
async function fetchAvailableBooks(bookId) {
	try {
		const req = await fetch(`${API_URL}/api/books/available/${bookId}`, {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		});

		if (!req.ok) throw new Error("Erreur API");

		const result = await req.json();
		return result;
	} catch (error) {
		console.error("Erreur serveur", error);
		alert("Récupération des livres disponibles : Erreur");
	}
}
