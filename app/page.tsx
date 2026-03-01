export default function HomePage() {
  return (
    <section className="home-main-hero">
      <h1>
        <span className="nowrap-brand">UPGRADE&#8209;INNOVATIONS</span>
      </h1>
      <p>
        Добро пожаловать в платформу. Навигация всегда доступна через фиксированные
        Header и Sidebar.
      </p>

      <style jsx>{`
        .home-main-hero h1 {
          text-align: center;
        }

        @media (max-width: 768px) {
          .home-main-hero h1 {
            text-align: center;
            writing-mode: horizontal-tb;
            text-orientation: mixed;
            white-space: normal;
            overflow-wrap: normal;
            word-break: normal;
            hyphens: auto;
            max-width: 100%;
          }

          .home-main-hero h1 .nowrap-brand {
            display: inline-block;
            white-space: nowrap;
            overflow-wrap: normal;
            word-break: keep-all;
            hyphens: none;
          }
        }
      `}</style>
    </section>
  );
}
