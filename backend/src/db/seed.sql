INSERT INTO authors (full_name, nationality, birth_year) VALUES
('Harper Lee', 'American', 1926),
('George Orwell', 'British', 1903),
('Jane Austen', 'British', 1775),
('F. Scott Fitzgerald', 'American', 1896),
('Herman Melville', 'American', 1819),
('Leo Tolstoy', 'Russian', 1828),
('Victor Hugo', 'French', 1802),
('Albert Camus', 'French', 1913),
('Gabriel Garcia Marquez', 'Colombian', 1927);

INSERT INTO books (title, year, author_id, available) VALUES
('To Kill a Mockingbird', 1960, 1, true),
('1984', 1949, 2, true),
('Pride and Prejudice', 1813, 3, true),
('The Great Gatsby', 1925, 4, true),
('Moby Dick', 1851, 5, true),
('War and Peace', 1869, 6, true),
('Les Misérables', 1862, 7, false),
('L''Étranger', 1942, 8, false),
('Cent ans de solitude', 1967, 9, false);

INSERT INTO loans (book_id, borrower_name, borrowed_date, return_date, loan_status) VALUES
(7, 'Alice Johnson', '2024-04-10', '2024-05-10', 'active'),
(8, 'Charlie Davis', '2024-05-05', '2024-06-05', 'active'),
(9, 'Diana Evans', '2024-06-01', '2024-07-01', 'active');