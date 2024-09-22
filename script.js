const baseUrl = "https://pokeapi.co/api/v2/pokemon/";
const numberOfCards = 12;
let hasFlippedCard = false;
let lockBoard = false; // Prevent multiple clicks while comparing
let firstCard, secondCard; // Track the first and second card
const pokemonImages = [];
let matchedPairs = 0;

// Fetching Pokémon images
async function fetchImages() {
    try {
        // Fetch 1050 Pokémon to have a large pool to randomly pick from
        const response = await axios.get(`${baseUrl}?limit=1050`);
        const pokemonData = response.data.results;

        // Randomly select 6 Pokémon from the fetched data
        let selectedPokemon = [];
        while (selectedPokemon.length < numberOfCards / 2) {
            const randomIndex = Math.floor(Math.random() * pokemonData.length);
            const pokemon = pokemonData[randomIndex];

            // Ensure we don't select the same Pokémon twice
            if (!selectedPokemon.includes(pokemon)) {
                selectedPokemon.push(pokemon);
            }
        }

        // Fetch details and images for the selected Pokémon
        for (const pokemon of selectedPokemon) {
            const pokemonDetails = await axios.get(pokemon.url);
            const pokemonImage = pokemonDetails.data.sprites.front_default;

            // Push the image twice to create pairs
            pokemonImages.push(pokemonImage);
            pokemonImages.push(pokemonImage);
        }

        // Shuffle the images array to randomize card placement
        pokemonImages.sort(() => Math.random() - 0.5);
        createCardImages();
    } catch (error) {
        console.error("Error fetching images: ", error);
    }
}

// Assign Pokémon images to the cards
function createCardImages() {
    const cards = document.querySelectorAll('.pokemon-card');
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const frontCard = card.querySelector('.front-card');
        frontCard.src = pokemonImages[i]; // Set image on the front of each card
        card.addEventListener('click', flipCard); // Add event listener to each card
    }
}

// Flip the card
function flipCard() {
    if (lockBoard) return; // Prevent flipping while checking
    if (this === firstCard) return; // Prevent double-clicking the same card

    this.classList.add('flip'); // Flip the card

    if (!hasFlippedCard) {
        // First card flipped
        hasFlippedCard = true;
        firstCard = this;
    } else {
        // Second card flipped
        hasFlippedCard = false;
        secondCard = this;

        // Check if cards match
        checkForMatch();
    }
}

// Check if the two flipped cards match
function checkForMatch() {
    const firstImage = firstCard.querySelector('.front-card').src;
    const secondImage = secondCard.querySelector('.front-card').src;

    if (firstImage === secondImage) {
        // It's a match! Keep both cards flipped
        disableCards();
    } else {
        // Not a match, flip the cards back after a delay
        unflipCards();
    }
}

// Disable matching cards to prevent further clicks
function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);

    matchedPairs++;

    if (matchedPairs === numberOfCards / 2) {
        setTimeout(() => {
            alert("You won!! You're a Pokémon master!")
        }, 1000);
    }

    resetBoard();
}

// Unflip the two cards if they don't match
function unflipCards() {
    lockBoard = true;

    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');

        resetBoard();
    }, 1000); // Wait 1 second before flipping back
}

// Reset the board state after a match or mismatch
function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

// Start the game by fetching images
fetchImages();
