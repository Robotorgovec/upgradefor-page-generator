import manifest from "./index.json";
import alucoilSystems from "./alucoil-systems.json";
import deltaCoolingDistribution from "./delta-cooling-distribution.json";
import gulfClimateSupply from "./gulf-climate-supply.json";
import nordcoilOem from "./nordcoil-oem.json";
import retrofitHvacLab from "./retrofit-hvac-lab.json";

import type { Company } from "../../../lib/wikimarket/company-types";

const companyRegistry: Record<string, Company> = {
  "alucoil-systems": alucoilSystems as unknown as Company,
  "delta-cooling-distribution": deltaCoolingDistribution as unknown as Company,
  "gulf-climate-supply": gulfClimateSupply as unknown as Company,
  "nordcoil-oem": nordcoilOem as unknown as Company,
  "retrofit-hvac-lab": retrofitHvacLab as unknown as Company,
};

export const wikimarketCompanyManifest = manifest;

export const wikimarketCompanies: Company[] = manifest.slugs.map((slug) => {
  const company = companyRegistry[slug];

  if (!company) {
    throw new Error(`Missing company content for slug: ${slug}`);
  }

  return company;
});
