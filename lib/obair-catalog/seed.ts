export interface ObairSeedModel {
  modelCodeRaw: string;
  modelCodeNormalized: string;
  displayName: string;
  slug: string;
  applicationType: string[];
  airflowMinM3h: number;
  airflowMaxM3h: number;
  staticPressureMinPa?: number;
  staticPressureMaxPa?: number;
  mountingType: string[];
  notes?: string;
  sourcePageRefs: string[];
  manufacturerReviewRequired?: boolean;
}

export interface ObairSeedSeries {
  code: string;
  name: string;
  applicationType: string[];
  standardSelectable: boolean;
  manufacturerReviewRequired: boolean;
  models: ObairSeedModel[];
}

export interface ObairSeedFamily {
  code: "BF" | "GXH" | "FG" | "ZKW";
  name: string;
  description: string;
  series: ObairSeedSeries[];
}

export const OBAIR_CATALOG_VERSION = "OBAIR-PDF-MVP-2026-04";

export const obairSeedFamilies: ObairSeedFamily[] = [
  {
    code: "BF",
    name: "Box Type Ventilation Unit",
    description: "BF family for standard box ventilation use-cases.",
    series: [
      {
        code: "BF",
        name: "BF Standard",
        applicationType: ["ventilation"],
        standardSelectable: true,
        manufacturerReviewRequired: false,
        models: [
          {
            modelCodeRaw: "BF-080",
            modelCodeNormalized: "BF-080",
            displayName: "BF 080",
            slug: "bf-080",
            applicationType: ["ventilation"],
            airflowMinM3h: 2000,
            airflowMaxM3h: 8000,
            staticPressureMinPa: 100,
            staticPressureMaxPa: 600,
            mountingType: ["indoor-standard", "limited-space"],
            sourcePageRefs: ["BF public page range"],
          },
          {
            modelCodeRaw: "BF-320",
            modelCodeNormalized: "BF-320",
            displayName: "BF 320",
            slug: "bf-320",
            applicationType: ["ventilation"],
            airflowMinM3h: 8001,
            airflowMaxM3h: 50000,
            staticPressureMinPa: 100,
            staticPressureMaxPa: 1000,
            mountingType: ["indoor-standard", "rooftop"],
            sourcePageRefs: ["BF public page range"],
          },
        ],
      },
    ],
  },
  {
    code: "GXH",
    name: "Heat Recovery Fresh Air Ventilation Unit",
    description: "GXH family for fresh/exhaust with heat recovery.",
    series: [
      {
        code: "GXH",
        name: "GXH Heat Recovery",
        applicationType: ["fresh-air", "exhaust", "heat-recovery"],
        standardSelectable: true,
        manufacturerReviewRequired: false,
        models: [
          {
            modelCodeRaw: "GXH-100",
            modelCodeNormalized: "GXH-100",
            displayName: "GXH 100",
            slug: "gxh-100",
            applicationType: ["fresh-air", "exhaust", "heat-recovery"],
            airflowMinM3h: 3000,
            airflowMaxM3h: 15000,
            staticPressureMinPa: 150,
            staticPressureMaxPa: 800,
            mountingType: ["indoor-standard", "technical-floor"],
            sourcePageRefs: ["GXH public page range"],
          },
          {
            modelCodeRaw: "GXH-300",
            modelCodeNormalized: "GXH-300",
            displayName: "GXH 300",
            slug: "gxh-300",
            applicationType: ["fresh-air", "exhaust", "heat-recovery"],
            airflowMinM3h: 15001,
            airflowMaxM3h: 50000,
            staticPressureMinPa: 150,
            staticPressureMaxPa: 1000,
            mountingType: ["indoor-standard", "technical-floor", "rooftop"],
            sourcePageRefs: ["GXH public page range"],
          },
        ],
      },
    ],
  },
  {
    code: "FG",
    name: "Cabinet Fan Coil / Cabinet Air-side Unit",
    description: "FG family for cabinet-style coil-centric air treatment.",
    series: [
      {
        code: "FG",
        name: "FG Cabinet",
        applicationType: ["cooling", "heating", "ventilation"],
        standardSelectable: true,
        manufacturerReviewRequired: false,
        models: [
          {
            modelCodeRaw: "FG-060",
            modelCodeNormalized: "FG-060",
            displayName: "FG 060",
            slug: "fg-060",
            applicationType: ["cooling", "heating", "ventilation"],
            airflowMinM3h: 2000,
            airflowMaxM3h: 12000,
            staticPressureMinPa: 200,
            staticPressureMaxPa: 1200,
            mountingType: ["limited-space", "ceiling"],
            sourcePageRefs: ["FG public page range"],
          },
          {
            modelCodeRaw: "FG-180",
            modelCodeNormalized: "FG-180",
            displayName: "FG 180",
            slug: "fg-180",
            applicationType: ["cooling", "heating", "ventilation"],
            airflowMinM3h: 12001,
            airflowMaxM3h: 36000,
            staticPressureMinPa: 200,
            staticPressureMaxPa: 2000,
            mountingType: ["indoor-standard", "technical-floor"],
            sourcePageRefs: ["FG public page range"],
          },
        ],
      },
    ],
  },
  {
    code: "ZKW",
    name: "Modular Air Handling Unit",
    description: "ZKW modular AHU family for cleanroom and complex treatment systems.",
    series: [
      {
        code: "ZKW",
        name: "ZKW Modular AHU",
        applicationType: ["ahu", "cleanroom", "ventilation", "cooling", "heating"],
        standardSelectable: false,
        manufacturerReviewRequired: true,
        models: [
          {
            modelCodeRaw: "ZKW-050",
            modelCodeNormalized: "ZKW-050",
            displayName: "ZKW 050",
            slug: "zkw-050",
            applicationType: ["ahu", "cleanroom", "ventilation", "cooling", "heating"],
            airflowMinM3h: 5000,
            airflowMaxM3h: 50000,
            staticPressureMinPa: 200,
            staticPressureMaxPa: 1500,
            mountingType: ["technical-floor", "rooftop"],
            sourcePageRefs: ["ZKW public page claim"],
            manufacturerReviewRequired: true,
            notes: "Project configuration usually requires manufacturer engineering review.",
          },
          {
            modelCodeRaw: "ZKW-200",
            modelCodeNormalized: "ZKW-200",
            displayName: "ZKW 200",
            slug: "zkw-200",
            applicationType: ["ahu", "cleanroom", "ventilation", "cooling", "heating"],
            airflowMinM3h: 50001,
            airflowMaxM3h: 200000,
            staticPressureMinPa: 200,
            staticPressureMaxPa: 2000,
            mountingType: ["technical-floor", "rooftop"],
            sourcePageRefs: ["ZKW public page claim"],
            manufacturerReviewRequired: true,
            notes: "Project configuration usually requires manufacturer engineering review.",
          },
        ],
      },
    ],
  },
];
