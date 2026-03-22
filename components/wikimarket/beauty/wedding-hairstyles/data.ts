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
    title: "Свадебные прически — 6 групп, 30 типов и подбор мастера | WikiMarket",
    description:
      "Свадебные прически на WikiMarket: 6 главных bridal-групп, 30 типовых решений, modifiers для фаты и аксессуаров, подбор стиля и исполнителя в одной SEO-структуре.",
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
      "Top 100 вариантов, подбор по вашим параметрам и мастера под дату, формат сборов и аксессуары в одном сценарии.",
    imageAlt: "Premium wedding hairstyle for bride",
    badges: [
      { label: "Top 100 + фильтр" },
      { label: "Мастера под стиль" },
      { label: "6 групп и 30 типов" },
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
        text: "Taxonomy, каталог типов и modifiers остаются под рукой как второй этаж, а не мешают первому выбору.",
      },
    ] satisfies HeroPoint[],
    trustStrip: [
      { label: "Без неподтвержденных рейтингов и отзывов" },
      { label: "Стили, фильтр и мастера связаны в одном потоке" },
      { label: "Top 100 и detail pages остаются доступными для поиска" },
    ] satisfies HeroTrustItem[],
    supportCard: {
      title: "Три быстрых входа в страницу",
      text: "Открыть Top 100, подобрать по параметрам или сразу перейти к мастерам под выбранный стиль.",
      microCtaLabel: "Сравнить мастеров",
      microCtaHref: "#wedding-hairstyle-masters",
    },
    primaryCta: { label: "Открыть Top 100", href: "#top-100-hairstyles" } satisfies HeroCta,
    secondaryCta: { label: "Подобрать по параметрам", href: "#guided-selection" } satisfies HeroCta,
  },
  quickAnswer: {
    title: "Как выбирать без перегруза",
    bullets: [
      "Сначала отметьте 3-5 параметров и посмотрите, как меняется Top 100.",
      "Если нужен длинный тайминг, чаще выигрывают собранные формы и контролируемый объем у лица.",
      "Half-up и waves удобны, когда важно сохранить длину на фото и мягкое движение по спине.",
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
      { href: "#taxonomy-groups", label: "6 SEO-групп" },
      { href: "#hairstyle-catalog", label: "Каталог 30 типов" },
      { href: "#selection-modifiers", label: "Modifiers" },
      { href: "#personal-scenarios", label: "Сценарии выбора" },
      { href: "#pricing", label: "Цена и условия" },
      { href: "#process", label: "Как проходит заказ" },
      { href: "#prep", label: "Что подготовить заранее" },
      { href: "#faq", label: "FAQ" },
    ] satisfies TocItem[],
  },
  taxonomyOverviewSection: {
    id: "taxonomy-groups",
    title: "6 главных SEO-групп свадебных причесок",
    subtitle:
      "Это верхний слой навигации по стилям: здесь удобно сверить семейство формы, а затем уже углубляться в конкретные типы и modifiers.",
    jumpLabel: "Перейти к группе в каталоге",
    representativeLabel: "Representative types",
    seoIntentLabel: "Когда эту группу выбирают:",
  } satisfies TaxonomyOverviewSectionCopy,
  taxonomyCatalogSection: {
    id: "hairstyle-catalog",
    title: "30 типов свадебных причесок, сгруппированных по 6 кластерам",
    subtitle:
      "Каталог нужен как справочник после первого выбора: здесь удобно сравнивать близкие варианты внутри уже понятной группы.",
    intentLabel: "Частый сценарий выбора:",
    modifiersLabel: "Подходящие modifiers:",
    backToGroupsLabel: "Назад к 6 группам",
  } satisfies TaxonomyCatalogSectionCopy,
  modifierGuideSection: {
    id: "selection-modifiers",
    title: "Modifiers: что уточнять после выбора формы",
    subtitle:
      "Фата, pearls, tiara, boho/classic/modern и длина волос работают как уточняющие атрибуты. Их удобнее сверять после того, как вы уже выбрали близкое направление в Top 100 или taxonomy.",
    note:
      "Смотрите на modifiers как на практический чек-лист: где крепится аксессуар, сколько нужно мягкости у лица и как меняется силуэт по длине волос.",
  } satisfies ModifierGuideSectionCopy,
  modifierLibrary: {
    items: [
      {
        id: "with-veil",
        slug: "with-veil",
        label: "With veil / С фатой",
        description: "Нужно заранее проверить точку крепления и баланс объема вокруг гребня или шпильки.",
        category: "accessories",
      },
      {
        id: "with-pearls",
        slug: "with-pearls",
        label: "With pearls / С жемчугом",
        description: "Добавляет мягкий декоративный акцент и работает лучше на чисто читаемой форме.",
        category: "accessories",
      },
      {
        id: "with-tiara",
        slug: "with-tiara",
        label: "With tiara / С тиарой",
        description: "Требует контролируемой высоты в зоне макушки и понятной опорной линии.",
        category: "accessories",
      },
      {
        id: "boho",
        slug: "boho",
        label: "Boho",
        description: "Больше текстуры, движения и расслабленного bridal-настроения без тяжеловесности.",
        category: "style-direction",
      },
      {
        id: "classic",
        slug: "classic",
        label: "Classic / Классика",
        description: "Чистая форма, спокойный контур и timeless bridal look для церемоний с традиционным силуэтом.",
        category: "style-direction",
      },
      {
        id: "modern",
        slug: "modern",
        label: "Modern / Современный",
        description: "Гладкость, более графичные линии и editorial-feel для минималистичных образов.",
        category: "style-direction",
      },
      {
        id: "for-long-hair",
        slug: "for-long-hair",
        label: "For long hair / Для длинных волос",
        description: "Подходит, когда важно сохранить длину, объем и детали по спине или в пучке.",
        category: "hair-length",
      },
      {
        id: "for-medium-hair",
        slug: "for-medium-hair",
        label: "For medium hair / Для средней длины",
        description: "Самый гибкий диапазон для большинства bridal-конструкций и комбинированных форм.",
        category: "hair-length",
      },
      {
        id: "for-short-hair",
        slug: "for-short-hair",
        label: "For short hair / Для коротких волос",
        description: "Нужно раньше тестировать форму, направление локона и место крепления аксессуаров.",
        category: "hair-length",
      },
    ] satisfies TaxonomyModifier[],
    groups: [
      {
        id: "modifier-accessories",
        title: "Accessories / Аксессуары",
        description: "Уточняют крепление, высоту и чистоту формы, но не заменяют основную конструкцию.",
        modifierIds: ["with-veil", "with-pearls", "with-tiara"],
      },
      {
        id: "modifier-style-direction",
        title: "Style direction / Стилистика",
        description: "Помогает согласовать прическу с платьем, декором и общим тоном церемонии.",
        modifierIds: ["boho", "classic", "modern"],
      },
      {
        id: "modifier-hair-length",
        title: "Hair length / Длина волос",
        description: "Нужна для realistic shortlist без иллюзий по объему, длине и времени на укладку.",
        modifierIds: ["for-long-hair", "for-medium-hair", "for-short-hair"],
      },
    ] satisfies TaxonomyModifierGroup[],
  },
  taxonomyGroups: [
    {
      id: "buns",
      slug: "buns",
      anchorId: "bridal-buns",
      title: "Buns / Пучки",
      shortDescription:
        "Пучки нужны, когда важны чистый силуэт, устойчивость на длинный день и удобная работа с фатой или открытой спиной.",
      seoIntent:
        "Когда нужен аккуратный bridal bun для церемонии, фотосессии, фаты и длинного свадебного тайминга.",
      types: [
        {
          id: "low-bun",
          slug: "low-bun",
          name: "Low Bun",
          shortDescription:
            "Универсальный bridal bun для классической церемонии, спокойного профиля и комфортного крепления фаты.",
          primaryGroup: "buns",
          modifiers: ["with-veil", "classic", "for-medium-hair", "for-long-hair"],
          searchTerms: ["low bun wedding hairstyle", "bridal low bun", "низкий пучок невесты"],
        },
        {
          id: "sleek-low-bun",
          slug: "sleek-low-bun",
          name: "Sleek Low Bun",
          shortDescription:
            "Гладкая версия low bun для минималистичного платья, чистой линии затылка и editorial-финиша.",
          primaryGroup: "buns",
          modifiers: ["with-veil", "modern", "for-medium-hair", "for-long-hair"],
          searchTerms: ["sleek low bun bridal", "smooth bridal bun", "гладкий низкий пучок"],
        },
        {
          id: "messy-bun",
          slug: "messy-bun",
          name: "Messy Bun",
          shortDescription:
            "Мягкий текстурный bun для романтичного образа, когда нужен relaxed luxury без ощущения тяжести.",
          primaryGroup: "buns",
          modifiers: ["boho", "with-pearls", "for-medium-hair", "for-long-hair"],
          searchTerms: ["messy bun wedding hair", "textured bridal bun", "небрежный свадебный пучок"],
        },
        {
          id: "high-bun",
          slug: "high-bun",
          name: "High Bun",
          shortDescription:
            "Высокая посадка открывает шею и серьги, помогает держать форму при плотном тайминге дня.",
          primaryGroup: "buns",
          modifiers: ["with-tiara", "modern", "for-medium-hair", "for-long-hair"],
          searchTerms: ["high bun bridal", "elegant high bun wedding", "высокий свадебный пучок"],
        },
        {
          id: "braided-bun",
          slug: "braided-bun",
          name: "Braided Bun",
          shortDescription:
            "Комбинирует texture от braid и стабильность bun, когда нужна деталь без потери собранности.",
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
      title: "Updos / Собранные прически",
      shortDescription:
        "Собранные прически нужны, когда невесте важны controlled volume, заметная архитектура и надежная фиксация на церемонию и банкет.",
      seoIntent:
        "Когда нужен structured updo для раннего выезда, длинного дня и аккуратной работы с платьем и аксессуарами.",
      types: [
        {
          id: "classic-chignon",
          slug: "classic-chignon",
          name: "Classic Chignon",
          shortDescription:
            "Традиционная свадебная форма для спокойного силуэта, строгой посадки и timeless bridal-ощущения.",
          primaryGroup: "updos",
          modifiers: ["with-veil", "classic", "for-medium-hair", "for-long-hair"],
          searchTerms: ["classic chignon wedding", "bridal chignon", "классический шиньон невесты"],
        },
        {
          id: "romantic-updo",
          slug: "romantic-updo",
          name: "Romantic Updo",
          shortDescription:
            "Мягкая собранная форма с деликатным объемом у лица для романтичного и светлого bridal-образа.",
          primaryGroup: "updos",
          modifiers: ["with-pearls", "classic", "for-medium-hair", "for-long-hair"],
          searchTerms: ["romantic bridal updo", "soft wedding updo", "романтичная собранная прическа"],
        },
        {
          id: "textured-updo",
          slug: "textured-updo",
          name: "Textured Updo",
          shortDescription:
            "Форма с заметной текстурой и объемом у макушки, когда нужен акцент без тяжелого глянца.",
          primaryGroup: "updos",
          modifiers: ["modern", "boho", "for-medium-hair", "for-long-hair"],
          searchTerms: ["textured updo wedding", "bridal textured updo", "текстурная собранная прическа"],
        },
        {
          id: "twisted-updo",
          slug: "twisted-updo",
          name: "Twisted Updo",
          shortDescription:
            "Собранная форма на скрутках для чистой детализации и более сложного, но аккуратного рисунка.",
          primaryGroup: "updos",
          modifiers: ["with-tiara", "classic", "for-medium-hair", "for-long-hair"],
          searchTerms: ["twisted updo bridal", "twist wedding hairstyle", "собранная прическа со скрутками"],
        },
        {
          id: "loose-updo",
          slug: "loose-updo",
          name: "Loose Updo",
          shortDescription:
            "Более свободный updo для мягкого контура у лица и баланса между собранностью и движением.",
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
      title: "Half-Up Half-Down / Полусобранные",
      shortDescription:
        "Полусобранные формы подходят, когда важно сохранить длину на фото, но при этом открыть лицо и удержать верхнюю зону.",
      seoIntent:
        "Когда невесте нужна мягкая длина по спине, совместимость с фатой и более романтичный силуэт без полного updo.",
      types: [
        {
          id: "classic-half-up-half-down",
          slug: "classic-half-up-half-down",
          name: "Classic Half-Up Half-Down",
          shortDescription:
            "Базовая полусобранная форма для мягкого bridal-силуэта и контролируемой линии у лица.",
          primaryGroup: "half-up-half-down",
          modifiers: ["with-veil", "classic", "for-medium-hair", "for-long-hair"],
          searchTerms: ["classic half up half down wedding", "bridal half up hair", "классическая полусобранная прическа"],
        },
        {
          id: "half-up-with-curls",
          slug: "half-up-with-curls",
          name: "Half-Up with Curls",
          shortDescription:
            "Полусобранная база с мягкими локонами для романтичного эффекта и читаемой длины на фото.",
          primaryGroup: "half-up-half-down",
          modifiers: ["with-pearls", "classic", "for-medium-hair", "for-long-hair"],
          searchTerms: ["half up curls wedding hair", "curly half up bridal", "полусобранные локоны невесты"],
        },
        {
          id: "half-up-with-braid",
          slug: "half-up-with-braid",
          name: "Half-Up with Braid",
          shortDescription:
            "Добавляет текстурную braid-деталь в верхнюю зону, не убирая длину и мягкость по спине.",
          primaryGroup: "half-up-half-down",
          modifiers: ["boho", "with-veil", "for-long-hair"],
          searchTerms: ["half up braid wedding", "braided half up bridal", "полусобранная прическа с косой"],
        },
        {
          id: "half-up-with-volume",
          slug: "half-up-with-volume",
          name: "Half-Up with Volume",
          shortDescription:
            "Подходит, когда нужна более заметная линия макушки и balancing effect для фаты или тиары.",
          primaryGroup: "half-up-half-down",
          modifiers: ["with-tiara", "modern", "for-medium-hair", "for-long-hair"],
          searchTerms: ["half up volume wedding", "voluminous half up bridal", "полусобранная прическа с объемом"],
        },
        {
          id: "veil-ready-half-up-style",
          slug: "veil-ready-half-up-style",
          name: "Veil-Ready Half-Up Style",
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
      title: "Waves & Curls / Волны и локоны",
      shortDescription:
        "Волны и локоны нужны, когда хочется сохранить движение, блеск и видимую длину без жесткой архитектуры.",
      seoIntent:
        "Когда приоритетом становятся мягкость, фотогеничность длины и более relaxed либо glamorous bridal-настроение.",
      types: [
        {
          id: "hollywood-waves",
          slug: "hollywood-waves",
          name: "Hollywood Waves",
          shortDescription:
            "Гладкая глянцевая волна для вечернего bridal-образа, выразительной линии у лица и фотогеничного блеска.",
          primaryGroup: "waves-curls",
          modifiers: ["modern", "classic", "for-medium-hair", "for-long-hair"],
          searchTerms: ["hollywood waves wedding", "bridal hollywood waves", "голливудская волна невесты"],
        },
        {
          id: "soft-bridal-curls",
          slug: "soft-bridal-curls",
          name: "Soft Bridal Curls",
          shortDescription:
            "Мягкие локоны для деликатного объема и романтичного образа на средней или даже укороченной длине.",
          primaryGroup: "waves-curls",
          modifiers: ["with-pearls", "classic", "for-medium-hair", "for-short-hair"],
          searchTerms: ["soft bridal curls", "soft curls wedding hair", "мягкие локоны невесты"],
        },
        {
          id: "loose-curls",
          slug: "loose-curls",
          name: "Loose Curls",
          shortDescription:
            "Более свободный вариант для boho-настроения, живого движения и relaxed silhouette без перегруза.",
          primaryGroup: "waves-curls",
          modifiers: ["boho", "modern", "for-medium-hair", "for-short-hair"],
          searchTerms: ["loose curls wedding hairstyle", "bridal loose curls", "свободные локоны на свадьбу"],
        },
        {
          id: "beach-waves",
          slug: "beach-waves",
          name: "Beach Waves",
          shortDescription:
            "Небрежная волна с текстурой для outdoor-свадьбы, boho-декора и более расслабленной эстетики.",
          primaryGroup: "waves-curls",
          modifiers: ["boho", "modern", "for-medium-hair", "for-long-hair"],
          searchTerms: ["beach waves bridal", "wedding beach waves", "пляжные волны невесты"],
        },
        {
          id: "side-swept-waves",
          slug: "side-swept-waves",
          name: "Side-Swept Waves",
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
      title: "Ponytails / Хвосты",
      shortDescription:
        "Свадебные хвосты подходят для современного bridal-образа, открытой шеи и сценариев, где нужен быстрый refresh формы.",
      seoIntent:
        "Когда нужен modern ponytail для чистой линии, заметной длины и более свежего editorial-настроения.",
      types: [
        {
          id: "low-ponytail",
          slug: "low-ponytail",
          name: "Low Ponytail",
          shortDescription:
            "Низкий хвост для лаконичного силуэта, аккуратной спины платья и controlled finish без жесткости.",
          primaryGroup: "ponytails",
          modifiers: ["with-veil", "classic", "for-medium-hair", "for-long-hair"],
          searchTerms: ["low ponytail wedding hair", "bridal low ponytail", "низкий свадебный хвост"],
        },
        {
          id: "sleek-ponytail",
          slug: "sleek-ponytail",
          name: "Sleek Ponytail",
          shortDescription:
            "Гладкий хвост для minimal bride, четкой линии лица и современной подаче без лишнего декора.",
          primaryGroup: "ponytails",
          modifiers: ["modern", "with-tiara", "for-medium-hair", "for-short-hair"],
          searchTerms: ["sleek ponytail bridal", "smooth ponytail wedding", "гладкий свадебный хвост"],
        },
        {
          id: "high-ponytail",
          slug: "high-ponytail",
          name: "High Ponytail",
          shortDescription:
            "Высокий хвост дает lifting effect, открывает лицо и помогает сохранить свежий вид до вечера.",
          primaryGroup: "ponytails",
          modifiers: ["modern", "with-tiara", "for-medium-hair", "for-long-hair"],
          searchTerms: ["high ponytail wedding", "bridal high ponytail", "высокий свадебный хвост"],
        },
        {
          id: "wavy-ponytail",
          slug: "wavy-ponytail",
          name: "Wavy Ponytail",
          shortDescription:
            "Сочетает controlled base и мягкую длину, когда хочется хвост без ощущения строгости.",
          primaryGroup: "ponytails",
          modifiers: ["with-pearls", "classic", "for-medium-hair", "for-long-hair"],
          searchTerms: ["wavy ponytail bridal", "wedding ponytail waves", "волнистый хвост невесты"],
        },
        {
          id: "ponytail-with-crown-volume",
          slug: "ponytail-with-crown-volume",
          name: "Ponytail with Crown Volume",
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
      title: "Braids / Косы и плетения",
      shortDescription:
        "Плетения помогают добавить texture, boho-движение и более заметную ручную работу без декоративного перегруза.",
      seoIntent:
        "Когда невесте нужна braid-based форма для outdoor-свадьбы, текстуры, аксессуаров и мягкого движения на фото.",
      types: [
        {
          id: "french-braid",
          slug: "french-braid",
          name: "French Braid",
          shortDescription:
            "Базовое структурное плетение для аккуратной фиксации и контролируемого направления волос.",
          primaryGroup: "braids",
          modifiers: ["boho", "for-medium-hair", "for-long-hair", "with-veil"],
          searchTerms: ["french braid wedding hairstyle", "bridal french braid", "французская коса невесты"],
        },
        {
          id: "fishtail-braid",
          slug: "fishtail-braid",
          name: "Fishtail Braid",
          shortDescription:
            "Дает более заметную фактуру и смотрится богато на длинных волосах и в живом свете.",
          primaryGroup: "braids",
          modifiers: ["boho", "with-pearls", "for-long-hair"],
          searchTerms: ["fishtail braid wedding", "bridal fishtail braid", "рыбий хвост свадебная прическа"],
        },
        {
          id: "crown-braid",
          slug: "crown-braid",
          name: "Crown Braid",
          shortDescription:
            "Плетение по кругу для выразительной верхней линии и более собранного boho-classic баланса.",
          primaryGroup: "braids",
          modifiers: ["with-veil", "classic", "for-medium-hair", "for-long-hair"],
          searchTerms: ["crown braid wedding hair", "bridal crown braid", "корона из кос на свадьбу"],
        },
        {
          id: "side-braid",
          slug: "side-braid",
          name: "Side Braid",
          shortDescription:
            "Уводит объем на одну сторону и хорошо сочетается с открытым плечом или асимметричным платьем.",
          primaryGroup: "braids",
          modifiers: ["boho", "with-pearls", "for-medium-hair", "for-long-hair"],
          searchTerms: ["side braid bridal", "wedding side braid", "боковая коса невесты"],
        },
        {
          id: "waterfall-braid",
          slug: "waterfall-braid",
          name: "Waterfall Braid",
          shortDescription:
            "Оставляет длину видимой и добавляет декоративную braid-линию для мягкого романтичного образа.",
          primaryGroup: "braids",
          modifiers: ["boho", "with-pearls", "for-medium-hair", "for-long-hair"],
          searchTerms: ["waterfall braid wedding", "bridal waterfall braid", "водопад коса свадебная прическа"],
        },
      ] satisfies TaxonomyType[],
    },
  ] satisfies TaxonomyGroup[],
  selector: {
    title: "Подобрать прическу",
    text: "Отметьте 3-5 параметров, и мы поднимем в Top 100 стили, которые ближе к вашему сценарию.",
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
      title: "Нужен короткий бриф под платье, фату и тайминг дня?",
      text: "Отправьте параметры, и мы соберем shortlist мастеров под выбранный стиль и формат сборов.",
      buttonLabel: "Получить подбор мастеров",
      href: "/account/register?intent=wedding-hairstyles",
    },
  },
  popularStylesSection: {
    title: "Featured styles до полного каталога",
    subtitle:
      "Это не случайная россыпь карточек, а быстрый вход в самые частые bridal-направления перед просмотром всех 30 типов.",
  } satisfies SectionCopy,
  popularStyles: [
    {
      id: "low-bun",
      sourceTypeId: "low-bun",
      title: "Low Bun",
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
      title: "Hollywood Waves",
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
      title: "Textured Updo",
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
      title: "High Bun",
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
      title: "Boho Braid",
      suitedFor: "Длинные волосы, outdoor-церемония, романтичный образ и живой декор.",
      effect: "Текстурный объем, мягкая динамика и заметная прическа без тяжести.",
      whenToChoose:
        "Если нужен расслабленный bridal-настрой с хорошей читаемостью на фото и в движении.",
      ctaLabel: "Открыть плетения в каталоге",
      ctaHref: "#bridal-braids",
      tags: ["long", "veil-no", "romantic", "balanced", "day", "round", "venue", "trial-yes"],
    },
    {
      id: "half-up-half-down-curls",
      sourceTypeId: "half-up-with-curls",
      title: "Half-Up with Curls",
      suitedFor: "Средняя и длинная длина, украшение-гребень, мягкий bridal-образ и фата.",
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
      note: "Смотрите waves & curls, sleek ponytail и заранее проверяйте, как крепятся аксессуары.",
      ctaLabel: "Открыть modifiers по длине",
      ctaHref: "#selection-modifiers",
    },
    {
      id: "medium",
      title: "Средняя длина",
      note: "Самый гибкий диапазон: доступны buns, updos, half-up и мягкие волны.",
      ctaLabel: "Смотреть каталог 30 типов",
      ctaHref: "#hairstyle-catalog",
    },
    {
      id: "long",
      title: "Длинные волосы",
      note: "Добавьте запас по времени на проработку формы, объема и финальную фиксацию.",
      ctaLabel: "Открыть buns и braids",
      ctaHref: "#bridal-buns",
    },
    {
      id: "veil",
      title: "Если будет фата",
      note: "Ключевой вопрос - точка крепления и баланс с высотой или объемом прически.",
      ctaLabel: "Открыть modifiers",
      ctaHref: "#selection-modifiers",
    },
    {
      id: "open-back",
      title: "Открытая спина / плечи",
      note: "Собранные силуэты и чистые ponytails чаще лучше подчеркивают линию шеи.",
      ctaLabel: "Открыть buns и ponytails",
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
      note: "Можно позволить более графичный или сияющий финиш: waves, sleek bun, polished ponytail.",
      ctaLabel: "Открыть evening-friendly типы",
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
      note: "Чаще работают curls, half-up with curls, loose updo и waterfall braid.",
      ctaLabel: "Открыть мягкие типы",
      ctaHref: "#half-up-with-curls",
    },
    {
      id: "strict",
      title: "Собранный строгий образ",
      note: "Четкая архитектура формы помогает держать вид в плотном свадебном тайминге.",
      ctaLabel: "Открыть structured группы",
      ctaHref: "#bridal-updos",
    },
  ] satisfies ScenarioItem[],
  performersSection: {
    title: "Исполнители свадебных причесок",
    subtitle:
      "Ниже можно сразу сравнить мастеров под выбранный стиль, формат сборов, пробный образ и условия бронирования.",
    disclaimer:
      "Карточки показывают, как будет выглядеть сравнение исполнителей: без шумных рейтингов, с упором на специализацию, выезд и подготовку к свадебному дню.",
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
        displayName: "Профиль исполнителя B",
        cityLabel: "Город: указывается в анкете",
        workFormat: "Формат работы: студия",
        specialization: "Специализация: волны, гладкие формы, вечерний bridal",
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
        "Чаще выбирают buns, updos или устойчивые half-up варианты: так проще контролировать крепление и комфорт в течение дня.",
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
  relatedPagesSection: {
    title: "Related paths",
    subtitle: "Рабочие переходы внутри bridal-сценария: к смежным разделам, справочнику групп и каталогу типов.",
  } satisfies SectionCopy,
  relatedPages: [
    {
      title: "Свадебный макияж",
      href: "/wikimarket/beauty/bridal-makeup",
      note: "Существующий beauty-intent для комплексного bridal-образа в одной воронке выбора.",
    },
    {
      title: "6 главных bridal-групп",
      href: "#taxonomy-groups",
      note: "Быстрый возврат к верхнему taxonomy layer этой страницы без лишней прокрутки.",
    },
    {
      title: "Каталог 30 типов",
      href: "#hairstyle-catalog",
      note: "Переход к сгруппированному каталогу, где все типы уже разложены по кластерам.",
    },
    {
      title: "Modifiers guide",
      href: "#selection-modifiers",
      note: "Уточнить фату, аксессуары, стиль свадьбы и длину волос без отдельного filter-engine.",
    },
  ] satisfies RelatedPage[],
} as const;

export type WeddingHairstylesPageData = typeof weddingHairstylesPageData;
