//API: "https://www.omdbapi.com/?apikey=5154c619&s=fast"

const movieListEl = document.querySelector(".movie-list");
async function main() {
  const movies = await fetch("https://www.omdbapi.com/?apikey=5154c619&s=fast");
  const moviesData = await movies.json();
  movieListEl.innerHTML = moviesData.map((movie) => usersHTML(movie)).join("");
  console.log(moviesData);
}
function showMoviePosts(id) {
  localStorage.setItem("id",id);
  window.location.href = `${window.location.origin}/find-movies.html`;
}
function usersHTML(movie) {
  return `
  <div class="movie-card" onclick="showMoviePosts(${movie.id})">
    <div class="movie-card__container">
      <h2>${movie.Title}</h2>
      <p><strong>Year:</strong> ${movie.Year}</p>
      <p><strong>Phone:</strong> ${movie.phone}</p>
      <p><strong>Website:</strong> <a href="https://${movie.website}" target="_blank">${movie.website}</a></p>
    </div>
    </div>  `;
}
main();