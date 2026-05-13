import BodyClass from "../../components/layout/BodyClass";
import DispatchDemo from "../../src/components/dispatch/DispatchDemo";

export const metadata = {
  title: "UPGRADE Dispatch Demo — Asia Park Astana",
  description: "Закрытая demo-страница медиадиспетчеризации инженерных систем Asia Park Astana.",
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
      <DispatchDemo />
    </>
  );
}
