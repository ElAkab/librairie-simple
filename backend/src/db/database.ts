export interface Author {
	id: number;
	full_name: string;
	nationality: string;
	birth_year: number | null;
}

export interface Book {
	id: number;
	title: string;
	year: number;
	author_id: number;
	available: boolean;
}

export interface Loan {
	id: number;
	book_id: number;
	borrower_name: string;
	borrowed_date: string;
	return_date: string | null;
	loan_status: "active" | "returned";
}

export interface User {
	id: number;
	username: string;
	email: string;
	password_hash: string;
	role: "user" | "admin";
	created_at: string;
	last_login: string | null;
	is_active: boolean;
}
