import type { WeddingHairstyleCategory } from "./weddingHairstylesTop100Data";

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
  sourceTypeId?: string;
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
  hairstyleKeys?: string[];
  hairstyleCategories?: WeddingHairstyleCategory[];
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type RelatedPage = {
  title: string;
  href: string;
  note: string;
  ctaLabel: string;
};

export type PricingColumn = {
  title: string;
  items: string[];
};

export type ProcessStep = {
  title: string;
  text: string;
};

export type TaxonomyGroupId =
  | "buns"
  | "updos"
  | "half-up-half-down"
  | "waves-curls"
  | "ponytails"
  | "braids";

export type TaxonomyModifierId =
  | "with-veil"
  | "with-pearls"
  | "with-tiara"
  | "boho"
  | "classic"
  | "modern"
  | "for-long-hair"
  | "for-medium-hair"
  | "for-short-hair";

export type TaxonomyModifier = {
  id: TaxonomyModifierId;
  slug: string;
  label: string;
  description: string;
  category: "accessories" | "style-direction" | "hair-length";
};

export type TaxonomyModifierGroup = {
  id: string;
  title: string;
  description: string;
  modifierIds: TaxonomyModifierId[];
};

export type TaxonomyType = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  primaryGroup: TaxonomyGroupId;
  modifiers: TaxonomyModifierId[];
  searchTerms: string[];
};

export type TaxonomyGroup = {
  id: TaxonomyGroupId;
  slug: string;
  anchorId: string;
  title: string;
  shortDescription: string;
  seoIntent: string;
  types: TaxonomyType[];
};

export type SectionCopy = {
  title: string;
  subtitle: string;
};

export type AnchoredSectionCopy = SectionCopy & {
  id: string;
};

export type TaxonomyOverviewSectionCopy = AnchoredSectionCopy & {
  jumpLabel: string;
  representativeLabel: string;
  seoIntentLabel: string;
};

export type TaxonomyCatalogSectionCopy = AnchoredSectionCopy & {
  intentLabel: string;
  modifiersLabel: string;
  backToGroupsLabel: string;
};

export type ModifierGuideSectionCopy = AnchoredSectionCopy & {
  note: string;
};

