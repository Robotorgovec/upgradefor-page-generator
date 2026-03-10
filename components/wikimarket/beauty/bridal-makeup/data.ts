export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type TocItem = {
  href: string;
  label: string;
};

export type HeroBadge = {
  label: string;
};

export type HeroPoint = {
  title: string;
  text: string;
};

export type HeroTrustItem = {
  label: string;
};

export type HeroCta = {
  label: string;
  href: string;
};

export type SelectorOption = {
  id: string;
  label: string;
};

export type SelectorCategory = {
  id: string;
  title: string;
  options: SelectorOption[];
};

export type RecommendationCard = {
  id: string;
  title: string;
  suitedFor: string;
  effect: string;
  whenToChoose: string;
  ctaLabel: string;
  ctaHref: string;
  tags: string[];
};

export type ScenarioItem = {
  id: string;
  title: string;
  note: string;
  ctaLabel: string;
  ctaHref: string;
};

export type PerformerTag =
  | "visit"
  | "trial"
  | "budget"
  | "premium"
  | "airbrush"
  | "sensitive-skin"
  | "early-start";

export type PerformerFilter = {
  id: "all" | PerformerTag;
  label: string;
};

export type PerformerCard = {
  id: string;
  displayName: string;
  cityLabel: string;
  workFormat: string;
  specialization: string;
  serviceModes: string;
  trialLabel: string;
  priceFromLabel: string;
  responseTimeLabel: string;
  availabilityLabel: string;
  strengths: string[];
  ctaLabel: string;
  ctaHref: string;
  tags: PerformerTag[];
  premiumLabel?: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type RelatedPage = {
  title: string;
  href: string;
  note: string;
};

export type PricingColumn = {
  title: string;
  items: string[];
};

export type ProcessStep = {
  title: string;
  text: string;
};

export const bridalMakeupPageData = {
  pageMeta: {
    title: "Свадебный макияж: лучший выбор образа и визажиста | WikiMarket",
    description:
      "Свадебный макияж на WikiMarket: подберите стиль под тип кожи, формат съемки и тайминг дня, сравните визажистов и оставьте заявку.",
    canonicalPath: "/wikimarket/beauty/bridal-makeup",
    h1: "Свадебный макияж: лучший выбор",
  },
  breadcrumbs: [
    { label: "Главная", href: "/" },
    { label: "WikiMarket", href: "/wikimarket/categories" },
    { label: "Красота", href: "/wikimarket/categories" },
    { label: "Свадебный макияж" },
  ] satisfies BreadcrumbItem[],
  hero: {
    title: "Свадебный макияж: лучший выбор",
    subtitle:
      "Подберите makeup-сценарий под тип кожи, платье, свет и длительность дня, а затем выберите визажиста с подходящим форматом работы.",
    badges: [
      { label: "Стойкость 12+ часов" },
      { label: "Выезд и студия" },
      { label: "Пробный макияж" },
      { label: "Фото и видео-ready" },
    ] satisfies HeroBadge[],
    points: [
      {
        title: "Сначала параметры, потом стиль",
        text: "Выбирайте макияж по коже, погоде и съемке, а не по случайной картинке из соцсетей.",
      },
      {
        title: "Под платье и освещение",
        text: "Один и тот же макияж выглядит по-разному в зале, на улице и при вспышке.",
      },
      {
        title: "Прозрачная подготовка",
        text: "Понимайте заранее, что входит в услугу и за что возможны доплаты.",
      },
      {
        title: "Меньше стресса в день свадьбы",
        text: "Чек-листы и пробный образ снижают риск переделок в самый ответственный момент.",
      },
    ] satisfies HeroPoint[],
    trustStrip: [
      { label: "Без неподтвержденных рейтингов и отзывов" },
      { label: "Карточки готовы под live-данные платформы" },
      { label: "Чистая SEO-структура без скрытых блоков" },
    ] satisfies HeroTrustItem[],
    supportCard: {
      title: "Поможем собрать образ под ваш день",
      text: "С учетом типа кожи, локации, времени церемонии и задачи по стойкости.",
      microCtaLabel: "Начать подбор",
      microCtaHref: "#guided-selection",
    },
    primaryCta: { label: "Подобрать макияж", href: "#guided-selection" } satisfies HeroCta,
    secondaryCta: { label: "Сравнить визажистов", href: "#performers" } satisfies HeroCta,
  },
  quickAnswer: {
    title: "Короткий ответ за 15 секунд",
    bullets: [
      "Лучший свадебный макияж всегда привязан к типу кожи и условиям съемки, а не только к тренду.",
      "Для жаркой погоды и длинного дня чаще выигрывают тонкие слои и матирующие точки контроля.",
      "Для сухой кожи важнее грамотная подготовка и эластичный финиш, чем плотное перекрытие.",
      "Пробный макияж особенно нужен при чувствительной коже и ранних сборах.",
      "Сценарий со вспышкой требует отдельной проверки оттенка тона и зоны под глазами.",
      "Четкий бриф с фото платья и референсами экономит время и снижает количество правок.",
    ],
  },
  toc: [
    { href: "#guided-selection", label: "Подобрать макияж" },
    { href: "#popular-styles", label: "Топ форматы макияжа" },
    { href: "#personal-scenarios", label: "Что выбрать именно вам" },
    { href: "#performers", label: "Визажисты" },
    { href: "#pricing", label: "Цена и состав услуги" },
    { href: "#process", label: "Как проходит заказ" },
    { href: "#prep", label: "Что подготовить заранее" },
    { href: "#faq", label: "FAQ" },
  ] satisfies TocItem[],
  selector: {
    title: "Подобрать свадебный макияж",
    text: "Отметьте параметры и получите самые релевантные сценарии для вашего дня.",
    categories: [
      {
        id: "skin-type",
        title: "Тип кожи",
        options: [
          { id: "dry", label: "Сухая" },
          { id: "normal", label: "Нормальная" },
          { id: "combination", label: "Комбинированная" },
          { id: "oily", label: "Жирная" },
          { id: "sensitive", label: "Чувствительная" },
        ],
      },
      {
        id: "coverage",
        title: "Плотность тона",
        options: [
          { id: "light", label: "Легкая" },
          { id: "medium", label: "Средняя" },
          { id: "full", label: "Плотная" },
        ],
      },
      {
        id: "finish",
        title: "Финиш",
        options: [
          { id: "natural", label: "Естественный" },
          { id: "glow", label: "Сияющий" },
          { id: "matte", label: "Матовый" },
        ],
      },
      {
        id: "ceremony-time",
        title: "Время церемонии",
        options: [
          { id: "early", label: "Раннее утро" },
          { id: "day", label: "Днем" },
          { id: "evening", label: "Вечером" },
        ],
      },
      {
        id: "venue",
        title: "Локация",
        options: [
          { id: "indoor", label: "В помещении" },
          { id: "outdoor", label: "На улице" },
          { id: "mixed", label: "Смешанный формат" },
        ],
      },
      {
        id: "photo-focus",
        title: "Тип съемки",
        options: [
          { id: "natural-photo", label: "Естественный свет" },
          { id: "flash-photo", label: "Со вспышкой" },
          { id: "video-priority", label: "Приоритет видео" },
        ],
      },
      {
        id: "dress-style",
        title: "Стиль платья",
        options: [
          { id: "classic", label: "Классика" },
          { id: "minimal", label: "Минимализм" },
          { id: "romantic", label: "Романтичный" },
          { id: "bold", label: "Акцентный" },
        ],
      },
      {
        id: "trial",
        title: "Пробный макияж",
        options: [
          { id: "trial-yes", label: "Нужен" },
          { id: "trial-no", label: "Без репетиции" },
        ],
      },
    ] satisfies SelectorCategory[],
    cta: {
      title: "Нужен персональный подбор?",
      text: "Отправьте параметры, и мы соберем shortlist визажистов и подходящих makeup-сценариев.",
      buttonLabel: "Подобрать свадебный макияж",
      href: "/account/register?intent=bridal-makeup",
    },
  },
  popularStyles: [
    {
      id: "soft-natural-glow",
      title: "Soft Natural Glow",
      suitedFor: "Дневные церемонии, романтичные платья, естественный свет, сухая и нормальная кожа.",
      effect: "Свежая кожа, мягкое свечение, аккуратный акцент на глазах без перегруза.",
      whenToChoose: "Если нужен аккуратный образ, который хорошо выглядит и вживую, и на фото.",
      ctaLabel: "Проверить сценарий для дня",
      ctaHref: "#personal-scenarios",
      tags: ["dry", "normal", "light", "natural", "glow", "day", "outdoor", "natural-photo", "romantic", "trial-no"],
    },
    {
      id: "soft-glam-balanced",
      title: "Soft Glam Balanced",
      suitedFor: "Смешанный формат локации, вечерний банкет, классический или минималистичный образ.",
      effect: "Баланс между выразительностью и натуральностью, без утяжеления кожи.",
      whenToChoose: "Когда нужен универсальный макияж на церемонию, фотосессию и вечер.",
      ctaLabel: "Сравнить с матовым вариантом",
      ctaHref: "#guided-selection",
      tags: ["combination", "medium", "natural", "matte", "day", "evening", "mixed", "video-priority", "classic", "minimal", "trial-yes"],
    },
    {
      id: "classic-matte-pro",
      title: "Classic Matte Pro",
      suitedFor: "Жирная и комбинированная кожа, длинная программа, яркий свет и вспышка.",
      effect: "Чистый тон, контроль блеска и стабильная картинка на протяжении всего дня.",
      whenToChoose: "Если главный приоритет - стойкость и предсказуемый результат на съемке.",
      ctaLabel: "Что учесть в жару",
      ctaHref: "#pricing",
      tags: ["oily", "combination", "medium", "full", "matte", "early", "day", "flash-photo", "indoor", "classic", "trial-yes"],
    },
    {
      id: "luminous-airbrush",
      title: "Luminous Airbrush",
      suitedFor: "Премиальные вечерние свадьбы, видео-съемка, задачи по идеальной текстуре кожи.",
      effect: "Ровный тон с тонким сиянием и высокой устойчивостью на HD-камере.",
      whenToChoose: "Если нужен эффект безупречной кожи с минимально заметными слоями.",
      ctaLabel: "Подобрать визажиста с аэрографом",
      ctaHref: "#performers",
      tags: ["normal", "combination", "medium", "glow", "evening", "indoor", "video-priority", "minimal", "bold", "trial-yes"],
    },
    {
      id: "evening-sculpted-glam",
      title: "Evening Sculpted Glam",
      suitedFor: "Вечерняя церемония, акцентное платье, съемка со вспышкой и контрастным светом.",
      effect: "Выразительный контур лица и глаз, глубокие тени, четкая читаемость в кадре.",
      whenToChoose: "Когда хочется яркий glam-образ и вы готовы к более акцентной подаче.",
      ctaLabel: "Сверить со стилистикой платья",
      ctaHref: "#popular-styles",
      tags: ["normal", "oily", "full", "matte", "evening", "indoor", "flash-photo", "bold", "trial-yes"],
    },
    {
      id: "sensitive-skin-minimal",
      title: "Sensitive Skin Minimal",
      suitedFor: "Чувствительная кожа, минималистичный образ, дневная церемония.",
      effect: "Деликатный ровный тон и спокойная цветовая палитра без агрессивных текстур.",
      whenToChoose: "Если важно снизить риск реакции и сохранить естественность лица.",
      ctaLabel: "Что спросить до бронирования",
      ctaHref: "#master-checklist",
      tags: ["sensitive", "light", "natural", "day", "outdoor", "natural-photo", "minimal", "trial-yes"],
    },
  ] satisfies RecommendationCard[],
  scenarios: [
    {
      id: "oily-skin",
      title: "Если кожа быстро блестит",
      note: "Делайте акцент на тонких слоях и матирующих точках контроля вместо плотной пудры по всему лицу.",
      ctaLabel: "Подобрать стойкий вариант",
      ctaHref: "#guided-selection",
    },
    {
      id: "dry-skin",
      title: "Если кожа сухая",
      note: "Ключ к красивому финишу - подготовка кожи и эластичные текстуры тона.",
      ctaLabel: "Сценарий для сухой кожи",
      ctaHref: "#guided-selection",
    },
    {
      id: "sensitive-skin",
      title: "Если кожа чувствительная",
      note: "Попросите визажиста заранее согласовать продукты и провести тест на реакцию.",
      ctaLabel: "Чек-лист для чувствительной кожи",
      ctaHref: "#master-checklist",
    },
    {
      id: "early-start",
      title: "Ранние сборы",
      note: "Нужен тайминг с запасом и понятный план мини-коррекции перед выездом.",
      ctaLabel: "Проверить план подготовки",
      ctaHref: "#process",
    },
    {
      id: "hot-weather",
      title: "Жара и влажность",
      note: "Приоритет - стойкость и контроль блеска, а не максимально сияющий финиш.",
      ctaLabel: "Что влияет на стойкость",
      ctaHref: "#pricing",
    },
    {
      id: "flash-shoot",
      title: "Съемка со вспышкой",
      note: "Проверьте тон и пудру на фото заранее, чтобы избежать эффекта белых зон.",
      ctaLabel: "Подготовка к съемке",
      ctaHref: "#prep",
    },
    {
      id: "video-priority",
      title: "Приоритет видео",
      note: "Лучше работают пластичные текстуры с аккуратной сатиновой посадкой.",
      ctaLabel: "Подобрать формат для видео",
      ctaHref: "#guided-selection",
    },
    {
      id: "minimal-look",
      title: "Минималистичный образ",
      note: "Ставьте акцент на чистой коже, аккуратном бровном рисунке и мягком тоне губ.",
      ctaLabel: "Выбрать natural-стиль",
      ctaHref: "#popular-styles",
    },
    {
      id: "bold-look",
      title: "Акцентный glam",
      note: "Сразу согласуйте глубину тона и интенсивность глаз, чтобы образ не спорил с платьем.",
      ctaLabel: "Сравнить glam-варианты",
      ctaHref: "#popular-styles",
    },
    {
      id: "all-day",
      title: "Нужна стойкость на весь день",
      note: "Уточните, входит ли touch-up набор или сопровождение после церемонии.",
      ctaLabel: "Что спросить визажиста",
      ctaHref: "#master-checklist",
    },
  ] satisfies ScenarioItem[],
  performersSection: {
    title: "Визажисты свадебного макияжа",
    subtitle:
      "Marketplace-структура карточек с полями под город, формат работы, специализацию и условия бронирования.",
    disclaimer:
      "Ниже демонстрационный формат профилей: без неподтвержденных рейтингов и отзывов. Live-данные подключаются из платформы.",
    filters: [
      { id: "all", label: "Все" },
      { id: "visit", label: "С выездом" },
      { id: "trial", label: "С репетицией" },
      { id: "budget", label: "Бюджетный сегмент" },
      { id: "premium", label: "Премиум" },
      { id: "airbrush", label: "С аэрографом" },
      { id: "sensitive-skin", label: "Для чувствительной кожи" },
      { id: "early-start", label: "На ранние сборы" },
    ] satisfies PerformerFilter[],
    performers: [
      {
        id: "makeup-artist-template-a",
        displayName: "Профиль визажиста A",
        cityLabel: "Город: указывается в анкете",
        workFormat: "Формат работы: частный визажист",
        specialization: "Специализация: natural и soft glam bridal",
        serviceModes: "Выезд / студия: оба формата",
        trialLabel: "Пробный макияж: доступен по запросу",
        priceFromLabel: "Ориентир по цене «от»: отображается после подключения данных",
        responseTimeLabel: "Время ответа: по данным профиля",
        availabilityLabel: "Доступность: календарь в профиле",
        strengths: [
          "Сильная диагностика типа кожи и условий дня",
          "Понятный бриф по референсам и цветовой гамме",
          "Аккуратная стойкость без перегруза текстурами",
        ],
        ctaLabel: "Открыть профиль",
        ctaHref: "/account/register?intent=bridal-makeup",
        tags: ["visit", "trial", "budget", "early-start"],
      },
      {
        id: "makeup-artist-template-b",
        displayName: "Профиль визажиста B",
        cityLabel: "Город: указывается в анкете",
        workFormat: "Формат работы: студия",
        specialization: "Специализация: airbrush и HD-макияж",
        serviceModes: "Выезд / студия: студия + выезд по договоренности",
        trialLabel: "Пробный макияж: обязателен перед подтверждением",
        priceFromLabel: "Ориентир по цене «от»: отображается после подключения данных",
        responseTimeLabel: "Время ответа: по данным профиля",
        availabilityLabel: "Доступность: календарь в профиле",
        strengths: [
          "Точный результат для фото и видео высокой четкости",
          "Сильная вечерняя и flash-ориентированная эстетика",
          "Продуманная схема закрепления на длинный день",
        ],
        ctaLabel: "Открыть профиль",
        ctaHref: "/account/register?intent=bridal-makeup",
        tags: ["premium", "airbrush", "trial"],
        premiumLabel: "Премиум-сегмент",
      },
      {
        id: "makeup-artist-template-c",
        displayName: "Профиль визажиста C",
        cityLabel: "Город: указывается в анкете",
        workFormat: "Формат работы: выездная команда",
        specialization: "Специализация: чувствительная кожа и ранние сборы",
        serviceModes: "Выезд / студия: приоритет выезда",
        trialLabel: "Пробный макияж: по запросу",
        priceFromLabel: "Ориентир по цене «от»: отображается после подключения данных",
        responseTimeLabel: "Время ответа: по данным профиля",
        availabilityLabel: "Доступность: календарь в профиле",
        strengths: [
          "Спокойный подход к чувствительной коже",
          "Резервный план под погоду и смену локации",
          "Сильная организация тайминга утренних сборов",
        ],
        ctaLabel: "Открыть профиль",
        ctaHref: "/account/register?intent=bridal-makeup",
        tags: ["visit", "sensitive-skin", "early-start", "budget"],
      },
    ] satisfies PerformerCard[],
    compareCta: {
      title: "Нужна помощь в сравнении визажистов?",
      text: "Соберем shortlist под дату, город, формат сборов и задачу по стойкости.",
      buttonLabel: "Сравнить визажистов",
      href: "/account/register?intent=bridal-makeup",
    },
  },
  chooseMasterChecklist: {
    title: "Как выбрать визажиста",
    subtitle: "Практический чек-лист до финального бронирования.",
    items: [
      "Уточните опыт мастера именно в свадебных сборах, а не только в вечернем макияже.",
      "Попросите план подготовки кожи и список продуктов под ваш тип.",
      "Согласуйте тайминг: старт, сборы, фотосессия, выезд на церемонию.",
      "Проверьте, как мастер решает задачу стойкости без эффекта маски.",
      "Обсудите условия touch-up или сопровождения в течение дня.",
    ],
  },
  bookingQuestions: {
    title: "Что спросить до бронирования",
    items: [
      "Какие этапы входят в пробный макияж и что фиксируется после него?",
      "Как мастер подбирает тон под естественный свет и вспышку?",
      "Есть ли отдельный сценарий для жары, влажности или ветра?",
      "Какие дополнительные расходы возможны в день свадьбы?",
    ],
  },
  photoChecklist: {
    title: "Какие материалы отправить заранее",
    items: [
      "Фото платья и аксессуаров при дневном свете",
      "2-4 референса с пометкой, что именно нравится",
      "Селфи без фильтров и плотного тона",
      "Примеры желаемой интенсивности макияжа",
    ],
  },
  trialChecklist: {
    title: "Что взять на пробный макияж",
    items: [
      "Фото платья, украшений и прически",
      "Список привычных или нежелательных продуктов",
      "План тайминга свадебного дня",
      "Контакты фотографа при нестандартных требованиях к съемке",
    ],
  },
  pricingSection: {
    title: "Цена, состав услуги и факторы выбора",
    subtitle:
      "Вместо абстрактных пакетов — понятная структура, чтобы заранее видеть бюджет и риски.",
    columns: [
      {
        title: "Что влияет на цену",
        items: [
          "Уровень сложности и плотность макияжа",
          "Необходимость пробного образа",
          "Ранний выезд и логистика",
          "Требования к стойкости и сопровождению",
        ],
      },
      {
        title: "Что обычно входит",
        items: [
          "Консультация по образу и референсам",
          "Подготовка кожи и выполнение макияжа",
          "Базовая фиксация под формат съемки",
          "Короткий бриф по мини-коррекции",
        ],
      },
      {
        title: "За что обычно доплачивают",
        items: [
          "Очень ранний старт до рассвета",
          "Дополнительный образ в тот же день",
          "Выезд в удаленную локацию",
          "Сопровождение после церемонии",
        ],
      },
    ] satisfies PricingColumn[],
    notes: [
      "Пробный макияж особенно полезен при чувствительной коже и сложном свете площадки.",
      "Стойкость зависит не только от фиксаторов, но и от подготовки кожи.",
      "Слишком плотный тон не всегда лучше: иногда он быстрее теряет аккуратность в течение дня.",
    ],
  },
  processSteps: [
    {
      title: "Вы описываете задачу и параметры дня",
      text: "Дата, город, формат съемки, локация и пожелания по образу.",
    },
    {
      title: "Получаете релевантных визажистов",
      text: "Подбор идет по параметрам, а не по случайной выдаче.",
    },
    {
      title: "Сравниваете условия и специализацию",
      text: "Проверяете формат работы, репетицию, логистику и стиль.",
    },
    {
      title: "Фиксируете репетицию и тайминг",
      text: "Согласовываете ключевые контрольные точки до дня свадьбы.",
    },
    {
      title: "Подтверждаете визажиста",
      text: "Остается финально сверить план сборов и материалы.",
    },
  ] satisfies ProcessStep[],
  prepChecklist: {
    title: "Что подготовить заранее",
    items: [
      "Фото платья и аксессуаров",
      "Референсы с указанием желаемой интенсивности",
      "Информация о типе и состоянии кожи",
      "Локация и условия освещения",
      "Тайминг свадебного дня",
      "Пожелания по стойкости и финишу",
      "Список продуктов, на которые была реакция",
    ],
  },
  faq: [
    {
      question: "Когда лучше бронировать свадебного визажиста?",
      answer:
        "Лучше фиксировать специалиста сразу после подтверждения даты и площадки, особенно в пиковый свадебный сезон.",
    },
    {
      question: "Пробный макияж обязателен?",
      answer:
        "Не всегда, но он сильно снижает риск в день свадьбы, особенно если есть чувствительность кожи или нестандартный свет площадки.",
    },
    {
      question: "Как выбрать между natural и glam?",
      answer:
        "Ориентируйтесь на стиль платья, формат съемки и то, как вы обычно ощущаете себя комфортно в макияже.",
    },
    {
      question: "Что лучше для съемки со вспышкой?",
      answer:
        "Нужен корректный подбор тона и умеренное количество светоотражающих текстур, чтобы избежать пересветов в кадре.",
    },
    {
      question: "Как повысить стойкость макияжа летом?",
      answer:
        "Работают тонкие слои, контроль блеска в Т-зоне и заранее согласованный план точечной коррекции.",
    },
    {
      question: "Подойдет ли плотный тон на весь день?",
      answer:
        "Не всегда. Для многих сценариев лучше средняя плотность с грамотной фиксацией, чтобы макияж оставался живым.",
    },
    {
      question: "Можно ли сделать макияж без сильного контуринга?",
      answer:
        "Да, и часто это выигрышно для дневных церемоний: мягкая пластика лица выглядит естественно и вживую, и в кадре.",
    },
    {
      question: "Что делать, если кожа реагирует на косметику?",
      answer:
        "Предупредите мастера заранее, предоставьте список реакций и по возможности проведите тест на пробном макияже.",
    },
    {
      question: "Нужен ли выезд визажиста?",
      answer:
        "Выезд полезен при плотном графике и удаленной площадке: он сокращает риски опозданий и лишних переездов.",
    },
    {
      question: "Какой макияж лучше для ранних сборов?",
      answer:
        "Сценарий с акцентом на стойкость и комфорт: важен четкий тайминг, умеренная плотность и запас времени на контроль.",
    },
  ] satisfies FaqItem[],
  ctaAfterSelection: {
    title: "Параметры готовы?",
    text: "Отправьте короткий бриф и получите подбор свадебного макияжа под ваш формат дня.",
    buttonLabel: "Подобрать образ",
    href: "/account/register?intent=bridal-makeup",
  },
  ctaAfterPerformers: {
    title: "Нужен shortlist визажистов?",
    text: "Соберем варианты под ваш бюджет, локацию и задачу по стойкости.",
    buttonLabel: "Сравнить визажистов",
    href: "/account/register?intent=bridal-makeup",
  },
  finalCta: {
    title: "Остался последний шаг",
    text: "Оставьте заявку и получите персональный подбор свадебного макияжа и исполнителя.",
    buttonLabel: "Оставить заявку",
    href: "/account/register?intent=bridal-makeup",
  },
  performerCta: {
    title: "Вы свадебный визажист?",
    text: "Подключите профиль в WikiMarket и получайте целевые bridal-запросы по вашему формату работы.",
    buttonLabel: "Стать исполнителем",
    href: "/account/register?role=performer",
  },
  relatedPages: [
    {
      title: "Свадебные прически",
      href: "/wikimarket/beauty/wedding-hairstyles",
      note: "Связанный интент для цельного bridal-образа в одном сценарии выбора.",
    },
    {
      title: "Пробный свадебный макияж",
      href: "/wikimarket/beauty/bridal-makeup-trial",
      note: "Отдельный сценарий про формат и цели репетиции образа.",
    },
    {
      title: "Свадебный макияж для фотосессии",
      href: "/wikimarket/beauty/bridal-makeup-photo",
      note: "Фокус на работе с естественным светом, вспышкой и видео.",
    },
    {
      title: "Макияж для чувствительной кожи",
      href: "/wikimarket/beauty/bridal-makeup-sensitive-skin",
      note: "Специализированный интент для деликатного и стойкого результата.",
    },
  ] satisfies RelatedPage[],
} as const;

export type BridalMakeupPageData = typeof bridalMakeupPageData;


