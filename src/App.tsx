import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/contexts/UserContext";
import { useCanonical } from "@/hooks/useCanonical";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
// preserved for launch mode — re-enable by routing "/" to <LaunchPage />
import LaunchPage from "./pages/LaunchPage";
import PreviewLoading from "./pages/PreviewLoading";
import TesteDeDosha from "./pages/TesteDeDosha";
import MeuDosha from "./pages/MeuDosha";
import Biblioteca from "./pages/Biblioteca";
import CursoAlimentacao from "./pages/curso/Alimentacao";
import CursoFormacao from "./pages/curso/Formacao";
import CursoFormacaoLive from "./pages/curso/FormacaoLive";
import CursoRotinas from "./pages/curso/Rotinas";
import TerapeutasDoBrasil from "./pages/TerapeutasDoBrasil";
import TerapeutaPerfil from "./pages/TerapeutaPerfil";
import TerapeutaCadastro from "./pages/TerapeutaCadastro";

import Video from "./pages/Video";
import DoshaVata from "./pages/DoshaVata";
import DoshaPitta from "./pages/DoshaPitta";
import DoshaKapha from "./pages/DoshaKapha";
import Horarios from "./pages/Horarios";
import Auth from "./pages/Auth";
import Assinar from "./pages/Assinar";
import PoliticaDePrivacidade from "./pages/PoliticaDePrivacidade";
import TermosDeUso from "./pages/TermosDeUso";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import AdminBlog from "./pages/AdminBlog";
import AdminMensagens from "./pages/AdminMensagens";
import Contato from "./pages/Contato";
import AdminAkasha from "./pages/AdminAkasha";
import AdminTeste from "./pages/AdminTeste";
import AdminTesteRegistros from "./pages/AdminTesteRegistros";
import AdminRoute from "./components/admin/AdminRoute";
import AdminLoja from "./pages/AdminLoja";
import AdminLojaVendas from "./pages/AdminLojaVendas";
import AdminVendasAkasha from "./pages/AdminVendasAkasha";
import AdminLojaVendaDetalhe from "./pages/AdminLojaVendaDetalhe";
import AdminBiblioteca from "./pages/AdminBiblioteca";
import AdminTerapeutas from "./pages/AdminTerapeutas";
import AdminAula from "./pages/AdminAula";
import Aula from "./pages/Aula";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import Metricas from "./pages/Metricas";
import Devlog from "./pages/Devlog";
import MetricasGraficos from "./pages/MetricasGraficos";
import MetricasAkasha from "./pages/MetricasAkasha";
import RegistroAkashico from "./pages/RegistroAkashico";
import RegistrosAkashikos from "./pages/RegistrosAkashikos";
import Samkhya from "./pages/Samkhya";
import SamkhyaProduto from "./pages/SamkhyaProduto";
import SamkhyaKit from "./pages/SamkhyaKit";
import SamkhyaCategoria from "./pages/SamkhyaCategoria";
import SamkhyaKits from "./pages/SamkhyaKits";
import SamkhyaTodos from "./pages/SamkhyaTodos";
import SamkhyaObrigado from "./pages/SamkhyaObrigado";
import { CartProvider } from "./contexts/CartContext";
import CartDrawer from "./components/loja/CartDrawer";

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

