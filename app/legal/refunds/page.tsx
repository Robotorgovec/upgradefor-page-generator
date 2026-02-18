export const metadata = {
  title: "Политика возвратов и отмены | UpgradeFor",
  description: "Политика возвратов и отмены по услугам UpgradeFor.",
};

export default function LegalRefundsPage() {
  return (
    <section className="wrap" aria-labelledby="refunds-title" style={{ paddingBlock: "var(--space-4)" }}>
      <article className="card" style={{ maxWidth: "920px", margin: "0 auto" }}>
        <header style={{ marginBottom: "var(--space-3)" }}>
          <h1 id="refunds-title" className="section-title" style={{ marginBottom: "var(--space-2)" }}>
            Политика возвратов и отмены
          </h1>
          <p style={{ margin: 0 }}>Актуальная версия документа для услуг UpgradeFor.</p>
        </header>

        <p>
          Условия возвратов и отмен по услугам регистрации и сопровождения доменных имён
          определяются настоящей Политикой, а также Публичной офертой.
        </p>

        <div style={{ marginTop: "var(--space-4)" }}>
          <p style={{ marginBottom: "8px" }}>
            <strong>Документы:</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: "18px" }}>
            <li>
              <a href="/legal/terms" style={{ textDecoration: "underline" }}>
                Публичная оферта
              </a>
            </li>
            <li>
              <a href="/legal/refunds" style={{ textDecoration: "underline" }}>
                Политика возвратов и отмены
              </a>
            </li>
            <li>
              <a href="/legal/privacy" style={{ textDecoration: "underline" }}>
                Политика конфиденциальности
              </a>
            </li>
          </ul>
        </div>
      </article>
    </section>
  );
}
