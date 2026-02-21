import styles from "../SportpitPreview.module.css";

type Category = { slug: string; name_ru: string; hint: string };

export default function CategoryGrid({
  categories,
  selected,
  onToggle,
}: {
  categories: Category[];
  selected: string;
  onToggle: (slug: string) => void;
}) {
  return (
    <div className={styles.usaCategoryGrid}>
      {categories.map((category) => {
        const active = selected === category.slug;
        return (
          <button
            key={category.slug}
            type="button"
            onClick={() => onToggle(category.slug)}
            className={`${styles.usaCategoryCard} ${active ? styles.usaCategoryCardActive : ""}`}
            title={category.hint}
          >
            <span className={styles.usaCategoryMark}>AC</span>
            <strong>{category.name_ru}</strong>
            <small>{category.hint}</small>
          </button>
        );
      })}
    </div>
  );
}
