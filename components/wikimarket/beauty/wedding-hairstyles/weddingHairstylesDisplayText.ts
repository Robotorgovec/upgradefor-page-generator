import type { WeddingHairstyleRecord } from "./weddingHairstylesTop100Data";

type DisplaySource = Pick<WeddingHairstyleRecord, "mastersFilterKey" | "title">;
type DescriptionSource = DisplaySource & Pick<WeddingHairstyleRecord, "description">;
type ImageAltSource = DisplaySource & Pick<WeddingHairstyleRecord, "imageAlt">;

const TITLE_OVERRIDES_BY_KEY: Record<string, string> = {
  "classic-low-bun": "Классический низкий пучок",
  "romantic-low-bun": "Романтичный низкий пучок",
  "twisted-low-bun": "Низкий пучок со скрутками",
  "braided-low-bun": "Низкий пучок с плетением",
  "center-part-low-bun": "Низкий пучок с центральным пробором",
  "pearl-low-bun": "Низкий пучок с жемчужным акцентом",
  "chignon-low-bun": "Низкий шиньон",
  "soft-volume-low-bun": "Низкий пучок с мягким объемом",
  "elegant-high-bun": "Элегантный высокий пучок",
  "modern-high-bun": "Современный высокий пучок",
  "textured-high-bun": "Текстурный высокий пучок",
  "veil-ready-high-bun": "Высокий пучок под фату",
  "curly-high-bun": "Высокий пучок на кудрях",
  "braided-high-bun": "Высокий пучок с плетением",
  "messy-high-bun": "Расслабленный высокий пучок",
  "soft-updo": "Мягкая собранная форма",
  "romantic-updo": "Романтичная собранная форма",
  "floral-updo": "Собранная форма с цветами",
  "loose-updo": "Свободная собранная форма",
  "french-twist-updo": "Французский твист",
  "modern-twist-updo": "Современный твист",
  "crown-updo": "Собранная форма с акцентом у макушки",
  "vintage-updo": "Винтажная собранная форма",
  "hollywood-waves": "Голливудская волна",
  "boho-beach-waves": "Бохо-пляжные волны",
  "glossy-soft-waves": "Глянцевые мягкие волны",
  "brushed-out-waves": "Расчесанные мягкие волны",
  "loose-glam-waves": "Свободные гламурные волны",
  "waterfall-waves": "Волны с эффектом водопада",
  "half-up-half-down-curls": "Полусобранная прическа с локонами",
  "half-up-soft-waves": "Полусобранная прическа с мягкими волнами",
  "half-up-braid-crown": "Полусобранная прическа с косой-короной",
  "half-up-twists": "Полусобранная прическа со скрутками",
  "half-up-pearl-pins": "Полусобранная прическа с жемчужными шпильками",
  "half-up-bow-detail": "Полусобранная прическа с бантом",
  "half-up-ponytail": "Полусобранный хвост",
  "half-up-floral-detail": "Полусобранная прическа с цветочным акцентом",
  "half-up-volume-curls": "Полусобранная прическа с объемными локонами",
  "half-up-veil-ready": "Полусобранная прическа под фату",
  "half-up-locs": "Локсы в полусобранной форме",
  "half-up-locs-bridal": "Свадебные локсы в полусобранной форме",
  "locs-half-updo": "Локсы в полусобранной форме",
  "old-hollywood-waves": "Волны старого Голливуда",
  "side-swept-waves": "Волны на одну сторону",
  "boho-braid": "Бохо-плетение",
  "fishtail-braid": "Плетение «рыбий хвост»",
  "crown-braid": "Коса-корона",
  "dutch-braid": "Голландская коса",
  "halo-braid": "Коса-венок",
  "waterfall-braid": "Коса-водопад",
  "side-braid": "Боковая коса",
  "braided-ponytail": "Хвост с плетением",
  "rope-braid": "Коса-жгут",
  "pull-through-braid": "Протяжное плетение",
  "sleek-low-ponytail": "Гладкий низкий хвост",
  "soft-curled-ponytail": "Мягкий хвост с локонами",
  "bubble-ponytail": "Пузырьковый хвост",
  "wrapped-ponytail": "Хвост с обернутым основанием",
  "glam-high-ponytail": "Гламурный высокий хвост",
  "romantic-ponytail": "Романтичный хвост",
  "side-part-ponytail": "Хвост на боковой пробор",
  "textured-low-ponytail": "Текстурный низкий хвост",
  "braided-high-ponytail": "Высокий хвост с плетением",
  "ribbon-detail-ponytail": "Хвост с лентой",
  "pixie-texture": "Текстурная пикси",
  "short-wave-bob": "Короткий боб с волной",
  "sleek-bridal-bob": "Гладкий свадебный боб",
  "side-part-short-curls": "Короткие локоны на боковой пробор",
  "finger-waves-bob": "Боб с ретро-волнами",
  "tucked-back-short-style": "Короткая укладка, убранная назад",
  "pearl-pin-bob": "Боб с жемчужными шпильками",
  "soft-volume-lob": "Лоб с мягким объемом",
  "side-swept-bob": "Боб на одну сторону",
  "vintage-short-glam": "Винтажная короткая гламурная укладка",
  "locs-bun": "Пучок из локсов",
  "locs-crown": "Локсы-корона",
  "locs-ponytail": "Хвост из локсов",
  "braided-locs-updo": "Собранная форма из локсов с плетением",
  "floral-locs-style": "Локсы с цветочным акцентом",
  "twisted-locs-bun": "Пучок из скрученных локсов",
  "soft-curls-locs": "Мягкие локоны на локсах",
  "locs-side-swept": "Локсы на одну сторону",
  "fulani-braids": "Косы фулани",
  "goddess-braids": "Объемные защитные косы",
  "natural-curly-puff": "Естественный кудрявый объем",
  "defined-coils-updo": "Собранная форма с четкими завитками",
  "afro-textured-side-part": "Афро-текстура на боковой пробор",
  "ponytail-with-crown-volume": "Хвост с объемом у макушки",
  "knotless-braids-bun": "Пучок из безузловых кос",
  "cornrow-low-bun": "Низкий пучок с корнроу",
  "twist-crown": "Корона из скруток",
  "passion-twists-updo": "Собранная форма из пэшн-твистов",
  "marley-twists-bun": "Пучок из марли-твистов",
  "twist-out-bridal-curls": "Свадебные локоны после твист-аута",
};

