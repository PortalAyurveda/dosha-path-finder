import { useEffect, useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { terapia, type ItemPortal, type TipoPortal } from "@/lib/terapia";
import { COR } from "@/lib/terapiaAvaliacao";
import { linkSeguro } from "@/lib/terapiaAcervo";
import { modelosTerapia } from '@/lib/terapiaModelos';
import EditorFolha from './EditorFolha';

export const LIMITE_PORTAL = 24;
const FILTROS: [TipoPortal, string][] = [["favoritos", "Favoritos"], ["receita", "Receitas"], ["aula", "Aulas"], ["artigo", "Artigos"], ["produto", "Produtos"], ["verso", "Versos"]];

function Cartao({ item, mudar, ocupado }: { ocupado:boolean; item: ItemPortal; mudar: (i: ItemPortal) => void }) {
  const link = item.link ? linkSeguro(item.link) : "";
  const verso = item.tipo === "verso";
  const titulo = item.titulo || [item.livro, item.referencia].filter(Boolean).join(" · ");
  return (
    <article className="relative min-w-0 rounded-lg border border-border bg-card p-4">
      <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-8 w-8" disabled={ocupado} aria-pressed={item.favorito} aria-label={item.favorito ? `Tirar ${titulo} dos favoritos` : `Favoritar ${titulo}`} onClick={() => mudar(item)}>
        <Heart className={`h-4 w-4 ${item.favorito ? "fill-secondary text-secondary" : ""}`} />
      </Button>
      <a href={link || undefined} target="_blank" rel="noreferrer" className={`block pr-8 ${link ? "" : "pointer-events-none"}`}>
        {item.imagem && !verso && <img src={item.imagem} alt="" loading="lazy" className="mb-3 h-32 w-full rounded object-cover" />}
        <p className="text-xs capitalize text-muted-foreground">{item.tipo}</p>
        <h3 className="mt-1 break-words font-serif text-base font-bold">{titulo}</h3>
        {verso ? (
          <>
            {(item.texto || item.resumo) && <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{item.texto || item.resumo}</p>}
            {(item.livro || item.referencia) && <p className="mt-2 text-xs text-muted-foreground">{[item.livro, item.referencia].filter(Boolean).join(" · ")}</p>}
          </>
        ) : item.resumo && <p className="mt-2 line-clamp-4 text-sm text-muted-foreground">{item.resumo}</p>}
        <div className="mt-2 flex flex-wrap gap-1">
          {([["V", item.vata], ["P", item.pitta], ["K", item.kapha]] as const).map(([d, v]) => v != null && v !== 0 ? <span key={d} className={`rounded border px-1.5 py-0.5 text-xs ${COR[d]}`}>{d}{v > 0 ? "+" : "−"}{Math.abs(v) > 1 ? Math.abs(v) : ""}</span> : null)}
        </div>
      </a>
    </article>
  );
}

export default function BibliotecaPortal({userId}:{userId?:string}={}) {
  const [pendentes,setPendentes]=useState<string[]>([]);
  const [tipo, setTipo] = useState<TipoPortal>("receita");
  const [digitado, setDigitado] = useState("");
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState("");
  const [folhas,setFolhas]=useState(false);const [editor,setEditor]=useState<string>();const [copiando,setCopiando]=useState(false);
  const qc = useQueryClient();
  const modelos=useQuery({queryKey:['terapia-modelos',userId],queryFn:modelosTerapia.lista,enabled:folhas});
  const copiar=async(id:string)=>{setCopiando(true);setErro('');try{const novo=await modelosTerapia.copiar(id);await qc.invalidateQueries({queryKey:['terapia-modelos']});setEditor(novo);}catch(e){setErro(e instanceof Error?e.message:String(e));}finally{setCopiando(false);}};
  useEffect(() => { const t = setTimeout(() => setBusca(digitado), 350); return () => clearTimeout(t); }, [digitado]);
  const chave = ["terapia-biblioteca-portal", tipo, busca];
  const q = useInfiniteQuery({
    queryKey: chave,
    queryFn: ({ pageParam }) => terapia.bibliotecaPortal(tipo, busca, LIMITE_PORTAL, pageParam),
    initialPageParam: 0,
    enabled:!folhas,
    getNextPageParam: (ultima, todas) => (ultima.length < LIMITE_PORTAL ? undefined : todas.length * LIMITE_PORTAL),
  });
  const itens = q.data?.pages.flat() ?? [];
  const mudar = async (i: ItemPortal) => {
    const key=`${i.tipo}:${i.ref}`;if(pendentes.includes(key))return;setPendentes(p=>[...p,key]);
    setErro("");
    try {
      const fav = await terapia.favoritar(i.tipo, i.ref, !i.favorito);
      qc.setQueryData<typeof q.data>(chave, (d) => d && { ...d, pages: d.pages.map((p) => p.map((x) => (x.tipo === i.tipo && x.ref === i.ref ? { ...x, favorito: fav } : x))) });
      void qc.invalidateQueries({ queryKey: ["terapia-biblioteca-portal", "favoritos"] });
    } catch (e) { setErro(e instanceof Error ? e.message : String(e)); } finally {setPendentes(p=>p.filter(k=>k!==key));}
  };
  if(editor)return <EditorFolha id={editor} voltar={()=>setEditor(undefined)} salvo={()=>{setEditor(undefined);void qc.invalidateQueries({queryKey:['terapia-modelos']});void qc.invalidateQueries({queryKey:['terapia-modelo']});}} copiar={id=>void copiar(id)}/>;
  const listaFolhas=(modelos.data??[]).filter(m=>m.do_portal&&`${m.nome} ${m.descricao??''} ${m.serve_para?.join(' ')??''}`.toLowerCase().includes(busca.toLowerCase()));
  return (
    <>
      <Input aria-label="Buscar na Biblioteca do Portal" placeholder="Buscar na Biblioteca do Portal" value={digitado} onChange={(e) => setDigitado(e.target.value)} />
      <nav aria-label="Filtrar Biblioteca do Portal" className="my-5 flex flex-wrap gap-2">
        {FILTROS.map(([v, n]) => <Button key={v} variant="outline" size="sm" aria-pressed={!folhas&&tipo === v} className={!folhas&&tipo === v ? "border-secondary bg-secondary/10" : ""} onClick={() => {setTipo(v);setFolhas(false);}}>{n}</Button>)}
        <Button variant="outline" size="sm" aria-pressed={folhas} className={folhas?'border-secondary bg-secondary/10':''} onClick={()=>setFolhas(true)}>Folhas prontas</Button>
      </nav>
      {!folhas&&tipo === "verso" && !busca && <p className="mb-4 text-xs text-muted-foreground">Versos em destaque. Busque para procurar em todos os livros.</p>}
      {(erro || (!folhas&&q.error) || modelos.error) && <p role="alert" className="mb-4 text-sm text-destructive">{erro || (!folhas?q.error?.message:'') || modelos.error?.message}</p>}
      {folhas?<>{modelos.isPending?<p role="status">Carregando folhas prontas…</p>:<div className="bibli-grade">{listaFolhas.map(m=><article key={m.id} className="bibli-cartao"><small>Folha pronta{m.dosha&&` · ${m.dosha}`}{m.duracao_dias&&` · ${m.duracao_dias} dias`}</small><h3>{m.nome}</h3><p>{m.descricao||`${m.itens} itens`}</p><div className="bibli-acoes"><Button size="sm" variant="outline" onClick={()=>setEditor(m.id)}>Ver</Button><Button size="sm" variant="outline" disabled={copiando} onClick={()=>void copiar(m.id)}>Copiar para as minhas</Button></div></article>)}</div>}{!modelos.isPending&&!listaFolhas.length&&<p className="py-8 text-muted-foreground">Nenhuma folha pronta encontrada.</p>}</>:q.isPending ? <p role="status">Carregando…</p> : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{itens.map((i) => <Cartao key={`${i.tipo}:${i.ref}`} item={i} ocupado={pendentes.includes(`${i.tipo}:${i.ref}`)} mudar={(x) => void mudar(x)} />)}</div>
          {!itens.length && <p className="py-8 text-sm text-muted-foreground">{tipo === "favoritos" ? "Nenhum favorito ainda. Toque no coração de um item." : "Nada encontrado."}</p>}
          {q.hasNextPage && <div className="mt-6 text-center"><Button variant="outline" disabled={q.isFetchingNextPage} onClick={() => void q.fetchNextPage()}>{q.isFetchingNextPage ? "Carregando…" : "Carregar mais"}</Button></div>}
        </>
      )}
    </>
  );
}
