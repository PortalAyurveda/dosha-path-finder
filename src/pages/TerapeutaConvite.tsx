import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Check, ChevronRight, Loader2, UserRound } from "lucide-react";
import { Helmet } from "react-helmet-async";
import CTAButton from "@/components/CTAButton";
import LoginForm from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useUser } from "@/contexts/UserContext";
import { terapia } from "@/lib/terapia";
import { depoisDeAceitar, etapasConvite, permissoesConvite, textoConvite, type EtapaConvite, type PermissoesConvite } from "@/lib/terapiaConvite";

const nomesEtapas: Record<EtapaConvite, string> = { convite: "Convite", entrar: "Entrar", permissoes: "O que pode ver", teste: "Teste", pronto: "Pronto" };
const cta = "w-full text-base h-auto min-h-12 py-3 px-4 whitespace-normal";

export default function TerapeutaConvite() {
  const { slug = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const { user, isAnonymous, loading: authLoading } = useUser();
  const logado = !!user && !isAnonymous;
  const [etapa, setEtapa] = useState<EtapaConvite>("convite");
  const [perm, setPerm] = useState<PermissoesConvite>({ teste: false, fotos: false, rotina: false, akasha: false });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const convite = useQuery({ queryKey: ["terapia-convite", slug, logado ? user?.id : "visitante"], queryFn: () => terapia.convite(slug), enabled: !authLoading && !!slug, staleTime: 0, refetchOnWindowFocus: false });
  const previa = useQuery({queryKey:["convite-previa",slug],queryFn:()=>terapia.convitePrevia(slug),enabled:!!slug});
  const meta = previa.data?.[0];
  const data = convite.data;
  useEffect(() => {
    if (!data) return;
    setPerm(permissoesConvite(data));
    setEtapa(data.eu?.ja_ligado ? "permissoes" : params.get("etapa") === "permissoes" ? (logado ? "permissoes" : "entrar") : "convite");
    setErro("");
  }, [data, logado, params]);

  const avancar = () => {
    if (logado) setEtapa("permissoes");
    else {
      setParams({ etapa: "permissoes" }, { replace: true });
      setEtapa("entrar");
    }
  };
  const aceitar = async () => {
    if (!data || !logado || salvando) return;
    setSalvando(true); setErro("");
    try {
      const resultado = await terapia.aceitarConvite(slug, perm);
      setEtapa(depoisDeAceitar(data.eu?.ja_ligado === true, resultado.tem_teste));
    } catch (e) { setErro(e instanceof Error ? e.message : "Não foi possível continuar. Tente novamente."); }
    finally { setSalvando(false); }
  };
  const t = (s: string) => textoConvite(s, data?.terapeuta);
  const textos = data?.textos;
  const etapas = etapasConvite(logado, data?.eu?.tem_teste === true);
  const local = [data?.terapeuta?.cidade, data?.terapeuta?.estado].filter(Boolean).join("/");
  const retorno = `/terapeutas/${encodeURIComponent(slug)}/convite?etapa=permissoes`;

  return <main className="w-full px-4 sm:px-6 py-8 md:py-12">
    <Helmet defer={false}>
      <title>{meta?.titulo || "Convite da terapeuta — Portal Ayurveda"}</title>
      <meta name="description" content={meta?.descricao || "Convite para acompanhamento com sua terapeuta no Portal Ayurveda."} />
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
    <div className="mx-auto max-w-xl bg-card text-card-foreground border border-border rounded-2xl shadow-therapist p-5 sm:p-7 space-y-6">
      {authLoading || convite.isLoading ? <div className="flex justify-center py-12" role="status" aria-label="Carregando convite"><Loader2 className="animate-spin text-secondary" /></div>
        : convite.isError ? <div className="space-y-4 text-center"><h1 className="font-serif text-xl font-bold text-primary">Não foi possível abrir o convite</h1><p role="alert">{convite.error.message}</p><Button variant="outline" onClick={() => convite.refetch()}>Tentar novamente</Button></div>
        : data && textos && !data.ativo ? <div className="space-y-4 text-center">
          <h1 className="font-serif text-2xl font-bold text-primary">{t(textos.erro_titulo)}</h1><p className="text-muted-foreground">{t(textos.erro_texto)}</p>
          <CTAButton to="/terapeutas-do-brasil" className={cta}>Ver terapeutas do Brasil</CTAButton>
          <Button asChild variant="outline" className="w-full h-auto py-3 whitespace-normal"><Link to="/teste-de-dosha">Fazer meu teste de dosha</Link></Button>
        </div> : data && textos ? <>
          <header className="flex items-center gap-3 sm:gap-4">
            {data.terapeuta?.imagem ? <img src={data.terapeuta.imagem} alt={data.terapeuta.nome} className="w-20 h-28 sm:w-24 sm:h-32 rounded-t-full rounded-b-lg object-cover border-2 border-border shrink-0" /> : <div className="w-20 h-28 rounded-t-full rounded-b-lg bg-muted flex items-center justify-center shrink-0"><UserRound className="text-muted-foreground" /></div>}
            <div className="min-w-0 space-y-1"><p className="uppercase text-xs font-medium text-muted-foreground">{t(textos.chapeu)}</p><h1 className="font-serif font-bold text-xl sm:text-2xl leading-tight text-primary break-words">{t(textos.titulo)}</h1><p className="text-sm text-muted-foreground">{[data.terapeuta?.especialidade, local].filter(Boolean).join(" · ")}</p></div>
          </header>
          {data.eu?.proprio ? <div className="space-y-5"><p>{t(textos.proprio_texto)}</p><CTAButton to="/painel-terapeuta" className={cta}>{t(textos.proprio_botao)}</CTAButton></div> : <>
            <ol aria-label="Etapas do convite" className="flex gap-1.5">
              {etapas.map((item, i) => <li key={item} aria-current={item === etapa ? "step" : undefined} className={`flex-1 min-w-0 border-t-2 pt-2 text-center text-[10px] sm:text-xs ${i <= etapas.indexOf(etapa) ? "border-secondary text-primary font-semibold" : "border-border text-muted-foreground"}`}>{nomesEtapas[item]}</li>)}
            </ol>
            {etapa === "convite" && <div className="space-y-5"><p className="whitespace-pre-line">{t(textos.intro)}</p><ol className="space-y-4">{textos.itens.map((item, i) => <li key={i} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary font-semibold text-sm">{i + 1}</span><div><p className="text-sm font-medium">{t(item.titulo)}</p><p className="text-xs text-muted-foreground">{t(item.texto)}</p></div></li>)}</ol><CTAButton onClick={avancar} className={cta}>{t(textos.botao)}</CTAButton><p className="text-xs text-center text-muted-foreground">{t(textos.mini)}</p></div>}
            {etapa === "entrar" && <div className="space-y-5"><h2 className="font-serif font-bold text-xl text-primary">{t(textos.entrar_titulo)}</h2><LoginForm embedded emailOnly redirectPath={retorno} /><p className="text-xs text-center text-muted-foreground">{t(textos.entrar_mini)}</p></div>}
            {etapa === "permissoes" && <div className="space-y-4"><h2 className="font-serif font-bold text-xl text-primary">{t(textos.perm_titulo)}</h2>{textos.perms.map(item => <label key={item.chave} htmlFor={`convite-${item.chave}`} className="flex gap-3 cursor-pointer border border-border rounded-lg p-4"><Checkbox id={`convite-${item.chave}`} checked={perm[item.chave]} disabled={salvando} onCheckedChange={checked => setPerm(p => ({ ...p, [item.chave]: checked === true }))} className="mt-0.5 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary data-[state=checked]:text-secondary-foreground" /><span><span className="block text-sm font-medium">{t(item.titulo)}</span><span className="block text-xs text-muted-foreground">{t(item.texto)}</span></span></label>)}<CTAButton className={cta} onClick={aceitar} disabled={salvando}>{salvando && <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />}Continuar</CTAButton>{erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}<p className="text-xs text-center text-muted-foreground">{t(textos.perm_mini)}</p></div>}
            {etapa === "teste" && <div className="space-y-4"><h2 className="font-serif font-bold text-xl text-primary">{t(textos.teste_titulo)}</h2><p>{t(textos.teste_texto)}</p><div className="flex h-2.5 overflow-hidden rounded-full" aria-hidden="true"><span className="bg-vata flex-1" /><span className="bg-pitta flex-1" /><span className="bg-kapha flex-1" /></div><CTAButton to="/teste-de-dosha" className={cta}>{t(textos.teste_botao)}</CTAButton><p className="text-xs text-center text-muted-foreground">{t(textos.teste_mini)}</p></div>}
            {etapa === "pronto" && <div className="space-y-5 text-center"><Check className="w-14 h-14 mx-auto p-3 rounded-full bg-secondary/10 text-secondary" /><h2 className="font-serif font-bold text-2xl text-primary">{t(textos.pronto_titulo)}</h2><p className="text-muted-foreground">{t(textos.pronto_texto)}</p><Button asChild variant="outline" className="w-full h-auto py-4 whitespace-normal justify-between gap-3 text-left"><Link to="/minha-rotina">{t(textos.pronto_rotina)}<ChevronRight className="w-4 h-4 shrink-0" /></Link></Button></div>}
          </>}
        </> : null}
    </div>
  </main>;
}