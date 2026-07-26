import { ReactNode, Suspense, lazy } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import { HeaderCtaProvider } from "@/contexts/HeaderCtaContext";
import { ImmersiveProvider, useImmersive } from "@/contexts/ImmersiveContext";
import { useUser } from "@/contexts/UserContext";

const FloatingAkasha = lazy(() => import("./akasha/FloatingAkasha"));

// Rotas de conversão (funil final) onde o widget da Akasha nunca aparece
const AKASHA_BLOCKED_PREFIXES = ["/assinar", "/teste-de-dosha", "/auth"];

const LayoutInner = ({ children }: { children: ReactNode }) => {
  const { immersive } = useImmersive();
  const { user } = useUser();
  const location = useLocation();
  const akashaBlocked = AKASHA_BLOCKED_PREFIXES.some((p) => location.pathname.startsWith(p));
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <div className="flex-1 min-h-screen">{children}</div>
      {!immersive && <Footer />}
      {!immersive && !akashaBlocked && user && (
        <Suspense fallback={null}>
          <FloatingAkasha />
        </Suspense>
      )}
    </div>
  );
};

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <HeaderCtaProvider>
      <ImmersiveProvider>
        <LayoutInner>{children}</LayoutInner>
      </ImmersiveProvider>
    </HeaderCtaProvider>
  );
};

export default Layout;
