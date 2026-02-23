import styles from "../SportpitShell.module.css";

type BurgerButtonProps = {
  isOpen: boolean;
  onToggle: () => void;
};

export function BurgerButton({ isOpen, onToggle }: BurgerButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.burger} ${isOpen ? styles.burgerOpen : ""}`}
      onClick={onToggle}
      aria-label="Открыть меню"
      aria-controls="sportpit-sidebar"
      aria-expanded={isOpen}
    >
      <span />
      <span />
      <span />
    </button>
  );
}
