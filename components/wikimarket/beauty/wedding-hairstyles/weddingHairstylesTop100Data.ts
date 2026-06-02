export type WeddingHairstyleCategory =
  | "bun"
  | "updo"
  | "waves"
  | "half-up"
  | "braid"
  | "ponytail"
  | "short-style"
  | "locs"
  | "protective"
  | "curls";

export type HairTextureGroup = "universal" | "straight-to-wavy" | "curly-to-coily" | "locs";

type WeddingHairstyleSeed = {
  slug: string;
  category: WeddingHairstyleCategory;
  hairTextureGroup: HairTextureGroup;
  isProtectiveStyle?: boolean;
  shortLabel?: string;
};

type WeddingHairstyleCategoryMeta = {
  label: string;
  description: string;
  intro: string;
  hairLengthNote: string;
  vibeLabel: string;
};

export type WeddingHairstyleRecord = {
  id: string;
  slug: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
  assetFilename: string;
  variant?: "closeup";
  isApproved: true;
  detailHref: string;
  mastersFilterKey: string;
  category: WeddingHairstyleCategory;
  categoryLabel: string;
  description: string;
  intro: string;
  hairLengthNote: string;
  textureNote: string;
  vibeLabel: string;
  isProtectiveStyle?: boolean;
  hairTextureGroup?: HairTextureGroup;
  shortLabel?: string;
  sortOrder: number;
};

export type ResolvedWeddingHairstyleRecord = WeddingHairstyleRecord & {
  hasLiveImage: boolean;
  liveImageSrc: string | null;
  liveImageExtension: string | null;
};

const TOP_100_ASSET_BASE_PATH = "/assets/media/wikimarket/beauty/wedding-hairstyles/top-100";

const CATEGORY_META: Record<WeddingHairstyleCategory, WeddingHairstyleCategoryMeta> = {
  bun: {
    label: "Пучки",
    description: "гладкая или текстурная свадебная форма с чистой линией шеи и удобным балансом для фаты.",
    intro: "Этот кластер рассчитан на длинный свадебный тайминг, чистый силуэт и контролируемый объем.",
    hairLengthNote: "Лучше всего для средней и длинной длины, когда нужны структура и надежная фиксация.",
    vibeLabel: "Полированный и вне времени",
  },
  updo: {
    label: "Собранные формы",
    description: "собранная свадебная конструкция с текстурой, высотой и готовностью к длинному событию.",
    intro: "Этот кластер держит силуэт собранным и оставляет место для шпилек, цветов и мягких прядей у лица.",
    hairLengthNote: "Лучше работает на средней и длинной длине с достаточной плотностью для формы и опоры.",
    vibeLabel: "Журнальный и объемный",
  },
  waves: {
    label: "Волны",
    description: "открытая свадебная укладка с блеском, мягкостью и заметным движением в кадре.",
    intro: "Этот кластер сохраняет длину видимой и подходит свадьбам, где важны глянец, мягкость и движение.",
    hairLengthNote: "Оптимально для средней и длинной длины, когда нужны видимая длина, выразительный эффект и мягкая динамика.",
    vibeLabel: "Мягкий гламур",
  },
  "half-up": {
    label: "Полусобранные",
    description: "сбалансированная форма, которая открывает лицо и сохраняет видимую длину.",
    intro: "Этот кластер соединяет распущенную длину и структуру, поэтому удобен для фаты, гребней и мягкой макушки.",
    hairLengthNote: "Лучше всего для средней и длинной длины, когда нужны подъем у лица и длина по спине.",
    vibeLabel: "Сбалансированный и романтичный",
  },
  braid: {
    label: "Плетения",
    description: "детализированный свадебный образ с плетением и читаемым рисунком на фото.",
    intro: "Этот кластер подходит церемониям на открытой площадке, boho-стилистике и образам с заметной ручной фактурой.",
    hairLengthNote: "Сильнее всего раскрывается на средней и длинной длине, где хватает запаса для рисунка и ширины.",
    vibeLabel: "Фактурный и выразительный",
  },
  ponytail: {
    label: "Хвосты",
    description: "гладкая или текстурная свадебная линия, которая оставляет профиль современным и фотогеничным.",
    intro: "Этот кластер подходит невестам, которым нужны движение и чистая форма без полностью собранной прически.",
    hairLengthNote: "Лучше всего для средней и длинной длины, где хвост становится частью визуального акцента.",
    vibeLabel: "Современный и направленный",
  },
  "short-style": {
    label: "Короткие стрижки",
    description: "короткий свадебный силуэт, построенный вокруг финиша, формы и посадки аксессуаров.",
    intro: "Этот кластер помогает сделать короткую длину намеренной: важны контур, блеск и точка декора.",
    hairLengthNote: "Подходит для пикси, боба и лоба, где финиш и баланс аксессуаров важнее массы волос.",
    vibeLabel: "Точный и выверенный",
  },
  locs: {
    label: "Локсы",
    description: "свадебный образ на локсы с уважением к структуре, декору и контролю силуэта.",
    intro: "Этот кластер нужен, когда локсы должны остаться аутентичными и при этом выглядеть свадебно.",
    hairLengthNote: "Адаптируется под разную длину; форма зависит от плотности локсов, веса декора и точек крепления.",
    vibeLabel: "Естественный и приподнятый",
  },
  protective: {
    label: "Защитные укладки",
    description: "свадебный образ на защитную укладку с чистыми проборами и готовностью к декору.",
    intro: "Этот кластер удерживает образ продуманным и учитывает стойкость плетений и скруток в день церемонии.",
    hairLengthNote: "Требования к длине зависят от способа подготовки; силуэт задают плотность и расположение кос или скруток.",
    vibeLabel: "Структурный и акцентный",
  },
  curls: {
    label: "Естественные кудри",
    description: "свадебная форма на естественные кудри, где важны четкость, мягкость и объем по слоям.",
    intro: "Этот кластер сохраняет естественное движение и помогает держать финиш стабильным для фото.",
    hairLengthNote: "Работает на средней и длинной длине, если заранее продуманы увлажнение и четкость завитка.",
    vibeLabel: "Мягкий объем и текстура",
  },
};