const RoutedApp = () => {
  useCanonical();
  return (
    <UserProvider>
      <CartProvider>
      <CartDrawer />
      <LayoutOrBare>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/preview-loading" element={<PreviewLoading />} />
              <Route path="/teste-de-dosha" element={<TesteDeDosha />} />
              <Route path="/meu-dosha" element={<MeuDosha />} />
              <Route path="/biblioteca" element={<Biblioteca />} />
              <Route path="/cursos" element={<Navigate to="/curso/alimentacao" replace />} />
              <Route path="/curso/alimentacao" element={<CursoAlimentacao />} />
              <Route path="/curso/formacao" element={<CursoFormacao />} />
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
              <Route path="/biblioteca/vata/remedios" element={<DoshaVata defaultTab="remedios" />} />
              <Route path="/biblioteca/vata/videos" element={<DoshaVata defaultTab="videos" />} />
              <Route path="/biblioteca/vata/avancado" element={<DoshaVata defaultTab="avancado" />} />
              {/* Legacy redirect */}
              <Route path="/biblioteca/vata/adoecimento" element={<DoshaVata defaultTab="avancado" />} />

              {/* Pitta */}
              <Route path="/biblioteca/pitta" element={<DoshaPitta />} />
              <Route path="/biblioteca/pitta/horarios" element={<DoshaPitta defaultTab="horarios" />} />
              <Route path="/biblioteca/pitta/alimentacao" element={<DoshaPitta defaultTab="alimentacao" />} />
              <Route path="/biblioteca/pitta/remedios" element={<DoshaPitta defaultTab="remedios" />} />
              <Route path="/biblioteca/pitta/videos" element={<DoshaPitta defaultTab="videos" />} />
              <Route path="/biblioteca/pitta/avancado" element={<DoshaPitta defaultTab="avancado" />} />
              <Route path="/biblioteca/pitta/adoecimento" element={<DoshaPitta defaultTab="avancado" />} />

              {/* Kapha */}
              <Route path="/biblioteca/kapha" element={<DoshaKapha />} />
              <Route path="/biblioteca/kapha/horarios" element={<DoshaKapha defaultTab="horarios" />} />
              <Route path="/biblioteca/kapha/alimentacao" element={<DoshaKapha defaultTab="alimentacao" />} />
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
              <Route path="/entrar" element={<Auth />} />
              <Route path="/assinar" element={<Assinar />} />
              <Route path="/politica-de-privacidade" element={<PoliticaDePrivacidade />} />
              <Route path="/termos-de-uso" element={<TermosDeUso />} />
              <Route path="/contato" element={<Contato />} />
              <Route path="/admin/mensagens" element={<AdminRoute><AdminMensagens /></AdminRoute>} />
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              <Route path="/admin/blog" element={<AdminRoute><AdminBlog /></AdminRoute>} />
              <Route path="/admin/akasha" element={<AdminRoute><AdminAkasha /></AdminRoute>} />
              <Route path="/admin/teste" element={<AdminRoute><AdminTeste /></AdminRoute>} />
              <Route path="/admin/teste/registros" element={<AdminRoute><AdminTesteRegistros /></AdminRoute>} />
              <Route path="/admin/loja" element={<AdminRoute><AdminLoja /></AdminRoute>} />
              <Route path="/admin/loja/vendas" element={<AdminRoute><AdminLojaVendas /></AdminRoute>} />
              <Route path="/admin/vendas/akasha" element={<AdminRoute><AdminVendasAkasha /></AdminRoute>} />
              <Route path="/admin/loja/vendas/:id" element={<AdminRoute><AdminLojaVendaDetalhe /></AdminRoute>} />
              <Route path="/admin/biblioteca" element={<AdminRoute><AdminBiblioteca /></AdminRoute>} />
              <Route path="/admin/terapeutas" element={<AdminRoute><AdminTerapeutas /></AdminRoute>} />
              <Route path="/admin/aula" element={<AdminRoute><AdminAula /></AdminRoute>} />

              {/* Aulas ao vivo */}
              <Route path="/aula/:slug" element={<Aula />} />
              <Route path="/aovivo" element={<Navigate to="/aula/aovivo" replace />} />

              {/* Loja Samkhya */}
              <Route path="/samkhya" element={<Samkhya />} />
              <Route path="/samkhya/produto/:slug" element={<SamkhyaProduto />} />
              <Route path="/samkhya/kits" element={<SamkhyaKits />} />
              <Route path="/samkhya/kits/:slug" element={<SamkhyaKit />} />
              <Route path="/samkhya/todos" element={<SamkhyaTodos />} />
              <Route path="/samkhya/categoria/:slug" element={<SamkhyaCategoria />} />
              <Route path="/samkhya/obrigado" element={<SamkhyaObrigado />} />

              <Route path="*" element={<NotFound />} />
      </Routes>
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
      </BrowserRouter>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
