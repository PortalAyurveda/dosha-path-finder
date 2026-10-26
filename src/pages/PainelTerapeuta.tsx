import { Suspense, lazy, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import CTAButton from "@/components/CTAButton";
import { useToast } from "@/hooks/use-toast";
import { useSouTerapeuta } from "@/hooks/useSouTerapeuta";
import { terapia, saudacao } from "@/lib/terapia";
import { AvatarPessoa, TermoTexto } from "@/components/terapia/Comuns";
import Hoje from "@/components/terapia/Hoje";
import Pacientes from "@/components/terapia/Pacientes";
import Agenda from "@/components/terapia/Agenda";
import MeuLink from "@/components/terapia/MeuLink";
import Perfil from "@/components/terapia/Perfil";
import Acervos from "@/components/terapia/acervo/Acervos";
import Configuracoes, { PassosParticipar } from "@/components/terapia/Participar";
import "@/components/terapia/painel.css";
import { chat, CHAT_LISTA_MS } from '@/lib/terapiaChat';
const ListaConversas = lazy(()=>import('@/components/terapia/chat/ListaConversas'));
const abas = [
  ["hoje", "Hoje"],
  ["pacientes", "Pacientes"],
  ["mensagens", "Mensagens"],
  ["agenda", "Agenda"],
  ["link", "Meu link"],
  ["acervo", "Meu acervo"],
  ["perfil", "Perfil público"],
  ["configuracoes", "Configurações"],
];
export default function PainelTerapeuta() {
  const acesso = useSouTerapeuta();
  const conversas = useQuery({queryKey:['chat-lista',true,acesso.userId],queryFn:chat.terapeuta,enabled:acesso.permitido,refetchInterval:CHAT_LISTA_MS});
  const totalMensagens = conversas.data?.reduce((n,c)=>n+c.nao_lidas,0)??0;
  const [params, setParams] = useSearchParams();
  const selecionada = (params.get("aba") === "config" ? "configuracoes" : params.get("aba")) ?? "hoje";
  const aba = abas.some(([v]) => v === selecionada) ? selecionada : "hoje";
  const qc = useQueryClient();
  const { toast } = useToast();
  const [aceito, setAceito] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [agora, setAgora] = useState(Date.now());
  const [termoAberto, setTermoAberto] = useState(false);
  const painel = useQuery({
    queryKey: ["terapia-painel", acesso.userId],
    queryFn: terapia.painel,
    enabled: acesso.permitido,
  });
  const emDia = painel.data?.sistema.termo_em_dia === true;
  const hoje = useQuery({
    queryKey: ["terapia-hoje", acesso.userId],
    queryFn: terapia.hoje,
    enabled: acesso.permitido && emDia,
  });
  const pacientes = useQuery({
    queryKey: ["terapia-pacientes", acesso.userId],
    queryFn: terapia.pacientes,
    enabled: acesso.permitido && emDia && aba === "pacientes",
  });
  const erro = acesso.error || painel.error || hoje.error || pacientes.error;
  useEffect(() => {
    if (erro) toast({ title: erro.message, variant: "destructive" });
  }, [erro, toast]);
  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const atualizar = () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["terapia-painel", acesso.userId] }),
      qc.invalidateQueries({ queryKey: ["terapia-online"] }),
    ]);
  const executar = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      return true;
    } catch (e) {
      toast({
        title: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
      return false;
    }
  };
  const mudar = async (v: boolean) => {
    setOcupado(true);
    try {
      await executar(async () => {
        await terapia.sistema(v);
        await atualizar();
      });
    } finally {
      setOcupado(false);
    }
  };
  const trocar = (v: string) => {
    setParams((p) => {
      const novo = new URLSearchParams(p);
      novo.set("aba", v === "agenda-fixos" ? "agenda" : v);
      if (v === "agenda-fixos") novo.set("agenda", "fixos"); else novo.delete("agenda");
      return novo;
    });
  };
  if (acesso.carregando || (acesso.permitido && painel.isPending))
    return (
      <main className="mx-auto max-w-6xl p-8" role="status">
        Carregando…
      </main>
    );
  if (!acesso.permitido && !acesso.error) return <Navigate to="/" replace />;
  if (!painel.data)
    return (
      <main className="mx-auto max-w-6xl p-8">
        <p role="alert">
          {erro?.message ?? "Não foi possível carregar o Portal do terapeuta."}
        </p>
        <Button
          variant="outline"
          onClick={() => {
            void acesso.refetch();
            void painel.refetch();
          }}
        >
          Tentar novamente
        </Button>
      </main>
    );
  const dados = painel.data;
  const participa = dados.sistema.participa ?? dados.sistema.no_sistema;
  const passos = !participa && (
    <PassosParticipar painel={dados} ocupado={ocupado} mudar={mudar} irPara={trocar} abrirTermo={() => setTermoAberto(true)} executar={executar} atualizar={atualizar} />
  );
  const total = hoje.data?.consultas.filter((c) => c.hoje).length ?? 0;
  const menu = (
    <nav
      aria-label="Portal do terapeuta"
      className="flex overflow-x-auto border-b border-border lg:flex-col lg:overflow-visible lg:border-0"
    >
      {abas.map(([v, l]) => (
        <Button
          key={v}
          variant="ghost"
          aria-current={aba === v ? "page" : undefined}
          onClick={() => trocar(v)}
          className={`h-11 shrink-0 justify-start rounded-md border-l-2 px-3 text-sm lg:w-full ${aba === v ? "border-secondary bg-secondary/10 font-semibold hover:bg-secondary/15" : "border-transparent text-muted-foreground"}`}
        >
          <span>{l}</span>{v === "mensagens" && totalMensagens > 0 && <span className="ml-auto rounded-full bg-secondary px-2 text-xs text-secondary-foreground">{totalMensagens}</span>}
          {v === "hoje" && total > 0 && (
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-xs text-secondary-foreground">
              {total}
            </span>
          )}
        </Button>
      ))}
    </nav>
  );
  return (
    <>
      <Helmet>
        <title>Portal do terapeuta | Portal Ayurveda</title>
      </Helmet>
      {!emDia ? (
        <main className="mx-auto max-w-2xl px-5 py-10">
          <p className="mb-4 text-xs font-semibold uppercase text-muted-foreground">
            Bem-vindo ao Portal do terapeuta
          </p>
          <TermoTexto painel={dados} />
          <div className="my-6 flex items-center gap-3">
            <Checkbox
              id="aceitar-termo"
              checked={aceito}
              onCheckedChange={(v) => setAceito(v === true)}
            />
            <label htmlFor="aceitar-termo" className="text-sm font-semibold">
              Li e aceito o termo
            </label>
          </div>
          <CTAButton
            disabled={!aceito || ocupado}
            className="h-11 px-5 py-2 text-base"
            onClick={async () => {
              setOcupado(true);
              try {
                await executar(async () => {
                  await terapia.aceitar(dados.termo.versao);
                  await atualizar();
                });
              } finally {
                setOcupado(false);
              }
            }}
          >
            Aceitar e entrar
          </CTAButton>
          <p className="mt-4 text-xs text-muted-foreground">
            Depois de aceitar, você liga “Participar do Portal” quando quiser
            aparecer com agenda no diretório.
          </p>
        </main>
      ) : (
        <div className="portal-terapeuta grid min-h-[calc(100dvh-4rem)] w-full lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="portal-lateral hidden border-r border-border p-3 lg:block">
            <div className="mb-5 flex items-center gap-3 border-b border-border pb-5">
              {dados.terapeuta.imagem ? (
                <img
                  src={dados.terapeuta.imagem}
                  alt=""
                  className="h-10 w-10 rounded-xl object-cover"
                />
              ) : <AvatarPessoa nome={dados.terapeuta.nome} />}
              <div>
                <p className="text-sm font-semibold">
                  {dados.terapeuta.nome}
                </p>
                <p className="text-xs text-muted-foreground">Portal do terapeuta</p>
              </div>
            </div>
            {menu}
          </aside>
          <div className="min-w-0">
            <div className="lg:hidden">
              {menu}
            </div>
            <main className={`portal-conteudo p-4 sm:p-6 ${aba === "mensagens" ? "portal-mensagens" : ""}`}>
              {passos && <div className="mb-6">{passos}</div>}
              <div className="portal-topo"><h1 className="portal-titulo mb-5 font-serif font-bold text-primary">
                {aba === "hoje"
                  ? saudacao(
                      dados.terapeuta.primeiro_nome,
                      new Date(agora).getHours(),
                    )
                  : abas.find(([v]) => v === aba)?.[1]}
                {aba === "pacientes" && (
                  <span className="ml-2 font-sans text-sm text-secondary">
                    {pacientes.data?.length ?? dados.numeros.pacientes}
                  </span>
                )}
              </h1>
              {(aba === "hoje" || aba === "agenda") && <Button asChild variant="outline" className="mb-5"><Link to="/consulta/treino">Sala de treino</Link></Button>}</div>
              {aba === "hoje" &&
                (hoje.data ? (
                  <Hoje dados={hoje.data} agora={agora} />
                ) : (
                  <p role="status">
                    {hoje.error?.message ?? "Carregando consultas…"}
                  </p>
                ))}
              {aba === "pacientes" &&
                (pacientes.data ? (
                  <Pacientes
                    lista={pacientes.data}
                    convidar={() => trocar("link")}
                  />
                ) : (
                  <p role="status">
                    {pacientes.error?.message ?? "Carregando pacientes…"}
                  </p>
                ))}
              {aba === "agenda" && (
                <Agenda
                  painel={dados}
                  executar={executar}
                  userId={acesso.userId}
                />
              ) : <AvatarPessoa nome={dados.terapeuta.nome} />}{" "}
              {aba === "link" && <MeuLink painel={dados} executar={executar} />}{" "}
              {aba === "mensagens" && <Suspense fallback={<p role="status">Carregando conversas…</p>}><ListaConversas terapeuta userId={acesso.userId} convite={dados.terapeuta.link_convite}/></Suspense>}
               {aba === "acervo" && <Acervos userId={acesso.userId} painel={dados} />}
              {aba === "perfil" && (
                <Perfil
                  painel={dados}
                  ocupado={ocupado}
                  mudar={mudar}
                  executar={executar}
                  atualizar={atualizar}
                />
              ) : <AvatarPessoa nome={dados.terapeuta.nome} />}
              {aba === "configuracoes" && (
                <Configuracoes painel={dados} ocupado={ocupado} mudar={mudar} executar={executar} atualizar={atualizar} />
              )}
            </main>
          </div>
        </div>
      )}
      <Dialog open={termoAberto} onOpenChange={setTermoAberto}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto">
          <DialogTitle className="sr-only">{dados.termo.titulo}</DialogTitle>
          <TermoTexto painel={dados} />
          <CTAButton className="mt-4 h-10 px-5 py-2 text-base" disabled={ocupado} onClick={async () => { setOcupado(true); try { if (await executar(async () => { await terapia.aceitar(dados.termo.versao); await atualizar(); })) setTermoAberto(false); } finally { setOcupado(false); } }}>Aceitar o termo</CTAButton>
        </DialogContent>
      </Dialog>
    </>
  );
}