const TEXTURE_NOTES: Record<HairTextureGroup, string> = {
  universal: "Подходит большинству подготовленных текстур; итог зависит от густоты, подготовки и нагрузки фаты или аксессуаров.",
  "straight-to-wavy":
    "Лучше всего для прямой и волнистой текстуры, где блеск, направление браша и контроль влажности формируют финальный вид.",
  "curly-to-coily":
    "Подходит кудрявой и плотной текстуре, где четкость завитка, стратегия вытяжения и баланс увлажнения входят в финальную форму.",
  locs: "Разработано для локсов: результат зависит от размера, плотности, веса украшений и точек фиксации.",
};

const ALT_VIEW_PHRASES = [
  "портрет невесты в ракурсе три четверти",
  "полубоковой свадебный ракурс",
  "деталь со спины с формой под фату",
  "профиль с аккуратной текстурой",
  "мягкий журнальный ракурс",
  "вид со спины для церемонии",
  "деталь макушки с акцентом на аксессуар",
  "портрет невесты при естественном свете",
  "деталь формы для банкета",
  "боковой профиль с мягким движением",
];

const TITLE_OVERRIDES: Record<string, string> = {
  "half-up-half-down-curls-wedding-hairstyle": "Half-Up Half-Down Curls",
  "half-up-soft-waves-wedding-hairstyle": "Half-Up Soft Waves",
  "half-up-braid-crown-wedding-hairstyle": "Half-Up Braid Crown",
  "half-up-floral-detail-wedding-hairstyle": "Half-Up Floral Detail",
  "half-up-volume-curls-wedding-hairstyle": "Half-Up Volume Curls",
  "half-up-locs-bridal-wedding-hairstyle": "Half-Up Locs Bridal Style",
  "locs-half-updo-wedding-hairstyle": "Locs Half-Updo",
  "old-hollywood-waves-wedding-hairstyle": "Old Hollywood Waves",
  "soft-curled-ponytail-wedding-hairstyle": "Soft Curled Ponytail",
  "side-part-short-curls-wedding-hairstyle": "Side-Part Short Curls",
  "soft-curls-locs-wedding-hairstyle": "Soft Curls on Locs",
  "natural-curly-puff-wedding-hairstyle": "Natural Curly Puff",
  "defined-coils-updo-wedding-hairstyle": "Defined Coils Updo",
  "afro-textured-side-part-wedding-hairstyle": "Afro-Textured Side Part",
};

