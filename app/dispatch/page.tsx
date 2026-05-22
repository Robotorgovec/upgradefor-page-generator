import BodyClass from "../../components/layout/BodyClass";
import DispatchWorkspace from "../../src/components/dispatch/DispatchWorkspace";

export const metadata = {
  title: "UPGRADE Dispatch / Asia Park Astana",
  description:
    "Интеллектуальная диспетчеризация существующей BMS/SCADA: холодоснабжение, вентиляция, насосные группы, чиллеры Trane, аварии, тренды, паспорта оборудования и AI-диагностика.",
  robots: { index: false, follow: false },
};

export default function DispatchPage() {
  return (
    <>
      <BodyClass className="dispatch-workspace-page" />
      <style>{`
        body.dispatch-workspace-page .site-header,
        body.dispatch-workspace-page .sidebar,
        body.dispatch-workspace-page [data-sidebar],
        body.dispatch-workspace-page .mobile-bottom-nav { display: none !important; }
        body.dispatch-workspace-page .app-content { padding: 0 !important; margin: 0 !important; max-width: none !important; }
        body.dispatch-workspace-page .dispatchPageStack { min-height: 100vh; overflow: hidden; background: #eef2f7; }
      `}</style>
      <main className="dispatchPageStack">
        <DispatchWorkspace />
      </main>
    </>
  );
}
