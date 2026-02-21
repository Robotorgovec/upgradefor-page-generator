import styles from "../SportpitPreview.module.css";

type Brand = { slug: string; name: string; logo_url: string | null };

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

export default function BrandRow({
  brands,
  selected,
  showAll,
  onToggle,
  onToggleAll,
}: {
  brands: Brand[];
  selected: string;
  showAll: boolean;
  onToggle: (slug: string) => void;
  onToggleAll: () => void;
}) {
  if (!brands.length) return <p className={styles.muted}>Нет брендов по выбранным условиям.</p>;

  const display = showAll ? brands : brands.slice(0, 12);

  return (
    <>
      <div className={styles.usaBrandsRow}>
        {display.map((brand) => {
          const active = selected === brand.slug;
          return (
            <button
              key={brand.slug}
              type="button"
              className={`${styles.usaBrandChip} ${active ? styles.usaBrandChipActive : ""}`}
              onClick={() => onToggle(brand.slug)}
              title={brand.name}
              aria-label={active ? `Снять бренд ${brand.name}` : `Выбрать бренд ${brand.name}`}
            >
              <span className={styles.usaBrandMono}>{initials(brand.name)}</span>
              <span>{brand.name}</span>
              {active && <span aria-hidden>×</span>}
            </button>
          );
        })}
      </div>
      {brands.length > 12 && (
        <button type="button" className={styles.secondaryBtn} onClick={onToggleAll}>
          {showAll ? "Свернуть бренды" : "Все бренды"}
        </button>
      )}
    </>
  );
}
