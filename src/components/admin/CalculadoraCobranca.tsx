import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, Loader2, Minus, Plus, X, Search, Eraser } from "lucide-react";
import {
  GRUPOS, ItemCatalogo, LinhaConta, TipoDesconto, adicionarDoCatalogo, brl, calcular, montarDescricao, normalizar, parseValor,
} from "@/lib/calculadoraCobranca";

let seq = 0;
const novaChave = () => `avulso:${Date.now()}:${seq++}`;

const CampoValor = ({ valor, onChange, className, aria }: { valor: number; onChange: (n: number) => void; className?: string; aria: string }) => {
  const [txt, setTxt] = useState(valor ? String(valor).replace(".", ",") : "");
  const foco = useRef(false);
  useEffect(() => {
    if (!foco.current) setTxt(valor ? valor.toFixed(2).replace(".", ",") : "");
  }, [valor]);
  return (
    <Input
      inputMode="decimal"
      aria-label={aria}
      className={className}
      value={txt}
      placeholder="0,00"
      onFocus={() => (foco.current = true)}
      onBlur={() => { foco.current = false; setTxt(valor ? valor.toFixed(2).replace(".", ",") : ""); }}
      onChange={(e) => { setTxt(e.target.value); onChange(parseValor(e.target.value)); }}
    />
  );
};