const WORD_OVERRIDES: Record<string, string> = {
  afro: "Afro",
  beach: "Beach",
  bob: "Bob",
  boho: "Boho",
  braid: "Braid",
  braided: "Braided",
  bridal: "Bridal",
  bubble: "Bubble",
  bun: "Bun",
  center: "Center",
  chignon: "Chignon",
  coils: "Coils",
  cornrow: "Cornrow",
  crown: "Crown",
  curls: "Curls",
  curly: "Curly",
  defined: "Defined",
  dutch: "Dutch",
  elegant: "Elegant",
  finger: "Finger",
  fishtail: "Fishtail",
  floral: "Floral",
  fulani: "Fulani",
  glam: "Glam",
  goddess: "Goddess",
  glossy: "Glossy",
  halo: "Halo",
  half: "Half",
  high: "High",
  hollywood: "Hollywood",
  knotless: "Knotless",
  knotted: "Knotted",
  locs: "Locs",
  lob: "Lob",
  loose: "Loose",
  low: "Low",
  marley: "Marley",
  mermaid: "Mermaid",
  modern: "Modern",
  natural: "Natural",
  old: "Old",
  part: "Part",
  passion: "Passion",
  pearl: "Pearl",
  pins: "Pins",
  pixie: "Pixie",
  ponytail: "Ponytail",
  puff: "Puff",
  pull: "Pull",
  ribbon: "Ribbon",
  romantic: "Romantic",
  rope: "Rope",
  sculpted: "Sculpted",
  short: "Short",
  side: "Side",
  sleek: "Sleek",
  smooth: "Smooth",
  soft: "Soft",
  swept: "Swept",
  textured: "Textured",
  twist: "Twist",
  twisted: "Twisted",
  tucked: "Tucked",
  updo: "Updo",
  veil: "Veil",
  vintage: "Vintage",
  volume: "Volume",
  waves: "Waves",
  waterfall: "Waterfall",
  wrapped: "Wrapped",
};

