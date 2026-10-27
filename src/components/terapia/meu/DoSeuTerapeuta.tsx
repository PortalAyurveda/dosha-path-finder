import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronDown, ExternalLink, Printer } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MarcaPortal } from "@/components/impressao/PecasImpressao";
import { dataAcompanhamento } from '@/lib/meuAcompanhamento';
import { diaBR } from "@/lib/terapia";
import { iniciarIndicacoes, linkCurto, linkIndicacao } from "@/lib/terapiaIndicacoes";
import { alternarFeito, feitoHoje, meu, progressoSecao, secoesDaHora, semanaDoItem, type MinhaFolha } from "@/lib/terapiaMeu";
import "./doSeuTerapeuta.css";

const vistas = new Set<string>();
const externo = (l: string) => /^https?:\/\//.test(l) && !l.includes("portalayurveda.com");

export default function DoSeuTerapeuta({ folha, rodape, acompanhamento=false }: { folha: MinhaFolha; rodape?: string; acompanhamento?:boolean }) {
  const [feitos, setFeitos] = useState(folha.feitos ?? []);
  const [erro, setErro] = useState("");
  const [imprimindo, setImprimindo] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const nome = folha.terapeuta.primeiro_nome;
  const dataFolha = acompanhamento ? dataAcompanhamento : diaBR;
  useEffect(() => setFeitos(folha.feitos ?? []), [folha]);
  useEffect(() => {
    if (vistas.has(folha.id)) return;
    vistas.add(folha.id);
    meu.vista(folha.id).catch(() => vistas.delete(folha.id));
  }, [folha.id]);
  useEffect(() => {
    if (!imprimindo) return;
    document.body.classList.add("imprimindo-do-seu-terapeuta");
    const fim = () => setImprimindo(false);
    window.addEventListener("afterprint", fim);
    const t = setTimeout(() => window.print(), 50);
    return () => { clearTimeout(t); window.removeEventListener("afterprint", fim); document.body.classList.remove("imprimindo-do-seu-terapeuta"); };
  }, [imprimindo]);

  const marcar = async (item: string, feito: boolean) => {
    const antes = feitos; setErro("");
    setFeitos(alternarFeito(feitos, item, feito, new Date()));
    try { await meu.marcar(folha.id, item, feito); } catch (e) { setFeitos(antes); setErro((e as Error).message); }
  };
  const dados = iniciarIndicacoes(folha.dados ?? {});
  const agora = new Date();
  // No celular começa aberta só a seção da hora do dia; no computador, todas.
  const [abertas, setAbertas] = useState<Record<string, boolean>>(() => {
    const daHora = secoesDaHora(agora.getHours());
    const mobile = window.matchMedia("(max-width: 760px)").matches;
    return Object.fromEntries((folha.secoes ?? []).map(s => [s.chave, !mobile || daHora.includes(s.chave)]));
  });
  const blocos: [string, string | null][] = [["Diagnóstico", folha.diagnostico], ["Tratamento", folha.tratamento], ["Retorno", folha.retorno ? (acompanhamento ? dataAcompanhamento(folha.retorno) : new Date(`${folha.retorno}T12:00:00`).toLocaleDateString("pt-BR")) : null]];

  return (
    <article ref={ref} className={`do-seu-terapeuta rounded-2xl border border-secondary/30 bg-card p-5 md:p-6 ${imprimindo ? "imprimir-este" : ""}`} aria-label={`Do seu terapeuta: ${folha.terapeuta.nome}`}>
      <div className="so-impressao mb-4 flex items-center justify-between border-b border-border pb-3"><span className="font-serif text-lg font-bold">Indicações · {dataFolha(folha.enviada_em)}</span><MarcaPortal /></div>
      <header className="flex flex-wrap items-center gap-3">
        {!acompanhamento && (folha.terapeuta.imagem ? <img src={folha.terapeuta.imagem} alt="" className="h-12 w-12 rounded-t-full rounded-b-md object-cover" /> : <span className="flex h-12 w-12 items-center justify-center rounded-t-full rounded-b-md bg-secondary/15 font-serif font-bold text-secondary">{nome[0]}</span>)}
        <div className="min-w-0 flex-1">
          {!acompanhamento&&<p className="text-xs font-semibold uppercase tracking-wide text-secondary">Do seu terapeuta</p>}
          <h2 className="font-serif text-lg font-bold text-primary">{acompanhamento?`Folha de ${dataFolha(folha.enviada_em)}`:folha.terapeuta.nome}</h2>
          <p className="text-xs text-muted-foreground">Enviada em {dataFolha(folha.enviada_em)}</p>
        </div>
        <Button variant="outline" size="sm" className="no-print" onClick={() => setImprimindo(true)}><Printer className="mr-2 h-4 w-4" />Imprimir</Button>
      </header>
      {blocos.map(([t, v]) => v?.trim() ? <section key={t} className="mt-4"><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t}</h3><p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{v}</p></section> : null)}
      {(folha.secoes ?? []).map(s => {
        const itens = dados.secoes[s.chave] ?? [];
        if (!itens.length) return null;
        const aberta = abertas[s.chave] ?? true;
        const feitosNaSecao = itens.filter(i => feitoHoje(feitos, i.id, agora)).length;
        return (
          <section key={s.chave} className={`dst-secao mt-5 ${aberta ? "" : "fechada"}`}>
            <h3 className="mb-2 font-serif text-base font-bold text-primary"><button type="button" className="dst-barra no-print" aria-expanded={aberta} onClick={() => setAbertas(a => ({ ...a, [s.chave]: !aberta }))}><ChevronDown size={16} className="dst-seta" aria-hidden="true" /><span>{aberta ? s.titulo : progressoSecao(s.titulo, feitosNaSecao, itens.length)}</span></button><span className="so-impressao">{s.titulo}</span></h3>
            <ul className="dst-corpo space-y-2">
              {itens.map(i => {
                const link = linkIndicacao(i);
                const hoje = feitoHoje(feitos, i.id, agora);
                return (
                  <li key={i.id} className="rounded-xl border border-border bg-background p-3">
                    <div className="flex flex-wrap items-start gap-3">
                      <div className="min-w-0 flex-1">
                        {!acompanhamento&&<span className="no-print mb-1 inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2 py-0.5 text-[11px] font-semibold text-secondary">● {nome} indicou</span>}
                        <p className="font-semibold">{i.titulo}</p>
                        {i.texto && <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{i.texto}</p>}
                        {i.nota && <p className="mt-1 whitespace-pre-wrap text-sm">{i.nota}</p>}
                        {link && <p className="so-impressao text-xs text-muted-foreground">{linkCurto(link)}</p>}
                      </div>
                      <div className="no-print flex flex-col items-end gap-2">
                        {link && (externo(link)
                          ? <Button asChild variant="outline" size="sm"><a href={link} target="_blank" rel="noreferrer">Abrir<ExternalLink className="ml-1 h-3 w-3" /></a></Button>
                          : <Button asChild variant="outline" size="sm"><Link to={link.replace(/^https?:\/\/(www\.)?portalayurveda\.com/, "") || "/"}>Abrir</Link></Button>)}
                        {acompanhamento?<label className="flex items-center gap-2 whitespace-nowrap text-xs"><Checkbox aria-label={`Feito hoje: ${i.titulo}`} checked={hoje} onCheckedChange={v=>void marcar(i.id,v===true)}/>feito hoje</label>:<Button size="sm" variant={hoje ? "secondary" : "outline"} aria-pressed={hoje} onClick={() => marcar(i.id, !hoje)}>{hoje && <Check className="mr-1 h-3 w-3" />}Feito hoje</Button>}
                        {!acompanhamento&&<div className="flex gap-1" aria-label="Últimos 7 dias">{semanaDoItem(feitos, i.id, agora).map(d => <span key={d.dia} title={d.dia.split("-").reverse().join("/")} className={`h-2 w-2 rounded-full ${d.feito ? "bg-secondary" : "bg-muted"}`} />)}</div>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      {erro && <p role="alert" className="mt-3 text-sm text-destructive">{erro}</p>}
      {rodape && <p className="no-print mt-5 border-t border-border pt-3 text-sm text-muted-foreground">{rodape}</p>}
      <p className="so-impressao mt-8 border-t border-border pt-2 text-xs">{folha.terapeuta.nome} · Portal Ayurveda</p>
    </article>
  );
}
