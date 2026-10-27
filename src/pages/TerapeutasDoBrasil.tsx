import { listaAtendimento, contarAtendimento } from "@/lib/terapiaPublica";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, SlidersHorizontal, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageContainer from "@/components/PageContainer";
import SectionTitle from "@/components/SectionTitle";
import TerapeutaCard from "@/components/terapeutas/TerapeutaCard";
import { useUser } from "@/contexts/UserContext";
import { horarioNestaSemana, ordenarDiretorio } from "@/lib/terapiaPublica";
import { Checkbox } from "@/components/ui/checkbox";
import { terapia } from "@/lib/terapia";
import TerapeutaCardSkeleton from "@/components/terapeutas/TerapeutaCardSkeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { splitTherapistSpecialties } from "@/lib/terapeutas";
import Seo from "@/components/Seo";
import BannerSlot from "@/components/banners/BannerSlot";

const TerapeutasDoBrasil = () => {
  const [search, setSearch] = useState("");
  const [locationMode, setLocationMode] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [soPortal, setSoPortal] = useState(false);
  const [estaSemana, setEstaSemana] = useState(false);
  const { user, isAnonymous, profile } = useUser();
  const config = useQuery({queryKey:["terapia-config"],queryFn:terapia.config});
  const pontos = useQuery({queryKey:["meus-pontos-atencao",user?.id],queryFn:terapia.pontosAtencao,enabled:!!user && !isAnonymous});
  const sugeridas = [...new Set((pontos.data ?? []).flatMap(p=>p.especialidades))];
  const ordem = sortBy || config.data?.diretorio_ordem || "recomendados";
  const [especialidadeSel, setEspecialidadeSel] = useState<string | null>(null);
  const [atendeSel, setAtendeSel] = useState<string | null>(null);

  const { data: terapeutas, isLoading } = useQuery({
    queryKey: ["terapeutas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_terapeutas")
        .select("*")
        .eq("status", "aprovado")
        .order("created date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: noSistema } = useQuery({ queryKey: ["terapeutas-no-sistema", user?.id], queryFn: terapia.noSistema });
  const sistemaPorId = useMemo(() => new Map((noSistema ?? []).map((t) => [String(t.id), t])), [noSistema]);
  const testesIds = (noSistema ?? []).filter(t=>t.teste).map(t=>t.id);
  const testes = useQuery({queryKey:['terapeutas-teste',user?.id,testesIds.join(',')],enabled:testesIds.length>0,queryFn:async()=>{const {data,error}=await supabase.from('portal_terapeutas').select('*').in('id',testesIds);if(error)throw error;return data;}});
  const lista = useMemo(()=>[...(testes.data ?? []),...(terapeutas ?? [])].filter((t,i,l)=>l.findIndex(x=>x.id===t.id)===i),[testes.data,terapeutas]);

  const filtered = useMemo(() => {
    if (!terapeutas) return [];
    const q = search.toLowerCase().trim();

    let results = lista.filter((t) => {
      if (!q) return true;
      if (locationMode) {
  return (
          t.cidade?.toLowerCase().includes(q) ||
          t.estado?.toLowerCase().includes(q)
        );
      }
      return (
        t.nome?.toLowerCase().includes(q) ||
        t.especialidade?.toLowerCase().includes(q)
      );
    });

    if (especialidadeSel) {
      results = results.filter((t) =>
        splitTherapistSpecialties(t.especialidade).some(
          (esp) => esp === especialidadeSel,
        ),
      );
    }

    if (atendeSel) results = results.filter((t) => listaAtendimento((t as any).atendimento).includes(atendeSel));
    if (soPortal) results = results.filter(t => sistemaPorId.has(String(t.id)));
    if (estaSemana) results = results.filter(t => horarioNestaSemana(sistemaPorId.get(String(t.id))?.proximo ?? null));
    return ordenarDiretorio(results, noSistema ?? [], ordem);
  }, [terapeutas, lista, search, locationMode, ordem, especialidadeSel, atendeSel, soPortal, estaSemana, sistemaPorId, noSistema]);

  const chipsEspecialidade = useMemo(() => {
    if (!terapeutas) return [] as Array<{ nome: string; total: number }>;
    const contagem = new Map<string, number>();
    terapeutas.forEach((t) => {
      const nomes = new Set(
        splitTherapistSpecialties(t.especialidade),
      );
      nomes.forEach((nome) =>
        contagem.set(nome, (contagem.get(nome) ?? 0) + 1),
      );
    });
    return [...contagem.entries()]
      .map(([nome, total]) => ({ nome, total }))
      .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome));
  }, [terapeutas]);

  const chipsAtende = useMemo(() => contarAtendimento((terapeutas ?? []) as any[]), [terapeutas]);

  return (
    <>
    <Seo
      title="Terapeutas Ayurvédicos do Brasil — Diretório Completo"
      description="Encontre terapeutas ayurvédicos qualificados em todo o Brasil. Perfis com especialidade, formação, cidade e contato direto."
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Terapeutas do Brasil",
        url: "https://portalayurveda.com/terapeutas-do-brasil",
      }}
    />
    <PageContainer
      title="Terapeutas do Brasil"
      description="Encontre terapeutas ayurvédicos qualificados no Brasil. Diretório completo com perfis, especialidades e contatos."
    >
      <SectionTitle
        as="h1"
        subtitle="Encontre terapeutas ayurvédicos qualificados perto de você"
      >
        Terapeutas do Brasil
      </SectionTitle>

      <BannerSlot slot="terapeutas_topo" className="my-6 [&:empty]:hidden" />

      {/* Search & Filters */}
      <div className="mb-8 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={
                locationMode
                  ? "Digite a cidade ou estado..."
                  : "Buscar por nome ou especialidade..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={locationMode ? "default" : "outline"}
            onClick={() => {
              setLocationMode(!locationMode);
              setSearch("");
            }}
            className={cn(
              "gap-1.5 shrink-0",
              locationMode
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border-border bg-card text-primary hover:bg-muted",
            )}
          >
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Localização</span>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <Select value={ordem} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recentes">Mais Recentes</SelectItem>
              <SelectItem value="recomendados">Recomendados</SelectItem>
              <SelectItem value="proximo">Próximo horário</SelectItem>
            </SelectContent>
          </Select>
          {(search || especialidadeSel || atendeSel) && (
            <span className="text-sm text-muted-foreground ml-auto">
              {filtered.length} resultado{filtered.length !== 1 && "s"}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-sm"><label className="flex items-center gap-2"><Checkbox checked={soPortal} onCheckedChange={v=>setSoPortal(v === true)} />Consulta online pelo Portal ({noSistema?.length ?? 0})</label><label className="flex items-center gap-2"><Checkbox checked={estaSemana} onCheckedChange={v=>setEstaSemana(v === true)} />Tem horário esta semana</label></div>
        {!!pontos.data?.length && <section className="border-y border-border py-4"><h2 className="font-serif text-lg font-bold">Pelo seu teste, {profile?.nome?.split(" ")[0] || "você"}</h2>{pontos.data.map(p=><div key={p.slug} className="mt-2"><p className="text-sm">{p.nome}</p><div className="flex flex-wrap gap-1">{p.especialidades.map(e=><Button key={e} size="sm" variant="outline" onClick={()=>setEspecialidadeSel(e)}>{e}</Button>)}</div></div>)}</section>}
        {chipsEspecialidade.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1 -mb-1">
            <Button
              type="button"
              onClick={() => setEspecialidadeSel(null)}
              className={cn(
                "h-auto shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition-colors cursor-pointer",
                !especialidadeSel
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-primary",
              )}
            >
              Todas
            </Button>
            {chipsEspecialidade.map((chip) => {
              const selecionado = especialidadeSel === chip.nome;
              return (
                <Button
                  key={chip.nome}
                  type="button"
                  onClick={() =>
                    setEspecialidadeSel(selecionado ? null : chip.nome)
                  }
                  className={cn(
                    "h-auto shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition-colors cursor-pointer",
                    selecionado
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-primary",
                  )}
                >
                  {chip.nome}
                  <span
                    className={selecionado ? "ml-1 opacity-80" : "ml-1 opacity-60"}
                  >
                    ({chip.total})
                  </span>
                </Button>
              );
            })}
          </div>
        )}
        {chipsAtende.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1 -mb-1" role="group" aria-label="Como atende">
            <span className="shrink-0 text-xs font-semibold text-muted-foreground mr-1">Como atende</span>
            <Button type="button" onClick={() => setAtendeSel(null)} className={cn("h-auto shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition-colors cursor-pointer", !atendeSel ? "bg-primary text-primary-foreground" : "bg-muted text-primary")}>Todos</Button>
            {chipsAtende.map((chip) => {
              const sel = atendeSel === chip.nome;
              return (
                <Button key={chip.nome} type="button" onClick={() => setAtendeSel(sel ? null : chip.nome)} className={cn("h-auto shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition-colors cursor-pointer", sel ? "bg-primary text-primary-foreground" : "bg-muted text-primary")}>
                  {chip.nome}<span className={sel ? "ml-1 opacity-80" : "ml-1 opacity-60"}>({chip.total})</span>
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <TerapeutaCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">
            Nenhum terapeuta encontrado com esses filtros.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filtered.map((t) => (
            <TerapeutaCard
              key={t.id}
              nome={t.nome ?? "Terapeuta"}
              cidade={t.cidade}
              estado={t.estado}
              especialidade={t.especialidade}
              resumo={t.resumo}
              imagem={t.imagem ?? t["imagem.1"]}
              slug={t["terapeutas(dinamica)"]}
              imagem_card={t.imagem_card}
              frase_card={t.frase_card}
              formado_desde={t.formado_desde}
              sistema={sistemaPorId.get(String(t.id))}
              combina={sistemaPorId.has(String(t.id)) ? splitTherapistSpecialties(t.especialidade).filter(e=>sugeridas.includes(e)) : []}
              temInstagram={!!t.instagram}
              online={sistemaPorId.get(String(t.id))?.online}
              valor={sistemaPorId.get(String(t.id))?.valor}
            />
          ))}
        </div>
      )}

      <BannerSlot
        slot="terapeutas_rodape"
        className="[&:empty]:hidden"
        fallback={
          <section className="mt-16 mb-4 flex flex-col items-center text-center gap-3 border-t border-border pt-12">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground">
              É terapeuta ayurvédico?
            </h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Cadastre seu perfil gratuitamente e seja encontrado por pessoas em busca dos seus serviços.
            </p>
            <Link to="/terapeutas-do-brasil/cadastro">
              <Button
                className="inline-flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-wide px-8 py-4 mt-2 shadow-md hover:shadow-xl transition-all hover:scale-[1.03] rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm bg-secondary text-secondary-foreground"

              >
                <UserPlus className="h-4 w-4" />
                Cadastre seu perfil
              </Button>
            </Link>
          </section>
        }
      />
    </PageContainer>
    </>
  );
};

export default TerapeutasDoBrasil;
