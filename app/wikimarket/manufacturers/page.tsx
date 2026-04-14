import CompanyDirectoryPage from "../../../components/wikimarket/company/CompanyDirectoryPage";
import { getDirectoryMetadata } from "../../../lib/wikimarket/company-metadata";
import { getCompaniesForRouteFamily } from "../../../lib/wikimarket/company-repository";

export const runtime = "nodejs";

export const revalidate = 3600;

export const metadata = getDirectoryMetadata("manufacturers");

export default function ManufacturersPage() {
  return <CompanyDirectoryPage routeFamily="manufacturers" companies={getCompaniesForRouteFamily("manufacturers")} />;
}
