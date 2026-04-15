export type CopperAluminumHeatExchangerQuestion = {
  id: string;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  topic?: string;
};

export const COPPER_ALUMINUM_HEAT_EXCHANGER_GAME_PATH =
  "/wikimarket/hvac/copper-aluminum-heat-exchangers";

export const COPPER_ALUMINUM_HEAT_EXCHANGER_QUESTIONS: CopperAluminumHeatExchangerQuestion[] = [
  {
    id: "construction-core",
    prompt: "What best describes the core construction of a copper-aluminum coil?",
    options: [
      "Copper tubes with aluminum fins",
      "Aluminum tubes with plastic fins",
      "Steel tubes with copper mesh",
      "Only copper plates without fins",
    ],
    correctIndex: 0,
    explanation:
      "This coil style typically uses copper tubing for refrigerant flow and aluminum fins on the air side to improve heat exchange.",
    topic: "construction",
  },
  {
    id: "why-fins",
    prompt: "Why are fins added around the tubes in these heat exchangers?",
    options: [
      "To increase air-side surface area for heat transfer",
      "To hold liquid refrigerant storage",
      "To replace the need for airflow",
      "To eliminate all corrosion risks",
    ],
    correctIndex: 0,
    explanation:
      "Fins multiply contact area between metal and moving air, which improves heat transfer effectiveness on the air side.",
    topic: "heat-transfer",
  },
  {
    id: "fouling-airflow",
    prompt: "What is a common effect of dust buildup on the fin surface?",
    options: [
      "It can block airflow and reduce heat transfer",
      "It increases airflow automatically",
      "It strengthens fin geometry",
      "It has no operational impact",
    ],
    correctIndex: 0,
    explanation:
      "Air-side fouling creates resistance to airflow and reduces useful heat exchange, often increasing system stress.",
    topic: "maintenance",
  },
  {
    id: "bent-fins",
    prompt: "How do bent fins typically affect coil performance?",
    options: [
      "They reduce airflow pathways and lower efficiency",
      "They improve fan balance",
      "They improve drain management",
      "They increase refrigerant pressure control",
    ],
    correctIndex: 0,
    explanation:
      "Bent fins choke airflow channels, reducing the air-side performance that the fin pack is designed to provide.",
    topic: "maintenance",
  },
  {
    id: "maintenance-principle",
    prompt: "Which maintenance approach is most appropriate for aluminum fin surfaces?",
    options: [
      "Gentle cleaning that preserves fin geometry",
      "Aggressive scraping with hard metal tools",
      "Skipping cleaning until complete blockage",
      "Sealing the fin pack with paint",
    ],
    correctIndex: 0,
    explanation:
      "Maintenance should remove contamination while protecting fragile fin structure and keeping airflow passages open.",
    topic: "maintenance",
  },
  {
    id: "corrosion-awareness",
    prompt: "Why should corrosion risk be reviewed in harsh environments?",
    options: [
      "Mixed metals and contaminants can accelerate degradation",
      "Copper and aluminum are always immune to corrosion",
      "Only the fan motor can corrode",
      "Corrosion only matters in indoor cleanrooms",
    ],
    correctIndex: 0,
    explanation:
      "Environmental moisture, salts, and pollutants can increase corrosion risks, especially where different metals and residues interact.",
    topic: "reliability",
  },
  {
    id: "common-use",
    prompt: "Where are copper-aluminum coils commonly found?",
    options: [
      "HVAC equipment such as evaporators and condensers",
      "Only in decorative furniture",
      "Only in high-voltage switchgear",
      "Only in medical imaging magnets",
    ],
    correctIndex: 0,
    explanation:
      "These coils are widely used in HVAC and refrigeration systems where compact air-side heat exchange is required.",
    topic: "applications",
  },
  {
    id: "working-fluid",
    prompt: "Inside the copper tubes, what usually carries heat in these systems?",
    options: [
      "A refrigerant or thermal fluid",
      "Dry ambient air",
      "Insulation foam",
      "Only cleaning solution",
    ],
    correctIndex: 0,
    explanation:
      "The tube side usually carries refrigerant or another process fluid, while the fin side exchanges heat with airflow.",
    topic: "construction",
  },
  {
    id: "ignore-fouling",
    prompt: "Why is ignoring air-side fouling a bad idea?",
    options: [
      "Because reduced airflow can increase energy use and stress operation",
      "Because fouling improves thermal contact",
      "Because fouling reduces fan power demand to zero",
      "Because fouling only changes appearance",
    ],
    correctIndex: 0,
    explanation:
      "When airflow is restricted, heat transfer drops and equipment may run longer or under less favorable operating conditions.",
    topic: "operations",
  },
  {
    id: "knowledge-vs-awareness",
    prompt: "Which statement shows maintenance awareness rather than only construction knowledge?",
    options: [
      "Monitor fin condition and cleanliness to protect airflow over time",
      "A coil has tubes and fins",
      "Copper is a metal",
      "A fan moves air",
    ],
    correctIndex: 0,
    explanation:
      "Knowing parts is construction knowledge. Acting on fouling, fin damage, and corrosion risk reflects real maintenance awareness.",
    topic: "competence",
  },
];
