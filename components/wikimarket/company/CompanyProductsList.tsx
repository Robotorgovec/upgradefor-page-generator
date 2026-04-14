import Image from "next/image";

import type { StandardProduct } from "../../../lib/wikimarket/company-types";
import styles from "./CompanyProfilePage.module.css";

type CompanyProductsListProps = {
  products: StandardProduct[];
};

export default function CompanyProductsList({ products }: CompanyProductsListProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className={styles.productsGrid}>
      {products.map((product) => (
        <article key={product.id} className={styles.productCard}>
          <div className={styles.productMedia}>
            <Image
              src={product.image.url}
              alt={product.image.alt}
              width={product.image.width}
              height={product.image.height}
              sizes="(max-width: 900px) 100vw, 360px"
            />
          </div>

          <div className={styles.productContent}>
            <h3>{product.title}</h3>
            <p>{product.shortDescription}</p>

            {product.specs ? (
              <dl className={styles.productSpecs}>
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{String(value)}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <a className={styles.inlineButton} href={product.inquiryUrl}>
              Запросить КП по позиции
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
