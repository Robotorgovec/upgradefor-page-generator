import styles from "./SportpitShell.module.css";

type SportpitBurgerV2Props = {
  isOpen: boolean;
  onToggle: () => void;
  controlsId: string;
};

export function SportpitBurgerV2({
  isOpen,
  onToggle,
  controlsId,
}: SportpitBurgerV2Props) {
  return (
    <button
      type="button"
      data-ui="sportpit-burger-v2"
      className={`${styles.burgerV2Btn} ${isOpen ? styles.burgerV2Open : ""}`}
      onClick={onToggle}
      aria-label={isOpen ? "Свернуть меню" : "Развернуть меню"}
      aria-controls={controlsId}
      aria-expanded={isOpen}
    >
      <span className={styles.burgerV2Line} />
      <span className={styles.burgerV2Line} />
      <span className={styles.burgerV2Line} />
    </button>
  );
}
