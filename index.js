//API: "https://www.omdbapi.com/?apikey=5154c619&s=fast"

const movieListEl = document.querySelector(".movie-list");
const searchInput = document.querySelector(".search-input");
const searchBtn = document.querySelector("#search-submit");
const resultsHeadingEl = document.querySelector(".search_results");
const spinnerEl = document.querySelector(".spinner");
const emptyStateImgEl = document.querySelector(".building");
const sortSelect = document.querySelector(".sort-select");
const movieControlsEl = document.querySelector(".movie-controls");
const movieContainerSpinnerEl = document.querySelector("#movie-container-spinner");

let activeRequestController = null;
let currentMovies = [];
let currentSort = "title-asc";

function setStatus(text) {
  if (resultsHeadingEl) resultsHeadingEl.textContent = text;
}

function setLoading(isLoading) {
  if (!searchBtn) return;
  searchBtn.disabled = isLoading;
  searchBtn.classList.toggle("loading", isLoading);
  searchBtn.classList.toggle("not-loading", !isLoading);
}

function setSpinnerVisible(isVisible) {
  if (!spinnerEl) return;
  spinnerEl.classList.toggle("hidden", !isVisible);
}

function setMovieContainerSpinnerVisible(isVisible) {
  if (!movieContainerSpinnerEl) return;
  movieContainerSpinnerEl.classList.toggle("hidden", !isVisible);
}

function setEmptyStateVisible(isVisible) {
  if (!emptyStateImgEl) return;
  emptyStateImgEl.classList.toggle("hidden", !isVisible);
}

function updateMovieControlsVisibility() {
  if (!movieControlsEl) return;
  movieControlsEl.classList.toggle("hidden", !currentMovies.length);
}

function getSortedMovies(movies, sortKey) {
  const items = [...movies];

  if (!items.length) return items;

  switch (sortKey) {
    case "title-asc":
      items.sort((a, b) =>
        (a.Title || "").toLowerCase().localeCompare((b.Title || "").toLowerCase()),
      );
      break;
    case "title-desc":
      items.sort((a, b) =>
        (b.Title || "").toLowerCase().localeCompare((a.Title || "").toLowerCase()),
      );
      break;
    case "year-desc":
      items.sort((a, b) => {
        const yearA = parseInt(a.Year, 10) || 0;
        const yearB = parseInt(b.Year, 10) || 0;
        return yearB - yearA;
      });
      break;
    case "year-asc":
      items.sort((a, b) => {
        const yearA = parseInt(a.Year, 10) || 0;
        const yearB = parseInt(b.Year, 10) || 0;
        return yearA - yearB;
      });
      break;
    default:
      break;
  }

  return items;
}

function renderMovies() {
  if (!movieListEl) return;
  const sorted = getSortedMovies(currentMovies, currentSort);
  movieListEl.innerHTML = sorted.map((movie) => moviesHTML(movie)).join("");
}

async function fetchMovies(query) {
  if (!movieListEl) return;

  if (activeRequestController) activeRequestController.abort();
  activeRequestController = new AbortController();

  setLoading(true);
  setStatus(`Searching for "${query}"...`);
  setSpinnerVisible(true);
  setMovieContainerSpinnerVisible(true);
  // Keep empty state visible while loading - don't hide it immediately
  movieListEl.innerHTML = "";

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=5154c619&s=${encodeURIComponent(query)}`,
      { signal: activeRequestController.signal },
    );

    if (!response.ok) {
      movieListEl.innerHTML = "<p>Something went wrong. Please try again.</p>";
      setStatus("Search");
      currentMovies = [];
      setEmptyStateVisible(true);
      updateMovieControlsVisibility();
      return;
    }

    const data = await response.json();

    if (data.Search?.length) {
      currentMovies = data.Search.slice();
      renderMovies();
      setStatus(`Search results: "${query}"`);
      setEmptyStateVisible(false);
    } else {
      currentMovies = [];
      movieListEl.innerHTML = "";
      setStatus(`No results for "${query}"`);
      setEmptyStateVisible(true);
    }
    updateMovieControlsVisibility();
  } catch (err) {
    if (err?.name === "AbortError") return;
    movieListEl.innerHTML = "<p>Network error. Please try again.</p>";
    setStatus("Search");
    setEmptyStateVisible(true);
    currentMovies = [];
    updateMovieControlsVisibility();
  } finally {
    setLoading(false);
    setSpinnerVisible(false);
    setMovieContainerSpinnerVisible(false);
  }
}

function runSearchNow() {
  const query = searchInput?.value?.trim() ?? "";
  if (!query) {
    currentMovies = [];
    if (movieListEl) movieListEl.innerHTML = "";
    setStatus("Search");
    setSpinnerVisible(false);
    setMovieContainerSpinnerVisible(false);
    setEmptyStateVisible(true);
    updateMovieControlsVisibility();
    return;
  }
  fetchMovies(query);
}

if (searchBtn) {
  searchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    runSearchNow();
  });
}

if (searchInput) {
  searchInput.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    runSearchNow();
  });
}

if (sortSelect) {
  sortSelect.addEventListener("change", (e) => {
    currentSort = e.target.value;
    if (!currentMovies.length) return;
    renderMovies();
  });
}

function moviesHTML(movie) {
  const poster =
    movie.Poster && movie.Poster !== "N/A" ? movie.Poster : "./assets/blinker-logo.png";

  return `
    <div class="movie-card">
            <div class="movie-card__container">
              <h3 class="movie-name">${movie.Title}</h3>
                <p class="movie-poster"><img src="${poster}" class="movie-poster" alt="${movie.Title} poster"></p>
                <p class="movie-year"><b>Year: </b> ${movie.Year}</p>
                <p class="movie-id"><b>ID: </b>${movie.imdbID}</p>
                <p class="movie-type"><b>Type: </b>${movie.Type}</p>
            </div>
          </div>`;
}