const TOP_100_SEED: WeddingHairstyleSeed[] = [
  { slug: "smooth-low-bun-wedding-hairstyle", category: "bun", hairTextureGroup: "straight-to-wavy" },
  { slug: "classic-low-bun-wedding-hairstyle", category: "bun", hairTextureGroup: "universal" },
  { slug: "sleek-low-bun-wedding-hairstyle", category: "bun", hairTextureGroup: "straight-to-wavy" },
  { slug: "center-part-low-bun-wedding-hairstyle", category: "bun", hairTextureGroup: "straight-to-wavy" },
  { slug: "romantic-low-bun-wedding-hairstyle", category: "bun", hairTextureGroup: "universal" },
  { slug: "pearl-low-bun-wedding-hairstyle", category: "bun", hairTextureGroup: "universal" },
  { slug: "twisted-low-bun-wedding-hairstyle", category: "bun", hairTextureGroup: "universal" },
  { slug: "braided-low-bun-wedding-hairstyle", category: "bun", hairTextureGroup: "universal" },
  { slug: "chignon-low-bun-wedding-hairstyle", category: "bun", hairTextureGroup: "straight-to-wavy" },
  { slug: "soft-volume-low-bun-wedding-hairstyle", category: "bun", hairTextureGroup: "universal" },
  { slug: "elegant-high-bun-wedding-hairstyle", category: "bun", hairTextureGroup: "universal" },
  { slug: "modern-high-bun-wedding-hairstyle", category: "bun", hairTextureGroup: "universal" },
  { slug: "ballerina-bun-wedding-hairstyle", category: "bun", hairTextureGroup: "straight-to-wavy" },
  { slug: "textured-high-bun-wedding-hairstyle", category: "bun", hairTextureGroup: "universal" },
  { slug: "veil-ready-high-bun-wedding-hairstyle", category: "bun", hairTextureGroup: "universal" },
  { slug: "curly-high-bun-wedding-hairstyle", category: "bun", hairTextureGroup: "curly-to-coily" },
  { slug: "braided-high-bun-wedding-hairstyle", category: "bun", hairTextureGroup: "universal" },
  { slug: "sculpted-high-bun-wedding-hairstyle", category: "bun", hairTextureGroup: "straight-to-wavy" },
  { slug: "messy-high-bun-wedding-hairstyle", category: "bun", hairTextureGroup: "universal" },
  { slug: "knotted-high-bun-wedding-hairstyle", category: "bun", hairTextureGroup: "universal" },
  { slug: "textured-updo-wedding-hairstyle", category: "updo", hairTextureGroup: "universal" },
  { slug: "soft-updo-wedding-hairstyle", category: "updo", hairTextureGroup: "universal" },
  { slug: "romantic-updo-wedding-hairstyle", category: "updo", hairTextureGroup: "universal" },
  { slug: "floral-updo-wedding-hairstyle", category: "updo", hairTextureGroup: "universal" },
  { slug: "loose-updo-wedding-hairstyle", category: "updo", hairTextureGroup: "universal" },
  { slug: "french-twist-updo-wedding-hairstyle", category: "updo", hairTextureGroup: "straight-to-wavy" },
  { slug: "modern-twist-updo-wedding-hairstyle", category: "updo", hairTextureGroup: "universal" },
  { slug: "crown-updo-wedding-hairstyle", category: "updo", hairTextureGroup: "universal" },
  { slug: "vintage-updo-wedding-hairstyle", category: "updo", hairTextureGroup: "straight-to-wavy" },
  { slug: "airy-updo-wedding-hairstyle", category: "updo", hairTextureGroup: "universal" },
  { slug: "hollywood-waves-wedding-hairstyle", category: "waves", hairTextureGroup: "straight-to-wavy" },
  { slug: "boho-beach-waves-wedding-hairstyle", category: "waves", hairTextureGroup: "straight-to-wavy" },
  { slug: "glossy-soft-waves-wedding-hairstyle", category: "waves", hairTextureGroup: "straight-to-wavy" },
  { slug: "side-swept-waves-wedding-hairstyle", category: "waves", hairTextureGroup: "straight-to-wavy" },
  { slug: "old-hollywood-waves-wedding-hairstyle", category: "waves", hairTextureGroup: "straight-to-wavy" },
  { slug: "mermaid-waves-wedding-hairstyle", category: "waves", hairTextureGroup: "straight-to-wavy" },
  { slug: "brushed-out-waves-wedding-hairstyle", category: "waves", hairTextureGroup: "straight-to-wavy" },
  { slug: "vintage-waves-wedding-hairstyle", category: "waves", hairTextureGroup: "straight-to-wavy" },
  { slug: "loose-glam-waves-wedding-hairstyle", category: "waves", hairTextureGroup: "straight-to-wavy" },
  { slug: "waterfall-waves-wedding-hairstyle", category: "waves", hairTextureGroup: "straight-to-wavy" },
  { slug: "half-up-half-down-curls-wedding-hairstyle", category: "half-up", hairTextureGroup: "universal" },
  { slug: "half-up-soft-waves-wedding-hairstyle", category: "half-up", hairTextureGroup: "straight-to-wavy" },
  { slug: "half-up-braid-crown-wedding-hairstyle", category: "half-up", hairTextureGroup: "universal" },
  { slug: "half-up-twists-wedding-hairstyle", category: "half-up", hairTextureGroup: "universal" },
  { slug: "half-up-pearl-pins-wedding-hairstyle", category: "half-up", hairTextureGroup: "universal" },
  { slug: "half-up-bow-detail-wedding-hairstyle", category: "half-up", hairTextureGroup: "universal" },
  { slug: "half-up-ponytail-wedding-hairstyle", category: "half-up", hairTextureGroup: "straight-to-wavy" },
  { slug: "half-up-floral-detail-wedding-hairstyle", category: "half-up", hairTextureGroup: "universal" },
  { slug: "half-up-volume-curls-wedding-hairstyle", category: "half-up", hairTextureGroup: "curly-to-coily" },
  { slug: "half-up-veil-ready-wedding-hairstyle", category: "half-up", hairTextureGroup: "universal" },
  { slug: "boho-braid-wedding-hairstyle", category: "braid", hairTextureGroup: "universal" },
  { slug: "fishtail-braid-wedding-hairstyle", category: "braid", hairTextureGroup: "straight-to-wavy" },
  { slug: "crown-braid-wedding-hairstyle", category: "braid", hairTextureGroup: "universal" },
  { slug: "dutch-braid-wedding-hairstyle", category: "braid", hairTextureGroup: "universal" },
  { slug: "halo-braid-wedding-hairstyle", category: "braid", hairTextureGroup: "universal" },
  { slug: "waterfall-braid-wedding-hairstyle", category: "braid", hairTextureGroup: "straight-to-wavy" },
  { slug: "side-braid-wedding-hairstyle", category: "braid", hairTextureGroup: "universal" },
  { slug: "braided-ponytail-wedding-hairstyle", category: "braid", hairTextureGroup: "universal" },
  { slug: "rope-braid-wedding-hairstyle", category: "braid", hairTextureGroup: "straight-to-wavy" },
  { slug: "pull-through-braid-wedding-hairstyle", category: "braid", hairTextureGroup: "universal" },
  { slug: "sleek-low-ponytail-wedding-hairstyle", category: "ponytail", hairTextureGroup: "straight-to-wavy" },
  { slug: "soft-curled-ponytail-wedding-hairstyle", category: "ponytail", hairTextureGroup: "universal" },
  { slug: "bubble-ponytail-wedding-hairstyle", category: "ponytail", hairTextureGroup: "straight-to-wavy" },
  { slug: "wrapped-ponytail-wedding-hairstyle", category: "ponytail", hairTextureGroup: "straight-to-wavy" },
  { slug: "glam-high-ponytail-wedding-hairstyle", category: "ponytail", hairTextureGroup: "straight-to-wavy" },
  { slug: "romantic-ponytail-wedding-hairstyle", category: "ponytail", hairTextureGroup: "universal" },
  { slug: "side-part-ponytail-wedding-hairstyle", category: "ponytail", hairTextureGroup: "straight-to-wavy" },
  { slug: "textured-low-ponytail-wedding-hairstyle", category: "ponytail", hairTextureGroup: "universal" },
  { slug: "braided-high-ponytail-wedding-hairstyle", category: "ponytail", hairTextureGroup: "universal" },
  { slug: "ribbon-detail-ponytail-wedding-hairstyle", category: "ponytail", hairTextureGroup: "straight-to-wavy" },
  { slug: "pixie-texture-wedding-hairstyle", category: "short-style", hairTextureGroup: "universal" },
  { slug: "short-wave-bob-wedding-hairstyle", category: "short-style", hairTextureGroup: "straight-to-wavy" },
  { slug: "sleek-bridal-bob-wedding-hairstyle", category: "short-style", hairTextureGroup: "straight-to-wavy" },
  { slug: "side-part-short-curls-wedding-hairstyle", category: "short-style", hairTextureGroup: "curly-to-coily" },
  { slug: "finger-waves-bob-wedding-hairstyle", category: "short-style", hairTextureGroup: "straight-to-wavy" },
  { slug: "tucked-back-short-style-wedding-hairstyle", category: "short-style", hairTextureGroup: "universal" },
  { slug: "pearl-pin-bob-wedding-hairstyle", category: "short-style", hairTextureGroup: "straight-to-wavy" },
  { slug: "soft-volume-lob-wedding-hairstyle", category: "short-style", hairTextureGroup: "universal" },
  { slug: "side-swept-bob-wedding-hairstyle", category: "short-style", hairTextureGroup: "straight-to-wavy" },
  { slug: "vintage-short-glam-wedding-hairstyle", category: "short-style", hairTextureGroup: "straight-to-wavy" },
  { slug: "half-up-locs-bridal-wedding-hairstyle", category: "locs", hairTextureGroup: "locs", isProtectiveStyle: true },
  { slug: "locs-bun-bridal-wedding-hairstyle", category: "locs", hairTextureGroup: "locs", isProtectiveStyle: true },
  { slug: "locs-crown-bridal-wedding-hairstyle", category: "locs", hairTextureGroup: "locs", isProtectiveStyle: true },
  { slug: "locs-ponytail-bridal-wedding-hairstyle", category: "locs", hairTextureGroup: "locs", isProtectiveStyle: true },
  { slug: "braided-locs-updo-wedding-hairstyle", category: "locs", hairTextureGroup: "locs", isProtectiveStyle: true },
  { slug: "floral-locs-style-wedding-hairstyle", category: "locs", hairTextureGroup: "locs", isProtectiveStyle: true },
  { slug: "twisted-locs-bun-wedding-hairstyle", category: "locs", hairTextureGroup: "locs", isProtectiveStyle: true },
  { slug: "soft-curls-locs-wedding-hairstyle", category: "locs", hairTextureGroup: "locs", isProtectiveStyle: true },
  { slug: "locs-half-updo-wedding-hairstyle", category: "locs", hairTextureGroup: "locs", isProtectiveStyle: true },
  { slug: "locs-side-swept-wedding-hairstyle", category: "locs", hairTextureGroup: "locs", isProtectiveStyle: true },
  {
    slug: "fulani-braids-bridal-wedding-hairstyle",
    category: "protective",
    hairTextureGroup: "curly-to-coily",
    isProtectiveStyle: true,
  },
  {
    slug: "goddess-braids-bridal-wedding-hairstyle",
    category: "protective",
    hairTextureGroup: "curly-to-coily",
    isProtectiveStyle: true,
  },
  {
    slug: "knotless-braids-bun-wedding-hairstyle",
    category: "protective",
    hairTextureGroup: "curly-to-coily",
    isProtectiveStyle: true,
  },
  {
    slug: "cornrow-low-bun-wedding-hairstyle",
    category: "protective",
    hairTextureGroup: "curly-to-coily",
    isProtectiveStyle: true,
  },
  {
    slug: "twist-crown-bridal-wedding-hairstyle",
    category: "protective",
    hairTextureGroup: "curly-to-coily",
    isProtectiveStyle: true,
  },
  {
    slug: "passion-twists-updo-wedding-hairstyle",
    category: "protective",
    hairTextureGroup: "curly-to-coily",
    isProtectiveStyle: true,
  },
  {
    slug: "marley-twists-bun-wedding-hairstyle",
    category: "protective",
    hairTextureGroup: "curly-to-coily",
    isProtectiveStyle: true,
  },
  {
    slug: "natural-curly-puff-wedding-hairstyle",
    category: "curls",
    hairTextureGroup: "curly-to-coily",
    isProtectiveStyle: true,
  },
  {
    slug: "defined-coils-updo-wedding-hairstyle",
    category: "curls",
    hairTextureGroup: "curly-to-coily",
    isProtectiveStyle: true,
  },
  { slug: "afro-textured-side-part-wedding-hairstyle", category: "curls", hairTextureGroup: "curly-to-coily" },
];

