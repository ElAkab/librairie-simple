// Ce fichier sert à “débloquer” l’import de modules JS non typés dans un projet TypeScript, pour que tu puisses avancer sans que le compilateur ne t’empêche de coder.

declare module "connect-pg-simple";
declare module "./routes/api/authors.js";
declare module "./routes/api/books.js";
declare module "./routes/api/loans.js";
declare module "./routes/api/auth.js";
declare module "./routes/dev.js";
