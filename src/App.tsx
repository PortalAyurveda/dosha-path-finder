import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import TesteDeDosha from "./pages/TesteDeDosha";
import MeuDosha from "./pages/MeuDosha";
import Biblioteca from "./pages/Biblioteca";
import Cursos from "./pages/Cursos";
import TerapeutasDoBrasil from "./pages/TerapeutasDoBrasil";
import Akasha from "./pages/Akasha";
import DoshaVata from "./pages/DoshaVata";
import DoshaPitta from "./pages/DoshaPitta";
import DoshaKapha from "./pages/DoshaKapha";
import DoshaVataAdoecimento from "./pages/DoshaVataAdoecimento";
import DoshaPittaAdoecimento from "./pages/DoshaPittaAdoecimento";
import DoshaKaphaAdoecimento from "./pages/DoshaKaphaAdoecimento";
import Horarios from "./pages/Horarios";
import HorariosVata from "./pages/HorariosVata";
import HorariosPitta from "./pages/HorariosPitta";
import HorariosKapha from "./pages/HorariosKapha";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/teste-de-dosha" element={<TesteDeDosha />} />
            <Route path="/meu-dosha" element={<MeuDosha />} />
            <Route path="/biblioteca" element={<Biblioteca />} />
            <Route path="/cursos" element={<Cursos />} />
            <Route path="/terapeutas-do-brasil" element={<TerapeutasDoBrasil />} />
            <Route path="/akasha" element={<Akasha />} />
            <Route path="/dosha/vata" element={<DoshaVata />} />
            <Route path="/dosha/vata/adoecimento" element={<DoshaVataAdoecimento />} />
            <Route path="/dosha/pitta" element={<DoshaPitta />} />
            <Route path="/dosha/pitta/adoecimento" element={<DoshaPittaAdoecimento />} />
            <Route path="/dosha/kapha" element={<DoshaKapha />} />
            <Route path="/dosha/kapha/adoecimento" element={<DoshaKaphaAdoecimento />} />
            <Route path="/horarios" element={<Horarios />} />
            <Route path="/horarios/vata" element={<HorariosVata />} />
            <Route path="/horarios/pitta" element={<HorariosPitta />} />
            <Route path="/horarios/kapha" element={<HorariosKapha />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
