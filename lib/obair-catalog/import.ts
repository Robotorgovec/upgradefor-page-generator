import type { PrismaClient } from "@prisma/client";

import { OBAIR_CATALOG_VERSION, obairSeedFamilies } from "./seed";

export interface ImportCatalogOptions {
  resetExisting?: boolean;
}

export interface ImportCatalogResult {
  version: string;
  familiesUpserted: number;
  seriesUpserted: number;
  modelsUpserted: number;
  options: ImportCatalogOptions;
}

export async function importObairCatalog(prisma: PrismaClient, options: ImportCatalogOptions = {}): Promise<ImportCatalogResult> {
  const { resetExisting = false } = options;

  return prisma.$transaction(async (tx) => {
    if (resetExisting) {
      await tx.adminOverride.deleteMany({});
      await tx.selectionLog.deleteMany({});
      await tx.selectionRequest.deleteMany({});
      await tx.catalogOption.deleteMany({});
      await tx.catalogAlias.deleteMany({});
      await tx.catalogModel.deleteMany({});
      await tx.catalogSeries.deleteMany({});
      await tx.catalogFamily.deleteMany({});
    }

    let familiesUpserted = 0;
    let seriesUpserted = 0;
    let modelsUpserted = 0;

    for (const familySeed of obairSeedFamilies) {
      const family = await tx.catalogFamily.upsert({
        where: { code: familySeed.code },
        update: {
          name: familySeed.name,
          description: familySeed.description,
          active: true,
        },
        create: {
          code: familySeed.code,
          name: familySeed.name,
          description: familySeed.description,
          active: true,
        },
      });
      familiesUpserted += 1;

      for (const seriesSeed of familySeed.series) {
        const series = await tx.catalogSeries.upsert({
          where: {
            familyId_code: {
              familyId: family.id,
              code: seriesSeed.code,
            },
          },
          update: {
            name: seriesSeed.name,
            applicationType: seriesSeed.applicationType,
            standardSelectable: seriesSeed.standardSelectable,
            manufacturerReviewRequired: seriesSeed.manufacturerReviewRequired,
          },
          create: {
            familyId: family.id,
            code: seriesSeed.code,
            name: seriesSeed.name,
            applicationType: seriesSeed.applicationType,
            standardSelectable: seriesSeed.standardSelectable,
            manufacturerReviewRequired: seriesSeed.manufacturerReviewRequired,
          },
        });
        seriesUpserted += 1;

        for (const modelSeed of seriesSeed.models) {
          await tx.catalogModel.upsert({
            where: { modelCodeNormalized: modelSeed.modelCodeNormalized },
            update: {
              seriesId: series.id,
              modelCodeRaw: modelSeed.modelCodeRaw,
              displayName: modelSeed.displayName,
              slug: modelSeed.slug,
              applicationType: modelSeed.applicationType,
              airflowMinM3h: modelSeed.airflowMinM3h,
              airflowMaxM3h: modelSeed.airflowMaxM3h,
              staticPressureMinPa: modelSeed.staticPressureMinPa,
              staticPressureMaxPa: modelSeed.staticPressureMaxPa,
              mountingType: modelSeed.mountingType,
              notes: modelSeed.notes,
              sourceCatalogVersion: OBAIR_CATALOG_VERSION,
              sourcePageRefs: modelSeed.sourcePageRefs,
              isStandardSelectable: !modelSeed.manufacturerReviewRequired,
              manufacturerReviewRequired: Boolean(modelSeed.manufacturerReviewRequired),
            },
            create: {
              seriesId: series.id,
              modelCodeRaw: modelSeed.modelCodeRaw,
              modelCodeNormalized: modelSeed.modelCodeNormalized,
              displayName: modelSeed.displayName,
              slug: modelSeed.slug,
              applicationType: modelSeed.applicationType,
              airflowMinM3h: modelSeed.airflowMinM3h,
              airflowMaxM3h: modelSeed.airflowMaxM3h,
              staticPressureMinPa: modelSeed.staticPressureMinPa,
              staticPressureMaxPa: modelSeed.staticPressureMaxPa,
              mountingType: modelSeed.mountingType,
              notes: modelSeed.notes,
              sourceCatalogVersion: OBAIR_CATALOG_VERSION,
              sourcePageRefs: modelSeed.sourcePageRefs,
              isStandardSelectable: !modelSeed.manufacturerReviewRequired,
              manufacturerReviewRequired: Boolean(modelSeed.manufacturerReviewRequired),
            },
          });

          modelsUpserted += 1;
        }
      }
    }

    return {
      version: OBAIR_CATALOG_VERSION,
      familiesUpserted,
      seriesUpserted,
      modelsUpserted,
      options,
    };
  });
}
