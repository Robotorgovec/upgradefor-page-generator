import NotFoundCompany from "../../../components/wikimarket/company/NotFoundCompany";
import { getCompaniesForRouteFamily } from "../../../lib/wikimarket/company-repository";

export default function ManufacturersNotFound() {
  return <NotFoundCompany routeFamily="manufacturers" suggestions={getCompaniesForRouteFamily("manufacturers").slice(0, 3)} />;
}
