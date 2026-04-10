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
import Akasha from "./pages/Akasha";
import Video from "./pages/Video";
import DoshaVata from "./pages/DoshaVata";
import DoshaPitta from "./pages/DoshaPitta";
import DoshaKapha from "./pages/DoshaKapha";
import DoshaVataAdoecimento from "./pages/DoshaVataAdoecimento";
import DoshaPittaAdoecimento from "./pages/DoshaPittaAdoecimento";
import DoshaKaphaAdoecimento from "./pages/DoshaKaphaAdoecimento";
import Horarios from "./pages/Horarios";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

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
              <Route path="/akasha" element={<Akasha />} />
              <Route path="/biblioteca/vata" element={<DoshaVata />} />
              <Route path="/biblioteca/vata/adoecimento" element={<DoshaVataAdoecimento />} />
              <Route path="/biblioteca/pitta" element={<DoshaPitta />} />
              <Route path="/biblioteca/pitta/adoecimento" element={<DoshaPittaAdoecimento />} />
              <Route path="/biblioteca/kapha" element={<DoshaKapha />} />
              <Route path="/biblioteca/kapha/adoecimento" element={<DoshaKaphaAdoecimento />} />
              <Route path="/biblioteca/horarios" element={<Horarios />} />
              <Route path="/entrar" element={<Auth />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </UserProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
