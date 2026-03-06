"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import ContactsCountryBlock from "../shared/ContactsCountryBlock";
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
  hasRatedReviews,
} from "./manufacturers";

export default function CuAlHeatExchangersPage() {
  const [product, setProduct] = useState("");
  const [usecase, setUsecase] = useState("");

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

  const manufacturerTrackRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateManufacturerControls = useCallback(() => {
    const track = manufacturerTrackRef.current;
    if (!track) return;

    const maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);
    setCanScrollPrev(track.scrollLeft > 4);
    setCanScrollNext(track.scrollLeft < maxScrollLeft - 4);
  }, []);

  const scrollManufacturers = useCallback(
    (direction: 1 | -1) => {
      const track = manufacturerTrackRef.current;
      if (!track) return;

      const firstCard = track.querySelector<HTMLElement>("[data-manufacturer-card='true']");
      const style = window.getComputedStyle(track);
      const gap = Number.parseFloat(style.columnGap || style.gap || "0");
      const step = (firstCard?.getBoundingClientRect().width ?? track.clientWidth) + (Number.isNaN(gap) ? 0 : gap);

      track.scrollBy({
        left: direction * step,
        behavior: "smooth",
      });
    },
    [],
  );

  useEffect(() => {
    const track = manufacturerTrackRef.current;
    if (!track) return;

    updateManufacturerControls();
    track.addEventListener("scroll", updateManufacturerControls, { passive: true });
    window.addEventListener("resize", updateManufacturerControls);

    return () => {
      track.removeEventListener("scroll", updateManufacturerControls);
      window.removeEventListener("resize", updateManufacturerControls);
    };
  }, [updateManufacturerControls]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.kicker}>HVAC / Cu-Al finned coils</p>
          <h1>
            <span className={styles.h1Line1}>Медно-алюминиевые теплообменники</span>
            <span className={styles.h1Line2}>Проектирование, производство и поставка</span>
          </h1>
          <p className={styles.lead}>
            Cu-Al оребрённые секции под вашу задачу: расчёт по воздуху/воде/хладагенту, производство/OEM и
            поставка с документами.
          </p>

          <div className={styles.actions}>
            <a className={`${styles.btn} ${styles.btnPrimary}`} href="#request">
              Рассчитать и подобрать
            </a>
            <a className={`${styles.btn} ${styles.btnOutline}`} href="#request">
              Запросить КП / тендерный пакет
            </a>
          </div>

          <nav className={styles.chips}>
            {navigationChips.map((chip) => (
              <a key={chip.href} href={chip.href}>
                {chip.label}
              </a>
            ))}
          </nav>
        </div>

        <div className={styles.heroVisual}>
          <img
            src="/assets/media/heat-exchanger-hero.png"
            alt="Медно-алюминиевые оребрённые теплообменники для HVAC"
          />
        </div>
      </section>

      <section className={styles.threeCards}>
        <article className={styles.card}>
          <h2>Что поставляем/делаем</h2>
          <ul>
            <li>Проектирование и расчёт Cu-Al секций (airside + waterside/refrigerant side)</li>
            <li>Изготовление секций под габарит и присоединения</li>
            <li>OEM/контрактное производство (по запросу)</li>
            <li>Поставка: упаковка, логистика, документы</li>
            <li>Замена импортных секций/аналогов по образцу/шильдику</li>
          </ul>
        </article>

        <article className={styles.card}>
          <h2>Какие изделия (синонимы)</h2>
          <ul className={styles.twoColumns}>
            <li>Калорифер / воздухонагреватель / водяной нагреватель</li>
            <li>Воздухоохладитель / охладитель (водяной/гликолевый)</li>
            <li>DX-испаритель (фреоновый испаритель)</li>
            <li>Конденсатор воздушный</li>
            <li>Радиатор / секция / батарея (в тех. смысле)</li>
            <li>Сухой охладитель (Dry cooler) / теплообменная секция</li>
            <li>Гликолевые секции рекуперации (run-around coil)</li>
            <li>Секции для руфтопов / ККБ / кондиционеров / тепловых насосов</li>
          </ul>
        </article>

        <article className={styles.card}>
          <h2>Почему доверяют</h2>
          <ul>
            <li>Расчёт не “по размеру”, а по режимам + ΔP + влажности/обледенению</li>
            <li>Подбор шага ламели/рядности/контуров</li>
            <li>Антикоррозионные покрытия (прибрежные/агрессивные среды)</li>
            <li>Чертежи/паспорт/опрессовка/маркировка</li>
            <li>Сроки и альтернативы (быстро со склада / под заказ)</li>
          </ul>
        </article>
      </section>

      <section className={styles.splitSection}>
        <article className={styles.card}>
          <h2>Как инженеры подбирают Cu-Al секцию</h2>
          <h3>Что считаем</h3>
          <ul>
            <li>Теплопроизводительность/холодопроизводительность</li>
            <li>Воздушный расход, скорости на “лице”, температура/влажность</li>
            <li>ΔP по воздуху (аэродинамика) и по воде/гликолю/хладагенту</li>
            <li>Рядность, шаг ламели (FPI), диаметр трубы (7 / 9.52 / 12.7)</li>
            <li>Риск обмерзания / конденсации, дренаж, каплеуловители (если нужно)</li>
          </ul>
        </article>

        <article className={styles.card}>
          <h2 className={styles.hiddenTitle}>Частые ошибки</h2>
          <h3>Частые ошибки</h3>
          <ul>
            <li>“Поставим любую секцию того же размера”</li>
            <li>“ΔP не важен”</li>
            <li>“Шаг ламели не влияет”</li>
            <li>“Можно без данных по влажности/точке росы”</li>
            <li>“Cu-Al подходит для любых агрессивных сред без покрытия”</li>
          </ul>
        </article>
      </section>

      <section id="manufacturers" className={styles.section}>
        <div className={styles.sectionHeadingRow}>
          <h2>Производители для Cu-Al / HVAC</h2>

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

        <div className={styles.manufacturerViewport}>
          <div className={styles.manufacturerTrack} ref={manufacturerTrackRef}>
            {cuAlManufacturerCards.map((company) => {
              const capabilities = getDisplayCapabilities(company);
              const miniFacts = getCardMiniFacts(company);
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
                        <span className={`${styles.badge} ${styles.badgeTrust}`}>Проверен</span>
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
        <h2>Изделия (по назначению)</h2>

        <div className={styles.productGrid}>
          {productItems.map((item) => (
            <article key={item.slug} className={styles.card}>
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
                  onClick={() => setProduct(item.slug)}
                >
                  Рассчитать/КП
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {productItems.map((item) => (
        <section key={item.slug} id={`product-${item.slug}`} className={styles.section}>
          <article className={styles.card}>
            <h2>{item.title}</h2>

            <div className={styles.detailsGrid}>
              <div>
                <h3>Где применяется</h3>
                <ul>{item.applied.map((point) => <li key={point}>{point}</li>)}</ul>
              </div>
              <div>
                <h3>Ключевые параметры</h3>
                <ul>{item.keyParams.map((point) => <li key={point}>{point}</li>)}</ul>
              </div>
              <div>
                <h3>Ограничения/важные нюансы</h3>
                <ul>{item.limits.map((point) => <li key={point}>{point}</li>)}</ul>
              </div>
              <div>
                <h3>Какие данные нужны</h3>
                <ul>{item.inputData.map((point) => <li key={point}>{point}</li>)}</ul>
              </div>
            </div>

            <a className={`${styles.btn} ${styles.btnPrimary}`} href="#request" onClick={() => setProduct(item.slug)}>
              Перейти к заявке по этому изделию
            </a>
          </article>
        </section>
      ))}

      <section id="usecases" className={styles.section}>
        <h2>Где применяются</h2>

        <div className={styles.usecaseGrid}>
          {useCaseSlugs.map((item) => (
            <a
              key={item.slug}
              href="#request"
              className={styles.usecaseLink}
              onClick={() => setUsecase(item.slug)}
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
              <li>Трубки: медь (варианты диаметров 7/9.52/12.7), пайка/соединения</li>
              <li>Ламели: алюминий (гладкая/рифлёная/жалюзийная)</li>
              <li>Коллекторы/распределители: медь/латунь, варианты присоединений</li>
              <li>Рама/корпус: оцинкованная сталь / нерж / алюминий (по среде)</li>
            </ul>
          </article>

          <article className={styles.card}>
            <h3>Покрытия/защита (актуально для HVAC)</h3>
            <ul>
              <li>Гидрофильное покрытие (для конденсата/дренажа)</li>
              <li>Эпоксидное/полиуретановое покрытие (коррозионная защита)</li>
              <li>Прибрежное/морское исполнение (усиленная защита, по запросу)</li>
              <li>Антибактериальные/спецпокрытия (по запросу)</li>
            </ul>
            <p>Подбор покрытия зависит от среды, расположения и уровня агрессивности.</p>
          </article>
        </div>
      </section>

      <section id="tech" className={styles.section}>
        <h2>Технические параметры, которые мы конфигурируем</h2>

        <article className={styles.card}>
          <ul className={styles.twoColumns}>
            <li>Габарит (ширина/высота/глубина), посадочные размеры</li>
            <li>Рядность (кол-во рядов), количество контуров</li>
            <li>Шаг ламели (FPI/мм), толщина ламели</li>
            <li>Диаметр труб, шаг труб</li>
            <li>Тип присоединений (резьба/пайка/фланец), сторона подключения</li>
            <li>Дренаж/каплеуловитель (если нужно)</li>
            <li>Рабочие давления по воде/гликолю/хладагенту (по задаче)</li>
            <li>Требования по шуму/ΔP по воздуху</li>
          </ul>
        </article>
      </section>

      <section id="inputs" className={styles.section}>
        <h2>Данные для расчёта — и зачем</h2>

        <div className={styles.productGrid}>
          {[
            ["Воздушный расход (м3/ч) и допустимый ΔP по воздуху", "Чтобы не “задушить” вентилятор"],
            ["Температуры воздуха (вход/выход) + влажность/точка росы", "Чтобы учесть конденсат/обледенение"],
            ["Среда внутри: вода/гликоль/хладагент (марка)", "Выбор схемы и расчёта"],
            ["Температуры/расходы воды/гликоля или режимы DX", "Точный теплобаланс"],
            ["Ограничения по габаритам/посадке", "Чтобы “встало на место”"],
            ["Требования к покрытию/коррозии", "Правильная защита"],
            ["Документы/требования тендера", "Комплектность КП"],
          ].map(([title, note]) => (
            <article key={title} className={styles.card}>
              <h3>{title}</h3>
              <p>{note}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="request" className={styles.section}>
        <h2>Заявка на расчёт / КП</h2>

        <form className={`${styles.card} ${styles.form}`} onSubmit={handleSubmit}>
          <input type="hidden" name="service" value="cu-al-design-production-supply" />
          <input type="hidden" name="product" value={product} />
          <input type="hidden" name="usecase" value={usecase} />

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Имя</span>
              <input className={styles.input} name="name" type="text" required />
            </label>
            <label className={styles.field}>
              <span>Компания</span>
              <input className={styles.input} name="company" type="text" />
            </label>
            <label className={styles.field}>
              <span>Телефон/WhatsApp</span>
              <input className={styles.input} name="phone" type="text" required />
            </label>
            <label className={styles.field}>
              <span>Email</span>
              <input className={styles.input} name="email" type="email" required />
            </label>
          </div>

          <label className={styles.field}>
            <span>Коротко задача</span>
            <textarea className={styles.textarea} name="task" rows={4} required />
          </label>

          <p className={styles.note}>
            Можно прикрепить фото/чертёж/шильдик — если upload недоступен, пришлите материалы в WhatsApp.
          </p>

          <button className={`${styles.btn} ${styles.btnPrimary}`} type="submit">
            Отправить заявку
          </button>
        </form>
      </section>

      <section className={styles.section}>
        <h2>Ориентиры цен (аккуратно)</h2>

        <div className={styles.card}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Изделие</th>
                <th>На что влияет цена</th>
              </tr>
            </thead>
            <tbody>
              {productItems.map((item) => (
                <tr key={item.slug}>
                  <td>{item.title}</td>
                  <td>Рядность + площадь, шаг ламели/покрытие, материалы рамы, срочность, документы/испытания.</td>
                </tr>
              ))}
            </tbody>
          </table>
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

      <ContactsCountryBlock sectionClassName={styles.sharedContacts} />

    </main>
  );
}
