import NotFoundCompany from "../../../components/wikimarket/company/NotFoundCompany";
import { getCompaniesForRouteFamily } from "../../../lib/wikimarket/company-repository";

export default function SellersNotFound() {
  return <NotFoundCompany routeFamily="sellers" suggestions={getCompaniesForRouteFamily("sellers").slice(0, 3)} />;
}
