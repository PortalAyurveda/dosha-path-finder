import { useEffect, useMemo, useState } from "react";
import { Copy, Download, Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Pontos = { sacada: number; sozinho: number; profundidade: number; fama: number; pronto: number };
type VersoRank = {
  id: number; livro: string; referencia: string | null; verso_no: string | null;
  verso_sanskrit: string | null; texto_pt: string; temas: string[]; pontos: number;
  pontos_det: Pontos | null; letras: number; pacotes: string[] | null;
};

const TEMAS = [
  ["autoestima", "Autoestima"], ["existencia", "Existência"], ["autorreflexao", "Autorreflexão"], ["mente", "Mente"],
  ["emocoes", "Emoções"], ["espirito", "Espírito"], ["sabedoria", "Sabedoria"], ["conduta", "Conduta"], ["disciplina", "Disciplina"],
  ["corpo", "Corpo"], ["saude", "Saúde"], ["alimento", "Alimento"], ["remedio", "Remédio"], ["rotina", "Rotina"],
  ["natureza", "Natureza"], ["seres", "Seres"], ["tempo", "Tempo"], ["morte", "Morte"],
] as [string, string][];
const NOME_TEMA: { [chave: string]: string } = Object.fromEntries(TEMAS);
const NOME_PACOTE: { [chave: string]: string } = { "cartoes-samkhya": "Cartões Samkhya", "instagram": "Instagram", "verso-do-dia": "Verso do dia (site)" };
const nomePacote = (p: string) => NOME_PACOTE[p] ?? p;
const FAIXAS = [
  { rotulo: "Curtinho, até 120", min: 0, max: 120 },
  { rotulo: "Cartão, 80 a 200", min: 80, max: 200 },
  { rotulo: "Post, 150 a 350", min: 150, max: 350 },
  { rotulo: "Longo, 350+", min: 350, max: 700 },
  { rotulo: "Qualquer", min: 0, max: 700 },
];
const PISOS = [[0, "Todos"], [60, "60+"], [70, "70+"], [80, "80+"]] as [number, string][];
const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const refDe = (v: VersoRank) =>
  [v.livro, v.referencia, v.verso_no ? "v. " + v.verso_no.replace(/[\[\]]/g, "") : null].filter(Boolean).join(" · ");
const textoCopia = (v: VersoRank) => v.texto_pt.trim() + "\n\n" + refDe(v);
const copiar = async (t: string) => { try { await navigator.clipboard.writeText(t); return true; } catch { return false; } };

type Ordem = "melhores" | "curtos" | "longos";

const chipClass = (marcado: boolean) =>
  `rounded-full border px-4 min-h-[48px] text-base ${marcado ? "border-classics bg-classics text-white hover:bg-classics/90" : "border-classics/30 bg-background text-foreground hover:bg-classics-soft"}`;

export default function AbaMelhoresVersos() {
  const [versos, setVersos] = useState<VersoRank[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<Ordem>("melhores");
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(700);
  const [piso, setPiso] = useState(0);
  const [temas, setTemas] = useState<string[]>([]);
  const [livro, setLivro] = useState("");
  const [comSanscrito, setComSanscrito] = useState(false);
  const [verSanscrito, setVerSanscrito] = useState(true);
  const [pacote, setPacote] = useState("");
  const [soPacote, setSoPacote] = useState(false);
  const [novoAberto, setNovoAberto] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const { role } = useUser();
  const admin = role === "admin";

  useEffect(() => {
    let ativo = true;
    void (async () => {
      const { data } = await supabase.rpc("acervo_versos" as never);
      if (!ativo) return;
      setVersos((data as unknown as VersoRank[]) ?? []);
      setCarregando(false);
    })();
    return () => { ativo = false; };
  }, []);

  const lista = useMemo(() => {
    const q = norm(busca.trim());
    const out = versos.filter((v) =>
      v.letras >= min && (max >= 700 || v.letras <= max) && v.pontos >= piso &&
      (!q || norm(v.texto_pt + " " + v.livro + " " + (v.referencia ?? "")).includes(q)) &&
      (!livro || v.livro === livro) && (!comSanscrito || !!v.verso_sanskrit) &&
      (temas.length === 0 || v.temas.some((t) => temas.includes(t))) &&
      (!(admin && pacote && soPacote) || (v.pacotes ?? []).includes(pacote)));
    const sac = (v: VersoRank) => v.pontos_det?.sacada ?? 0;
    out.sort(ordem === "curtos" ? (a, b) => a.letras - b.letras
      : ordem === "longos" ? (a, b) => b.letras - a.letras
      : (a, b) => b.pontos - a.pontos || sac(b) - sac(a) || a.id - b.id);
    return out;
  }, [versos, busca, ordem, min, max, piso, temas, livro, comSanscrito, admin, pacote, soPacote]);

  const resumo = useMemo(() => ({
    livros: new Set(versos.map((v) => v.livro)).size,
    media: versos.length ? Math.round(versos.reduce((s, v) => s + v.pontos, 0) / versos.length) : 0,
    sanscrito: versos.filter((v) => !!v.verso_sanskrit).length,
  }), [versos]);

  const temasDisponiveis = useMemo(() => TEMAS.map(([chave, nome]) => ({
    chave,
    nome,
    total: versos.filter((v) => v.temas.includes(chave)).length,
  })).filter((t) => t.total > 0), [versos]);

  const livros = useMemo(() => {
    const contagens = new Map<string, number>();
    for (const v of versos) contagens.set(v.livro, (contagens.get(v.livro) ?? 0) + 1);
    return [...contagens.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt"));
  }, [versos]);

  const pacotes = useMemo(() => {
    const nomes = new Set<string>();
    for (const v of versos) for (const p of v.pacotes ?? []) nomes.add(p);
    if (pacote) nomes.add(pacote);
    return [...nomes].map((nome) => ({
      nome,
      total: versos.filter((v) => (v.pacotes ?? []).includes(nome)).length,
    })).sort((a, b) => nomePacote(a.nome).localeCompare(nomePacote(b.nome), "pt"));
  }, [versos, pacote]);

  const versosPacote = useMemo(
    () => pacote ? versos.filter((v) => (v.pacotes ?? []).includes(pacote)) : [],
    [versos, pacote],
  );

  const alternar = async (v: VersoRank) => {
    const { data, error } = await supabase.rpc("acervo_pacote_alternar" as never, { p_verso: v.id, p_pacote: pacote } as never);
    if (error) { toast("Não salvou. Tente de novo."); return; }
    setVersos((vs) => vs.map((x) => (x.id === v.id ? { ...x, pacotes: (data as unknown as string[]) ?? [] } : x)));
  };

  const criarPacote = () => {
    const nome = novoNome.trim().slice(0, 60);
    if (!nome) return;
    setPacote(nome);
    setNovoAberto(false);
    setNovoNome("");
  };

  const copiarPacote = async () => {
    if (!versosPacote.length) { toast("Pacote vazio"); return; }
    const ok = await copiar(versosPacote.map(textoCopia).join("\n\n\n"));
    if (ok) toast(`${versosPacote.length} versos copiados`);
  };

  const baixarPlanilha = () => {
    if (!versosPacote.length) { toast("Pacote vazio"); return; }
    const celula = (valor: unknown) => `"${String(valor ?? "").replace(/"/g, '""')}"`;
    const cabecalho = ["texto", "sanscrito", "livro", "referencia", "verso", "letras", "temas", "pontos", "id"];
    const linhas = versosPacote.map((v) => [
      v.texto_pt, v.verso_sanskrit ?? "", v.livro, v.referencia ?? "", v.verso_no ?? "", v.letras,
      v.temas.map((t) => NOME_TEMA[t] ?? t).join(" / "), v.pontos, v.id,
    ].map(celula).join(","));
    const csv = "\uFEFF" + [cabecalho.map(celula).join(","), ...linhas].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = norm(nomePacote(pacote)).trim().replace(/\s+/g, "-") + ".csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast("Planilha salva");
  };

  const limparFiltros = () => {
    setBusca("");
    setMin(0);
    setMax(700);
    setPiso(0);
    setTemas([]);
    setLivro("");
    setComSanscrito(false);
  };

  if (carregando) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-classics" />
      </div>
    );
  }

  const mediaLetrasPacote = versosPacote.length
    ? Math.round(versosPacote.reduce((s, v) => s + v.letras, 0) / versosPacote.length)
    : 0;

  return (
    <section className="mx-auto max-w-5xl">
      <h2>Melhores versos</h2>
      <p className="mt-3 text-base text-foreground">
        {versos.length} versos de {resumo.livros} livros clássicos · média {resumo.media} pontos · {resumo.sanscrito} com sânscrito
      </p>
      <p className="mt-2 text-sm text-foreground">
        Pontuação de 0 a 100: sacada (até 30) · se sustenta sozinho (25) · profundidade (20) · fama do verso (15) · pronto pra usar (10).
      </p>

      {admin && (
        <div className="mt-6 rounded-2xl border-2 border-classics bg-card p-4">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="pacote" className="text-sm font-semibold uppercase tracking-wide text-foreground">Pacote</label>
            <select
              id="pacote"
              value={pacote}
              onChange={(e) => { setPacote(e.target.value); setSoPacote(false); }}
              className="min-h-[48px] min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-base text-foreground"
            >
              <option value="">Nenhum pacote aberto</option>
              {pacotes.map((p) => <option key={p.nome} value={p.nome}>{nomePacote(p.nome)} ({p.total})</option>)}
            </select>
            <Button type="button" variant="outline" className="min-h-[48px] text-base" onClick={() => setNovoAberto(true)}>
              <Plus className="mr-2 h-4 w-4" />Novo pacote
            </Button>
            {pacote && (
              <Button type="button" aria-pressed={soPacote} className={chipClass(soPacote)} onClick={() => setSoPacote((v) => !v)}>
                Ver só este pacote
              </Button>
            )}
          </div>

          {novoAberto && (
            <div className="mt-3 flex flex-wrap gap-3">
              <Input
                value={novoNome}
                maxLength={60}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Nome do pacote, ex.: Cartões dezembro"
                className="min-h-[48px] min-w-[220px] flex-1 text-base"
              />
              <Button type="button" className="min-h-[48px] bg-classics text-base text-white hover:bg-classics/90" onClick={criarPacote}>Criar</Button>
              <Button type="button" variant="outline" className="min-h-[48px] text-base" onClick={() => { setNovoAberto(false); setNovoNome(""); }}>Cancelar</Button>
            </div>
          )}

          {pacote && (
            <div className="mt-4 border-t border-border pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-serif text-lg text-foreground">{nomePacote(pacote)}</p>
                  <p className="text-sm text-foreground">{versosPacote.length} versos · média {mediaLetrasPacote} letras</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button type="button" variant="outline" className="min-h-[48px] text-base" onClick={() => void copiarPacote()}>
                    <Copy className="mr-2 h-4 w-4" />Copiar textos
                  </Button>
                  <Button type="button" variant="outline" className="min-h-[48px] text-base" onClick={baixarPlanilha}>
                    <Download className="mr-2 h-4 w-4" />Baixar planilha
                  </Button>
                </div>
              </div>
              <p className="mt-3 text-sm text-foreground">Toque em "+ Pacote" nos cartões para colocar ou tirar. Fica salvo na hora.</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 space-y-4 rounded-2xl border border-classics/20 bg-card p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar palavra: morte, agni, mente, leite..."
              className="min-h-[48px] pl-9 text-base"
            />
          </div>
          <select
            value={ordem}
            onChange={(e) => setOrdem(e.target.value as Ordem)}
            aria-label="Ordem dos versos"
            className="min-h-[48px] rounded-md border border-input bg-background px-3 text-base text-foreground"
          >
            <option value="melhores">Melhores primeiro</option>
            <option value="curtos">Mais curtos primeiro</option>
            <option value="longos">Mais longos primeiro</option>
          </select>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-foreground">Tamanho</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-base text-foreground">
              mínimo · {min} letras
              <input
                type="range" min={0} max={700} step={10} value={min}
                onChange={(e) => { const valor = Number(e.target.value); setMin(valor); if (valor > max) setMax(valor); }}
                className="mt-2 w-full accent-current text-classics"
              />
            </label>
            <label className="text-base text-foreground">
              máximo · {max === 700 ? "sem limite" : `${max} letras`}
              <input
                type="range" min={60} max={700} step={10} value={max}
                onChange={(e) => { const valor = Number(e.target.value); setMax(valor); if (valor < min) setMin(valor); }}
                className="mt-2 w-full accent-current text-classics"
              />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            {FAIXAS.map((f) => (
              <Button key={f.rotulo} type="button" aria-pressed={min === f.min && max === f.max} className={chipClass(min === f.min && max === f.max)} onClick={() => { setMin(f.min); setMax(f.max); }}>
                {f.rotulo}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-foreground">Pontos</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {PISOS.map(([valor, rotulo]) => (
              <Button key={valor} type="button" aria-pressed={piso === valor} className={chipClass(piso === valor)} onClick={() => setPiso(valor)}>
                {rotulo}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-foreground">Temas</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {temasDisponiveis.map((t) => {
              const marcado = temas.includes(t.chave);
              return (
                <Button
                  key={t.chave}
                  type="button"
                  aria-pressed={marcado}
                  className={chipClass(marcado)}
                  onClick={() => setTemas((atuais) => marcado ? atuais.filter((x) => x !== t.chave) : [...atuais, t.chave])}
                >
                  {t.nome} <span className="ml-1 text-sm">{t.total}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="livro" className="text-sm font-semibold uppercase tracking-wide text-foreground">Livro</label>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <select
              id="livro"
              value={livro}
              onChange={(e) => setLivro(e.target.value)}
              className="min-h-[48px] min-w-[220px] rounded-md border border-input bg-background px-3 text-base text-foreground"
            >
              <option value="">Todos os livros</option>
              {livros.map(([nome, total]) => <option key={nome} value={nome}>{nome} ({total})</option>)}
            </select>
            <Button type="button" aria-pressed={comSanscrito} className={chipClass(comSanscrito)} onClick={() => setComSanscrito((v) => !v)}>Com sânscrito</Button>
            <Button type="button" aria-pressed={verSanscrito} className={chipClass(verSanscrito)} onClick={() => setVerSanscrito((v) => !v)}>Mostrar sânscrito</Button>
            <Button type="button" variant="outline" className="min-h-[48px] text-base" onClick={limparFiltros}>Limpar filtros</Button>
          </div>
        </div>
      </div>

      <p className="my-4 text-base text-foreground">Mostrando {lista.length} de {versos.length}</p>

      {lista.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {lista.map((v) => {
            const noPacote = !!pacote && (v.pacotes ?? []).includes(pacote);
            const det = v.pontos_det ?? { sacada: 0, sozinho: 0, profundidade: 0, fama: 0, pronto: 0 };
            return (
              <article key={v.id} className={`flex flex-col gap-3 rounded-2xl bg-card p-5 ${noPacote ? "border-2 border-emerald-700" : "border border-classics/20"}`}>
                {v.verso_sanskrit && verSanscrito && (
                  <p lang="sa" className="whitespace-pre-line text-lg leading-relaxed text-primary" style={{ fontFamily: "'Noto Serif Devanagari', serif" }}>
                    {v.verso_sanskrit}
                  </p>
                )}
                <p className="whitespace-pre-line font-serif text-lg leading-relaxed text-foreground">{v.texto_pt}</p>
                <p className="text-base text-foreground">{refDe(v)}</p>
                <div className="flex flex-wrap gap-2">
                  {v.temas.map((t) => <span key={t} className="rounded-full bg-classics-soft px-3 py-1 text-sm text-foreground">{NOME_TEMA[t] ?? t}</span>)}
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                  <p className="text-base text-foreground">
                    <span className="rounded-lg bg-classics-soft px-2 py-0.5 font-bold">{v.pontos}</span> pontos · {v.letras} letras
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button type="button" variant="outline" className="min-h-[48px] text-base" onClick={async () => { if (await copiar(textoCopia(v))) toast("Verso copiado"); }}>
                      <Copy className="mr-2 h-4 w-4" />Copiar
                    </Button>
                    {admin && pacote && (
                      <Button
                        type="button"
                        variant="outline"
                        className={`min-h-[48px] text-base ${noPacote ? "border-emerald-700 bg-emerald-50 text-foreground hover:bg-emerald-50" : ""}`}
                        onClick={() => void alternar(v)}
                      >
                        {noPacote ? "✓ No pacote" : "+ Pacote"}
                      </Button>
                    )}
                  </div>
                  <p className="w-full text-sm text-foreground">
                    sacada {det.sacada} · sozinho {det.sozinho} · profundidade {det.profundidade} · fama {det.fama} · pronto {det.pronto}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-sm text-foreground">
          Nenhum verso com esses filtros. Tente aumentar o tamanho ou tirar um tema.
        </p>
      )}
    </section>
  );
}