const WORD_TRANSLATIONS: Record<string, string> = {
  afro: "афро",
  airy: "воздушная",
  ballerina: "балетный",
  beach: "пляжные",
  bob: "боб",
  boho: "бохо",
  braid: "коса",
  braided: "с плетением",
  braids: "косы",
  bridal: "свадебный",
  bubble: "пузырьковый",
  bun: "пучок",
  center: "центральный",
  chignon: "шиньон",
  classic: "классический",
  coils: "завитки",
  cornrow: "корнроу",
  crown: "корона",
  curls: "локоны",
  curly: "кудрявый",
  defined: "четкие",
  dutch: "голландская",
  elegant: "элегантный",
  finger: "ретро",
  fishtail: "рыбий хвост",
  floral: "цветочный",
  french: "французский",
  fulani: "фулани",
  glam: "гламурные",
  goddess: "goddess",
  glossy: "глянцевые",
  halo: "венок",
  high: "высокий",
  hollywood: "голливудские",
  knotless: "безузловые",
  knotted: "узловой",
  locs: "локсы",
  lob: "лоб",
  loose: "свободные",
  low: "низкий",
  marley: "marley",
  mermaid: "русалочьи",
  messy: "текстурный",
  modern: "современный",
  natural: "естественный",
  old: "ретро",
  part: "пробор",
  passion: "passion",
  pearl: "жемчужный",
  pins: "шпильки",
  pixie: "пикси",
  ponytail: "хвост",
  puff: "объем",
  pull: "протяжная",
  ribbon: "лента",
  romantic: "романтичный",
  rope: "жгут",
  sculpted: "скульптурный",
  short: "короткие",
  side: "боковой",
  sleek: "полированный",
  smooth: "гладкий",
  soft: "мягкие",
  swept: "на одну сторону",
  textured: "текстурный",
  twist: "твист",
  twisted: "скрученный",
  tucked: "подвернутый",
  updo: "собранная форма",
  veil: "под фату",
  vintage: "винтажный",
  volume: "объем",
  waves: "волны",
  waterfall: "водопад",
  wrapped: "обернутый",
};

function sentenceCase(value: string) {
  if (!value) {
    return value;
  }

  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function normalizeGeneratedTitle(value: string) {
  return value
    .replace(/\bполусобранная down\b/g, "полусобранная прическа")
    .replace(/\bбоковой пробор\b/g, "на боковой пробор")
    .replace(/\bцентральный пробор\b/g, "с центральным пробором")
    .replace(/\bс плетением локсы\b/g, "локсы с плетением")
    .replace(/\bпротяжная through\b/g, "протяжное плетение")
    .replace(/\s+/g, " ")
    .trim();
}

function buildTitleFromKey(key: string) {
  const translatedWords = key.split("-").map((word) => WORD_TRANSLATIONS[word] ?? word);
  return sentenceCase(normalizeGeneratedTitle(translatedWords.join(" ")));
}

export function getWeddingHairstyleDisplayTitle(hairstyle: DisplaySource) {
  return TITLE_OVERRIDES_BY_KEY[hairstyle.mastersFilterKey] ?? buildTitleFromKey(hairstyle.mastersFilterKey);
}

export function getWeddingHairstyleDisplayDescription(hairstyle: DescriptionSource) {
  return hairstyle.description.replace(hairstyle.title, getWeddingHairstyleDisplayTitle(hairstyle));
}

export function getWeddingHairstyleDisplayImageAlt(hairstyle: ImageAltSource) {
  return hairstyle.imageAlt.replace(
    `прической ${hairstyle.title}`,
    `прической ${getWeddingHairstyleDisplayTitle(hairstyle)}`,
  );
}
