import { supabase, isSupabaseConfigured } from './supabaseClient.js';

const MOVIE_COLUMNS = 'id, title, description, category, year, cover_url, drive_file_id';

// Acepta un ID suelto o un enlace de Drive y devuelve solo el ID.
export function normalizeDriveId(value = '') {
  const withoutPath = value.includes('/d/') ? value.split('/d/')[1] : value;
  return withoutPath.trim().split(/[/?]/)[0];
}

// Si la portada es un enlace de Drive, lo convierte a una URL de imagen.
// Las URLs normales (por ejemplo de Supabase Storage) se dejan igual.
export function normalizeCoverUrl(value = '') {
  const url = (value || '').trim();
  if (!url) return null;

  const isDriveLink = url.includes('drive.google.com/file/d/');
  const isDriveImage =
    url.includes('drive.google.com/thumbnail') || url.includes('googleusercontent.com');
  if (isDriveImage) return url;
  if (isDriveLink) {
    return `https://lh3.googleusercontent.com/d/${normalizeDriveId(url)}=w600`;
  }

  const isBareDriveId = /^[\w-]{20,}$/.test(url);
  if (isBareDriveId) return `https://lh3.googleusercontent.com/d/${url}=w600`;

  return url;
}

function mapMovie(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    year: row.year,
    coverUrl: normalizeCoverUrl(row.cover_url),
    driveFileId: normalizeDriveId(row.drive_file_id),
  };
}

export async function getMovies() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Faltan las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env.'
    );
  }

  const { data, error } = await supabase
    .from('movies')
    .select(MOVIE_COLUMNS)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(mapMovie);
}