import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Search } from "lucide-react";
import Seo from "@/components/Seo";
import BannerSlot from "@/components/banners/BannerSlot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VersoCard, { type Verso } from "@/components/textos/VersoCard";
import { supabase } from "@/integrations/supabase/client";

const PAGINA = 20;

export default function ClassicosPesquisar() {
  const [termo, setTermo] = useState("");
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<Verso[]>([]);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const offsetRef = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setBusca(termo.trim()), 300);
    return () => clearTimeout(t);
  }, [termo]);

  const buscar = useCallback(async (q: string, off: number) => {
    setCarregando(true);
    const { data } = await supabase.rpc("search_classical_verses", { q, lim: PAGINA, off } as never);
    const linhas = (data as any[] | null) ?? [];
    if (off === 0) setTotal(linhas[0]?.total_count ? Number(linhas[0].total_count) : 0);
    setResultados((antigos) => (off > 0 ? [...antigos, ...(linhas as Verso[])] : (linhas as Verso[])));
    offsetRef.current = off + linhas.length;
    setCarregando(false);
  }, []);

  useEffect(() => {
    if (!busca) { setResultados([]); setTotal(0); offsetRef.current = 0; return; }
    void buscar(busca, 0);
  }, [busca, buscar]);

  return (
    <>
      <Seo title="Pesquisar nos textos clássicos" description="Busca por palavra inteira em todos os versos traduzidos dos clássicos de Ayurveda, Yoga e Vedānta." />
      <div className="bg-classics-soft">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <Link to="/textos-classicos" className="text-base text-classics hover:underline">Textos Clássicos</Link>
          <h1 className="mt-2">Pesquisar</h1>
        </div>
      </div>

      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Buscar em português ou sânscrito"
            aria-label="Buscar versos"
            className="min-h-[52px] pl-12 text-base"
          />
        </div>

        {busca && (
          <p className="mt-3 text-base text-muted-foreground">
            {carregando && resultados.length === 0 ? "Buscando" : total > 0 ? `${total.toLocaleString("pt-BR")} versos encontrados` : "Nenhum verso encontrado."}
          </p>
        )}

        <div className="mt-4 space-y-3">
          {resultados.map((v, i) => <VersoCard key={i} verso={v} />)}
        </div>

        {resultados.length > 0 && resultados.length < total && (
          <div className="mt-5 flex justify-center">
            <Button variant="outline" disabled={carregando} onClick={() => void buscar(busca, offsetRef.current)}
              className="min-h-[48px] border-classics/40 text-base text-classics hover:bg-classics-soft">
              {carregando ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              Carregar mais
            </Button>
          </div>
        )}

        <BannerSlot slot="classicos_rodape" className="my-8 [&:empty]:hidden" />
      </main>
    </>
  );
}