const APPROVED_ASSET_MAPPING_BY_SLUG = new Map(
  weddingHairstylesTop100ApprovedAssetMappings.map((item) => [item.slug, item] as const),
);

if (APPROVED_ASSET_MAPPING_BY_SLUG.size !== TOP_100_SEED.length) {
  throw new Error(
    `Top 100 wedding hairstyle asset mapping coverage mismatch: ${APPROVED_ASSET_MAPPING_BY_SLUG.size}/${TOP_100_SEED.length}.`,
  );
}

function toTitleCase(word: string) {
  const normalizedWord = WORD_OVERRIDES[word] ?? word;
  return normalizedWord
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getDisplayTitle(slug: string) {
  if (TITLE_OVERRIDES[slug]) {
    return TITLE_OVERRIDES[slug];
  }

  return slug
    .replace(/-bridal-wedding-hairstyle$/, "")
    .replace(/-wedding-hairstyle$/, "")
    .split("-")
    .map((word) => toTitleCase(word))
    .join(" ");
}

function getMastersFilterKey(slug: string) {
  return slug.replace(/-bridal-wedding-hairstyle$/, "").replace(/-wedding-hairstyle$/, "");
}

function getShortLabel(title: string) {
  const parts = title.split(" ");
  return parts.slice(0, Math.min(3, parts.length)).join(" ");
}

function getImageAlt(title: string, index: number) {
  const phrase = ALT_VIEW_PHRASES[index % ALT_VIEW_PHRASES.length];
  return `Невеста с прической ${title}, ${phrase}`;
}

function buildDetailHref(slug: string) {
  return `/wikimarket/beauty/wedding-hairstyles/${slug}`;
}

function buildMastersHref(filterKey: string) {
  return `/wikimarket/beauty/wedding-hairstyles?hairstyle=${filterKey}#wedding-hairstyle-masters`;
}

function buildRecord(seed: WeddingHairstyleSeed, index: number): WeddingHairstyleRecord {
  const categoryMeta = CATEGORY_META[seed.category];
  const title = getDisplayTitle(seed.slug);
  const mastersFilterKey = getMastersFilterKey(seed.slug);
  const approvedAsset = APPROVED_ASSET_MAPPING_BY_SLUG.get(seed.slug);

  if (!approvedAsset) {
    throw new Error(`Missing approved wedding hairstyle asset mapping for slug "${seed.slug}".`);
  }

  return {
    id: `wedding-hairstyle-top100-${index + 1}`,
    slug: seed.slug,
    title,
    imageSrc: `${TOP_100_ASSET_BASE_PATH}/${approvedAsset.assetFilename}`,
    imageAlt: getImageAlt(title, index),
    assetFilename: approvedAsset.assetFilename,
    variant: approvedAsset.variant,
    isApproved: approvedAsset.isApproved,
    detailHref: buildDetailHref(seed.slug),
    mastersFilterKey,
    category: seed.category,
    categoryLabel: categoryMeta.label,
    description: `${title}: ${categoryMeta.description}`,
    intro: `${categoryMeta.intro} ${title} остается удобным для фаты, украшений и портретов невесты без перегруза галерейной подачей.`,
    hairLengthNote: categoryMeta.hairLengthNote,
    textureNote: TEXTURE_NOTES[seed.hairTextureGroup],
    vibeLabel: categoryMeta.vibeLabel,
    isProtectiveStyle: seed.isProtectiveStyle,
    hairTextureGroup: seed.hairTextureGroup,
    shortLabel: seed.shortLabel ?? getShortLabel(title),
    sortOrder: index + 1,
  };
}

export const weddingHairstylesTop100Registry = TOP_100_SEED.map(buildRecord);

export const weddingHairstylesTop100CanonicalSlugs = weddingHairstylesTop100Registry.map((item) => item.slug);

export const weddingHairstylesTop100ApprovedAssetFilenames = weddingHairstylesTop100Registry.map(
  (item) => item.assetFilename,
);

export const weddingHairstylesTop100ExpectedPngFiles = weddingHairstylesTop100Registry.map(
  (item) => item.assetFilename,
);

export const weddingHairstylesTop100CategoryOrder: WeddingHairstyleCategory[] = [
  "bun",
  "updo",
  "waves",
  "half-up",
  "braid",
  "ponytail",
  "short-style",
  "locs",
  "protective",
  "curls",
];

export function getWeddingHairstyleBySlug(slug: string) {
  return weddingHairstylesTop100Registry.find((item) => item.slug === slug) ?? null;
}

export function getWeddingHairstyleByFilterKey(filterKey: string) {
  return weddingHairstylesTop100Registry.find((item) => item.mastersFilterKey === filterKey) ?? null;
}

export function getWeddingHairstylesGroupedByCategory() {
  return weddingHairstylesTop100CategoryOrder.map((category) => ({
    category,
    label: CATEGORY_META[category].label,
    items: weddingHairstylesTop100Registry.filter((item) => item.category === category),
  }));
}

export function buildWeddingHairstyleMastersHref(filterKey: string) {
  return buildMastersHref(filterKey);
}
import { weddingHairstylesTop100ApprovedAssetMappings } from "./weddingHairstylesTop100AssetMapping";
