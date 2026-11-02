import { useEffect, useState } from 'react';
import { getEpisodes } from '../services/movieService.js';

export default function useEpisodes(seriesId) {
  const [episodes, setEpisodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    setIsLoading(true);
    setError(null);

    getEpisodes(seriesId)
      .then((data) => {
        if (!isCancelled) setEpisodes(data);
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
  }, [seriesId]);

  return { episodes, isLoading, error };
}
