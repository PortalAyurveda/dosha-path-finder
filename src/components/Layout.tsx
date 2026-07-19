import { ReactNode, Suspense, lazy } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import { HeaderCtaProvider } from "@/contexts/HeaderCtaContext";
import { ImmersiveProvider, useImmersive } from "@/contexts/ImmersiveContext";
import { useUser } from "@/contexts/UserContext";

const FloatingAkasha = lazy(() => import("./akasha/FloatingAkasha"));

const LayoutInner = ({ children }: { children: ReactNode }) => {
  const { immersive } = useImmersive();
  const { user } = useUser();
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <div className="flex-1 min-h-screen">{children}</div>
      {!immersive && <Footer />}
      {!immersive && user && (
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
