import { useEffect, useState } from 'react';
import { getMovies } from '../services/movieService.js';

export default function useMovies() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    getMovies()
      .then((data) => {
        if (!isCancelled) setMovies(data);
      })
      .catch((err) => {
        if (!isCancelled) setError(err.message);
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  return { movies, isLoading, error };
}
