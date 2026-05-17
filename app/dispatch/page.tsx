import BodyClass from "../../components/layout/BodyClass";
import DispatchDashboard from "../../src/components/dispatch/DispatchDashboard";

export const metadata = {
  title: "UPGRADE Dispatch / Asia Park Astana",
  description:
    "Интеллектуальная диспетчеризация существующей BMS/SCADA: холодоснабжение, вентиляция, насосные группы, чиллеры Trane, аварии, тренды, паспорта оборудования и AI-диагностика.",
  robots: { index: false, follow: false },
};

export default function DispatchPage() {
  return (
    <>
      <BodyClass className="dispatch-demo-page" />
      <style>{`
        body.dispatch-demo-page .site-header,
        body.dispatch-demo-page .sidebar,
        body.dispatch-demo-page [data-sidebar],
        body.dispatch-demo-page .mobile-bottom-nav { display: none !important; }
        body.dispatch-demo-page .app-content { padding: 0 !important; margin: 0 !important; max-width: none !important; }
      `}</style>
      <DispatchDashboard />
    </>
  );
}
