export const metadata = {
  title: "Политика конфиденциальности | UpgradeFor",
  description: "Политика конфиденциальности сервиса UpgradeFor.",
};

export default function LegalPrivacyPage() {
  return (
    <section className="wrap" aria-labelledby="privacy-title" style={{ paddingBlock: "var(--space-4)" }}>
      <article className="card" style={{ maxWidth: "920px", margin: "0 auto" }}>
        <header style={{ marginBottom: "var(--space-3)" }}>
          <h1 id="privacy-title" className="section-title" style={{ marginBottom: "var(--space-2)" }}>
            Политика конфиденциальности
          </h1>
          <p style={{ margin: 0 }}>Актуальная версия документа о порядке обработки данных.</p>
        </header>

        <p>
          Настоящая Политика определяет принципы и правила обработки персональных данных при
          использовании сайта и услуг UpgradeFor.
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
