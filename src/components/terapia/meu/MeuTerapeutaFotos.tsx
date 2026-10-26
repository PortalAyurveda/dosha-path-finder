import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/UserContext";
import { diaBR } from "@/lib/terapia";
import { terapia } from '@/lib/terapia';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { meu, type FotoMinha } from "@/lib/terapiaMeu";

function Miniatura({ foto }: { foto: FotoMinha }) {
  const url = useQuery({ queryKey: ["minha-foto", foto.path], queryFn: () => meu.fotoUrl(foto.path), staleTime: 50 * 60 * 1000 });
  return url.data ? <img src={url.data} alt={foto.titulo ?? ""} className="h-full w-full object-cover" /> : <span className="text-xs text-muted-foreground">Carregando…</span>;
}

function Quadro({ titulo, instrucao, modelo, foto, tipo, extraTitulo, ocupado, enviar, apagar }: { titulo: string; instrucao?: string; modelo?: string; foto?: FotoMinha; tipo: string; extraTitulo?: string; ocupado: boolean; enviar: (tipo: string, f: File, titulo?: string, antiga?: FotoMinha) => void; apagar: (f: FotoMinha) => void }) {
  const [verModelo, setVerModelo] = useState(false);
  return (
    <article className="min-w-0 rounded-xl border border-border bg-background p-3">
      <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-muted">{foto ? <Miniatura foto={foto} /> : modelo ? <Button variant="ghost" className="h-full w-full p-0" aria-label={`Ver modelo de ${titulo}`} onClick={()=>setVerModelo(true)}><img src={modelo} alt={`Modelo de ${titulo}`} className="h-full w-full object-contain" /></Button> : <Camera className="h-6 w-6 text-muted-foreground" />}</div>
      <p className="mt-2 text-sm font-semibold">{titulo}</p>
      {instrucao && <p className="text-xs leading-relaxed text-muted-foreground">{instrucao}</p>}
      {foto && <p className="text-xs text-muted-foreground">Enviada em {diaBR(foto.criado_em)}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        {foto && modelo && <Button size="sm" variant="link" onClick={()=>setVerModelo(true)}>Ver modelo</Button>}
        <Button asChild size="sm" variant={foto ? "outline" : "secondary"} disabled={ocupado}>
          <label className="cursor-pointer">{foto ? "Trocar" : "Enviar"}<input type="file" accept="image/*" capture="environment" className="sr-only" disabled={ocupado} onChange={e => { const f = e.target.files?.[0]; e.target.value = ""; if (f) enviar(tipo, f, extraTitulo, foto); }} /></label>
        </Button>
        {foto && <Button size="sm" variant="ghost" disabled={ocupado} onClick={() => apagar(foto)} aria-label={`Apagar ${titulo}`}><Trash2 className="h-4 w-4" /></Button>}
      </div>
      {modelo && <Dialog open={verModelo} onOpenChange={setVerModelo}><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogTitle>{titulo} · Modelo</DialogTitle><img src={modelo} alt={`Modelo de ${titulo}`} className="max-h-[70dvh] w-full object-contain" />{instrucao && <p className="text-sm text-muted-foreground">{instrucao}</p>}</DialogContent></Dialog>}
    </article>
  );
}

export default function MeuTerapeutaFotos({ primeiroNome }: { primeiroNome: string }) {
  const { user } = useUser();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["fotos-minhas"], queryFn: meu.fotos });
  const config = useQuery({queryKey:['terapia-config'],queryFn:terapia.config});
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const [tituloExtra, setTituloExtra] = useState("");
  const atualizar = () => { qc.invalidateQueries({ queryKey: ["fotos-minhas"] }); qc.invalidateQueries({ queryKey: ["meu-terapeuta"] }); };
  const enviar = async (tipo: string, f: File, titulo?: string, antiga?: FotoMinha, pedido?:string) => {
    if (!user) return; setOcupado(true); setErro("");
    try {
      const path = await meu.fotoEnviar(user.id, f);
      try { await meu.fotoRegistrar(tipo, path, titulo, pedido); } catch(e) { await meu.fotoTirarDoStorage(path).catch(()=>undefined); throw e; }
      if (antiga) { const p = await meu.fotoApagar(antiga.id); if (p) await meu.fotoTirarDoStorage(p).catch(() => undefined); }
      if (tipo === "extra") setTituloExtra("");
      atualizar();
    } catch (e) { setErro((e as Error).message); } finally { setOcupado(false); }
  };
  const apagar = async (f: FotoMinha) => {
    if (!window.confirm("Apagar esta foto?")) return;
    setOcupado(true); setErro("");
    try { const p = await meu.fotoApagar(f.id); if (p) await meu.fotoTirarDoStorage(p); atualizar(); } catch (e) { setErro((e as Error).message); } finally { setOcupado(false); }
  };
  if (q.isLoading) return <p role="status" className="text-sm text-muted-foreground">Carregando fotos…</p>;
  if (q.error) return <p role="alert" className="text-sm text-destructive">{q.error.message}</p>;
  const guiadas = config.data?.fotos_guiadas ?? q.data?.guiadas ?? [];
  const fotos = q.data?.fotos ?? [];
  const recente = (t: string) => fotos.find(f => f.tipo === t);
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Essas fotos vão para {primeiroNome} ver antes da consulta. No celular, cada quadro abre a câmera.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {(q.data?.pedidos??[]).map(p=><article key={p.id} className="min-w-0 rounded-lg border border-secondary bg-secondary/5 p-3"><p className="mb-2 text-xs font-semibold">{p.terapeuta??primeiroNome} pediu</p><h3 className="text-sm font-semibold">{p.titulo}</h3>{p.instrucao&&<p className="my-2 text-xs">{p.instrucao}</p>}{p.modelo&&<img src={p.modelo} alt={`Modelo: ${p.titulo}`} className="my-2 aspect-[3/4] w-full object-contain"/>}{p.ate&&<p className="mb-2 text-xs text-muted-foreground">Até {diaBR(p.ate)}</p>}<Button asChild variant="secondary" size="sm" disabled={ocupado}><label className="cursor-pointer">Tirar foto<input type="file" accept="image/*" capture="environment" className="sr-only" disabled={ocupado} onChange={e=>{const f=e.target.files?.[0];e.target.value='';if(f)void enviar('extra',f,p.titulo,undefined,p.id);}}/></label></Button></article>)}
        {guiadas.map(g => <Quadro key={g.chave} titulo={g.titulo} instrucao={g.instrucao ?? ('texto' in g ? String(g.texto ?? '') : '')} modelo={g.modelo} tipo={g.chave} foto={recente(g.chave)} ocupado={ocupado} enviar={enviar} apagar={apagar} />)}
        {fotos.filter(f => f.tipo === "extra").map(f => <Quadro key={f.id} titulo={f.titulo || "Outra foto"} tipo="extra" extraTitulo={f.titulo ?? undefined} foto={f} ocupado={ocupado} enviar={enviar} apagar={apagar} />)}
      </div>
      <div className="flex flex-wrap items-end gap-2 rounded-xl border border-dashed border-border p-3">
        <label className="min-w-[180px] flex-1 text-sm font-semibold">+ Outra foto<Input className="mt-1" placeholder="Título da foto" value={tituloExtra} onChange={e => setTituloExtra(e.target.value)} /></label>
        <Button asChild variant="outline" disabled={ocupado || !tituloExtra.trim()}>
          <label className={tituloExtra.trim() ? "cursor-pointer" : "pointer-events-none opacity-50"}>Escolher foto<input type="file" accept="image/*" capture="environment" className="sr-only" disabled={ocupado || !tituloExtra.trim()} onChange={e => { const f = e.target.files?.[0]; e.target.value = ""; if (f) enviar("extra", f, tituloExtra.trim()); }} /></label>
        </Button>
      </div>
      {ocupado && <p role="status" className="text-sm text-muted-foreground">Enviando…</p>}
      {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
    </div>
  );
}
