import Link from "next/link";

import type { Company, RouteFamily } from "../../../lib/wikimarket/company-types";
import { getCompanyPath } from "../../../lib/wikimarket/company-repository";
import styles from "./NotFoundCompany.module.css";

type NotFoundCompanyProps = {
  routeFamily: RouteFamily;
  suggestions: Company[];
};

export default function NotFoundCompany({ routeFamily, suggestions }: NotFoundCompanyProps) {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.kicker}>404 / {routeFamily}</p>
        <h1>Профиль не найден</h1>
        <p>
          Такой slug не опубликован в каталоге. Проверьте ссылку или перейдите в список профилей ниже.
        </p>

        <div className={styles.actions}>
          <Link href={`/wikimarket/${routeFamily}`}>Открыть каталог</Link>
          <Link href="/wikimarket/hvac/copper-aluminum-heat-exchangers">Вернуться в категорию</Link>
        </div>
      </section>

      {suggestions.length > 0 ? (
        <section className={styles.card}>
          <h2>Что можно открыть вместо этого</h2>
          <ul className={styles.suggestionList}>
            {suggestions.map((company) => (
              <li key={company.id}>
                <Link href={getCompanyPath(company, routeFamily)}>{company.publicName}</Link>
                <span>{company.shortDescription}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
