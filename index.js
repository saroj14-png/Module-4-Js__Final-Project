//API: "https://www.omdbapi.com/?apikey=5154c619&s=fast"

const movieListEl = document.querySelector(".movie-list");
const searchInput = document.querySelector(".search-input");
const searchBtn = document.querySelector("#search-submit");
const resultsHeadingEl = document.querySelector(".serch_results");
const buildingImgEl = document.querySelector(".building");

let activeRequestController = null;
let debounceTimer = null;

function setStatus(text) {
  if (resultsHeadingEl) resultsHeadingEl.textContent = text;
}

function setLoading(isLoading) {
  if (!searchBtn) return;
  searchBtn.disabled = isLoading;
  searchBtn.classList.toggle("loading", isLoading);
  searchBtn.classList.toggle("not-loading", !isLoading);
}

function setLandingVisible(isVisible) {
  if (!buildingImgEl) return;
  buildingImgEl.classList.toggle("hidden", !isVisible);
}

async function fetchMovies(query) {
  if (!movieListEl) return;

  if (activeRequestController) activeRequestController.abort();
  activeRequestController = new AbortController();

  setLoading(true);
  setStatus(`Searching for "${query}"...`);
  setLandingVisible(false);

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=5154c619&s=${encodeURIComponent(query)}`,
      { signal: activeRequestController.signal },
    );

    if (!response.ok) {
      movieListEl.innerHTML = "<p>Something went wrong. Please try again.</p>";
      setStatus("Search");
      setLandingVisible(true);
      return;
    }

    const data = await response.json();

    if (data.Search?.length) {
      movieListEl.innerHTML = data.Search.map((movie) => moviesHTML(movie)).join(
        "",
      );
      setStatus(`Results for "${query}"`);
    } else {
      movieListEl.innerHTML = "<p>No results found</p>";
      setStatus(`No results for "${query}"`);
      setLandingVisible(true);
    }
  } catch (err) {
    if (err?.name === "AbortError") return;
    movieListEl.innerHTML = "<p>Network error. Please try again.</p>";
    setStatus("Search");
    setLandingVisible(true);
  } finally {
    setLoading(false);
  }
}

function runSearchNow() {
  const query = searchInput?.value?.trim() ?? "";
  if (!query) {
    if (movieListEl) movieListEl.innerHTML = "";
    setStatus("Search");
    setLandingVisible(true);
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

  // Optional: still supports searching while typing, but debounced
  searchInput.addEventListener("input", () => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(runSearchNow, 450);
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
