import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, Pencil, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CabecalhoPergunta, Campo } from "./Campos";
import AtividadeRelatorio from "./AtividadeRelatorio";
import {
  ddmm,
  hhmm,
  Html,
  mensagemMotivo,
  Pilula,
  PintaDoshas,
  prazoAberto,
  rpc,
  type Atividade,
  type Pergunta,
  type Resposta,
  type Tema,
} from "./base";

type Props = { atividadeId: string; tema: Tema; onVoltar?: () => void };

const AtividadeRunner = ({ atividadeId, tema, onVoltar }: Props) => {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [atividade, setAtividade] = useState<Atividade | null>(null);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [resposta, setResposta] = useState<Resposta | null>(null);
  const [respostas, setRespostas] = useState<Record<string, any>>({});
  const [editando, setEditando] = useState(false);
  const [parte, setParte] = useState(0);
  const [salvoEm, setSalvoEm] = useState<string | null>(null);
  const [erroSalvar, setErroSalvar] = useState(false);
  const [entregando, setEntregando] = useState(false);
  const [faltam, setFaltam] = useState<string[] | null>(null);
  const [prazoFim, setPrazoFim] = useState(false);
  const [recemEntregue, setRecemEntregue] = useState(false);
  const pendentes = useRef<Set<string>>(new Set());
  const respostasRef = useRef(respostas);
  respostasRef.current = respostas;
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const topoRef = useRef<HTMLDivElement>(null);

  const abrir = useCallback(async () => {
    const d = await rpc("atividade_abrir", { p_atividade_id: atividadeId });
    if (!d?.ok) {
      setErro(mensagemMotivo(d?.motivo));
      setCarregando(false);
      return;
    }
    setErro(null);
    setAtividade(d.atividade);
    setPerguntas([...(d.perguntas ?? [])].sort((a: Pergunta, b: Pergunta) => (a.ordem ?? 0) - (b.ordem ?? 0)));
    setResposta(d.resposta);
    setRespostas(d.resposta?.respostas ?? {});
    setSalvoEm(d.resposta?.atualizada_em ?? null);
    setCarregando(false);
  }, [atividadeId]);

  useEffect(() => {
    setCarregando(true);
    void abrir();
  }, [abrir]);

  const salvar = useCallback(async () => {
    clearTimeout(timer.current);
    if (!pendentes.current.size) return true;
    const codigos = [...pendentes.current];
    pendentes.current.clear();
    const parcial: Record<string, any> = {};
    for (const c of codigos) parcial[c] = respostasRef.current[c] ?? null;
    const d = await rpc("atividade_salvar", { p_atividade_id: atividadeId, p_respostas: parcial, p_entregar: false });
    if (!d?.ok) {
      codigos.forEach((c) => pendentes.current.add(c));
      if (d?.motivo === "prazo_encerrado") setPrazoFim(true);
      setErroSalvar(true);
      return false;
    }
    setErroSalvar(false);
    setSalvoEm(d.atualizada_em ?? new Date().toISOString());
    setResposta((r) => ({ ...(r ?? { respostas: {}, resultado: null, entregue_em: null }), status: d.status, entregue_em: d.entregue_em, atualizada_em: d.atualizada_em, resultado: d.resultado }));
    return true;
  }, [atividadeId]);

  // Ao sair, salva o que estiver pendente.
  useEffect(() => () => void salvar(), [salvar]);

  const mudar = (codigo: string, v: any) => {
    setRespostas((r) => ({ ...r, [codigo]: v }));
    pendentes.current.add(codigo);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void salvar(), 1500);
  };

  const porSecao = (atividade?.config?.paginacao ?? "secao") === "secao";
  const partes = useMemo(() => {
    if (!porSecao) return [{ secao: null as string | null, perguntas }];
    const lista: { secao: string | null; perguntas: Pergunta[] }[] = [];
    for (const p of perguntas) {
      const ult = lista[lista.length - 1];
      if (ult && ult.secao === (p.secao ?? null)) ult.perguntas.push(p);
      else lista.push({ secao: p.secao ?? null, perguntas: [p] });
    }
    return lista.length ? lista : [{ secao: null, perguntas: [] }];
  }, [perguntas, porSecao]);

  const irPara = (i: number) => {
    void salvar();
    setParte(i);
    setTimeout(() => topoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  };

  const entregar = async () => {
    setEntregando(true);
    setFaltam(null);
    clearTimeout(timer.current);
    const parcial: Record<string, any> = {};
    for (const c of pendentes.current) parcial[c] = respostasRef.current[c] ?? null;
    pendentes.current.clear();
    const d = await rpc("atividade_salvar", { p_atividade_id: atividadeId, p_respostas: parcial, p_entregar: true });
    setEntregando(false);
    if (!d?.ok) {
      if (d?.motivo === "faltam") {
        setFaltam(d.faltam ?? []);
        if (d.atualizada_em) setSalvoEm(d.atualizada_em);
        return;
      }
      if (d?.motivo === "prazo_encerrado") setPrazoFim(true);
      Object.keys(parcial).forEach((c) => pendentes.current.add(c));
      setErro(null);
      setErroSalvar(true);
      return;
    }
    setRecemEntregue(true);
    setEditando(false);
    setParte(0);
    await abrir();
    setTimeout(() => topoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  };

  if (carregando) return <Skeleton className="h-64 w-full rounded-3xl" />;
  if (erro || !atividade)
    return (
      <div className="space-y-3">
        {onVoltar && <BotaoVoltar onClick={onVoltar} />}
        <p className="rounded-2xl border-2 border-[#EEEAF3] bg-white p-5 text-base font-semibold text-[#2A2540]">{erro}</p>
      </div>
    );

  const aberto = prazoAberto(atividade.prazo) && !prazoFim;
  const entregue = resposta?.status === "entregue";
  const leitura = !aberto || (entregue && !editando);
  const textoEntregar = atividade.config?.texto_entregar || "Entregar";

  const cabecalho = (
    <div
      className="rounded-tl-[44px] rounded-tr-[44px] rounded-br-3xl rounded-bl-sm p-6 sm:p-8"
      style={{ background: `linear-gradient(180deg, ${tema.lightColor} 0%, #ffffff 100%)` }}
    >
      <h2 className="font-serif text-[26px] font-bold leading-tight sm:text-3xl" style={{ color: tema.darkColor }}>
        <PintaDoshas texto={atividade.titulo} />
      </h2>
      {atividade.subtitulo && <p className="mt-2 text-base text-[#4A4560]">{atividade.subtitulo}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        {porSecao && partes.length > 1 && <Pilula cor={tema.darkColor}>{partes.length} partes</Pilula>}
        {atividade.prazo && <Pilula cor={tema.darkColor}>Entrega até {ddmm(atividade.prazo)}</Pilula>}
        {resposta?.status === "rascunho" && salvoEm && <Pilula cor={tema.darkColor}>Rascunho salvo às {hhmm(salvoEm)}</Pilula>}
        {!aberto && <Pilula cor="#6d6883">O prazo desta atividade terminou.</Pilula>}
      </div>
    </div>
  );

  // Ficha entregue → relatório.
  if (entregue && !editando && atividade.tipo === "ficha") {
    return (
      <div ref={topoRef} className="scroll-mt-24 space-y-5">
        {onVoltar && <BotaoVoltar onClick={onVoltar} />}
        {cabecalho}
        {recemEntregue && atividade.mensagem_final && (
          <div className="rounded-2xl border-2 p-4 text-base font-semibold" style={{ borderColor: tema.primaryColor, background: `${tema.primaryColor}10` }}>
            <Html html={atividade.mensagem_final} />
          </div>
        )}
        {aberto && (
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="inline-flex min-h-[60px] items-center gap-2 rounded-full px-6 text-base font-bold text-white"
            style={{ background: tema.primaryColor }}
          >
            <Pencil className="h-5 w-5" /> Editar respostas
          </button>
        )}
        <AtividadeRelatorio atividade={atividade} perguntas={perguntas} respostas={respostas} entregueEm={resposta?.entregue_em ?? null} tema={tema} />
      </div>
    );
  }

  // Quiz entregue → correção.
  if (entregue && !editando && atividade.tipo === "quiz") {
    const r = resposta?.resultado;
    return (
      <div ref={topoRef} className="scroll-mt-24 space-y-5">
        {onVoltar && <BotaoVoltar onClick={onVoltar} />}
        {cabecalho}
        {recemEntregue && atividade.mensagem_final && <Html html={atividade.mensagem_final} className="text-base" />}
        {r && (
          <p className="font-serif text-2xl font-bold" style={{ color: tema.darkColor }}>
            Você acertou {r.acertos} de {r.total}
          </p>
        )}
        {atividade.config?.explicacao_geral && <Html html={atividade.config.explicacao_geral} className="text-base text-[#2A2540]" />}
        <div className="space-y-4">
          {perguntas
            .filter((p) => p.tipo !== "informativo")
            .map((p) => {
              const marcada = respostas[p.codigo];
              const marcadas: string[] = Array.isArray(marcada) ? marcada : marcada != null ? [marcada] : [];
              const expl = (p.opcoes ?? []).filter((o) => o.explicacao && (o.correta || marcadas.includes(o.valor)));
              return (
                <div key={p.id} className="rounded-2xl border-2 border-[#EEEAF3] bg-white p-4">
                  <CabecalhoPergunta pergunta={p} tema={tema} />
                  <div className="space-y-2">
                    {(p.opcoes ?? []).map((o) => {
                      const sel = marcadas.includes(o.valor);
                      const estilo = o.correta
                        ? { background: "#E3F2E8", borderColor: "#2E7D4F", color: "#1B5E37" }
                        : sel
                          ? { background: "#FDE4E4", borderColor: "#C62828", color: "#8E1B1B" }
                          : { background: "#fff", borderColor: "#E7E3EE", color: "#4A4560" };
                      return (
                        <div key={o.valor} className="flex min-h-[52px] items-center gap-2 rounded-2xl border-2 px-4 py-2 text-base font-semibold" style={estilo}>
                          {o.correta ? <Check className="h-4 w-4 shrink-0" /> : sel ? <X className="h-4 w-4 shrink-0" /> : null}
                          <PintaDoshas texto={o.rotulo} />
                        </div>
                      );
                    })}
                  </div>
                  {expl.map((o) => (
                    <p key={o.valor} className="mt-2 text-[15px] leading-relaxed text-[#4A4560]">
                      <strong>{o.rotulo}:</strong> {o.explicacao}
                    </p>
                  ))}
                </div>
              );
            })}
        </div>
        {aberto && (
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="inline-flex min-h-[60px] items-center gap-2 rounded-full px-6 text-base font-bold text-white"
            style={{ background: tema.primaryColor }}
          >
            <Pencil className="h-5 w-5" /> Editar respostas
          </button>
        )}
      </div>
    );
  }

  const atual = partes[Math.min(parte, partes.length - 1)];
  const ultima = parte >= partes.length - 1;
  const faltamPerguntas = (faltam ?? []).map((c) => perguntas.find((p) => p.codigo === c)).filter(Boolean) as Pergunta[];
  const primeiraParteFalta = partes.findIndex((pt) => pt.perguntas.some((p) => faltam?.includes(p.codigo)));

  return (
    <div ref={topoRef} className="scroll-mt-24 space-y-5 text-base">
      {onVoltar && <BotaoVoltar onClick={onVoltar} />}
      {cabecalho}
      {parte === 0 && atividade.intro_html && <Html html={atividade.intro_html} className="text-base leading-relaxed text-[#2A2540]" />}

      {porSecao && partes.length > 1 && (
        <div className="flex gap-1.5" aria-label={`Parte ${parte + 1} de ${partes.length}`}>
          {partes.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir para a parte ${i + 1}`}
              onClick={() => irPara(i)}
              className="h-2 flex-1 rounded-full"
              style={{ background: i <= parte ? tema.primaryColor : "#E7E3EE" }}
            />
          ))}
        </div>
      )}

      <div className="rounded-3xl border-2 border-[#EEEAF3] bg-white p-5 sm:p-7">
        {porSecao && (atual.secao || partes.length > 1) && (
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-white" style={{ background: tema.primaryColor }}>
              {parte + 1}
            </span>
            {atual.secao && <p className="text-sm font-bold uppercase tracking-wider text-[#4A4560]">{atual.secao}</p>}
          </div>
        )}
        <div className="space-y-8">
          {atual.perguntas.map((p) => (
            <div key={p.id}>
              <CabecalhoPergunta pergunta={p} tema={tema} />
              <Campo pergunta={p} valor={respostas[p.codigo]} onChange={(v) => mudar(p.codigo, v)} tema={tema} leitura={leitura} atividadeId={atividade.id} />
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[#EEEAF3] pt-5">
          {porSecao && parte > 0 && (
            <button type="button" onClick={() => irPara(parte - 1)} className="inline-flex min-h-[60px] items-center gap-2 rounded-full border-2 border-[#352F54] px-6 font-bold text-[#352F54]">
              <ArrowLeft className="h-5 w-5" /> Voltar
            </button>
          )}
          {porSecao && !ultima && (
            <button type="button" onClick={() => irPara(parte + 1)} className="ml-auto inline-flex min-h-[60px] items-center gap-2 rounded-full px-6 font-bold text-white" style={{ background: tema.primaryColor }}>
              Avançar <ArrowRight className="h-5 w-5" />
            </button>
          )}
          {ultima && !leitura && (
            <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
              {atividade.prazo && <span className="text-[15px] text-[#4A4560]">Você pode editar até {ddmm(atividade.prazo)}.</span>}
              <button
                type="button"
                disabled={entregando}
                onClick={entregar}
                className="inline-flex min-h-[60px] items-center gap-2 rounded-full px-7 font-bold text-white disabled:opacity-70"
                style={{ background: tema.primaryColor }}
              >
                {entregando && <Loader2 className="h-5 w-5 animate-spin" />} {textoEntregar}
              </button>
            </div>
          )}
        </div>

        <p className="mt-3 text-sm text-[#5A5570]" aria-live="polite">
          {!aberto ? "O prazo desta atividade terminou." : erroSalvar ? "Não foi possível salvar. Tentando de novo." : salvoEm ? `Salvo às ${hhmm(salvoEm)}` : ""}
        </p>

        {faltam && (
          <div className="mt-4 rounded-2xl border-2 border-[#E8935A] bg-[#FFF4EA] p-4">
            <p className="font-bold text-[#8A4A12]">Faltam algumas respostas</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] text-[#4A4560]">
              {faltamPerguntas.map((p) => (
                <li key={p.id}>{p.enunciado || p.codigo}</li>
              ))}
            </ul>
            {porSecao && primeiraParteFalta >= 0 && (
              <button type="button" onClick={() => irPara(primeiraParteFalta)} className="mt-3 inline-flex min-h-[52px] items-center rounded-full border-2 border-[#8A4A12] px-5 font-bold text-[#8A4A12]">
                Ir para a parte {primeiraParteFalta + 1}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const BotaoVoltar = ({ onClick }: { onClick: () => void }) => (
  <button type="button" onClick={onClick} className="inline-flex min-h-[52px] items-center gap-2 text-base font-bold text-[#352F54]">
    <ArrowLeft className="h-5 w-5" /> Voltar para as atividades
  </button>
);

export default AtividadeRunner;
