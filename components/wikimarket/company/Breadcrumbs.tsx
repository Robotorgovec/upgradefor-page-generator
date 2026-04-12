import Link from "next/link";

import styles from "./CompanyProfilePage.module.css";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumbs">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className={styles.breadcrumbItem}>
          {item.href ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
          {index < items.length - 1 ? <span className={styles.breadcrumbDivider}>/</span> : null}
        </span>
      ))}
    </nav>
  );
}
