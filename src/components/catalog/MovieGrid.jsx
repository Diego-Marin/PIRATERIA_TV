import MovieCard from './MovieCard.jsx';

export default function MovieGrid({ movies, onSelectMovie }) {
  return (
    <div className="poster-grid">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} onSelect={onSelectMovie} />
      ))}
    </div>
  );
}