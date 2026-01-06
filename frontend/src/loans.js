const loansContainer = document.getElementById("loans");

async function getLoans() {
	try {
		const req = await fetch("/api/loans");
		if (!req.ok) throw new Error("Erreur avec l'API");
		const result = await req.json();
		return result;
	} catch (error) {
		console.error("Echec de récupération de données ", error);
		loansContainer.innerHTML =
			"<p class='error'>Impossible de récupérer les données des emprunts.</p>";
		return [];
	}
}

async function init() {
	try {
		const allLoans = await getLoans();
		allLoans.forEach((loan) => {
			const cardLoan = document.createElement("div");
			cardLoan.classList.add("loan-card");
			const content = `
				<div class="loan-header">
					<h3>Livre ID: ${loan.book_id}</h3>
				</div>
				<div class="loan-info">
					<p><strong>Emprunteur:</strong> ${loan.borrower_name}</p>
					<p><strong>Date d'emprunt:</strong> ${loan.borrowed_date}</p>
					<p><strong>Date de retour:</strong> ${
						loan.return_date ? loan.return_date : "Non retourné"
					}</p>
				</div>
				<div class="loan-actions">
					<button class="edit-loan-button" data-loan-id="${loan.id}">Modifier</button>
				</div>
			`;
			cardLoan.innerHTML = content;
			loansContainer.appendChild(cardLoan);
		});
	} catch (error) {
		console.error("Erreur d'initialisation", error);
	}
}

init();
