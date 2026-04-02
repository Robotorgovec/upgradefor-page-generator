"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import CuAlLocalContactsBlock from "./CuAlLocalContactsBlock";
import CuAlRfqConfigurator from "./CuAlRfqConfigurator";
import styles from "./CuAlHeatExchangersPage.module.css";
import { faqItems, heroChips, productItems, useCases } from "./data";
import {
  DEFAULT_MANUFACTURER_CARD_IMAGE,
  DEFAULT_MANUFACTURER_CARD_IMAGE_ALT,
  cuAlManufacturerCards,
  getCardMiniFacts,
  getCompanyLocationLabel,
  getCompanyRoleLabel,
  getDisplayCapabilities,
  getRatingLabel,
  getTrustEvidence,
  getVerificationHint,
  hasRatedReviews,
} from "./manufacturers";

const breadcrumbs = [
  { href: "/wikimarket/hvac/heat-exchangers", label: "WikiMarket HVAC" },
  { href: "/wikimarket/hvac/heat-exchangers", label: "Каталог теплообменников" },
  { href: "/wikimarket/hvac/copper-aluminum-heat-exchangers", label: "Cu-Al теплообменники" },
] as const;

const documentSignals = [
  "Паспорт, маркировка и комплект отгрузочных документов",
  "Опрессовка, результаты испытаний и контроль исполнения",
  "Чертежи, привязка по посадочным размерам и пакет для тендера",
  "Гарантийные условия, сроки и согласование альтернатив по поставке",
] as const;

const processSteps = [
  "Собираем исходные данные: режимы, габариты, ограничения и пожелания по документам.",
  "Подбираем конструкцию секции, покрытия и исполнение под среду и срок поставки.",
  "Согласовываем КП, комплект документов и маршрут поставки по вашему проекту.",
] as const;

