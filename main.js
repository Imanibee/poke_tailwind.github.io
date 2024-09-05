let currentPage = 1;
const itemsPerPage = 8;
let totalPages = 0;
let allPokemon = [];
let filteredPokemon = [];

// Fetch all Pokémon (limit to 807 as the original Pokedex)
async function fetchAllPokemonData() {
  const totalPokemon = 807;
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${totalPokemon}`);
    const data = await response.json();
    allPokemon = await Promise.all(data.results.map(async pokemon => {
      const res = await fetch(pokemon.url);
      return await res.json();
    }));
    filteredPokemon = allPokemon; // Set the filtered data to all Pokémon initially
    totalPages = Math.ceil(filteredPokemon.length / itemsPerPage); // Calculate total pages based on all Pokemon
    renderPokemonCards(); // Render the first page of Pokémon
  } catch (error) {
    console.error('Error fetching all Pokémon data:', error);
  }
}

// Render Pokémon cards based on current page
function renderPokemonCards() {
  const pokemonListElement = document.getElementById('pokemonList');
  pokemonListElement.innerHTML = '';

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPagePokemon = filteredPokemon.slice(startIndex, endIndex);

  currentPagePokemon.forEach(pokemon => {
    const card = `
      <div class="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition duration-300 hover:scale-105" onclick="openModal('${pokemon.name}', '${pokemon.types.map(type => type.type.name).join(', ')}', '${pokemon.abilities.map(ability => ability.ability.name).join(', ')}', '${pokemon.stats.map(stat => `${stat.stat.name}: ${stat.base_stat}`).join(', ')}')">
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="w-full h-48 object-cover">
        <div class="p-4">
          <h3 class="text-xl font-semibold mb-2">${pokemon.name}</h3>
          <p class="text-gray-700 mb-2">Type: ${pokemon.types.map(type => type.type.name).join(', ')}</p>
          <a href="#" class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md inline-block">Details</a>
        </div>
      </div>
    `;
    pokemonListElement.innerHTML += card;
  });

  renderPagination();
}

// Render pagination with Next and Previous
function renderPagination() {
  const paginationElement = document.getElementById('pagination');
  paginationElement.innerHTML = '';

  // Previous button
  const prevButton = document.createElement('button');
  prevButton.textContent = 'Previous';
  prevButton.classList.add('mx-1', 'px-4', 'py-2', 'bg-gray-300', 'hover:bg-gray-400', 'text-black', 'rounded-md', 'focus:outline-none');
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderPokemonCards();
    }
  });
  paginationElement.appendChild(prevButton);

  // Show up to 5 page numbers at a time
  const maxVisiblePages = 5;
  const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  for (let i = startPage; i <= endPage; i++) {
    const button = document.createElement('button');
    button.textContent = i;
    button.classList.add('mx-1', 'px-4', 'py-2', 'bg-blue-500', 'hover:bg-blue-600', 'text-white', 'rounded-md', 'focus:outline-none');
    if (i === currentPage) {
      button.classList.add('bg-blue-600');
    }
    button.addEventListener('click', () => {
      currentPage = i;
      renderPokemonCards();
    });
    paginationElement.appendChild(button);
  }

  // Next button
  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next';
  nextButton.classList.add('mx-1', 'px-4', 'py-2', 'bg-gray-300', 'hover:bg-gray-400', 'text-black', 'rounded-md', 'focus:outline-none');
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderPokemonCards();
    }
  });
  paginationElement.appendChild(nextButton);
}

// Open modal for details
function openModal(name, type, abilities, stats) {
  document.getElementById('modalTitle').textContent = name;
  document.getElementById('modalType').textContent = `Type: ${type}`;
  document.getElementById('modalAbilities').textContent = `Abilities: ${abilities}`;
  document.getElementById('modalStats').textContent = `Stats: ${stats}`;
  document.getElementById('pokemonModal').classList.remove('hidden');
}

// Close modal
document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('pokemonModal').classList.add('hidden');
});

// Search all Pokémon
document.getElementById('searchInput').addEventListener('input', function () {
  const searchTerm = this.value.toLowerCase();
  filteredPokemon = allPokemon.filter(pokemon => pokemon.name.toLowerCase().includes(searchTerm));
  currentPage = 1; // Reset to the first page of results
  totalPages = Math.ceil(filteredPokemon.length / itemsPerPage); // Update total pages
  renderPokemonCards();
});

// Filter by type
document.getElementById('typeFilter').addEventListener('change', function () {
  const selectedType = this.value;
  if (selectedType === '') {
    filteredPokemon = allPokemon;
  } else {
    filteredPokemon = allPokemon.filter(pokemon => pokemon.types.some(type => type.type.name === selectedType));
  }
  currentPage = 1; // Reset to the first page of results
  totalPages = Math.ceil(filteredPokemon.length / itemsPerPage); // Update total pages
  renderPokemonCards();
});

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  fetchAllPokemonData(); // Fetch all Pokémon data initially
  fetchPokemonTypes(); // Fetch Pokémon types for the filter
});
