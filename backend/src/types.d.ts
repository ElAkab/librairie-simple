import "express-session";
import { User } from "./db/database";

declare module "express-session" {
	interface SessionData {
		user?: Pick<User, "id" | "username" | "email" | "role">;
	}
}

declare module "connect-pg-simple";
declare module "./db/connection.js";
declare module "./routes/api/authors.js";
declare module "./routes/api/books.js";
declare module "./routes/api/loans.js";
declare module "./routes/api/auth.js";
declare module "./routes/dev.js";