export default function CuAlHeatExchangersPage() {
  const [product, setProduct] = useState("");
  const [usecase, setUsecase] = useState("");
  const [prefillSignal, setPrefillSignal] = useState(0);

  const useCaseSlugs = useMemo(
    () =>
      useCases.map((item) => ({
        label: item,
        slug: item
          .toLowerCase()
          .replace(/[^a-zа-я0-9]+/gi, "-")
          .replace(/(^-|-$)/g, ""),
      })),
    [],
  );

  const navigationChips = useMemo(
    () => [...heroChips, { href: "#manufacturers", label: "Производители" }],
    [],
  );

  const manufacturerViewportRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const productViewportRef = useRef<HTMLDivElement | null>(null);
  const [canScrollProductPrev, setCanScrollProductPrev] = useState(false);
  const [canScrollProductNext, setCanScrollProductNext] = useState(false);

  const triggerPrefill = useCallback((nextProduct = "", nextUsecase = "") => {
    if (nextProduct) {
      setProduct(nextProduct);
    }
    if (nextUsecase) {
      setUsecase(nextUsecase);
    }
    setPrefillSignal((current) => current + 1);
  }, []);

  const updateManufacturerControls = useCallback(() => {
    const viewport = manufacturerViewportRef.current;
    if (!viewport) return;

    const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    setCanScrollPrev(viewport.scrollLeft > 4);
    setCanScrollNext(viewport.scrollLeft < maxScrollLeft - 4);
  }, []);

  const scrollManufacturers = useCallback(
    (direction: 1 | -1) => {
      const viewport = manufacturerViewportRef.current;
      if (!viewport) return;

      const firstCard = viewport.querySelector<HTMLElement>("[data-manufacturer-card='true']");
      const style = window.getComputedStyle(firstCard?.parentElement ?? viewport);
      const gap = Number.parseFloat(style.columnGap || style.gap || "0");
      const step =
        (firstCard?.getBoundingClientRect().width ?? viewport.clientWidth) + (Number.isNaN(gap) ? 0 : gap);

      viewport.scrollBy({
        left: direction * step,
        behavior: "smooth",
      });
    },
    [],
  );

  const updateProductControls = useCallback(() => {
    const viewport = productViewportRef.current;
    if (!viewport) return;

    const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    setCanScrollProductPrev(viewport.scrollLeft > 4);
    setCanScrollProductNext(viewport.scrollLeft < maxScrollLeft - 4);
  }, []);

  const scrollProducts = useCallback(
    (direction: 1 | -1) => {
      const viewport = productViewportRef.current;
      if (!viewport) return;

      const firstCard = viewport.querySelector<HTMLElement>("[data-product-card='true']");
      const style = window.getComputedStyle(firstCard?.parentElement ?? viewport);
      const gap = Number.parseFloat(style.columnGap || style.gap || "0");
      const step =
        (firstCard?.getBoundingClientRect().width ?? viewport.clientWidth) + (Number.isNaN(gap) ? 0 : gap);

      viewport.scrollBy({
        left: direction * step,
        behavior: "smooth",
      });
    },
    [],
  );

  useEffect(() => {
    const viewport = manufacturerViewportRef.current;
    if (!viewport) return;

    updateManufacturerControls();
    viewport.addEventListener("scroll", updateManufacturerControls, { passive: true });
    window.addEventListener("resize", updateManufacturerControls);

    return () => {
      viewport.removeEventListener("scroll", updateManufacturerControls);
      window.removeEventListener("resize", updateManufacturerControls);
    };
  }, [updateManufacturerControls]);

  useEffect(() => {
    const viewport = productViewportRef.current;
    if (!viewport) return;

    updateProductControls();
    viewport.addEventListener("scroll", updateProductControls, { passive: true });
    window.addEventListener("resize", updateProductControls);

    return () => {
      viewport.removeEventListener("scroll", updateProductControls);
      window.removeEventListener("resize", updateProductControls);
    };
  }, [updateProductControls]);

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        {breadcrumbs.map((item, index) => (
          <span key={item.label} className={styles.breadcrumbItem}>
            {index < breadcrumbs.length - 1 ? <a href={item.href}>{item.label}</a> : <span>{item.label}</span>}
            {index < breadcrumbs.length - 1 ? <span aria-hidden="true">/</span> : null}
          </span>
        ))}
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.kicker}>HVAC / Cu-Al finned coils</p>
          <h1>
            <span className={styles.h1Line1}>Медно-алюминиевые теплообменники</span>
            <span className={styles.h1Line2}>Проектирование, производство и поставка</span>
          </h1>
          <p className={styles.lead}>
            Cu-Al оребрённые секции под вашу задачу: расчёт по воздуху, воде и хладагенту, производство/OEM и поставка с документами.
          </p>

          <div className={styles.actions}>
            <a className={`${styles.btn} ${styles.btnPrimary}`} href="#request">
              Рассчитать и подобрать
            </a>
            <a className={`${styles.btn} ${styles.btnOutline}`} href="#request">
              Запросить КП / тендерный пакет
            </a>
          </div>

          <nav className={styles.chips} aria-label="Навигация по странице">
            {navigationChips.map((chip) => (
              <a key={chip.href} href={chip.href}>
                {chip.label}
              </a>
            ))}
          </nav>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.heroVisualCard}>
            <span className={styles.heroVisualBadge}>Схема/фото в подготовке</span>
            <strong>Cu-Al секции для HVAC</strong>
            <p>
              Подбор под вентиляцию, холод и OEM-задачи без привязки к одному каталожному типоразмеру.
            </p>
            <ul className={styles.heroVisualList}>
              <li>Вода, гликоль и DX-режимы</li>
              <li>Retrofit и замена по образцу</li>
              <li>Документы, КП и тендерный пакет</li>
            </ul>
          </div>
        </div>
      </section>

      <CuAlRfqConfigurator
        prefillProductSlug={product}
        prefillUsecaseSlug={usecase}
        prefillSignal={prefillSignal}
      />

      <section className={styles.trustGrid} aria-labelledby="trust-pack-title">
        <article className={styles.card}>
          <h2 id="trust-pack-title">Документы и качество</h2>
          <ul>
            {documentSignals.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className={styles.card}>
          <h2>Как работаем</h2>
          <ol className={styles.processList}>
            {processSteps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </article>
      </section>

      <section className={styles.threeCards}>
        <article className={styles.card}>
          <h2>Что поставляем и делаем</h2>
          <ul>
            <li>Проектирование и расчёт Cu-Al секций по режимам и ограничениям проекта.</li>
            <li>Изготовление секций под габарит, присоединения и нужное покрытие.</li>
            <li>OEM и контрактное производство по запросу.</li>
            <li>Поставка: упаковка, логистика, документы и тендерный комплект.</li>
            <li>Замена импортных секций и аналогов по образцу, фото или шильдику.</li>
          </ul>
        </article>

        <article className={styles.card}>
          <h2>Какие изделия закрываем</h2>
          <ul className={styles.twoColumns}>
            <li>Калорифер / водяной нагреватель</li>
            <li>Воздухоохладитель / водяной или гликолевый охладитель</li>
            <li>DX-испаритель (фреоновый испаритель)</li>
            <li>Воздушный конденсатор</li>
            <li>Dry cooler / сухой охладитель</li>
            <li>Гликолевые секции рекуперации</li>
            <li>Секции для руфтопов, ККБ и кондиционеров</li>
            <li>Радиаторные и OEM-секции по ТЗ</li>
          </ul>
        </article>

        <article className={styles.card}>
          <h2>Почему доверяют подбор</h2>
          <ul>
            <li>Смотрим не только на размер, а на режим, ΔP, влажность и риск обмерзания.</li>
            <li>Подбираем шаг ламели, рядность, контуры и покрытие под среду.</li>
            <li>Учитываем сроки, документы и альтернативы по поставке.</li>
            <li>Готовим чертежи, паспорт, маркировку и подтверждение испытаний.</li>
          </ul>
        </article>
      </section>

      <section className={styles.splitSection}>
        <article className={styles.card}>
          <h2>Как инженеры подбирают Cu-Al секцию</h2>
          <h3>Что считаем в первую очередь</h3>
          <ul>
            <li>Теплопроизводительность или холодопроизводительность.</li>
            <li>Воздушный расход, скорость на лице и допустимый ΔP.</li>
            <li>Температуру, влажность, риск конденсации и обледенения.</li>
            <li>Рядность, шаг ламели, диаметр трубы и схему контуров.</li>
            <li>Дренаж, каплеуловители и исполнение под условия эксплуатации.</li>
          </ul>
        </article>

        <article className={styles.card}>
          <h2>Частые ошибки</h2>
          <ul>
            <li>Подбор только по габариту без режима и допустимого сопротивления.</li>
            <li>Игнорирование влажности и точки росы при охлаждении.</li>
            <li>Попытка использовать Cu-Al без покрытия в агрессивной среде.</li>
            <li>Ожидание точной цены без данных по документам и сроку поставки.</li>
          </ul>
        </article>
      </section>

      <section id="manufacturers" className={styles.section}>
        <div className={styles.sectionHeadingRow}>
          <div className={styles.sectionTitleGroup}>
            <span className={styles.sectionChip}>Производители и поставщики</span>
            <h2>Производители и поставщики для Cu-Al / HVAC</h2>
          </div>

          <div className={styles.manufacturerHeaderActions}>
            <div className={styles.manufacturerControls} role="group" aria-label="Управление списком производителей">
              <button
                type="button"
                className={`${styles.manufacturerArrow} ${!canScrollPrev ? styles.manufacturerArrowDisabled : ""}`}
                aria-label="Предыдущие производители"
                onClick={() => scrollManufacturers(-1)}
                disabled={!canScrollPrev}
              >
                ←
              </button>
              <button
                type="button"
                className={`${styles.manufacturerArrow} ${!canScrollNext ? styles.manufacturerArrowDisabled : ""}`}
                aria-label="Следующие производители"
                onClick={() => scrollManufacturers(1)}
                disabled={!canScrollNext}
              >
                →
              </button>
            </div>

            <a className={styles.showAllLink} href="/wikimarket/hvac/copper-aluminum-heat-exchangers/manufacturers">
              Посмотреть всех
            </a>
          </div>
        </div>

        <div className={styles.manufacturerViewport} ref={manufacturerViewportRef}>
          <div className={styles.manufacturerTrack}>
            {cuAlManufacturerCards.map((company) => {
              const capabilities = getDisplayCapabilities(company);
              const miniFacts = getCardMiniFacts(company);
              const trustEvidence = getTrustEvidence(company);
              const hasRatedState = hasRatedReviews(company);

              return (
                <article
                  key={company.id}
                  data-manufacturer-card="true"
                  className={`${styles.card} ${styles.manufacturerCard} ${styles.manufacturerSlide}`}
                >
                  <a className={styles.manufacturerImageWrap} href={company.profileUrl}>
                    <img
                      className={styles.manufacturerImage}
                      src={DEFAULT_MANUFACTURER_CARD_IMAGE}
                      alt={DEFAULT_MANUFACTURER_CARD_IMAGE_ALT}
                    />
                  </a>

                  <div className={styles.manufacturerContent}>
                    <div className={styles.manufacturerBadges}>
                      <span className={`${styles.badge} ${styles.badgeRole}`}>
                        {getCompanyRoleLabel(company.companyRole)}
                      </span>
                      {company.isVerified ? (
                        <span
                          className={`${styles.badge} ${styles.badgeTrust}`}
                          title={getVerificationHint(company)}
                        >
                          Проверен
                        </span>
                      ) : null}
                    </div>

                    <h3 className={styles.manufacturerTitle}>
                      <a href={company.profileUrl}>{company.cardTitle}</a>
                    </h3>

                    <p className={styles.manufacturerDescription}>{company.shortDescription}</p>
                    <p className={styles.manufacturerRelevance}>{company.categoryRelevanceLabel}</p>
                    <p className={`${styles.manufacturerRating} ${hasRatedState ? styles.manufacturerRatingRated : ""}`}>
                      {getRatingLabel(company)}
                    </p>
                    <p className={styles.manufacturerGeo}>{getCompanyLocationLabel(company)}</p>

                    <ul className={styles.manufacturerCapabilities}>
                      {capabilities.map((capability) => (
                        <li key={`${company.id}-${capability}`}>{capability}</li>
                      ))}
                    </ul>

                    {trustEvidence.length > 0 ? (
                      <ul className={styles.manufacturerTrust}>
                        {trustEvidence.map((fact) => (
                          <li key={`${company.id}-trust-${fact}`}>{fact}</li>
                        ))}
                      </ul>
                    ) : null}

                    {miniFacts.length > 0 ? (
                      <ul className={styles.manufacturerFacts}>
                        {miniFacts.map((fact) => (
                          <li key={`${company.id}-fact-${fact}`}>{fact}</li>
                        ))}
                      </ul>
                    ) : null}

                    <div className={styles.actions}>
                      <a className={`${styles.btn} ${styles.btnPrimary}`} href={company.primaryCtaUrl}>
                        {company.primaryCtaLabel}
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="products" className={styles.section}>
        <div className={styles.sectionHeadingRow}>
          <div className={styles.sectionTitleGroup}>
            <span className={styles.sectionChip}>Изделия по назначению</span>
            <h2>Основные типы Cu-Al секций</h2>
          </div>

          <div className={styles.productHeaderActions}>
            <div className={styles.productControls} role="group" aria-label="Управление списком изделий">
              <button
                type="button"
                className={`${styles.productArrow} ${!canScrollProductPrev ? styles.productArrowDisabled : ""}`}
                aria-label="Предыдущие изделия"
                onClick={() => scrollProducts(-1)}
                disabled={!canScrollProductPrev}
              >
                ←
              </button>
              <button
                type="button"
                className={`${styles.productArrow} ${!canScrollProductNext ? styles.productArrowDisabled : ""}`}
                aria-label="Следующие изделия"
                onClick={() => scrollProducts(1)}
                disabled={!canScrollProductNext}
              >
                →
              </button>
            </div>
          </div>
        </div>

        <div className={styles.productViewport} ref={productViewportRef}>
          <div className={styles.productTrack}>
            {productItems.map((item) => (
              <article
                key={item.slug}
                data-product-card="true"
                className={`${styles.card} ${styles.productSlideCard} ${styles.productSlide}`}
              >
                <div className={styles.productImageWrap}>
                  <div className={styles.productImagePlaceholder}>
                    <span className={styles.productImageBadge}>Схема/фото скоро</span>
                    <strong>{item.placeholderLabel}</strong>
                  </div>
                </div>
                <p className={styles.productQuickStat}>{item.quickStat}</p>
                <h3>{item.title}</h3>
                <p>{item.whereUsed}</p>
                <p>{item.whereUsedExtra}</p>

                <ul>
                  {item.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>

                <div className={styles.actions}>
                  <a className={`${styles.btn} ${styles.btnOutline}`} href={`#product-${item.slug}`}>
                    Подробнее
                  </a>
                  <a
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    href="#request"
                    onClick={() => triggerPrefill(item.slug)}
                  >
                    Рассчитать/КП
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="product-details-title">
        <div className={styles.sectionTitleGroup}>
          <span className={styles.sectionChip}>Подробно по изделиям</span>
          <h2 id="product-details-title">Что важно проверить по каждому типу секции</h2>
        </div>

        <div className={styles.productDetailsList}>
          {productItems.map((item) => (
            <article key={item.slug} id={`product-${item.slug}`} className={styles.card}>
              <h3>{item.title}</h3>

              <div className={styles.detailsGrid}>
                <div>
                  <h4>Где применяется</h4>
                  <ul>
                    {item.applied.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4>Ключевые параметры</h4>
                  <ul>
                    {item.keyParams.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4>Ограничения и важные нюансы</h4>
                  <ul>
                    {item.limits.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4>Какие данные нужны</h4>
                  <ul>
                    {item.inputData.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={styles.actions}>
                <a className={`${styles.btn} ${styles.btnOutline}`} href="#products">
                  Назад к изделиям
                </a>
                <a className={`${styles.btn} ${styles.btnPrimary}`} href="#request" onClick={() => triggerPrefill(item.slug)}>
                  Перейти к заявке по этому изделию
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="usecases" className={styles.section}>
        <h2>Где применяются Cu-Al теплообменники</h2>

        <div className={styles.usecaseGrid}>
          {useCaseSlugs.map((item) => (
            <a
              key={item.slug}
              href="#request"
              className={styles.usecaseLink}
              onClick={() => triggerPrefill("", item.slug)}
            >
              {item.label}
            </a>
          ))}
        </div>
      </section>

      <section id="materials" className={styles.section}>
        <h2>Материалы и покрытия</h2>

        <div className={styles.splitSection}>
          <article className={styles.card}>
            <h3>Базовая конструкция Cu-Al</h3>
            <ul>
              <li>Трубки: медь с вариантами диаметров 7 / 9.52 / 12.7 мм.</li>
              <li>Ламели: алюминий, гладкая, рифлёная или жалюзийная геометрия.</li>
              <li>Коллекторы и распределители: медь или латунь, варианты присоединений.</li>
              <li>Рама: оцинкованная сталь, нержавеющая сталь или алюминий.</li>
            </ul>
          </article>

          <article className={styles.card}>
            <h3>Покрытия и защита</h3>
            <ul>
              <li>Гидрофильное покрытие для конденсата и дренажа.</li>
              <li>Эпоксидное и полиуретановое покрытие для защиты от коррозии.</li>
              <li>Прибрежное и морское исполнение по условиям среды.</li>
              <li>Антибактериальные и специальные покрытия по запросу.</li>
            </ul>
            <p>Подбор покрытия зависит от среды, расположения, загрязнения и уровня агрессивности.</p>
          </article>
        </div>
      </section>

      <section id="tech" className={styles.section}>
        <h2>Технические параметры, которые мы конфигурируем</h2>

        <article className={styles.card}>
          <ul className={styles.twoColumns}>
            <li>Габарит, посадочные размеры и глубина секции.</li>
            <li>Рядность, количество контуров и схема циркуляции.</li>
            <li>Шаг ламели, толщина ламели и геометрия оребрения.</li>
            <li>Диаметр труб, шаг труб и расположение коллекторов.</li>
            <li>Тип присоединения, сторона подключения и сервисный доступ.</li>
            <li>Дренаж, каплеуловитель и ограничения по шуму/ΔP.</li>
            <li>Рабочие давления по воде, гликолю или хладагенту.</li>
            <li>Требования к документам, маркировке и испытаниям.</li>
          </ul>
        </article>
      </section>

      <section id="inputs" className={styles.section}>
        <h2>Какие данные помогают быстрее получить точный подбор</h2>

        <div className={styles.productGrid}>
          {[
            ["Расход воздуха и допустимый ΔP по воздуху", "Помогает не перегрузить вентилятор и правильно подобрать фронт секции."],
            ["Температуры воздуха и влажность", "Нужны для расчёта конденсации, точки росы и риска обмерзания."],
            ["Среда внутри секции", "Вода, гликоль или хладагент влияют на схему и тип расчёта."],
            ["Температуры и расходы воды/гликоля или режимы DX", "Дают корректный тепловой баланс и точнее определяют конструкцию."],
            ["Ограничения по габаритам и посадке", "Нужны, чтобы секция встала на место без переделки корпуса."],
            ["Требования к покрытию и среде", "Помогают выбрать защиту от коррозии и срок службы."],
            ["Требования к документам", "Влияют на комплектность КП, тендерный пакет и сроки согласования."],
          ].map(([title, note]) => (
            <article key={title} className={styles.card}>
              <h3>{title}</h3>
              <p>{note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>Ориентиры цены</h2>

        <div className={styles.card}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Изделие</th>
                  <th>Что сильнее всего влияет на стоимость</th>
                </tr>
              </thead>
              <tbody>
                {productItems.map((item) => (
                  <tr key={item.slug}>
                    <td>{item.title}</td>
                    <td>Рядность, площадь теплообмена, шаг ламели, покрытие, материалы рамы, срок и комплект документов.</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="faq" className={styles.section}>
        <h2>FAQ</h2>

        <div className={styles.productGrid}>
          {faqItems.map(([question, answer]) => (
            <article key={question} className={styles.card}>
              <h3>{question}</h3>
              <p>{answer}</p>
            </article>
          ))}
        </div>
      </section>

      <CuAlLocalContactsBlock />
    </div>
  );
}
