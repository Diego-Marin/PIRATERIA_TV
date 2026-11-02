export const CATEGORIES = [
  { id: 'movie', label: 'Películas' },
  { id: 'series', label: 'Series' },
  { id: 'course', label: 'Cursos' },
];

export default function CategoryTabs({ active, onChange }) {
  return (
    <div className="category-tabs" role="tablist" aria-label="Categorías">
      {CATEGORIES.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={id === active}
          className={`category-tab${id === active ? ' category-tab--active' : ''}`}
          data-category={id}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
