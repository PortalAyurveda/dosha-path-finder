import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/contexts/UserContext";
import { useCanonical } from "@/hooks/useCanonical";
import Layout from "@/components/Layout";
import AnalyticsLoader from "@/components/AnalyticsLoader";
import AdminRoute from "./components/admin/AdminRoute";
import { CartProvider } from "./contexts/CartContext";
import CartDrawer from "./components/loja/CartDrawer";

const Index = lazy(() => import("./pages/Index"));
const LaunchPage = lazy(() => import("./pages/LaunchPage"));
const PreviewLoading = lazy(() => import("./pages/PreviewLoading"));
const TesteDeDosha = lazy(() => import("./pages/TesteDeDosha"));
const MeuDosha = lazy(() => import("./pages/MeuDosha"));
const Biblioteca = lazy(() => import("./pages/Biblioteca"));
const CursoAlimentacao = lazy(() => import("./pages/curso/Alimentacao"));
const CursoFormacao = lazy(() => import("./pages/curso/Formacao"));
const CursoFormacaoLive = lazy(() => import("./pages/curso/FormacaoLive"));
const CursoFormacaoInscricao = lazy(() => import("./pages/curso/FormacaoInscricao"));
const CursoRotinas = lazy(() => import("./pages/curso/Rotinas"));
const TerapeutasDoBrasil = lazy(() => import("./pages/TerapeutasDoBrasil"));
const TerapeutaPerfil = lazy(() => import("./pages/TerapeutaPerfil"));
const TerapeutaCadastro = lazy(() => import("./pages/TerapeutaCadastro"));
const Video = lazy(() => import("./pages/Video"));
const DoshaVata = lazy(() => import("./pages/DoshaVata"));
const DoshaPitta = lazy(() => import("./pages/DoshaPitta"));
const DoshaKapha = lazy(() => import("./pages/DoshaKapha"));
const Horarios = lazy(() => import("./pages/Horarios"));
const Auth = lazy(() => import("./pages/Auth"));
const Assinar = lazy(() => import("./pages/Assinar"));
const PoliticaDePrivacidade = lazy(() => import("./pages/PoliticaDePrivacidade"));
const TermosDeUso = lazy(() => import("./pages/TermosDeUso"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminDashboard2 = lazy(() => import("./pages/AdminDashboard2"));
const AdminBlog = lazy(() => import("./pages/AdminBlog"));
const AdminMensagens = lazy(() => import("./pages/AdminMensagens"));
const Contato = lazy(() => import("./pages/Contato"));
const AdminAkasha = lazy(() => import("./pages/AdminAkasha"));
const AdminTeste = lazy(() => import("./pages/AdminTeste"));
const AdminTesteRegistros = lazy(() => import("./pages/AdminTesteRegistros"));
const AdminRevisoes = lazy(() => import("./pages/AdminRevisoes"));
const AdminLoja = lazy(() => import("./pages/AdminLoja"));
const AdminLojaVendas = lazy(() => import("./pages/AdminLojaVendas"));
const AdminVendasAkasha = lazy(() => import("./pages/AdminVendasAkasha"));
const AdminLojaVendaDetalhe = lazy(() => import("./pages/AdminLojaVendaDetalhe"));
const AdminBiblioteca = lazy(() => import("./pages/AdminBiblioteca"));
const AdminTerapeutas = lazy(() => import("./pages/AdminTerapeutas"));
const AdminAula = lazy(() => import("./pages/AdminAula"));
const AdminDevlog = lazy(() => import("./pages/AdminDevlog"));
const AdminRotinas = lazy(() => import("./pages/AdminRotinas"));
const AdminEstoque = lazy(() => import("./pages/AdminEstoque"));
const AdminTags = lazy(() => import("./pages/AdminTags"));
const AdminCupons = lazy(() => import("./pages/AdminCupons"));
const AdminAlunos = lazy(() => import("./pages/AdminAlunos"));

const AulaDispatcher = lazy(() => import("./pages/AulaDispatcher"));
const WebinarConfirmado = lazy(() => import("./pages/WebinarConfirmado"));
const AdminWebinars = lazy(() => import("./pages/AdminWebinars"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogArticle = lazy(() => import("./pages/BlogArticle"));
const Metricas = lazy(() => import("./pages/Metricas"));
const Devlog = lazy(() => import("./pages/Devlog"));
const MetricasGraficos = lazy(() => import("./pages/MetricasGraficos"));
const MetricasAkasha = lazy(() => import("./pages/MetricasAkasha"));
const RegistroAkashico = lazy(() => import("./pages/RegistroAkashico"));
const RegistrosAkashikos = lazy(() => import("./pages/RegistrosAkashikos"));
const Samkhya = lazy(() => import("./pages/Samkhya"));
const SamkhyaProduto = lazy(() => import("./pages/SamkhyaProduto"));
const SamkhyaKit = lazy(() => import("./pages/SamkhyaKit"));
const SamkhyaCategoria = lazy(() => import("./pages/SamkhyaCategoria"));
const SamkhyaKits = lazy(() => import("./pages/SamkhyaKits"));
const SamkhyaTodos = lazy(() => import("./pages/SamkhyaTodos"));
const SamkhyaObrigado = lazy(() => import("./pages/SamkhyaObrigado"));
const Pesquisa = lazy(() => import("./pages/Pesquisa"));
const Revisao = lazy(() => import("./pages/Revisao"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const LayoutOrBare = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const bare = pathname === "/aovivo";
  if (bare) return <>{children}</>;
  return <Layout>{children}</Layout>;
};

const RouteFallback = () => (
  <div className="min-h-screen w-full bg-background" aria-busy="true" aria-label="Carregando">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 md:py-12 space-y-6">
      <div className="h-10 w-2/3 rounded bg-muted/60 animate-pulse" />
      <div className="h-4 w-1/2 rounded bg-muted/40 animate-pulse" />
      <div className="h-64 w-full rounded-lg bg-muted/40 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="h-40 rounded-lg bg-muted/40 animate-pulse" />
        <div className="h-40 rounded-lg bg-muted/40 animate-pulse" />
        <div className="h-40 rounded-lg bg-muted/40 animate-pulse" />
      </div>
    </div>
  </div>
);

const RoutedApp = () => {
  useCanonical();
  return (
    <UserProvider>
      <CartProvider>
      <CartDrawer />
      <LayoutOrBare>
            <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/preview-loading" element={<PreviewLoading />} />
              <Route path="/teste-de-dosha" element={<TesteDeDosha />} />
              <Route path="/meu-dosha" element={<MeuDosha />} />
              <Route path="/biblioteca" element={<Biblioteca />} />
              <Route path="/cursos" element={<Navigate to="/curso/alimentacao" replace />} />
              <Route path="/curso/alimentacao" element={<CursoAlimentacao />} />
              <Route path="/curso/formacao" element={<CursoFormacao />} />
              <Route path="/curso/formacao/inscricao" element={<CursoFormacaoInscricao />} />
              <Route path="/curso/formacao/live" element={<CursoFormacaoLive />} />
              <Route path="/cursos/rotinas" element={<CursoRotinas />} />
              <Route path="/curso/rotinas" element={<CursoRotinas />} />
              <Route path="/terapeutas-do-brasil" element={<TerapeutasDoBrasil />} />
              <Route path="/terapeutas-do-brasil/cadastro" element={<TerapeutaCadastro />} />
              <Route path="/terapeutas-do-brasil/:slug" element={<TerapeutaPerfil />} />
              <Route path="/terapeutas/:slug" element={<TerapeutaPerfil />} />
              <Route path="/akasha" element={<Navigate to="/meu-dosha" replace />} />
              <Route path="/video/:slug" element={<Video />} />

              {/* Vata */}
              <Route path="/biblioteca/vata" element={<DoshaVata />} />
              <Route path="/biblioteca/vata/horarios" element={<DoshaVata defaultTab="horarios" />} />
              <Route path="/biblioteca/vata/alimentacao" element={<DoshaVata defaultTab="alimentacao" />} />
              <Route path="/biblioteca/vata/alquimia" element={<DoshaVata defaultTab="remedios" />} />
              <Route path="/biblioteca/vata/remedios" element={<DoshaVata defaultTab="remedios" />} />
              <Route path="/biblioteca/vata/videos" element={<DoshaVata defaultTab="videos" />} />
              <Route path="/biblioteca/vata/avancado" element={<DoshaVata defaultTab="avancado" />} />
              {/* Legacy redirect */}
              <Route path="/biblioteca/vata/adoecimento" element={<DoshaVata defaultTab="avancado" />} />

              {/* Pitta */}
              <Route path="/biblioteca/pitta" element={<DoshaPitta />} />
              <Route path="/biblioteca/pitta/horarios" element={<DoshaPitta defaultTab="horarios" />} />
              <Route path="/biblioteca/pitta/alimentacao" element={<DoshaPitta defaultTab="alimentacao" />} />
              <Route path="/biblioteca/pitta/alquimia" element={<DoshaPitta defaultTab="remedios" />} />
              <Route path="/biblioteca/pitta/remedios" element={<DoshaPitta defaultTab="remedios" />} />
              <Route path="/biblioteca/pitta/videos" element={<DoshaPitta defaultTab="videos" />} />
              <Route path="/biblioteca/pitta/avancado" element={<DoshaPitta defaultTab="avancado" />} />
              <Route path="/biblioteca/pitta/adoecimento" element={<DoshaPitta defaultTab="avancado" />} />

              {/* Kapha */}
              <Route path="/biblioteca/kapha" element={<DoshaKapha />} />
              <Route path="/biblioteca/kapha/horarios" element={<DoshaKapha defaultTab="horarios" />} />
              <Route path="/biblioteca/kapha/alimentacao" element={<DoshaKapha defaultTab="alimentacao" />} />
              <Route path="/biblioteca/kapha/alquimia" element={<DoshaKapha defaultTab="remedios" />} />
              <Route path="/biblioteca/kapha/remedios" element={<DoshaKapha defaultTab="remedios" />} />
              <Route path="/biblioteca/kapha/videos" element={<DoshaKapha defaultTab="videos" />} />
              <Route path="/biblioteca/kapha/avancado" element={<DoshaKapha defaultTab="avancado" />} />
              <Route path="/biblioteca/kapha/adoecimento" element={<DoshaKapha defaultTab="avancado" />} />

              <Route path="/biblioteca/horarios" element={<Horarios />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogArticle />} />
              <Route path="/devlog" element={<Devlog />} />
              <Route path="/metricas" element={<Metricas />} />
              <Route path="/metricas/graficos" element={<MetricasGraficos />} />
              <Route path="/metricas/akasha" element={<MetricasAkasha />} />
              <Route path="/registros" element={<RegistrosAkashikos />} />
              <Route path="/registros/:id" element={<RegistroAkashico />} />
              <Route path="/registros-akashikos" element={<RegistrosAkashikos />} />
              <Route path="/registros-akashikos/:slug" element={<RegistroAkashico />} />
              <Route path="/entrar" element={<Auth />} />
              <Route path="/assinar" element={<Assinar />} />
              <Route path="/politica-de-privacidade" element={<PoliticaDePrivacidade />} />
              <Route path="/termos-de-uso" element={<TermosDeUso />} />
              <Route path="/contato" element={<Contato />} />
              <Route path="/admin/mensagens" element={<AdminRoute><AdminMensagens /></AdminRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/dashboard-2" element={<AdminRoute><AdminDashboard2 /></AdminRoute>} />
              <Route path="/admin/imagens" element={<AdminRoute><Admin /></AdminRoute>} />
              <Route path="/admin/blog" element={<AdminRoute><AdminBlog /></AdminRoute>} />
              <Route path="/admin/akasha" element={<AdminRoute><AdminAkasha /></AdminRoute>} />
              <Route path="/admin/teste" element={<AdminRoute><AdminTeste /></AdminRoute>} />
              <Route path="/admin/teste/registros" element={<AdminRoute><AdminTesteRegistros /></AdminRoute>} />
              <Route path="/admin/revisoes" element={<AdminRoute><AdminRevisoes /></AdminRoute>} />
              <Route path="/admin/loja" element={<AdminRoute><AdminLoja /></AdminRoute>} />
              <Route path="/admin/loja/vendas" element={<AdminRoute><AdminLojaVendas /></AdminRoute>} />
              <Route path="/admin/vendas/akasha" element={<AdminRoute><AdminVendasAkasha /></AdminRoute>} />
              <Route path="/admin/loja/vendas/:id" element={<AdminRoute><AdminLojaVendaDetalhe /></AdminRoute>} />
              <Route path="/admin/biblioteca" element={<AdminRoute><AdminBiblioteca /></AdminRoute>} />
              <Route path="/admin/terapeutas" element={<AdminRoute><AdminTerapeutas /></AdminRoute>} />
              <Route path="/admin/aula" element={<AdminRoute><AdminAula /></AdminRoute>} />
              <Route path="/admin/devlog" element={<AdminRoute><AdminDevlog /></AdminRoute>} />
              <Route path="/admin/rotinas" element={<AdminRoute><AdminRotinas /></AdminRoute>} />
              <Route path="/admin/estoque" element={<AdminRoute><AdminEstoque /></AdminRoute>} />
              <Route path="/admin/tags" element={<AdminRoute><AdminTags /></AdminRoute>} />
              <Route path="/admin/cupons" element={<AdminRoute><AdminCupons /></AdminRoute>} />
              <Route path="/admin/alunos" element={<AdminRoute><AdminAlunos /></AdminRoute>} />

              {/* Aulas ao vivo + webinars (CMS) */}
              <Route path="/aula/:slug/confirmado" element={<WebinarConfirmado />} />
              <Route path="/aula/:slug" element={<AulaDispatcher />} />
              <Route path="/aula-secreta" element={<Navigate to="/aula/aula-secreta-alimentacao" replace />} />
              <Route path="/aovivo" element={<Navigate to="/aula/aovivo" replace />} />
              <Route path="/admin/webinars" element={<AdminRoute><AdminWebinars /></AdminRoute>} />

              {/* Loja Samkhya */}
              <Route path="/samkhya" element={<Samkhya />} />
              <Route path="/samkhya/produto/:slug" element={<SamkhyaProduto />} />
              <Route path="/samkhya/kits" element={<SamkhyaKits />} />
              <Route path="/samkhya/kits/:slug" element={<SamkhyaKit />} />
              <Route path="/samkhya/todos" element={<SamkhyaTodos />} />
              <Route path="/samkhya/categoria/:slug" element={<SamkhyaCategoria />} />
              <Route path="/samkhya/obrigado" element={<SamkhyaObrigado />} />

              <Route path="/pesquisa" element={<Pesquisa />} />
              <Route path="/revisao" element={<Revisao />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
      </LayoutOrBare>
      </CartProvider>
    </UserProvider>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RoutedApp />
        <AnalyticsLoader />
      </BrowserRouter>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
