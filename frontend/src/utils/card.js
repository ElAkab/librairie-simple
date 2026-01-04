const randomImage = () => {
	const images = [
		"https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=150&h=200&fit=crop",
		"https://images.unsplash.com/photo-1512820790803-83ca734da794?w=150&h=200&fit=crop",
		"https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=150&h=200&fit=crop",
		"https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=150&h=200&fit=crop",
		"https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=150&h=200&fit=crop",
		"https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=150&h=200&fit=crop",
		"https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=150&h=200&fit=crop",
		"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=200&fit=crop",
		"https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=150&h=200&fit=crop",
		"https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=150&h=200&fit=crop",
		"https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=150&h=200&fit=crop",
		"https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=150&h=200&fit=crop",
	];
	return images[Math.floor(Math.random() * images.length)];
};

export default function createCard(title, year, author) {
	const imageUrl = randomImage();
	return `
    <div class="card">
        <img src="${imageUrl}" alt="Book cover" />
        <h3>${title}</h3>
        <p>By <span class="author">${author}</span></p>
        <span>Publié en  ${year}</span>
    </div>
    `;
}
