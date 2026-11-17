import { ReactNode, Suspense, lazy, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import { HeaderCtaProvider } from "@/contexts/HeaderCtaContext";
import { ImmersiveProvider, useImmersive } from "@/contexts/ImmersiveContext";
import { useUser } from "@/contexts/UserContext";
import { OnlineCtx, type EstadoOnline } from "@/components/terapia/online/contexto";
import { useSouTerapeuta } from "@/hooks/useSouTerapeuta";

const OnlineTerapeutaMotor = lazy(() => import("@/components/terapia/online/OnlineTerapeuta"));
const ChatAvisos = lazy(() => import("@/components/terapia/chat/ChatAvisos"));

const FloatingAkasha = lazy(() => import("./akasha/FloatingAkasha"));
const FloatingTutorCurso = lazy(() => import("./tutor/FloatingTutorCurso"));

// Rotas de conversão (funil final) onde o widget da Akasha nunca aparece
const AKASHA_BLOCKED_PREFIXES = ["/assinar", "/teste-de-dosha", "/auth"];

const LayoutInner = ({ children }: { children: ReactNode }) => {
  const { immersive } = useImmersive();
  const { user } = useUser();
  const location = useLocation();
  const akashaBlocked = AKASHA_BLOCKED_PREFIXES.some((p) => location.pathname.startsWith(p));
  const isSalaCurso = /^\/cursos\/[^/]+\/estudar(\/[^/]+)?\/?$/.test(location.pathname);
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <div className="flex-1 min-h-screen">{children}</div>
      {!immersive && <Footer />}
      {isSalaCurso ? (
        user && (
          <Suspense fallback={null}>
            <FloatingTutorCurso />
          </Suspense>
        )
      ) : (
        !immersive && !akashaBlocked && user && (
          <Suspense fallback={null}>
            <FloatingAkasha />
          </Suspense>
        )
      )}
    </div>
  );
};


// Visitante não carrega nada da terapia; logado carrega só os avisos de mensagem; terapeuta liga o tempo real.
const OnlineTerapeutaProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAnonymous } = useUser();
  const logado = !!user && !isAnonymous;
  const acesso = useSouTerapeuta();
  const [valor, setValor] = useState<EstadoOnline | null>(null);
  return (
    <OnlineCtx.Provider value={acesso.permitido ? valor : null}>
      {logado && (
        <Suspense fallback={null}>
          <ChatAvisos />
          {acesso.permitido && <OnlineTerapeutaMotor onValor={setValor} />}
        </Suspense>
      )}
      {children}
    </OnlineCtx.Provider>
  );
};

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <HeaderCtaProvider>
      <ImmersiveProvider>
        <OnlineTerapeutaProvider>
          <LayoutInner>{children}</LayoutInner>
        </OnlineTerapeutaProvider>
      </ImmersiveProvider>
    </HeaderCtaProvider>
  );
};

export default Layout;
