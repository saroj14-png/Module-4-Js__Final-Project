//API: "https://www.omdbapi.com/?apikey=5154c619&s=fast"

const movieListEl = document.querySelector(".movie-list");
const searchInput = document.querySelector(".search-input");
const searchBtn = document.querySelector("#search-submit");
const resultsHeadingEl = document.querySelector(".serch_results");
const spinnerEl = document.querySelector(".spinner");
const emptyStateImgEl = document.querySelector(".building");

let activeRequestController = null;

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

function setEmptyStateVisible(isVisible) {
  if (!emptyStateImgEl) return;
  emptyStateImgEl.classList.toggle("hidden", !isVisible);
}

async function fetchMovies(query) {
  if (!movieListEl) return;

  if (activeRequestController) activeRequestController.abort();
  activeRequestController = new AbortController();

  setLoading(true);
  setStatus(`Searching for "${query}"...`);
  setSpinnerVisible(true);
  setEmptyStateVisible(false);

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=5154c619&s=${encodeURIComponent(query)}`,
      { signal: activeRequestController.signal },
    );

    if (!response.ok) {
      movieListEl.innerHTML = "<p>Something went wrong. Please try again.</p>";
      setStatus("Search");
      return;
    }

    const data = await response.json();

    if (data.Search?.length) {
      movieListEl.innerHTML = data.Search.map((movie) => moviesHTML(movie)).join(
        "",
      );
      setStatus(`Results for "${query}"`);
      setEmptyStateVisible(false);
    } else {
      movieListEl.innerHTML = "";
      setStatus(`No results for "${query}"`);
      setEmptyStateVisible(true);
    }
  } catch (err) {
    if (err?.name === "AbortError") return;
    movieListEl.innerHTML = "<p>Network error. Please try again.</p>";
    setStatus("Search");
    setEmptyStateVisible(false);
  } finally {
    setLoading(false);
    setSpinnerVisible(false);
  }
}

function runSearchNow() {
  const query = searchInput?.value?.trim() ?? "";
  if (!query) {
    if (movieListEl) movieListEl.innerHTML = "";
    setStatus("Search");
    setSpinnerVisible(false);
    setEmptyStateVisible(true);
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
