document.addEventListener('DOMContentLoaded', () => {
	const searchInput = document.getElementById('search-events');
	const chips = Array.from(document.querySelectorAll('.chip'));
	const cards = Array.from(document.querySelectorAll('.event-card'));

	if (!searchInput || cards.length === 0) return;

	let activeCategory = 'all';

	function normalize(s) {
		return (s||'').toString().trim().toLowerCase();
	}

	function applyFilter() {
		const q = normalize(searchInput.value);

		cards.forEach(card => {
			const name = normalize(card.dataset.name);
			const category = normalize(card.dataset.category);

			const matchesQuery = q === '' || name.indexOf(q) !== -1;
			const matchesCategory = (activeCategory === 'all') || (category === activeCategory);

			if (matchesQuery && matchesCategory) {
				card.style.display = '';
			} else {
				card.style.display = 'none';
			}
		});
	}

	// Debounce helper
	function debounce(fn, wait = 180) {
		let t;
		return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
	}

	searchInput.addEventListener('input', debounce(applyFilter));

	chips.forEach(chip => {
		// set category on chip via text or data-cat
		const cat = chip.dataset.cat || normalize(chip.textContent);
		chip.addEventListener('click', () => {
			chips.forEach(c => c.classList.remove('active'));
			chip.classList.add('active');
			activeCategory = (cat === 'all') ? 'all' : cat.toLowerCase();
			applyFilter();
		});
	});

	// Initialize
	applyFilter();
});