const CalculadoraCobranca = () => {
  const [catalogo, setCatalogo] = useState<ItemCatalogo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState(false);
  const [linhas, setLinhas] = useState<LinhaConta[]>([]);
  const [desconto, setDesconto] = useState(0);
  const [tipo, setTipo] = useState<TipoDesconto>("pct");
  const [frete, setFrete] = useState(0);
  const [nome, setNome] = useState("");
  const [gerando, setGerando] = useState<null | "pix" | "cartao">(null);
  const [link, setLink] = useState<{ url: string; forma: "pix" | "cartao" } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("admin_catalogo_calculadora");
      if (error) toast.error(error.message);
      const arr = Array.isArray(data) ? data : Array.isArray((data as any)?.itens) ? (data as any).itens : [];
      setCatalogo(arr as ItemCatalogo[]);
      setCarregando(false);
    })();
  }, []);

  useEffect(() => {
    const fora = (e: MouseEvent) => { if (caixa.current && !caixa.current.contains(e.target as Node)) setAberto(false); };
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, []);

  const resultados = useMemo(() => {
    const q = normalizar(busca.trim());
    if (!q) return [];
    const achados = catalogo.filter((i) => normalizar(i.nome || "").includes(q));
    const grupos = [...GRUPOS, ...Array.from(new Set(achados.map((i) => i.grupo))).filter((g) => !GRUPOS.includes(g))];
    return grupos.map((g) => ({ grupo: g, itens: achados.filter((i) => i.grupo === g).slice(0, 30) })).filter((g) => g.itens.length);
  }, [busca, catalogo]);

  const resumo = calcular(linhas, desconto, tipo, frete);

  const mexer = () => { setLink(null); setErro(null); setAviso(false); };
  const atualizar = (chave: string, p: Partial<LinhaConta>) => { mexer(); setLinhas((ls) => ls.map((l) => (l.chave === chave ? { ...l, ...p } : l))); };

  const escolher = (item: ItemCatalogo) => { mexer(); setLinhas((ls) => adicionarDoCatalogo(ls, item)); setBusca(""); setAberto(false); };
  const avulso = (n = "") => { mexer(); setLinhas((ls) => [...ls, { chave: novaChave(), nome: n, preco: 0, qtd: 1 }]); setBusca(""); setAberto(false); };

  const limpar = () => { setLinhas([]); setDesconto(0); setTipo("pct"); setFrete(0); setNome(""); setBusca(""); mexer(); };

  const gerar = async (forma: "pix" | "cartao") => {
    setErro(null); setLink(null);
    if (resumo.total <= 0) { setAviso(true); return; }
    setAviso(false);
    setGerando(forma);
    const validas = linhas.filter((l) => l.nome.trim());
    const { data, error } = await supabase.functions.invoke("criar-cobranca", {
      body: {
        forma,
        valor: resumo.total,
        descricao: montarDescricao(validas, desconto, tipo),
        nome: nome.trim() || undefined,
        itens: validas.map((l) => ({ nome: l.nome.trim(), qtd: l.qtd, preco: l.preco })),
      },
    });
    setGerando(null);
    let msg: string | null = (data as any)?.error || null;
    if (error && !msg) {
      try { const b = await (error as any).context?.json?.(); msg = b?.error || b?.message || null; } catch { /* sem corpo */ }
      msg = msg || error.message || "Erro ao gerar cobrança";
    }
    if (msg) { setErro(msg); return; }
    const url = (data as any)?.url;
    if (!url) { setErro("A função não retornou um link"); return; }
    setLink({ url, forma });
    toast.success("Cobrança criada");
  };

  const copiar = async () => {
    if (!link) return;
    try { await navigator.clipboard.writeText(link.url); toast.success("Link copiado"); } catch { toast.error("Não consegui copiar"); }
  };

  return (
    <Card className="p-5 space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Calculadora</h2>
        <Button size="sm" variant="outline" onClick={limpar}><Eraser className="w-4 h-4 mr-2" />Limpar</Button>
      </div>

      <div ref={caixa} className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder={carregando ? "Carregando catálogo…" : "Buscar produto, curso ou kit"}
          value={busca}
          onFocus={() => setAberto(true)}
          onChange={(e) => { setBusca(e.target.value); setAberto(true); }}
        />
        {aberto && busca.trim() && (
          <div className="absolute z-20 mt-1 w-full max-h-80 overflow-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md">
            {resultados.map((g) => (
              <div key={g.grupo}>
                <div className="px-3 pt-2 pb-1 text-xs font-semibold uppercase text-muted-foreground">{g.grupo}</div>
                {g.itens.map((i) => (
                  <button key={`${i.tipo}:${i.id}`} type="button" onClick={() => escolher(i)}
                    className="w-full flex justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground">
                    <span className="min-w-0">{i.nome}</span>
                    <span className="shrink-0 tabular-nums">{brl(Number(i.preco))}</span>
                  </button>
                ))}
              </div>
            ))}
            {resultados.length === 0 && <p className="px-3 py-2 text-sm text-muted-foreground">Nada encontrado no catálogo.</p>}
            <button type="button" onClick={() => avulso(busca.trim())}
              className="w-full border-t border-border px-3 py-2 text-left text-sm font-medium text-primary hover:bg-accent">
              Adicionar “{busca.trim()}” como item avulso
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {linhas.length === 0 && <p className="text-sm text-muted-foreground">Nenhum item na conta ainda.</p>}
        {linhas.map((l) => {
          const mudou = l.precoOriginal !== undefined && Math.abs(l.preco - l.precoOriginal) > 0.004;
          return (
            <div key={l.chave} className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  {l.id ? <p className="font-medium text-sm">{l.nome}</p> : (
                    <Input aria-label="Nome do item" placeholder="Nome do item" value={l.nome} onChange={(e) => atualizar(l.chave, { nome: e.target.value })} />
                  )}
                  {mudou && <p className="text-xs text-muted-foreground line-through">{brl(l.precoOriginal!)}</p>}
                </div>
                <Button size="icon" variant="ghost" aria-label="Remover" onClick={() => { mexer(); setLinhas((ls) => ls.filter((x) => x.chave !== l.chave)); }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="w-28"><CampoValor aria="Preço unitário" valor={l.preco} onChange={(n) => atualizar(l.chave, { preco: n })} /></div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="outline" className="h-9 w-9" aria-label="Diminuir" disabled={l.qtd <= 1} onClick={() => atualizar(l.chave, { qtd: Math.max(1, l.qtd - 1) })}><Minus className="w-4 h-4" /></Button>
                  <span className="w-8 text-center tabular-nums">{l.qtd}</span>
                  <Button size="icon" variant="outline" className="h-9 w-9" aria-label="Aumentar" onClick={() => atualizar(l.chave, { qtd: l.qtd + 1 })}><Plus className="w-4 h-4" /></Button>
                </div>
                <span className="ml-auto font-semibold tabular-nums">{brl(l.preco * l.qtd)}</span>
              </div>
            </div>
          );
        })}
        <Button variant="outline" size="sm" onClick={() => avulso()}><Plus className="w-4 h-4 mr-2" />Item avulso</Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Desconto</Label>
          <div className="flex gap-2 mt-1">
            <CampoValor aria="Desconto" valor={desconto} onChange={(n) => { mexer(); setDesconto(n); }} />
            <Button type="button" variant="outline" className="w-12 shrink-0" onClick={() => { mexer(); setTipo((t) => (t === "pct" ? "brl" : "pct")); }}>
              {tipo === "pct" ? "%" : "R$"}
            </Button>
          </div>
        </div>
        <div>
          <Label>Frete (R$)</Label>
          <div className="mt-1"><CampoValor aria="Frete" valor={frete} onChange={(n) => { mexer(); setFrete(n); }} /></div>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 space-y-1 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span className="tabular-nums">{brl(resumo.subtotal)}</span></div>
        <div className="flex justify-between"><span>Desconto</span><span className="tabular-nums">− {brl(resumo.desconto)}</span></div>
        <div className="flex justify-between"><span>Frete</span><span className="tabular-nums">{brl(resumo.frete)}</span></div>
        <div className="flex justify-between items-baseline pt-2 border-t border-border mt-2">
          <span className="font-semibold">Total</span><span className="text-3xl font-bold tabular-nums">{brl(resumo.total)}</span>
        </div>
      </div>

      <div>
        <Label htmlFor="calc-nome">Nome do cliente (opcional)</Label>
        <Input id="calc-nome" className="mt-1" value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => gerar("pix")} disabled={!!gerando}>
          {gerando === "pix" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Gerar link Pix
        </Button>
        <Button onClick={() => gerar("cartao")} disabled={!!gerando}>
          {gerando === "cartao" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Gerar link Cartão
        </Button>
      </div>
      {(aviso || resumo.total <= 0) && <p className={`text-sm text-center ${aviso ? "text-destructive" : "text-muted-foreground"}`}>Adicione pelo menos um item</p>}
      {erro && <p className="text-sm text-destructive rounded-md border border-destructive/40 p-3">{erro}</p>}
      {link && (
        <div className="rounded-lg border border-primary/40 bg-primary/5 p-4 space-y-2">
          <p className="text-sm font-medium">{link.forma === "pix" ? "Link Pix gerado!" : "Link de cartão gerado!"}</p>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm underline break-all flex-1">{link.url}</a>
            <Button size="sm" variant="outline" onClick={copiar}><Copy className="w-4 h-4 mr-2" />Copiar</Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default CalculadoraCobranca;
