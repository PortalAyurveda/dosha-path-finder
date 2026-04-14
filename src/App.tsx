import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/contexts/UserContext";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import TesteDeDosha from "./pages/TesteDeDosha";
import MeuDosha from "./pages/MeuDosha";
import Biblioteca from "./pages/Biblioteca";
import Cursos from "./pages/Cursos";
import TerapeutasDoBrasil from "./pages/TerapeutasDoBrasil";
import TerapeutaPerfil from "./pages/TerapeutaPerfil";
import Akasha from "./pages/Akasha";
import Video from "./pages/Video";
import DoshaVata from "./pages/DoshaVata";
import DoshaPitta from "./pages/DoshaPitta";
import DoshaKapha from "./pages/DoshaKapha";
import Horarios from "./pages/Horarios";
import Auth from "./pages/Auth";
import PoliticaDePrivacidade from "./pages/PoliticaDePrivacidade";
import TermosDeUso from "./pages/TermosDeUso";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <UserProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/teste-de-dosha" element={<TesteDeDosha />} />
              <Route path="/meu-dosha" element={<MeuDosha />} />
              <Route path="/biblioteca" element={<Biblioteca />} />
              <Route path="/cursos" element={<Cursos />} />
              <Route path="/terapeutas-do-brasil" element={<TerapeutasDoBrasil />} />
              <Route path="/terapeutas-do-brasil/:slug" element={<TerapeutaPerfil />} />
              <Route path="/terapeutas/:slug" element={<TerapeutaPerfil />} />
              <Route path="/akasha" element={<Akasha />} />
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
              <Route path="/entrar" element={<Auth />} />
              <Route path="/politica-de-privacidade" element={<PoliticaDePrivacidade />} />
              <Route path="/termos-de-uso" element={<TermosDeUso />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </UserProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
