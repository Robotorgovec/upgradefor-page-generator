export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type TocItem = {
  href: string;
  label: string;
};

export type PopularStyleCard = {
  id: string;
  title: string;
  whenFits: string;
  hairAndLookFit: string;
  ctaLabel: string;
  ctaHref: string;
};

export type SelectionGroup = {
  id: string;
  anchorId: string;
  title: string;
  items: string[];
};

export type PerformerType = "Частный мастер" | "Студия" | "Выездная команда";
export type ServiceMode = "В салоне" | "На выезде";
export type ProfileState = "beta" | "active";

export type PerformerCard = {
  id: string;
  slug: string;
  displayName: string;
  performerType: PerformerType;
  city: string;
  specialization: string[];
  hairLengths: string[];
  serviceModes: ServiceMode[];
  experienceYears: number;
  priceFrom: number;
  priceTo: number;
  trialAvailable: boolean;
  portfolioCount: number;
  languages: string[];
  profileState: ProfileState;
  ctaHref: string;
  image: string | null;
  shortNote: string;
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

export const weddingHairstylesPageData = {
  pageMeta: {
    title: "Свадебные прически — идеи, стили и подбор мастера | Upgradefor",
    description:
      "Свадебные прически: популярные стили, советы по выбору мастера, подготовка к пробной укладке и анкеты исполнителей в формате WikiMarket.",
    canonicalPath: "/wikimarket/beauty/wedding-hairstyles",
    h1: "Свадебные прически",
  },
  breadcrumbs: [
    { label: "Главная", href: "/" },
    { label: "WikiMarket", href: "/wikimarket/categories" },
    { label: "Красота" },
    { label: "Свадебные прически" },
  ] satisfies BreadcrumbItem[],
  hero: {
    title: "Свадебные прически",
    lead:
      "Страница помогает выбрать стиль свадебной прически, сравнить критерии под ваш образ и перейти к подбору мастера в формате WikiMarket.",
    primaryCta: { label: "Подобрать мастера", href: "#request" },
    secondaryCta: { label: "Стать исполнителем", href: "/account/register?role=performer" },
  },
  quickAnswer: {
    title: "Короткий ответ за 15 секунд",
    text:
      "Свадебная прическа — это не только форма укладки, но и часть общего образа: платья, фаты, аксессуаров и тайминга свадебного дня. Начинать выбор лучше с практики, а не с одной красивой картинки.",
    priorities: [
      "длина и густота волос",
      "тип укладки и стойкость на весь день",
      "совместимость с фатой, диадемой или цветами",
      "наличие пробного образа до даты свадьбы",
      "формат работы мастера: в салоне или выезд на площадку",
    ],
  },
  toc: [
    { href: "#popular-styles", label: "Популярные стили" },
    { href: "#by-hair-length", label: "По длине волос" },
    { href: "#by-look-type", label: "По типу образа" },
    { href: "#performers", label: "Исполнители" },
    { href: "#how-to-choose", label: "Как выбрать мастера" },
    { href: "#pricing", label: "Стоимость" },
    { href: "#prep-checklist", label: "Подготовка" },
    { href: "#faq", label: "FAQ" },
  ] satisfies TocItem[],
  popularStyles: [
    {
      id: "low-bun",
      title: "Низкий пучок",
      whenFits: "Подходит для классической церемонии и образов с акцентом на украшения или открытую спину.",
      hairAndLookFit: "Чаще выбирают для средних и длинных волос, особенно с фатой средней длины.",
      ctaLabel: "Сравнить по параметрам",
      ctaHref: "#by-hair-length",
    },
    {
      id: "high-bun",
      title: "Высокий пучок",
      whenFits: "Удобный вариант для активного дня, фотосессии и смены локаций.",
      hairAndLookFit: "Лучше раскрывается на средней и длинной длине, акцентирует шею и линию плеч.",
      ctaLabel: "Проверить стойкость",
      ctaHref: "#pricing",
    },
    {
      id: "hollywood-wave",
      title: "Голливудская волна",
      whenFits: "Эффектный вариант для вечернего или ретро-образа с лаконичным платьем.",
      hairAndLookFit: "Оптимальна для средней и длинной длины, требует точной фиксации и контроля влажности.",
      ctaLabel: "Условия для образа",
      ctaHref: "#by-look-type",
    },
    {
      id: "curls",
      title: "Локоны",
      whenFits: "Романтичный формат для классики, outdoor-свадьбы и мягкого макияжа.",
      hairAndLookFit: "Подходит для всех длин при корректной технике подготовки и фиксации.",
      ctaLabel: "Выбрать формат мастера",
      ctaHref: "#performers",
    },
    {
      id: "braids",
      title: "Плетение / косы",
      whenFits: "Практичный вариант для длинной фотосессии и динамичной программы свадьбы.",
      hairAndLookFit: "Чаще всего для средней и длинной длины, хорошо сочетается с цветами.",
      ctaLabel: "Смотреть чек-лист",
      ctaHref: "#prep-checklist",
    },
    {
      id: "veil-updo",
      title: "Собранная прическа с фатой",
      whenFits: "Рабочий выбор, если важны крепление фаты и стойкость конструкции.",
      hairAndLookFit: "Подходит для разных длин при корректной точке фиксации аксессуара.",
      ctaLabel: "Как выбрать мастера",
      ctaHref: "#how-to-choose",
    },
  ] satisfies PopularStyleCard[],
  selectionGroups: [
    {
      id: "length",
      anchorId: "by-hair-length",
      title: "По длине волос",
      items: [
        "Короткие: акцент на текстуру, крепление аксессуаров и стойкость формы.",
        "Средние: самый гибкий диапазон решений — от волны до собранных форм.",
        "Длинные: больше вариативности, но выше требования к фиксации и таймингу.",
      ],
    },
    {
      id: "accessories",
      anchorId: "by-accessories",
      title: "По аксессуарам",
      items: [
        "С фатой: заранее определить точку крепления и баланс объема.",
        "С диадемой: проверить комфорт посадки и нагрузку на прическу.",
        "Без аксессуаров: сделать акцент на силуэт и текстуру укладки.",
        "С живыми/декоративными цветами: учитывать сезонность и свежесть материала.",
      ],
    },
    {
      id: "wedding-style",
      anchorId: "by-look-type",
      title: "По стилю свадьбы",
      items: [
        "Классика: собранные формы, аккуратный контур, спокойные линии.",
        "Минимализм: чистый силуэт без перегруженного декора.",
        "Романтичный стиль: мягкие волны, плетения, воздушный объем.",
        "Modern bridal: структурные формы и акцент на геометрию.",
        "Выездная церемония / outdoor: приоритет стойкости и защиты от погоды.",
      ],
    },
    {
      id: "practicality",
      anchorId: "by-practicality",
      title: "По практичности",
      items: [
        "Стойкие на весь день: приоритет фиксации и корректного распределения объема.",
        "Для жаркой погоды: легкие формы, которые держат контур без утяжеления.",
        "Для влажной погоды: техники, снижающие риск пушения и потери формы.",
        "Для активной фотосессии: прически, устойчивые к движению и смене локаций.",
      ],
    },
  ] satisfies SelectionGroup[],
  performersSection: {
    title: "Исполнители свадебных причесок",
    subtitle: "Анкеты мастеров и студий в формате WikiMarket",
    betaLabel: "Анкеты исполнителей (бета-формат)",
    becomeFirstCta: {
      label: "Стать первым исполнителем в разделе",
      href: "/account/register?role=performer",
    },
    performers: [
      {
        id: "wh-pro-001",
        slug: "bridal-hair-anna-petrova",
        displayName: "Анна Петрова Bridal Hair",
        performerType: "Частный мастер",
        city: "Екатеринбург",
        specialization: ["собранные свадебные прически", "укладки с фатой"],
        hairLengths: ["средние", "длинные"],
        serviceModes: ["На выезде", "В салоне"],
        experienceYears: 7,
        priceFrom: 6000,
        priceTo: 14000,
        trialAvailable: true,
        portfolioCount: 48,
        languages: ["Русский"],
        profileState: "beta",
        ctaHref: "#request",
        image: null,
        shortNote: "Фокус на стойких свадебных образах и ранних выездах по городу.",
      },
      {
        id: "wh-pro-002",
        slug: "studio-veil-and-style",
        displayName: "Студия Veil & Style",
        performerType: "Студия",
        city: "Москва",
        specialization: ["голливудская волна", "пробные образы"],
        hairLengths: ["короткие", "средние", "длинные"],
        serviceModes: ["В салоне"],
        experienceYears: 9,
        priceFrom: 8000,
        priceTo: 18000,
        trialAvailable: true,
        portfolioCount: 76,
        languages: ["Русский", "English"],
        profileState: "beta",
        ctaHref: "#request",
        image: null,
        shortNote: "Подходит для невест, которым важен заранее собранный тайминг утренних сборов.",
      },
      {
        id: "wh-pro-003",
        slug: "on-site-bridal-team-nova",
        displayName: "Выездная команда Bridal Nova",
        performerType: "Выездная команда",
        city: "Санкт-Петербург",
        specialization: ["прически для невесты и гостей", "outdoor-форматы"],
        hairLengths: ["средние", "длинные"],
        serviceModes: ["На выезде"],
        experienceYears: 5,
        priceFrom: 10000,
        priceTo: 24000,
        trialAvailable: true,
        portfolioCount: 39,
        languages: ["Русский"],
        profileState: "beta",
        ctaHref: "#request",
        image: null,
        shortNote: "Командный формат для сборов на площадке и при плотном свадебном графике.",
      },
      {
        id: "wh-pro-004",
        slug: "olga-bridal-texture",
        displayName: "Ольга Bridal Texture",
        performerType: "Частный мастер",
        city: "Казань",
        specialization: ["плетения", "прически с цветами"],
        hairLengths: ["короткие", "средние", "длинные"],
        serviceModes: ["На выезде", "В салоне"],
        experienceYears: 6,
        priceFrom: 5500,
        priceTo: 13000,
        trialAvailable: false,
        portfolioCount: 31,
        languages: ["Русский", "Татарский"],
        profileState: "beta",
        ctaHref: "#request",
        image: null,
        shortNote: "Специализация на естественных текстурах и спокойных романтичных образах.",
      },
    ] satisfies PerformerCard[],
  },
  chooseMasterChecklist: [
    "Уточните, есть ли пробная прическа и как она проходит по времени.",
    "Проверьте опыт именно в bridal hair, а не только в вечерних укладках.",
    "Спросите, как мастер работает с фатой, диадемой и другими аксессуарами.",
    "Уточните, как обеспечивается стойкость на весь свадебный день.",
    "Проверьте возможность раннего выезда и условия работы на локации.",
    "Уточните, может ли мастер работать в связке с визажистом и таймингом сборов.",
  ],
  pricingFactors: [
    "сложность выбранной прически",
    "длина и густота волос",
    "наличие и формат пробной прически",
    "ранний выезд мастера",
    "выезд на площадку и логистика",
    "количество образов в течение дня",
    "аксессуары и накладные элементы",
    "дополнительное время на фиксацию и корректировки",
  ],
  prepChecklist: [
    "Бронируйте мастера заранее, особенно если дата попадает на высокий сезон.",
    "Пробный образ лучше делать за 2-6 недель до свадьбы.",
    "На тест возьмите фото платья, фаты, аксессуаров и 2-3 референса.",
    "За день до свадьбы соблюдайте рекомендации мастера по подготовке волос.",
    "На пробе проверьте не только вид, но и комфорт в движении.",
    "В день свадьбы заложите запас времени на финальную фиксацию и фото.",
  ],
  faq: [
    {
      question: "Нужна ли пробная свадебная прическа?",
      answer:
        "Пробная прическа помогает заранее проверить форму, стойкость и совместимость с аксессуарами. Это снижает риск спешки и переделок в день свадьбы.",
    },
    {
      question: "Когда лучше бронировать мастера?",
      answer:
        "Оптимально бронировать сразу после подтверждения даты и площадки. На популярные даты места у специалистов заканчиваются заранее.",
    },
    {
      question: "Можно ли сделать прическу с фатой на короткие волосы?",
      answer:
        "Да, но важно заранее продумать крепление аксессуара и формат укладки. На пробе мастер покажет рабочую схему под вашу длину.",
    },
    {
      question: "Что выбрать: локоны или собранную укладку?",
      answer:
        "Решение зависит от погоды, длины волос, платья и программы дня. Для долгой активности чаще выбирают более собранные и устойчивые формы.",
    },
    {
      question: "Сколько держится свадебная прическа?",
      answer:
        "Стойкость зависит от техники, исходных волос и погодных условий. На консультации стоит отдельно обсудить формат фиксации под ваш сценарий дня.",
    },
    {
      question: "Нужен ли отдельный мастер для мамы и подружек невесты?",
      answer:
        "Если планируется несколько образов в сжатый тайминг, отдельный мастер или командный формат помогает избежать задержек перед церемонией.",
    },
    {
      question: "Что делать, если свадьба летом и жарко?",
      answer:
        "Выбирайте варианты с акцентом на стойкость, заранее тестируйте фиксацию и обсуждайте с мастером резервный сценарий корректировки в течение дня.",
    },
    {
      question: "Может ли мастер приехать на площадку?",
      answer:
        "Да, многие специалисты работают на выезде. Перед бронированием важно уточнить время прибытия, условия локации и стоимость логистики.",
    },
  ] satisfies FaqItem[],
  ctaBride: {
    title: "Нужна свадебная прическа под ваш образ?",
    text:
      "Опишите длину волос, дату, город и желаемый стиль — мы поможем подобрать формат мастера.",
    buttonLabel: "Оставить заявку",
    href: "/account/register?intent=wedding-hairstyles",
  },
  ctaPerformer: {
    title: "Вы мастер свадебных причесок?",
    text:
      "Разместите профиль, покажите специализацию, формат работы и собирайте целевые заявки.",
    buttonLabel: "Стать исполнителем",
    href: "/account/register?role=performer",
  },
  relatedPages: [
    {
      title: "Bridal makeup",
      href: "/wikimarket/beauty/bridal-makeup",
      note: "Соседний интент для комплексного bridal-образа.",
    },
    {
      title: "Evening hairstyles",
      href: "/wikimarket/beauty/evening-hairstyles",
      note: "Похожие задачи укладки для вечерних мероприятий.",
    },
    {
      title: "Wedding hair trial",
      href: "/wikimarket/beauty/wedding-hair-trial",
      note: "Отдельный интент про формат и цели пробной прически.",
    },
    {
      title: "Hairstyles with veil",
      href: "/wikimarket/beauty/hairstyles-with-veil",
      note: "Фокус на сценариях крепления и стилизации фаты.",
    },
    {
      title: "Short hair wedding hairstyles",
      href: "/wikimarket/beauty/short-hair-wedding-hairstyles",
      note: "Специализированный интент по короткой длине.",
    },
  ] satisfies RelatedPage[],
} as const;

export type WeddingHairstylesPageData = typeof weddingHairstylesPageData;
