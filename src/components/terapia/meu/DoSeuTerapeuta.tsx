import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Printer } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MarcaPortal } from "@/components/impressao/PecasImpressao";
import { dataAcompanhamento } from '@/lib/meuAcompanhamento';
import { diaBR } from "@/lib/terapia";
import { MOMENTOS, iniciarIndicacoes, linkCurto, linkIndicacao, momentosDaFolha, verTexto } from "@/lib/terapiaIndicacoes";
import { alternarFeito, feitoHoje, meu, progressoSecao, secoesDaHora, type MinhaFolha } from "@/lib/terapiaMeu";
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
  const momentos = momentosDaFolha(folha.secoes).filter(s => (dados.secoes[s.chave] ?? []).length);
  // No computador todos os momentos ficam abertos; no celular, só o da hora e "Todo dia".
  const [mobile] = useState(() => window.matchMedia("(max-width: 760px)").matches);
  const [abertas, setAbertas] = useState<Record<string, boolean>>(() => { const daHora = secoesDaHora(agora.getHours()); return Object.fromEntries(MOMENTOS.map(s => [s.chave, !mobile || daHora.includes(s.chave)])); });
  const enviadoEm = new Date(folha.enviada_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  const retorno = folha.retorno ? new Date(`${folha.retorno}T12:00:00`).toLocaleDateString("pt-BR", { day: "numeric", month: "long" }) : "";

  return (
    <article ref={ref} className={`do-seu-terapeuta seu-dia ${imprimindo ? "imprimir-este" : ""}`} aria-label={`Seu dia: ${folha.terapeuta.nome}`}>
      <div className="so-impressao mb-4 flex items-center justify-between border-b border-border pb-3"><span className="font-serif text-lg font-bold">Seu dia · {dataFolha(folha.enviada_em)}</span><MarcaPortal /></div>
      <header className="sd-topo">
        <div className="min-w-0 flex-1"><h2>Seu dia</h2><p>Do seu terapeuta {nome} · enviado em {enviadoEm}</p></div>
        <Button variant="outline" size="sm" className="no-print" onClick={() => setImprimindo(true)}><Printer className="mr-2 h-4 w-4" />Imprimir</Button>
      </header>
      {folha.diagnostico?.trim() && <section className="sd-acontece"><h3>O que está acontecendo</h3><p>{folha.diagnostico}</p></section>}
      {momentos.map(s => {
        const itens = dados.secoes[s.chave] ?? [];
        const aberta = imprimindo || (abertas[s.chave] ?? true);
        const feitosNaSecao = itens.filter(i => feitoHoje(feitos, i.id, agora)).length;
        return (
          <section key={s.chave} className={`sd-cartao ${aberta ? "" : "fechada"}`}>
            <h3>{mobile ? <button type="button" className="sd-barra" aria-expanded={aberta} onClick={() => setAbertas(a => ({ ...a, [s.chave]: !aberta }))}><span>{s.titulo}</span><small>{progressoSecao(feitosNaSecao, itens.length)}</small><ChevronDown size={16} className="sd-seta" aria-hidden="true" /></button> : <span className="sd-barra"><span>{s.titulo}</span><small>{progressoSecao(feitosNaSecao, itens.length)}</small></span>}</h3>
            {aberta && <ul>
              {itens.map(i => {
                const link = linkIndicacao(i);
                const hoje = feitoHoje(feitos, i.id, agora);
                const ver = link ? (externo(link) ? <a href={link} target="_blank" rel="noreferrer">{verTexto(i.tipo)}</a> : <Link to={link.replace(/^https?:\/\/(www\.)?portalayurveda\.com/, "") || "/"}>{verTexto(i.tipo)}</Link>) : null;
                return (
                  <li key={i.id} className={hoje ? "feito" : ""}>
                    <Checkbox className="no-print sd-ck" aria-label={`Feito hoje: ${i.titulo}`} checked={hoje} onCheckedChange={v => void marcar(i.id, v === true)} />
                    <div className="min-w-0">
                      <b>{i.titulo}</b>
                      {i.texto && <small className="whitespace-pre-wrap">{i.texto}</small>}
                      {(i.nota || ver) && <small>{i.nota}{i.nota && ver ? " · " : ""}{ver && <span className="no-print">{ver}</span>}</small>}
                      {link && <small className="so-impressao">{linkCurto(link)}</small>}
                    </div>
                  </li>
                );
              })}
            </ul>}
          </section>
        );
      })}
      {erro && <p role="alert" className="mt-3 text-sm text-destructive">{erro}</p>}
      {retorno && <section className="sd-cartao sd-proxima"><h3 className="sd-eti">Próxima consulta</h3><p><b>{retorno}</b><span className="no-print"> · <Link to="/meu-acompanhamento?aba=conversa">conversar com {nome}</Link></span></p></section>}
      {rodape && <p className="no-print mt-4 text-sm text-muted-foreground">{rodape}</p>}
      <p className="so-impressao mt-8 border-t border-border pt-2 text-xs">{folha.terapeuta.nome} · Portal Ayurveda</p>
    </article>
  );
}
