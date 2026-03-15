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
  | "early"
  | "long-hair"
  | "veil";

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

export const weddingHairstylesPageData = {
  pageMeta: {
    title: "Свадебные прически — подбор стиля и мастера | WikiMarket",
    description:
      "Свадебные прически на WikiMarket: быстро выберите стиль по параметрам, сравните исполнителей и оставьте заявку на подбор образа под платье и фату.",
    canonicalPath: "/wikimarket/beauty/wedding-hairstyles",
    h1: "Свадебные прически",
  },
  breadcrumbs: [
    { label: "Главная", href: "/" },
    { label: "WikiMarket", href: "/wikimarket/categories" },
    { label: "Красота", href: "/wikimarket/categories" },
    { label: "Свадебные прически" },
  ] satisfies BreadcrumbItem[],
  hero: {
    title: "Свадебные прически",
    subtitle:
      "Подбор стиля, выбор мастера, выезд, репетиция и заявка через WikiMarket в одном сценарии.",
    badges: [
      { label: "Выезд" },
      { label: "Репетиция" },
      { label: "На дом / в студии" },
      { label: "По образу / по параметрам" },
    ] satisfies HeroBadge[],
    points: [
      {
        title: "Выбор за 5 минут",
        text: "Сначала параметры, потом конкретные решения и исполнители.",
      },
      {
        title: "Под платье и фату",
        text: "Сравнивайте стили по совместимости с вырезом, аксессуарами и погодой.",
      },
      {
        title: "Упор на стойкость",
        text: "Отдельно оценивайте ранний выезд, жару, влажность и длинный тайминг дня.",
      },
      {
        title: "Прозрачный бриф",
        text: "Фиксируйте, что нужно уточнить до бронирования, без хаоса в чате.",
      },
    ] satisfies HeroPoint[],
    trustStrip: [
      { label: "Без неподтвержденных рейтингов и отзывов" },
      { label: "Карточки готовы под live-данные платформы" },
      { label: "SEO-индексируемая структура без скрытых JS-меню" },
    ] satisfies HeroTrustItem[],
    supportCard: {
      title: "Поможем подобрать стиль и мастера",
      text: "С учетом длины волос, фаты, платья и тайминга свадьбы.",
      microCtaLabel: "Начать подбор",
      microCtaHref: "#guided-selection",
    },
    primaryCta: { label: "Подобрать стиль", href: "#guided-selection" } satisfies HeroCta,
    secondaryCta: { label: "Найти мастера", href: "#performers" } satisfies HeroCta,
  },
  quickAnswer: {
    title: "Короткий ответ за 15 секунд",
    bullets: [
      "Сначала выберите конструкцию под длину волос и фату, потом декор.",
      "Для длинного дня чаще выигрывают собранные формы и контролируемый объем.",
      "Репетиция особенно важна при раннем выезде и сложном тайминге церемонии.",
      "Для лета и влажности заранее проверьте сценарий коррекции в течение дня.",
      "Лучший выбор мастера начинается с брифа, а не с одной референс-картинки.",
      "Фото платья, аксессуаров и сборов ускоряют согласование в 2-3 раза по ощущениям команды.",
    ],
  },
  toc: [
    { href: "#guided-selection", label: "Подобрать прическу" },
    { href: "#popular-styles", label: "Популярные стили" },
    { href: "#personal-scenarios", label: "Что выбрать именно вам" },
    { href: "#performers", label: "Исполнители" },
    { href: "#pricing", label: "Цена и условия" },
    { href: "#process", label: "Как проходит заказ" },
    { href: "#prep", label: "Что подготовить заранее" },
    { href: "#faq", label: "FAQ" },
  ] satisfies TocItem[],
  selector: {
    title: "Подобрать прическу",
    text: "Отметьте параметры и получите приоритетные стили для вашего сценария.",
    categories: [
      {
        id: "hair-length",
        title: "Длина волос",
        options: [
          { id: "short", label: "Короткие" },
          { id: "medium", label: "Средние" },
          { id: "long", label: "Длинные" },
        ],
      },
      {
        id: "face-shape",
        title: "Форма лица",
        options: [
          { id: "oval", label: "Овальная" },
          { id: "round", label: "Круглая" },
          { id: "angular", label: "Выраженные углы" },
        ],
      },
      {
        id: "veil",
        title: "Фата",
        options: [
          { id: "veil-yes", label: "Да, будет" },
          { id: "veil-no", label: "Без фаты" },
        ],
      },
      {
        id: "dress-style",
        title: "Стиль платья",
        options: [
          { id: "classic", label: "Классика" },
          { id: "minimal", label: "Минимализм" },
          { id: "romantic", label: "Романтичный" },
        ],
      },
      {
        id: "volume",
        title: "Желаемый объем",
        options: [
          { id: "soft", label: "Мягкий" },
          { id: "balanced", label: "Сбалансированный" },
          { id: "structured", label: "Собранный" },
        ],
      },
      {
        id: "prep-location",
        title: "Место сборов",
        options: [
          { id: "home", label: "На дому" },
          { id: "studio", label: "В студии" },
          { id: "venue", label: "На площадке" },
        ],
      },
      {
        id: "wedding-time",
        title: "Время свадьбы",
        options: [
          { id: "early", label: "Раннее утро" },
          { id: "day", label: "Днем" },
          { id: "evening", label: "Вечером" },
        ],
      },
      {
        id: "trial",
        title: "Пробный образ",
        options: [
          { id: "trial-yes", label: "Нужен" },
          { id: "trial-no", label: "Не нужен" },
        ],
      },
    ] satisfies SelectorCategory[],
    cta: {
      title: "Нужен подбор под платье и фату?",
      text: "Отправьте параметры, и мы соберем shortlist исполнителей под ваш сценарий дня.",
      buttonLabel: "Подобрать образ под платье и фату",
      href: "/account/register?intent=wedding-hairstyles",
    },
  },
  popularStyles: [
    {
      id: "low-bun",
      title: "Низкий пучок",
      suitedFor: "Фата, открытая спина, классические и минималистичные образы.",
      effect: "Собранный силуэт, чистый контур, устойчивость на длинный день.",
      whenToChoose: "Если нужен спокойный премиальный вид и надежная фиксация.",
      ctaLabel: "Смотреть сценарии",
      ctaHref: "#personal-scenarios",
      tags: ["medium", "long", "veil-yes", "classic", "structured", "early", "oval", "home", "trial-yes"],
    },
    {
      id: "hollywood-waves",
      title: "Голливудская волна",
      suitedFor: "Средняя/длинная длина, вечерний сценарий, лаконичное платье.",
      effect: "Блеск и графичная линия у лица, сильный фотогеничный эффект.",
      whenToChoose: "Если приоритет - выразительный образ и контролируемый климат локации.",
      ctaLabel: "Проверить стойкость",
      ctaHref: "#pricing",
      tags: ["medium", "long", "minimal", "soft", "evening", "oval", "studio", "trial-no"],
    },
    {
      id: "textured-updo",
      title: "Текстурная собранная прическа",
      suitedFor: "Средняя и длинная длина, платье со сложной фактурой, вечерняя церемония.",
      effect: "Выразительная форма без тяжелого глянца, визуальный объем в зоне макушки.",
      whenToChoose: "Когда нужен акцентный образ и баланс между стойкостью и мягкостью.",
      ctaLabel: "Сравнить с пучком",
      ctaHref: "#guided-selection",
      tags: ["medium", "long", "romantic", "structured", "evening", "angular", "studio", "trial-yes"],
    },
    {
      id: "high-bun",
      title: "Высокий пучок",
      suitedFor: "Платье с чистой линией плеч, выразительные серьги и церемония в плотном тайминге.",
      effect: "Лифтинг-силуэт, открытая шея и собранный премиальный контур.",
      whenToChoose: "Когда нужен элегантный образ с высокой посадкой и устойчивой фиксацией.",
      ctaLabel: "Проверить совместимость",
      ctaHref: "#guided-selection",
      tags: ["medium", "long", "classic", "minimal", "structured", "early", "evening", "oval", "studio", "trial-yes"],
    },
    {
      id: "boho-braid",
      title: "Бохо-коса",
      suitedFor: "Длинные волосы, outdoor-церемония, романтичный образ и живой декор.",
      effect: "Текстурный объем, мягкая динамика и заметная прическа без тяжести.",
      whenToChoose:
        "Если нужен расслабленный bridal-настрой с хорошей читаемостью на фото и в движении.",
      ctaLabel: "Сравнить с локонами",
      ctaHref: "#guided-selection",
      tags: ["long", "veil-no", "romantic", "balanced", "day", "round", "venue", "trial-yes"],
    },
    {
      id: "half-up-half-down-curls",
      title: "Half-up half-down локоны",
      suitedFor: "Средняя и длинная длина, украшение-гребень, мягкий bridal-образ и фата.",
      effect: "Открывает лицо, сохраняет длину и дает мягкий объем без жесткой архитектуры.",
      whenToChoose:
        "Когда нужен баланс между собранной линией у лица и свободной длиной по спине.",
      ctaLabel: "Сценарий под фату",
      ctaHref: "#personal-scenarios",
      tags: ["medium", "long", "veil-yes", "romantic", "soft", "day", "oval", "home", "trial-no"],
    },
  ] satisfies RecommendationCard[],
  scenarios: [
    {
      id: "short",
      title: "Короткие волосы",
      note: "Выбирайте текстуру и фиксируйте точку крепления аксессуаров заранее.",
      ctaLabel: "Сценарий для короткой длины",
      ctaHref: "#guided-selection",
    },
    {
      id: "medium",
      title: "Средняя длина",
      note: "Самый гибкий диапазон: и собранные формы, и мягкие волны.",
      ctaLabel: "Сценарий для средней длины",
      ctaHref: "#guided-selection",
    },
    {
      id: "long",
      title: "Длинные волосы",
      note: "Добавьте запас по времени на проработку формы и фиксацию.",
      ctaLabel: "Сценарий для длинных волос",
      ctaHref: "#guided-selection",
    },
    {
      id: "veil",
      title: "Если будет фата",
      note: "Ключевой вопрос — место крепления и баланс с объемом прически.",
      ctaLabel: "Проверить совместимость",
      ctaHref: "#popular-styles",
    },
    {
      id: "open-back",
      title: "Открытая спина / плечи",
      note: "Собранные силуэты чаще подчеркивают линию шеи и верх платья.",
      ctaLabel: "Смотреть собранные формы",
      ctaHref: "#popular-styles",
    },
    {
      id: "summer",
      title: "Летняя жара",
      note: "Ставьте приоритет на стойкость, а не на максимальный объем.",
      ctaLabel: "Что влияет на стойкость",
      ctaHref: "#pricing",
    },
    {
      id: "evening",
      title: "Вечерняя церемония",
      note: "Можно позволить более графичный или сияющий финиш.",
      ctaLabel: "Сценарий для вечера",
      ctaHref: "#guided-selection",
    },
    {
      id: "all-day",
      title: "Нужна стойкость на весь день",
      note: "Проверяйте резервный план корректировки перед банкетом.",
      ctaLabel: "Что спросить мастера",
      ctaHref: "#master-checklist",
    },
    {
      id: "romantic",
      title: "Мягкий романтичный образ",
      note: "Работают волны, легкие плетения и мягкий контур у лица.",
      ctaLabel: "Подобрать романтичный стиль",
      ctaHref: "#popular-styles",
    },
    {
      id: "strict",
      title: "Собранный строгий образ",
      note: "Четкая архитектура формы помогает держать вид в плотном тайминге.",
      ctaLabel: "Подобрать строгий стиль",
      ctaHref: "#popular-styles",
    },
  ] satisfies ScenarioItem[],
  performersSection: {
    title: "Исполнители свадебных причесок",
    subtitle:
      "Marketplace-структура с готовыми полями под бренд, город, формат работы и условия бронирования.",
    disclaimer:
      "Ниже демо-структура карточек: без неподтвержденных рейтингов, отзывов и счетчиков заказов. Live-данные подключаются из платформы.",
    filters: [
      { id: "all", label: "Все" },
      { id: "visit", label: "По выезду" },
      { id: "trial", label: "По пробному образу" },
      { id: "budget", label: "По бюджету" },
      { id: "premium", label: "По премиум-сегменту" },
      { id: "early", label: "На раннее утро" },
      { id: "long-hair", label: "Для длинных волос" },
      { id: "veil", label: "Для фаты" },
    ] satisfies PerformerFilter[],
    performers: [
      {
        id: "performer-template-a",
        displayName: "Профиль исполнителя A",
        cityLabel: "Город: указывается в анкете",
        workFormat: "Формат работы: частный мастер",
        specialization: "Специализация: собранные bridal-образы и фата",
        serviceModes: "Выезд / студия: оба формата",
        trialLabel: "Пробный образ: по запросу",
        priceFromLabel: "Ориентир по цене «от»: отображается после подключения данных",
        responseTimeLabel: "Время ответа: по данным профиля",
        availabilityLabel: "Доступность: календарь в профиле",
        strengths: [
          "Сильный блок брифа по платью и аксессуарам",
          "Фокус на стойкость и ранние сборы",
          "Подходит для фаты и открытой спины",
        ],
        ctaLabel: "Открыть профиль",
        ctaHref: "/account/register?intent=wedding-hairstyles",
        tags: ["visit", "trial", "early", "veil", "long-hair"],
      },
      {
        id: "performer-template-b",
        displayName: "Профиль исполнителя B",
        cityLabel: "Город: указывается в анкете",
        workFormat: "Формат работы: студия",
        specialization: "Специализация: волны, гладкие формы, вечерный bridal",
        serviceModes: "Выезд / студия: студия + выезд по договоренности",
        trialLabel: "Пробный образ: обязательно перед бронированием",
        priceFromLabel: "Ориентир по цене «от»: отображается после подключения данных",
        responseTimeLabel: "Время ответа: по данным профиля",
        availabilityLabel: "Доступность: календарь в профиле",
        strengths: [
          "Подходит для минималистичных и вечерних образов",
          "Детальный тайминг сборов и фотосессии",
          "Комфортная коммуникация по референсам",
        ],
        ctaLabel: "Открыть профиль",
        ctaHref: "/account/register?intent=wedding-hairstyles",
        tags: ["trial", "premium", "budget"],
        premiumLabel: "Премиум-сегмент",
      },
      {
        id: "performer-template-c",
        displayName: "Профиль исполнителя C",
        cityLabel: "Город: указывается в анкете",
        workFormat: "Формат работы: выездная команда",
        specialization: "Специализация: длинные волосы, динамичный свадебный день",
        serviceModes: "Выезд / студия: приоритет выезда",
        trialLabel: "Пробный образ: по запросу",
        priceFromLabel: "Ориентир по цене «от»: отображается после подключения данных",
        responseTimeLabel: "Время ответа: по данным профиля",
        availabilityLabel: "Доступность: календарь в профиле",
        strengths: [
          "Оптимально при раннем старте и нескольких локациях",
          "Понятный план корректировки образа на день",
          "Подходит для длинной длины и фаты",
        ],
        ctaLabel: "Открыть профиль",
        ctaHref: "/account/register?intent=wedding-hairstyles",
        tags: ["visit", "early", "long-hair", "veil"],
      },
    ] satisfies PerformerCard[],
    compareCta: {
      title: "Нужна помощь в сравнении исполнителей?",
      text: "Соберем shortlist под дату, город, формат сборов и желаемый образ.",
      buttonLabel: "Сравнить исполнителей",
      href: "/account/register?intent=wedding-hairstyles",
    },
  },
  chooseMasterChecklist: {
    title: "Как выбрать мастера",
    subtitle: "Чек-лист, который повышает точность выбора до бронирования.",
    items: [
      "Попросите сценарий на случай жары, влажности и длинной программы дня.",
      "Уточните, как фиксируется фата и как быстро ее можно снять без потери формы.",
      "Проверьте, как мастер строит тайминг сборов и взаимодействие с визажистом.",
      "Узнайте, какие материалы и стайлинг используются для вашей структуры волос.",
      "Согласуйте формат финальной коррекции перед церемонией и банкетом.",
    ],
  },
  bookingQuestions: {
    title: "Что спросить до бронирования",
    items: [
      "Как выглядит план репетиции и что именно фиксируется после нее?",
      "Какие ограничения есть по времени старта, если выезд очень ранний?",
      "Можно ли заранее согласовать второй вариант формы на случай погоды?",
      "Входит ли сопровождение в течение дня или только утренние сборы?",
    ],
  },
  photoChecklist: {
    title: "Какие фото отправить заранее",
    items: [
      "Платье спереди и со спины",
      "Фата, украшения, заколки, гребни",
      "Текущее состояние волос при дневном свете",
      "2-4 референса с пометкой «нравится именно это»",
    ],
  },
  trialChecklist: {
    title: "Что взять с собой на репетицию",
    items: [
      "Фату и основные аксессуары",
      "Фото платья и выреза",
      "Резинки/зажимы, если есть привычные",
      "План тайминга свадебного дня",
    ],
  },
  pricingSection: {
    title: "Цена, состав услуги и факторы выбора",
    subtitle:
      "Вместо абстрактного списка — структура, которая помогает заранее понять бюджет и риски.",
    columns: [
      {
        title: "Что влияет на цену",
        items: [
          "Сложность и конструкция выбранной формы",
          "Длина/густота волос и объем подготовки",
          "Наличие репетиции и ее глубина",
          "Ранний выезд и логистика",
        ],
      },
      {
        title: "Что обычно входит",
        items: [
          "Консультация по образу и совместимости с платьем",
          "Сборка формы и финальная фиксация",
          "Базовые рекомендации по стойкости на день",
          "Короткий бриф по корректировке",
        ],
      },
      {
        title: "За что обычно доплачивают",
        items: [
          "Очень ранний старт сборов",
          "Дополнительные образы в тот же день",
          "Сопровождение после церемонии",
          "Сложные аксессуары и крепления",
        ],
      },
    ] satisfies PricingColumn[],
    notes: [
      "Репетиция чаще всего нужна, если образ сложный или важна точная посадка фаты.",
      "Выезд оправдан, когда локация удаленная или тайминг очень плотный.",
      "На стойкость влияют не только средства фиксации, но и стартовое состояние волос.",
    ],
  },
  processSteps: [
    {
      title: "Вы описываете образ, дату, город и время",
      text: "Короткий бриф задает рамку для точного подбора.",
    },
    {
      title: "Получаете подходящих исполнителей",
      text: "Выбор формируется под параметры, а не по случайному портфолио.",
    },
    {
      title: "Сравниваете условия",
      text: "Смотрите формат работы, репетицию, выезд и совместимость с задачей.",
    },
    {
      title: "Уточняете репетицию, выезд и тайминг",
      text: "Фиксируете ключевые детали до подтверждения исполнителя.",
    },
    {
      title: "Подтверждаете исполнителя",
      text: "Остается согласовать финальный план дня и точки контроля.",
    },
  ] satisfies ProcessStep[],
  prepChecklist: {
    title: "Что подготовить заранее",
    items: [
      "Фото платья и выреза",
      "Желаемые референсы (2-4 варианта)",
      "Длина и текущее состояние волос",
      "Фата и аксессуары",
      "Место сборов",
      "Тайминг свадебного дня",
      "Пожелания по стойкости и формату коррекции",
    ],
  },
  faq: [
    {
      question: "За сколько недель бронировать мастера?",
      answer:
        "Оптимально фиксировать исполнителя сразу после подтверждения даты и площадки. Для пиковых дат лучше иметь запас по времени и репетицию в календаре.",
    },
    {
      question: "Нужна ли репетиция?",
      answer:
        "Да, если важны точная посадка фаты, сложная конструкция формы или ранний выезд. Репетиция снижает риск правок в день церемонии.",
    },
    {
      question: "Что лучше для фаты?",
      answer:
        "Чаще выбирают собранные формы или устойчивые полусобранные варианты: проще контролировать крепление и комфорт в течение дня.",
    },
    {
      question: "Как выбрать прическу под платье?",
      answer:
        "Ориентируйтесь на вырез, открытую спину, линию плеч и фактуру ткани. Прическа должна дополнять, а не перегружать силуэт.",
    },
    {
      question: "Что держится лучше летом?",
      answer:
        "Как правило, собранные формы и контролируемый объем. Важно заранее обсудить сценарий корректировки при жаре и влажности.",
    },
    {
      question: "Что делать, если волосы тонкие?",
      answer:
        "Подход строится на правильной подготовке и распределении объема. Часто лучше работают легкие конструкции без избыточной нагрузки.",
    },
    {
      question: "Можно ли сделать прическу без большого количества лака?",
      answer:
        "Можно, но это влияет на стойкость. С мастером стоит заранее согласовать баланс между естественным видом и длительностью фиксации.",
    },
    {
      question: "Что лучше на ранний выезд?",
      answer:
        "Удобнее формы с понятной геометрией и быстрым финальным контролем. Ранний старт лучше тестировать на репетиции.",
    },
    {
      question: "Когда нужен выезд мастера?",
      answer:
        "Когда локация удалена, тайминг плотный или важно собираться на месте. Выезд помогает убрать риски переездов перед церемонией.",
    },
    {
      question: "Какой образ лучше переживает влажность и ветер?",
      answer:
        "Устойчивее показывают себя собранные или частично собранные конструкции с контролируемой фиксацией и резервным планом коррекции.",
    },
  ] satisfies FaqItem[],
  ctaAfterSelection: {
    title: "Собрали параметры?",
    text: "Отправьте короткий бриф и получите подборку под платье, фату и тайминг дня.",
    buttonLabel: "Подобрать образ под платье и фату",
    href: "/account/register?intent=wedding-hairstyles",
  },
  ctaAfterPerformers: {
    title: "Готовы сравнить условия?",
    text: "Соберем исполнителей под ваш формат сборов и ожидания по стойкости.",
    buttonLabel: "Сравнить исполнителей",
    href: "/account/register?intent=wedding-hairstyles",
  },
  finalCta: {
    title: "Остался последний шаг",
    text: "Оставьте заявку, чтобы получить персональный подбор мастера и стиля.",
    buttonLabel: "Оставить заявку",
    href: "/account/register?intent=wedding-hairstyles",
  },
  performerCta: {
    title: "Вы мастер свадебных причесок?",
    text: "Подключите профиль и получайте целевые брифы от невест в формате WikiMarket.",
    buttonLabel: "Стать исполнителем",
    href: "/account/register?role=performer",
  },
  relatedPages: [
    {
      title: "Свадебный макияж",
      href: "/wikimarket/beauty/bridal-makeup",
      note: "Интент для комплексного bridal-образа в одной воронке выбора.",
    },
    {
      title: "Репетиция свадебного образа",
      href: "/wikimarket/beauty/wedding-hair-trial",
      note: "Отдельный сценарий про цели и формат пробного образа.",
    },
    {
      title: "Прически с фатой",
      href: "/wikimarket/beauty/hairstyles-with-veil",
      note: "Фокус на крепление фаты и устойчивость конструкции.",
    },
    {
      title: "Прически на короткие волосы",
      href: "/wikimarket/beauty/short-hair-wedding-hairstyles",
      note: "Специализированный интент для короткой длины и аксессуаров.",
    },
  ] satisfies RelatedPage[],
} as const;

export type WeddingHairstylesPageData = typeof weddingHairstylesPageData;


