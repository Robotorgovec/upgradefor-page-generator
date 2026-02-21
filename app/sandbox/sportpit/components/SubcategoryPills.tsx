import styles from "../SportpitPreview.module.css";

type Subcategory = { slug: string; name_ru: string };

export default function SubcategoryPills({
  items,
  selected,
  onToggle,
}: {
  items: Subcategory[];
  selected: string;
  onToggle: (slug: string) => void;
}) {
  if (!items.length) return null;

  return (
    <div className={styles.usaPillsRow}>
      {items.map((item) => {
        const active = selected === item.slug;
        return (
          <button key={item.slug} type="button" className={`${styles.usaPill} ${active ? styles.usaPillActive : ""}`} onClick={() => onToggle(item.slug)}>
            {item.name_ru}
          </button>
        );
      })}
    </div>
  );
}