export const weddingHairstylesPageData = {
  pageMeta: {
    title: "Свадебные прически: Top 100, подбор стиля и мастера | WikiMarket",
    description:
      "Top 100 свадебных причесок, фильтр по длине волос, фате, платью и формату сборов. Сравнение стилей, справочник типов и подбор мастеров.",
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
    kicker: "WikiMarket / Красота",
    title: "Свадебные прически",
    subtitle:
      "Выберите образ без перегруза: Top 100 свадебных причесок, быстрый подбор по платью, фате и длине волос, затем короткий список мастеров под дату и формат сборов.",
    imageAlt: "Невеста с аккуратной свадебной прической",
    badges: [
      { label: "Top 100 + фильтр" },
      { label: "100 стилей / 10 кластеров" },
      { label: "6 SEO-групп и 30 типов" },
      { label: "Мастера под стиль" },
    ] satisfies HeroBadge[],
    points: [
      {
        title: "Сначала быстрый выбор",
        text: "Откройте Top 100 сразу после фильтра и смотрите стили, которые ближе всего к вашему сценарию.",
      },
      {
        title: "Потом мастера",
        text: "Ниже уже можно сравнить исполнителей под направление, дату, пробный образ и формат сборов.",
      },
      {
        title: "Справочник остается ниже",
        text: "Справочник, каталог типов и модификаторы остаются под рукой как второй этаж, а не мешают первому выбору.",
      },
    ] satisfies HeroPoint[],
    trustStrip: [
      { label: "Без неподтвержденных рейтингов и отзывов" },
      { label: "Стили, фильтр и мастера связаны в одном потоке" },
      { label: "Top 100 и страницы стилей остаются доступными для поиска" },
    ] satisfies HeroTrustItem[],
    supportCard: {
      title: "Три быстрых входа",
      text: "Открыть Top 100, подобрать по параметрам и сравнить мастеров можно как один путь выбора: фильтр поднимает подходящие стили, а выбранный стиль ведет к короткому списку исполнителей.",
      microCtaLabel: "Сравнить мастеров",
      microCtaHref: "#wedding-hairstyle-masters",
    },
    actionNote: "Без оплаты на этапе подбора: сначала стиль, бриф и понятный короткий список.",
    primaryCta: { label: "Открыть Top 100", href: "#top-100-hairstyles" } satisfies HeroCta,
    secondaryCta: { label: "Подобрать по параметрам", href: "#guided-selection" } satisfies HeroCta,
  },
  trustBridge: {
    eyebrow: "Прозрачный подбор",
    title: "Почему выбор не превращается в случайный список",
    subtitle:
      "Страница не подменяет данные красивыми обещаниями: сначала связывает ваши параметры со стилями, затем показывает, почему конкретный мастер попал в выдачу.",
    proofCards: [
      {
        value: "0",
        label: "фейковых рейтингов",
        text: "В демо-блоках нет неподтвержденных звезд, отзывов и мест в рейтинге. Там, где данные еще не подключены, это прямо указано.",
      },
      {
        value: "100",
        label: "стилей в индексе",
        text: "Top 100 остается полной витриной, а выбранные параметры только поднимают ближайшие варианты выше.",
      },
      {
        value: "1",
        label: "единый бриф",
        text: "Выбранный стиль, фильтры и формат сборов передаются к мастерам без повторного заполнения.",
      },
    ],
    handoffTitle: "Что попадет в заявку",
    handoffItems: [
      "платье, фата, длина волос и желаемая форма",
      "выбранный стиль из Top 100 или ближайшая категория",
      "требования к выезду, пробному образу и таймингу",
    ],
    primaryCta: { label: "Начать с параметров", href: "#guided-selection" } satisfies HeroCta,
    secondaryCta: { label: "Смотреть Top 100", href: "#top-100-hairstyles" } satisfies HeroCta,
  },
  quickAnswer: {
    title: "Как выбирать без перегруза",
    bullets: [
      "Сначала отметьте 3–5 параметров и посмотрите, как меняется Top 100.",
      "Если нужен длинный тайминг, чаще выигрывают собранные формы и контролируемый объем у лица.",
      "Полусобранные формы и волны удобны, когда важно сохранить длину на фото и мягкое движение по спине.",
      "Фату, аксессуары и платье лучше согласовывать одновременно со стилем, а не после финального выбора.",
      "Пробный образ особенно важен, если критичны крепление фаты, ранний выезд или сложная конструкция формы.",
    ],
  },
  toc: {
    title: "Содержание",
    items: [
      { href: "#guided-selection", label: "Подобрать прическу" },
      { href: "#top-100-hairstyles", label: "Top 100" },
      { href: "#performers", label: "Исполнители" },
      { href: "#summary", label: "Как выбирать" },
      { href: "#taxonomy-groups", label: "Справочник 6×30" },
      { href: "#selection-modifiers", label: "Модификаторы" },
      { href: "#personal-scenarios", label: "Сценарии выбора" },
      { href: "#pricing", label: "Цена и условия" },
      { href: "#process", label: "Как проходит заказ" },
      { href: "#prep", label: "Что подготовить заранее" },
      { href: "#faq", label: "FAQ" },
    ] satisfies TocItem[],
  },
  taxonomyOverviewSection: {
    id: "taxonomy-groups",
    title: "Справочник свадебных причесок: 6 групп и 30 базовых типов",
    subtitle:
      "Это второй слой после интерактивного Top 100: сначала выбираем семейство формы, затем внутри него сравниваем 5 базовых типов и только после этого уточняем фату, стиль и длину.",
    jumpLabel: "Смотреть группу и 5 типов",
    representativeLabel: "5 базовых типов",
    seoIntentLabel: "Когда эту группу выбирают:",
  } satisfies TaxonomyOverviewSectionCopy,
  taxonomyCatalogSection: {
    id: "hairstyle-catalog",
    title: "30 базовых типов внутри справочника",
    subtitle:
      "Здесь не повторяется весь Top 100: это компактная карта базовых форм, по которой удобно понять, какую конструкцию обсуждать с мастером.",
    intentLabel: "Частый сценарий выбора:",
    modifiersLabel: "Подходящие модификаторы:",
    backToGroupsLabel: "К 6 группам",
  } satisfies TaxonomyCatalogSectionCopy,
  modifierGuideSection: {
    id: "selection-modifiers",
    title: "Модификаторы: что уточнять после выбора формы",
    subtitle:
      "Фата, жемчуг, тиара, бохо, классика, современная стилистика и длина волос работают как уточняющие атрибуты. Их удобнее сверять после того, как вы уже выбрали близкое направление в Top 100 или справочнике.",
    note:
      "Смотрите на модификаторы как на практический чек-лист: где крепится аксессуар, сколько нужно мягкости у лица и как меняется силуэт по длине волос.",
  } satisfies ModifierGuideSectionCopy,
  modifierLibrary: {
    items: [
      {
        id: "with-veil",
        slug: "with-veil",
        label: "С фатой",
        description: "Нужно заранее проверить точку крепления и баланс объема вокруг гребня или шпильки.",
        category: "accessories",
      },
      {
        id: "with-pearls",
        slug: "with-pearls",
        label: "С жемчугом",
        description: "Добавляет мягкий декоративный акцент и работает лучше на чисто читаемой форме.",
        category: "accessories",
      },
      {
        id: "with-tiara",
        slug: "with-tiara",
        label: "С тиарой",
        description: "Требует контролируемой высоты в зоне макушки и понятной опорной линии.",
        category: "accessories",
      },
      {
        id: "boho",
        slug: "boho",
        label: "Бохо",
        description: "Больше текстуры, движения и расслабленного свадебного настроения без тяжеловесности.",
        category: "style-direction",
      },
      {
        id: "classic",
        slug: "classic",
        label: "Классика",
        description: "Чистая форма, спокойный контур и вневременной свадебный образ для церемоний с традиционным силуэтом.",
        category: "style-direction",
      },
      {
        id: "modern",
        slug: "modern",
        label: "Современная стилистика",
        description: "Гладкость, более графичные линии и журнальный характер для минималистичных образов.",
        category: "style-direction",
      },
      {
        id: "for-long-hair",
        slug: "for-long-hair",
        label: "Для длинных волос",
        description: "Подходит, когда важно сохранить длину, объем и детали по спине или в пучке.",
        category: "hair-length",
      },
      {
        id: "for-medium-hair",
        slug: "for-medium-hair",
        label: "Для средней длины",
        description: "Самый гибкий диапазон для большинства свадебных конструкций и комбинированных форм.",
        category: "hair-length",
      },
      {
        id: "for-short-hair",
        slug: "for-short-hair",
        label: "Для коротких волос",
        description: "Нужно раньше тестировать форму, направление локона и место крепления аксессуаров.",
        category: "hair-length",
      },
    ] satisfies TaxonomyModifier[],
    groups: [
      {
        id: "modifier-accessories",
        title: "Аксессуары",
        description: "Уточняют крепление, высоту и чистоту формы, но не заменяют основную конструкцию.",
        modifierIds: ["with-veil", "with-pearls", "with-tiara"],
      },
      {
        id: "modifier-style-direction",
        title: "Стилистика",
        description: "Помогает согласовать прическу с платьем, декором и общим тоном церемонии.",
        modifierIds: ["boho", "classic", "modern"],
      },
      {
        id: "modifier-hair-length",
        title: "Длина волос",
        description: "Нужна для реалистичного короткого списка без иллюзий по объему, длине и времени на укладку.",
        modifierIds: ["for-long-hair", "for-medium-hair", "for-short-hair"],
      },
    ] satisfies TaxonomyModifierGroup[],
  },
  taxonomyGroups: [
    {
      id: "buns",
      slug: "buns",
      anchorId: "bridal-buns",
      title: "Пучки",
      shortDescription:
        "Пучки нужны, когда важны чистый силуэт, устойчивость на длинный день и удобная работа с фатой или открытой спиной.",
      seoIntent:
        "Когда нужен аккуратный свадебный пучок для церемонии, фотосессии, фаты и длинного свадебного тайминга.",
      types: [
        {
          id: "low-bun",
          slug: "low-bun",
          name: "Низкий пучок",
          shortDescription:
            "Универсальный свадебный пучок для классической церемонии, спокойного профиля и комфортного крепления фаты.",
          primaryGroup: "buns",
          modifiers: ["with-veil", "classic", "for-medium-hair", "for-long-hair"],
          searchTerms: ["low bun wedding hairstyle", "bridal low bun", "низкий пучок невесты"],
        },
        {
          id: "sleek-low-bun",
          slug: "sleek-low-bun",
          name: "Гладкий низкий пучок",
          shortDescription:
            "Гладкий низкий пучок для минималистичного платья, чистой линии затылка и журнального финиша.",
          primaryGroup: "buns",
          modifiers: ["with-veil", "modern", "for-medium-hair", "for-long-hair"],
          searchTerms: ["sleek low bun bridal", "smooth bridal bun", "гладкий низкий пучок"],
        },
        {
          id: "messy-bun",
          slug: "messy-bun",
          name: "Текстурный пучок",
          shortDescription:
            "Мягкий текстурный пучок для романтичного образа, когда нужна спокойная роскошь без ощущения тяжести.",
          primaryGroup: "buns",
          modifiers: ["boho", "with-pearls", "for-medium-hair", "for-long-hair"],
          searchTerms: ["messy bun wedding hair", "textured bridal bun", "небрежный свадебный пучок"],
        },
        {
          id: "high-bun",
          slug: "high-bun",
          name: "Высокий пучок",
          shortDescription:
            "Высокая посадка открывает шею и серьги, помогает держать форму при плотном тайминге дня.",
          primaryGroup: "buns",
          modifiers: ["with-tiara", "modern", "for-medium-hair", "for-long-hair"],
          searchTerms: ["high bun bridal", "elegant high bun wedding", "высокий свадебный пучок"],
        },
        {
          id: "braided-bun",
          slug: "braided-bun",
          name: "Пучок с плетением",
          shortDescription:
            "Комбинирует фактуру плетения и стабильность пучка, когда нужна деталь без потери собранности.",
          primaryGroup: "buns",
          modifiers: ["with-veil", "boho", "with-pearls", "for-long-hair"],
          searchTerms: ["braided bun wedding", "bridal braided bun", "пучок с плетением невеста"],
        },
      ] satisfies TaxonomyType[],
    },
    {
      id: "updos",
      slug: "updos",
      anchorId: "bridal-updos",
      title: "Собранные прически",
      shortDescription:
        "Собранные прически нужны, когда невесте важны контролируемый объем, заметная архитектура и надежная фиксация на церемонию и банкет.",
      seoIntent:
        "Когда нужна структурная собранная прическа для раннего выезда, длинного дня и аккуратной работы с платьем и аксессуарами.",
      types: [
        {
          id: "classic-chignon",
          slug: "classic-chignon",
          name: "Классический шиньон",
          shortDescription:
            "Традиционная свадебная форма для спокойного силуэта, строгой посадки и вневременного свадебного ощущения.",
          primaryGroup: "updos",
          modifiers: ["with-veil", "classic", "for-medium-hair", "for-long-hair"],
          searchTerms: ["classic chignon wedding", "bridal chignon", "классический шиньон невесты"],
        },
        {
          id: "romantic-updo",
          slug: "romantic-updo",
          name: "Романтичная собранная форма",
          shortDescription:
            "Мягкая собранная форма с деликатным объемом у лица для романтичного и светлого свадебного образа.",
          primaryGroup: "updos",
          modifiers: ["with-pearls", "classic", "for-medium-hair", "for-long-hair"],
          searchTerms: ["romantic bridal updo", "soft wedding updo", "романтичная собранная прическа"],
        },
        {
          id: "textured-updo",
          slug: "textured-updo",
          name: "Текстурная собранная форма",
          shortDescription:
            "Форма с заметной текстурой и объемом у макушки, когда нужен акцент без тяжелого глянца.",
          primaryGroup: "updos",
          modifiers: ["modern", "boho", "for-medium-hair", "for-long-hair"],
          searchTerms: ["textured updo wedding", "bridal textured updo", "текстурная собранная прическа"],
        },
        {
          id: "twisted-updo",
          slug: "twisted-updo",
          name: "Собранная форма со скрутками",
          shortDescription:
            "Собранная форма на скрутках для чистой детализации и более сложного, но аккуратного рисунка.",
          primaryGroup: "updos",
          modifiers: ["with-tiara", "classic", "for-medium-hair", "for-long-hair"],
          searchTerms: ["twisted updo bridal", "twist wedding hairstyle", "собранная прическа со скрутками"],
        },
        {
          id: "loose-updo",
          slug: "loose-updo",
          name: "Свободная собранная форма",
          shortDescription:
            "Более свободная собранная форма для мягкого контура у лица и баланса между фиксацией и движением.",
          primaryGroup: "updos",
          modifiers: ["boho", "with-veil", "for-medium-hair", "for-long-hair"],
          searchTerms: ["loose updo wedding", "soft loose bridal updo", "свободная собранная прическа"],
        },
      ] satisfies TaxonomyType[],
    },
    {
      id: "half-up-half-down",
      slug: "half-up-half-down",
      anchorId: "bridal-half-up-half-down",
      title: "Полусобранные прически",
      shortDescription:
        "Полусобранные формы подходят, когда важно сохранить длину на фото, но при этом открыть лицо и удержать верхнюю зону.",
      seoIntent:
        "Когда невесте нужна мягкая длина по спине, совместимость с фатой и более романтичный силуэт без полностью собранной формы.",
      types: [
        {
          id: "classic-half-up-half-down",
          slug: "classic-half-up-half-down",
          name: "Классическая полусобранная прическа",
          shortDescription:
            "Базовая полусобранная форма для мягкого свадебного силуэта и контролируемой линии у лица.",
          primaryGroup: "half-up-half-down",
          modifiers: ["with-veil", "classic", "for-medium-hair", "for-long-hair"],
          searchTerms: ["classic half up half down wedding", "bridal half up hair", "классическая полусобранная прическа"],
        },
        {
          id: "half-up-with-curls",
          slug: "half-up-with-curls",
          name: "Полусобранная прическа с локонами",
          shortDescription:
            "Полусобранная база с мягкими локонами для романтичного эффекта и читаемой длины на фото.",
          primaryGroup: "half-up-half-down",
          modifiers: ["with-pearls", "classic", "for-medium-hair", "for-long-hair"],
          searchTerms: ["half up curls wedding hair", "curly half up bridal", "полусобранные локоны невесты"],
        },
        {
          id: "half-up-with-braid",
          slug: "half-up-with-braid",
          name: "Полусобранная прическа с плетением",
          shortDescription:
            "Добавляет текстурное плетение в верхнюю зону, не убирая длину и мягкость по спине.",
          primaryGroup: "half-up-half-down",
          modifiers: ["boho", "with-veil", "for-long-hair"],
          searchTerms: ["half up braid wedding", "braided half up bridal", "полусобранная прическа с косой"],
        },
        {
          id: "half-up-with-volume",
          slug: "half-up-with-volume",
          name: "Полусобранная прическа с объемом",
          shortDescription:
            "Подходит, когда нужна более заметная линия макушки и визуальный баланс для фаты или тиары.",
          primaryGroup: "half-up-half-down",
          modifiers: ["with-tiara", "modern", "for-medium-hair", "for-long-hair"],
          searchTerms: ["half up volume wedding", "voluminous half up bridal", "полусобранная прическа с объемом"],
        },
        {
          id: "veil-ready-half-up-style",
          slug: "veil-ready-half-up-style",
          name: "Полусобранная прическа под фату",
          shortDescription:
            "Сделан под заранее понятную точку крепления фаты, чтобы длина оставалась открытой и удобной.",
          primaryGroup: "half-up-half-down",
          modifiers: ["with-veil", "classic", "for-medium-hair", "for-long-hair"],
          searchTerms: ["veil ready half up bridal", "half up hairstyle with veil", "полусобранная свадебная прическа с фатой"],
        },
      ] satisfies TaxonomyType[],
    },
    {
      id: "waves-curls",
      slug: "waves-curls",
      anchorId: "bridal-waves-curls",
      title: "Волны и локоны",
      shortDescription:
        "Волны и локоны нужны, когда хочется сохранить движение, блеск и видимую длину без жесткой архитектуры.",
      seoIntent:
        "Когда приоритетом становятся мягкость, фотогеничность длины и более расслабленное либо выразительное свадебное настроение.",
      types: [
        {
          id: "hollywood-waves",
          slug: "hollywood-waves",
          name: "Голливудская волна",
          shortDescription:
            "Гладкая глянцевая волна для вечернего свадебного образа, выразительной линии у лица и фотогеничного блеска.",
          primaryGroup: "waves-curls",
          modifiers: ["modern", "classic", "for-medium-hair", "for-long-hair"],
          searchTerms: ["hollywood waves wedding", "bridal hollywood waves", "голливудская волна невесты"],
        },
        {
          id: "soft-bridal-curls",
          slug: "soft-bridal-curls",
          name: "Мягкие свадебные локоны",
          shortDescription:
            "Мягкие локоны для деликатного объема и романтичного образа на средней или даже укороченной длине.",
          primaryGroup: "waves-curls",
          modifiers: ["with-pearls", "classic", "for-medium-hair", "for-short-hair"],
          searchTerms: ["soft bridal curls", "soft curls wedding hair", "мягкие локоны невесты"],
        },
        {
          id: "loose-curls",
          slug: "loose-curls",
          name: "Свободные локоны",
          shortDescription:
            "Более свободный вариант для бохо-настроения, живого движения и расслабленного силуэта без перегруза.",
          primaryGroup: "waves-curls",
          modifiers: ["boho", "modern", "for-medium-hair", "for-short-hair"],
          searchTerms: ["loose curls wedding hairstyle", "bridal loose curls", "свободные локоны на свадьбу"],
        },
        {
          id: "beach-waves",
          slug: "beach-waves",
          name: "Пляжные волны",
          shortDescription:
            "Небрежная волна с текстурой для свадьбы на открытой площадке, бохо-декора и более расслабленной эстетики.",
          primaryGroup: "waves-curls",
          modifiers: ["boho", "modern", "for-medium-hair", "for-long-hair"],
          searchTerms: ["beach waves bridal", "wedding beach waves", "пляжные волны невесты"],
        },
        {
          id: "side-swept-waves",
          slug: "side-swept-waves",
          name: "Волны на одну сторону",
          shortDescription:
            "Убирает длину на одну сторону, красиво работает с открытым плечом и заметным украшением.",
          primaryGroup: "waves-curls",
          modifiers: ["with-tiara", "classic", "for-medium-hair", "for-long-hair"],
          searchTerms: ["side swept waves wedding", "bridal side waves", "волны на одну сторону невеста"],
        },
      ] satisfies TaxonomyType[],
    },
    {
      id: "ponytails",
      slug: "ponytails",
      anchorId: "bridal-ponytails",
      title: "Хвосты",
      shortDescription:
        "Свадебные хвосты подходят для современного свадебного образа, открытой шеи и сценариев, где форму нужно быстро освежить.",
      seoIntent:
        "Когда нужен современный хвост для чистой линии, заметной длины и более свежего журнального настроения.",
      types: [
        {
          id: "low-ponytail",
          slug: "low-ponytail",
          name: "Низкий хвост",
          shortDescription:
            "Низкий хвост для лаконичного силуэта, аккуратной спины платья и контролируемого финиша без жесткости.",
          primaryGroup: "ponytails",
          modifiers: ["with-veil", "classic", "for-medium-hair", "for-long-hair"],
          searchTerms: ["low ponytail wedding hair", "bridal low ponytail", "низкий свадебный хвост"],
        },
        {
          id: "sleek-ponytail",
          slug: "sleek-ponytail",
          name: "Гладкий хвост",
          shortDescription:
            "Гладкий хвост для минималистичной невесты, четкой линии лица и современной подачи без лишнего декора.",
          primaryGroup: "ponytails",
          modifiers: ["modern", "with-tiara", "for-medium-hair", "for-short-hair"],
          searchTerms: ["sleek ponytail bridal", "smooth ponytail wedding", "гладкий свадебный хвост"],
        },
        {
          id: "high-ponytail",
          slug: "high-ponytail",
          name: "Высокий хвост",
          shortDescription:
            "Высокий хвост дает лифтинг-эффект, открывает лицо и помогает сохранить свежий вид до вечера.",
          primaryGroup: "ponytails",
          modifiers: ["modern", "with-tiara", "for-medium-hair", "for-long-hair"],
          searchTerms: ["high ponytail wedding", "bridal high ponytail", "высокий свадебный хвост"],
        },
        {
          id: "wavy-ponytail",
          slug: "wavy-ponytail",
          name: "Волнистый хвост",
          shortDescription:
            "Сочетает контролируемую основу и мягкую длину, когда хочется хвост без ощущения строгости.",
          primaryGroup: "ponytails",
          modifiers: ["with-pearls", "classic", "for-medium-hair", "for-long-hair"],
          searchTerms: ["wavy ponytail bridal", "wedding ponytail waves", "волнистый хвост невесты"],
        },
        {
          id: "ponytail-with-crown-volume",
          slug: "ponytail-with-crown-volume",
          name: "Хвост с объемом у макушки",
          shortDescription:
            "Добавляет высоту у макушки и работает, когда платью нужен более собранный верхний силуэт.",
          primaryGroup: "ponytails",
          modifiers: ["modern", "with-tiara", "for-medium-hair", "for-long-hair"],
          searchTerms: ["ponytail with crown volume wedding", "volume bridal ponytail", "свадебный хвост с объемом у макушки"],
        },
      ] satisfies TaxonomyType[],
    },
    {
      id: "braids",
      slug: "braids",
      anchorId: "bridal-braids",
      title: "Косы и плетения",
      shortDescription:
        "Плетения помогают добавить фактуру, бохо-движение и более заметную ручную работу без декоративного перегруза.",
      seoIntent:
        "Когда невесте нужна форма на основе плетения для свадьбы на открытой площадке, текстуры, аксессуаров и мягкого движения на фото.",
      types: [
        {
          id: "french-braid",
          slug: "french-braid",
          name: "Французская коса",
          shortDescription:
            "Базовое структурное плетение для аккуратной фиксации и контролируемого направления волос.",
          primaryGroup: "braids",
          modifiers: ["boho", "for-medium-hair", "for-long-hair", "with-veil"],
          searchTerms: ["french braid wedding hairstyle", "bridal french braid", "французская коса невесты"],
        },
        {
          id: "fishtail-braid",
          slug: "fishtail-braid",
          name: "Плетение «рыбий хвост»",
          shortDescription:
            "Дает более заметную фактуру и смотрится богато на длинных волосах и в живом свете.",
          primaryGroup: "braids",
          modifiers: ["boho", "with-pearls", "for-long-hair"],
          searchTerms: ["fishtail braid wedding", "bridal fishtail braid", "рыбий хвост свадебная прическа"],
        },
        {
          id: "crown-braid",
          slug: "crown-braid",
          name: "Коса-корона",
          shortDescription:
            "Плетение по кругу для выразительной верхней линии и более собранного баланса между бохо и классикой.",
          primaryGroup: "braids",
          modifiers: ["with-veil", "classic", "for-medium-hair", "for-long-hair"],
          searchTerms: ["crown braid wedding hair", "bridal crown braid", "корона из кос на свадьбу"],
        },
        {
          id: "side-braid",
          slug: "side-braid",
          name: "Боковая коса",
          shortDescription:
            "Уводит объем на одну сторону и хорошо сочетается с открытым плечом или асимметричным платьем.",
          primaryGroup: "braids",
          modifiers: ["boho", "with-pearls", "for-medium-hair", "for-long-hair"],
          searchTerms: ["side braid bridal", "wedding side braid", "боковая коса невесты"],
        },
        {
          id: "waterfall-braid",
          slug: "waterfall-braid",
          name: "Коса-водопад",
          shortDescription:
            "Оставляет длину видимой и добавляет декоративную линию плетения для мягкого романтичного образа.",
          primaryGroup: "braids",
          modifiers: ["boho", "with-pearls", "for-medium-hair", "for-long-hair"],
          searchTerms: ["waterfall braid wedding", "bridal waterfall braid", "водопад коса свадебная прическа"],
        },
      ] satisfies TaxonomyType[],
    },
  ] satisfies TaxonomyGroup[],
  selector: {
    title: "Подобрать прическу",
    text: "Отметьте 3–5 параметров, и мы поднимем в Top 100 стили, которые ближе к вашему сценарию.",
    summaryTitle: "Ваш текущий набор параметров",
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
        title: "Форма и объем",
        options: [
          { id: "soft", label: "Мягкий объем" },
          { id: "balanced", label: "Сбалансированный объем" },
          { id: "structured", label: "Собранная форма" },
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
      title: "Нужен короткий бриф под платье, фату и тайминг дня?",
      text: "Отправьте параметры, и мы соберем короткий список мастеров под выбранный стиль и формат сборов.",
      buttonLabel: "Получить подбор мастеров",
      href: "/account/register?intent=wedding-hairstyles",
    },
  },
  popularStylesSection: {
    title: "Приоритетные стили до полного каталога",
    subtitle:
      "Это не случайная россыпь карточек, а быстрый вход в самые частые свадебные направления перед просмотром всех 30 типов.",
  } satisfies SectionCopy,
  popularStyles: [
    {
      id: "low-bun",
      sourceTypeId: "low-bun",
      title: "Низкий пучок",
      suitedFor: "Фата, открытая спина, классические и минималистичные образы.",
      effect: "Собранный силуэт, чистый контур, устойчивость на длинный день.",
      whenToChoose: "Если нужен спокойный премиальный вид и надежная фиксация.",
      ctaLabel: "Открыть тип в каталоге",
      ctaHref: "#low-bun",
      tags: ["medium", "long", "veil-yes", "classic", "structured", "early", "oval", "home", "trial-yes"],
    },
    {
      id: "hollywood-waves",
      sourceTypeId: "hollywood-waves",
      title: "Голливудская волна",
      suitedFor: "Средняя/длинная длина, вечерний сценарий, лаконичное платье.",
      effect: "Блеск и графичная линия у лица, сильный фотогеничный эффект.",
      whenToChoose: "Если приоритет - выразительный образ и контролируемый климат локации.",
      ctaLabel: "Открыть тип в каталоге",
      ctaHref: "#hollywood-waves",
      tags: ["medium", "long", "minimal", "soft", "evening", "oval", "studio", "trial-no"],
    },
    {
      id: "textured-updo",
      sourceTypeId: "textured-updo",
      title: "Текстурная собранная форма",
      suitedFor: "Средняя и длинная длина, платье со сложной фактурой, вечерняя церемония.",
      effect: "Выразительная форма без тяжелого глянца, визуальный объем в зоне макушки.",
      whenToChoose: "Когда нужен акцентный образ и баланс между стойкостью и мягкостью.",
      ctaLabel: "Открыть тип в каталоге",
      ctaHref: "#textured-updo",
      tags: ["medium", "long", "romantic", "structured", "evening", "angular", "studio", "trial-yes"],
    },
    {
      id: "high-bun",
      sourceTypeId: "high-bun",
      title: "Высокий пучок",
      suitedFor: "Платье с чистой линией плеч, выразительные серьги и церемония в плотном тайминге.",
      effect: "Лифтинг-силуэт, открытая шея и собранный премиальный контур.",
      whenToChoose: "Когда нужен элегантный образ с высокой посадкой и устойчивой фиксацией.",
      ctaLabel: "Открыть тип в каталоге",
      ctaHref: "#high-bun",
      tags: ["medium", "long", "classic", "minimal", "structured", "early", "evening", "oval", "studio", "trial-yes"],
    },
    {
      id: "boho-braid",
      sourceTypeId: "waterfall-braid",
      title: "Бохо-плетение",
      suitedFor: "Длинные волосы, церемония на открытой площадке, романтичный образ и живой декор.",
      effect: "Текстурный объем, мягкая динамика и заметная прическа без тяжести.",
      whenToChoose:
        "Если нужен расслабленный свадебный настрой с хорошей читаемостью на фото и в движении.",
      ctaLabel: "Открыть плетения в каталоге",
      ctaHref: "#bridal-braids",
      tags: ["long", "veil-no", "romantic", "balanced", "day", "round", "venue", "trial-yes"],
    },
    {
      id: "half-up-half-down-curls",
      sourceTypeId: "half-up-with-curls",
      title: "Полусобранная прическа с локонами",
      suitedFor: "Средняя и длинная длина, украшение-гребень, мягкий свадебный образ и фата.",
      effect: "Открывает лицо, сохраняет длину и дает мягкий объем без жесткой архитектуры.",
      whenToChoose:
        "Когда нужен баланс между собранной линией у лица и свободной длиной по спине.",
      ctaLabel: "Открыть тип в каталоге",
      ctaHref: "#half-up-with-curls",
      tags: ["medium", "long", "veil-yes", "romantic", "soft", "day", "oval", "home", "trial-no"],
    },
  ] satisfies RecommendationCard[],
  scenariosSection: {
    title: "Что выбрать именно вам?",
    subtitle: "Короткие сценарии, которые помогают быстро сузить выбор перед брифом мастеру.",
  } satisfies SectionCopy,
  scenarios: [
    {
      id: "short",
      title: "Короткие волосы",
      note: "Смотрите волны, локоны и гладкий хвост, а также заранее проверяйте, как крепятся аксессуары.",
      ctaLabel: "Открыть модификаторы по длине",
      ctaHref: "#selection-modifiers",
    },
    {
      id: "medium",
      title: "Средняя длина",
      note: "Самый гибкий диапазон: доступны пучки, собранные формы, полусобранные варианты и мягкие волны.",
      ctaLabel: "Смотреть каталог 30 типов",
      ctaHref: "#hairstyle-catalog",
    },
    {
      id: "long",
      title: "Длинные волосы",
      note: "Добавьте запас по времени на проработку формы, объема и финальную фиксацию.",
      ctaLabel: "Открыть пучки и плетения",
      ctaHref: "#bridal-buns",
    },
    {
      id: "veil",
      title: "Если будет фата",
      note: "Ключевой вопрос - точка крепления и баланс с высотой или объемом прически.",
      ctaLabel: "Открыть модификаторы",
      ctaHref: "#selection-modifiers",
    },
    {
      id: "open-back",
      title: "Открытая спина / плечи",
      note: "Собранные силуэты и чистые хвосты чаще лучше подчеркивают линию шеи.",
      ctaLabel: "Открыть пучки и хвосты",
      ctaHref: "#bridal-ponytails",
    },
    {
      id: "summer",
      title: "Летняя жара",
      note: "Ставьте приоритет на стойкость, а не на максимальный распущенный объем.",
      ctaLabel: "Что влияет на стойкость",
      ctaHref: "#pricing",
    },
    {
      id: "evening",
      title: "Вечерняя церемония",
      note: "Можно позволить более графичный или сияющий финиш: волны, гладкий пучок или полированный хвост.",
      ctaLabel: "Открыть типы для вечера",
      ctaHref: "#hollywood-waves",
    },
    {
      id: "all-day",
      title: "Нужна стойкость на весь день",
      note: "Проверяйте резервный план коррекции перед банкетом и устойчивость к смене локаций.",
      ctaLabel: "Что спросить мастера",
      ctaHref: "#master-checklist",
    },
    {
      id: "romantic",
      title: "Мягкий романтичный образ",
      note: "Чаще работают локоны, полусобранные локоны, свободная собранная форма и плетение-водопад.",
      ctaLabel: "Открыть мягкие типы",
      ctaHref: "#half-up-with-curls",
    },
    {
      id: "strict",
      title: "Собранный строгий образ",
      note: "Четкая архитектура формы помогает держать вид в плотном свадебном тайминге.",
      ctaLabel: "Открыть структурные группы",
      ctaHref: "#bridal-updos",
    },
  ] satisfies ScenarioItem[],
  performersSection: {
    title: "Исполнители свадебных причесок",
    subtitle:
      "Ниже можно сразу сравнить мастеров под выбранный стиль, формат сборов, пробный образ и условия бронирования.",
    disclaimer:
      "Демо-карточки показывают структуру будущего сравнения исполнителей. Реальные профили, города, цены, календарь и время ответа появятся после подключения данных.",
    filtersAriaLabel: "Фильтры исполнителей",
    strengthsTitle: "Сильные стороны",
    emptyState:
      "По выбранному фильтру карточки пока не показаны. Оставьте заявку, чтобы получить подбор под ваши параметры.",
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
        displayName: "Демо-профиль частного мастера",
        cityLabel: "Город: будет указан в профиле",
        workFormat: "Формат работы: частный мастер",
        specialization: "Специализация: собранные свадебные образы и фата",
        serviceModes: "Выезд / студия: оба формата",
        trialLabel: "Пробный образ: по запросу",
        priceFromLabel: "появится после подключения данных",
        responseTimeLabel: "появится после подключения данных",
        availabilityLabel: "календарь в профиле после подключения",
        strengths: [
          "Сильный блок брифа по платью и аксессуарам",
          "Фокус на стойкость и ранние сборы",
          "Подходит для фаты и открытой спины",
        ],
        ctaLabel: "Открыть профиль",
        ctaHref: "/account/register?intent=wedding-hairstyles",
        tags: ["visit", "trial", "early", "veil", "long-hair"],
        hairstyleCategories: ["bun", "updo", "half-up"],
        hairstyleKeys: [
          "smooth-low-bun",
          "classic-low-bun",
          "textured-updo",
          "elegant-high-bun",
          "half-up-half-down-curls",
        ],
      },
      {
        id: "performer-template-b",
        displayName: "Демо-профиль студии",
        cityLabel: "Город: будет указан в профиле",
        workFormat: "Формат работы: студия",
        specialization: "Специализация: волны, гладкие формы, вечерний свадебный стиль",
        serviceModes: "Выезд / студия: студия + выезд по договоренности",
        trialLabel: "Пробный образ: обязательно перед бронированием",
        priceFromLabel: "появится после подключения данных",
        responseTimeLabel: "появится после подключения данных",
        availabilityLabel: "календарь в профиле после подключения",
        strengths: [
          "Подходит для минималистичных и вечерних образов",
          "Детальный тайминг сборов и фотосессии",
          "Комфортная коммуникация по референсам",
        ],
        ctaLabel: "Открыть профиль",
        ctaHref: "/account/register?intent=wedding-hairstyles",
        tags: ["trial", "premium", "budget"],
        premiumLabel: "Демо-карточка",
        hairstyleCategories: ["waves", "ponytail", "short-style"],
        hairstyleKeys: [
          "hollywood-waves",
          "boho-beach-waves",
          "sleek-low-ponytail",
          "soft-curled-ponytail",
          "sleek-bridal-bob",
        ],
      },
      {
        id: "performer-template-c",
        displayName: "Демо-профиль выездной команды",
        cityLabel: "Город: будет указан в профиле",
        workFormat: "Формат работы: выездная команда",
        specialization: "Специализация: длинные волосы, динамичный свадебный день",
        serviceModes: "Выезд / студия: приоритет выезда",
        trialLabel: "Пробный образ: по запросу",
        priceFromLabel: "появится после подключения данных",
        responseTimeLabel: "появится после подключения данных",
        availabilityLabel: "календарь в профиле после подключения",
        strengths: [
          "Оптимально при раннем старте и нескольких локациях",
          "Понятный план корректировки образа на день",
          "Подходит для длинной длины и фаты",
        ],
        ctaLabel: "Открыть профиль",
        ctaHref: "/account/register?intent=wedding-hairstyles",
        tags: ["visit", "early", "long-hair", "veil"],
        hairstyleCategories: ["braid", "locs", "protective", "curls"],
        hairstyleKeys: [
          "boho-braid",
          "half-up-locs",
          "goddess-braids",
          "defined-coils-updo",
          "twist-crown",
        ],
      },
    ] satisfies PerformerCard[],
    compareCta: {
      title: "Нужна помощь в сравнении исполнителей?",
      text: "Соберем короткий список под дату, город, формат сборов и желаемый образ.",
      buttonLabel: "Получить короткий список исполнителей",
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
      "Вместо абстрактного списка - структура, которая помогает заранее понять бюджет и риски.",
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
  processSection: {
    title: "Как проходит заказ",
    subtitle: "Пять шагов от первого брифа до подтверждения исполнителя.",
  } satisfies SectionCopy,
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
    subtitle: "Соберите материалы заранее, чтобы выбор стиля и исполнителя прошел без потери времени.",
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
        "Чаще выбирают пучки, собранные формы или устойчивые полусобранные варианты: так проще контролировать крепление и комфорт в течение дня.",
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
    title: "Подключайте профиль мастера",
    text: "Получайте запросы от невест под даты, выезд, пробный образ и формат сборов без лишнего холодного трафика.",
    buttonLabel: "Подключить профиль",
    href: "/account/register?role=performer",
  },
  relatedPagesSection: {
    title: "Что посмотреть дальше",
    subtitle: "Смежные разделы помогут собрать образ целиком и сравнить соседние категории WikiMarket без лишнего поиска.",
  } satisfies SectionCopy,
  relatedPages: [
    {
      title: "Свадебный макияж",
      href: "/wikimarket/beauty/bridal-makeup",
      note: "Смежный раздел для комплексного свадебного образа в одной воронке выбора.",
      ctaLabel: "Открыть раздел",
    },
    {
      title: "Справочник 6×30",
      href: "#taxonomy-groups",
      note: "Быстрый возврат к объединенному справочнику: 6 семейств формы и 30 базовых типов.",
      ctaLabel: "Открыть справочник",
    },
    {
      title: "30 типов внутри справочника",
      href: "#hairstyle-catalog",
      note: "Переход сразу к детальному слою, где в каждой группе сравниваются 5 базовых конструкций.",
      ctaLabel: "Открыть 30 типов",
    },
    {
      title: "Гид по модификаторам",
      href: "#selection-modifiers",
      note: "Уточнить фату, аксессуары, стиль свадьбы и длину волос без отдельного фильтра.",
      ctaLabel: "Открыть гид по модификаторам",
    },
  ] satisfies RelatedPage[],
} as const;

export type WeddingHairstylesPageData = typeof weddingHairstylesPageData;
