-- CreateEnum
CREATE TYPE "CatalogModelStatus" AS ENUM ('draft', 'active', 'hidden', 'deprecated');

-- CreateEnum
CREATE TYPE "SelectionResultStatus" AS ENUM ('matched_standard', 'matched_with_warning', 'no_standard_match', 'project_specific');

-- CreateTable
CREATE TABLE "CatalogFamily" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogFamily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogSeries" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "applicationType" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "standardSelectable" BOOLEAN NOT NULL DEFAULT true,
    "manufacturerReviewRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogSeries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogModel" (
    "id" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "modelCodeRaw" TEXT NOT NULL,
    "modelCodeNormalized" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "CatalogModelStatus" NOT NULL DEFAULT 'active',
    "applicationType" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "airflowMinM3h" INTEGER NOT NULL,
    "airflowMaxM3h" INTEGER NOT NULL,
    "staticPressureMinPa" INTEGER,
    "staticPressureMaxPa" INTEGER,
    "coolingCapacityKwMin" DECIMAL(10,2),
    "coolingCapacityKwMax" DECIMAL(10,2),
    "heatingCapacityKwMin" DECIMAL(10,2),
    "heatingCapacityKwMax" DECIMAL(10,2),
    "mountingType" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "driveType" TEXT,
    "cabinetType" TEXT,
    "ductOrientation" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "coilType" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "heatRecoveryType" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "motorType" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pipeSystemType" TEXT,
    "pipeConnectionSide" TEXT,
    "powerSupply" TEXT,
    "widthMm" INTEGER,
    "depthMm" INTEGER,
    "heightMm" INTEGER,
    "weightKg" INTEGER,
    "filterStages" JSONB,
    "sections" JSONB,
    "dimensions" JSONB,
    "industries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "sourceCatalogVersion" TEXT NOT NULL,
    "sourcePageRefs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isStandardSelectable" BOOLEAN NOT NULL DEFAULT true,
    "manufacturerReviewRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogOption" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "optionCode" TEXT NOT NULL,
    "optionType" TEXT NOT NULL,
    "optionValue" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogAlias" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatalogAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectionRequest" (
    "id" TEXT NOT NULL,
    "inputPayload" JSONB NOT NULL,
    "resultStatus" "SelectionResultStatus" NOT NULL,
    "selectedModelId" TEXT,
    "selectedFamilyCode" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "company" TEXT,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SelectionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectionLog" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "modelId" TEXT,
    "score" DOUBLE PRECISION,
    "reasons" JSONB,
    "warnings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SelectionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminOverride" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "ruleType" TEXT NOT NULL,
    "rulePayload" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CatalogFamily_code_key" ON "CatalogFamily"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogSeries_familyId_code_key" ON "CatalogSeries"("familyId", "code");

-- CreateIndex
CREATE INDEX "CatalogSeries_code_idx" ON "CatalogSeries"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogModel_modelCodeNormalized_key" ON "CatalogModel"("modelCodeNormalized");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogModel_slug_key" ON "CatalogModel"("slug");

-- CreateIndex
CREATE INDEX "CatalogModel_seriesId_idx" ON "CatalogModel"("seriesId");

-- CreateIndex
CREATE INDEX "CatalogModel_airflowMinM3h_airflowMaxM3h_idx" ON "CatalogModel"("airflowMinM3h", "airflowMaxM3h");

-- CreateIndex
CREATE INDEX "CatalogModel_staticPressureMinPa_staticPressureMaxPa_idx" ON "CatalogModel"("staticPressureMinPa", "staticPressureMaxPa");

-- CreateIndex
CREATE INDEX "CatalogModel_status_idx" ON "CatalogModel"("status");

-- CreateIndex
CREATE INDEX "CatalogOption_modelId_idx" ON "CatalogOption"("modelId");

-- CreateIndex
CREATE INDEX "CatalogOption_optionType_idx" ON "CatalogOption"("optionType");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogAlias_modelId_alias_key" ON "CatalogAlias"("modelId", "alias");

-- CreateIndex
CREATE INDEX "CatalogAlias_alias_idx" ON "CatalogAlias"("alias");

-- CreateIndex
CREATE INDEX "SelectionRequest_resultStatus_idx" ON "SelectionRequest"("resultStatus");

-- CreateIndex
CREATE INDEX "SelectionRequest_selectedFamilyCode_idx" ON "SelectionRequest"("selectedFamilyCode");

-- CreateIndex
CREATE INDEX "SelectionRequest_createdAt_idx" ON "SelectionRequest"("createdAt");

-- CreateIndex
CREATE INDEX "SelectionLog_requestId_idx" ON "SelectionLog"("requestId");

-- CreateIndex
CREATE INDEX "SelectionLog_modelId_idx" ON "SelectionLog"("modelId");

-- CreateIndex
CREATE INDEX "AdminOverride_modelId_idx" ON "AdminOverride"("modelId");

-- CreateIndex
CREATE INDEX "AdminOverride_ruleType_idx" ON "AdminOverride"("ruleType");

-- CreateIndex
CREATE INDEX "AdminOverride_active_idx" ON "AdminOverride"("active");

-- AddForeignKey
ALTER TABLE "CatalogSeries" ADD CONSTRAINT "CatalogSeries_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "CatalogFamily"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogModel" ADD CONSTRAINT "CatalogModel_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "CatalogSeries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogOption" ADD CONSTRAINT "CatalogOption_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "CatalogModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogAlias" ADD CONSTRAINT "CatalogAlias_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "CatalogModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectionRequest" ADD CONSTRAINT "SelectionRequest_selectedModelId_fkey" FOREIGN KEY ("selectedModelId") REFERENCES "CatalogModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectionLog" ADD CONSTRAINT "SelectionLog_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SelectionRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectionLog" ADD CONSTRAINT "SelectionLog_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "CatalogModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminOverride" ADD CONSTRAINT "AdminOverride_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "CatalogModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
