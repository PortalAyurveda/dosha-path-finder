import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Printer } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MarcaPortal } from "@/components/impressao/PecasImpressao";
import { dataAcompanhamento } from '@/lib/meuAcompanhamento';
import { diaBR } from "@/lib/terapia";
import { dowDaData, iniciarIndicacoes, itemValeNoDia, linkCurto, linkIndicacao, momentosDaFolha, resumoDias, verTexto } from "@/lib/terapiaIndicacoes";
import { alternarFeitoDia, diaSP, feitoNoDia, meu, progressoSecao, rotuloDiaMarcando, type MinhaFolha } from "@/lib/terapiaMeu";
import "./doSeuTerapeuta.css";
import FitaCuidados from "./FitaCuidados";

const vistas = new Set<string>();
const externo = (l: string) => /^https?:\/\//.test(l) && !l.includes("portalayurveda.com");

export default function DoSeuTerapeuta({ folha, rodape, acompanhamento=false, semFita=false }: { folha: MinhaFolha; rodape?: string; acompanhamento?:boolean; semFita?: boolean }) {
  const [feitos, setFeitos] = useState(folha.feitos ?? []);
  const [vistos, setVistos] = useState(folha.vistos ?? []);
  const [erro, setErro] = useState("");
  const [imprimindo, setImprimindo] = useState(false);
  const [diaSel, setDiaSel] = useState<string | null>(null);
  const [verTudo, setVerTudo] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const nome = folha.terapeuta.primeiro_nome;
  const dataFolha = acompanhamento ? dataAcompanhamento : diaBR;
  const qc = useQueryClient();
  const fitaQ = useQuery({ queryKey: ["cuidados-fita"], queryFn: meu.fita, retry: false });
  const fita = fitaQ.data;
  const hoje = fita?.hoje ?? diaSP(new Date());
  const dia = diaSel ?? hoje;
  const dow = dowDaData(dia);
  useEffect(() => { setFeitos(folha.feitos ?? []); setVistos(folha.vistos ?? []); }, [folha]);
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

  const marcar = async (item: string, feito: boolean, diaMarca: string) => {
    const antes = feitos; setErro("");
    setFeitos(alternarFeitoDia(feitos, item, feito, diaMarca));
    try { await meu.marcar(folha.id, item, feito, diaMarca); void qc.invalidateQueries({ queryKey: ["cuidados-fita"] }); } catch (e) { setFeitos(antes); setErro((e as Error).message); }
  };
  const marcarLeitura = async (item: string, feito: boolean) => {
    const visto = vistos.find(v => v.item === item);
    const diaMarca = feito ? dia : (visto?.dia ?? dia);
    const antesV = vistos; setErro("");
    setVistos(feito ? [...vistos.filter(v => v.item !== item), { item, dia: diaMarca }] : vistos.filter(v => v.item !== item));
    try { await meu.marcar(folha.id, item, feito, diaMarca); } catch (e) { setVistos(antesV); setErro((e as Error).message); }
  };

  const dados = iniciarIndicacoes(folha.dados ?? {});
  // Cada dia mostra só os itens que valem nele; "Para ler e assistir" aparece sempre (marca uma vez só).
  const itensDoDia = (chave: string) => (dados.secoes[chave] ?? []).filter(i => verTudo || chave === 'ler' || itemValeNoDia(i, dow));
  const momentos = momentosDaFolha(folha.secoes).filter(s => itensDoDia(s.chave).length);
  const enviadoEm = new Date(folha.enviada_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  const retorno = folha.retorno ? new Date(`${folha.retorno}T12:00:00`).toLocaleDateString("pt-BR", { day: "numeric", month: "long" }) : "";
  const primeiroDia = fita?.folha_desde === hoje;

  return (
    <article ref={ref} className={`do-seu-terapeuta seu-dia ${imprimindo ? "imprimir-este" : ""}`} aria-label={`Seu dia: ${folha.terapeuta.nome}`}>
      <div className="so-impressao mb-4 flex items-center justify-between border-b border-border pb-3"><span className="font-serif text-lg font-bold">Seu dia · {dataFolha(folha.enviada_em)}</span><MarcaPortal /></div>
      <header className="sd-topo">
        <div className="min-w-0 flex-1"><h2>Seu dia</h2><p>Do seu terapeuta {nome} · enviado em {enviadoEm}</p></div>
        <Button variant="outline" size="sm" className="no-print" onClick={() => setImprimindo(true)}><Printer className="mr-2 h-4 w-4" />Imprimir</Button>
      </header>
      {fita && !semFita && <FitaCuidados fita={fita} dia={dia} primeiroDia={primeiroDia} onDia={d => { setDiaSel(d); setVerTudo(false); }} />}
      {dia !== hoje && <div className="sd-faixa no-print" role="status"><span>{rotuloDiaMarcando(dia, hoje)}</span><button type="button" onClick={() => setDiaSel(null)}>Voltar para hoje</button></div>}
      {folha.diagnostico?.trim() && <section className="sd-acontece"><h3>O que está acontecendo</h3><p>{folha.diagnostico}</p></section>}
      {!momentos.length && <section className="sd-cartao sd-vazio">
        <p>Hoje não tem cuidado da sua folha. Siga com calma.</p>
        <button type="button" className="sd-link" onClick={() => setVerTudo(true)}>Ver a folha completa</button>
      </section>}
      {verTudo && momentos.length > 0 && <p className="sd-voltar no-print"><button type="button" className="sd-link" onClick={() => setVerTudo(false)}>Ver só o que vale {dia === hoje ? "hoje" : "neste dia"}</button></p>}
      {momentos.map(s => {
        const itens = itensDoDia(s.chave);
        const leitura = s.chave === 'ler';
        const feitosNaSecao = itens.filter(i => leitura ? vistos.some(v => v.item === i.id) : feitoNoDia(feitos, i.id, dia)).length;
        return (
          <section key={s.chave} className="sd-cartao">
            <h3><span className="sd-barra"><span>{s.titulo}</span><small>{progressoSecao(feitosNaSecao, itens.length, leitura)}</small></span></h3>
            <ul>
              {itens.map(i => {
                const link = linkIndicacao(i);
                const visto = vistos.find(v => v.item === i.id);
                const feito = leitura ? !!visto : feitoNoDia(feitos, i.id, dia);
                const ver = link ? (externo(link) ? <a href={link} target="_blank" rel="noreferrer">{verTexto(i.tipo)}</a> : <Link to={link.replace(/^https?:\/\/(www\.)?portalayurveda\.com/, "") || "/"}>{verTexto(i.tipo)}</Link>) : null;
                const resumo = resumoDias(i);
                return (
                  <li key={i.id} className={feito ? "feito" : ""}>
                    <Checkbox className="no-print sd-ck" aria-label={`${leitura ? "Visto" : "Feito"}: ${i.titulo}`} checked={feito} onCheckedChange={v => void (leitura ? marcarLeitura(i.id, v === true) : marcar(i.id, v === true, dia))} />
                    <div className="min-w-0">
                      <b>{i.titulo}</b>
                      {leitura && visto && <small className="no-print sd-visto">visto em {new Date(`${visto.dia}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}{ver ? <> · {ver}</> : null}</small>}
                      {!(leitura && visto) && i.texto && <small className="whitespace-pre-wrap">{i.texto}</small>}
                      {!(leitura && visto) && (resumo || i.nota || ver) && <small>{resumo && <span className="sd-dias">{resumo} · </span>}{i.nota}{(i.nota || resumo) && ver ? " · " : ""}{ver && <span className="no-print">{ver}</span>}</small>}
                      {resumo && <small className="so-impressao">({resumo})</small>}
                      {link && <small className="so-impressao">{linkCurto(link)}</small>}
                    </div>
                  </li>
                );
              })}
            </ul>
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
