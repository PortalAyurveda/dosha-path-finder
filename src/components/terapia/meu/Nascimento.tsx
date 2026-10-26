import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { terapia, type MunicipioNascimento } from "@/lib/terapia";
import { meu } from "@/lib/terapiaMeu";
export default function Nascimento({ pronto }: { pronto: () => void }) {
  const [data, setData] = useState(""); const [hora, setHora] = useState(""); const [semHora, setSemHora] = useState(false);
  const [cidade, setCidade] = useState(""); const [municipio, setMunicipio] = useState<MunicipioNascimento>(); const [fora, setFora] = useState(false); const [exterior, setExterior] = useState("");
  const [erro, setErro] = useState(""); const [ocupado, setOcupado] = useState(false);
  const busca = useQuery({ queryKey: ["meu-municipios", cidade], queryFn: () => terapia.municipios(cidade), enabled: !fora && !municipio && cidade.trim().length >= 2 });
  const salvar = async () => { setOcupado(true); setErro(""); try { await meu.nascimento({ data, hora: semHora ? undefined : hora, hora_conhecida: !semHora, municipio: fora ? undefined : municipio?.codigo_ibge, exterior: fora ? exterior : undefined }); pronto(); } catch (e) { setErro((e as Error).message); } finally { setOcupado(false); } };
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm">Data<Input type="date" value={data} onChange={e => setData(e.target.value)} className="mt-1" /></label>
      <div className="text-sm">Hora<Input type="time" value={hora} disabled={semHora} onChange={e => setHora(e.target.value)} className="mt-1" /><label className="mt-2 flex items-center gap-2 text-xs"><Checkbox checked={semHora} onCheckedChange={v => setSemHora(!!v)} />Não sei a hora</label></div>
      <div className="text-sm sm:col-span-2">
        <label className="mb-2 flex items-center gap-2 text-xs"><Checkbox checked={fora} onCheckedChange={v => { setFora(!!v); setMunicipio(undefined); }} />Nasci fora do Brasil</label>
        {fora ? <Input placeholder="Cidade e país" value={exterior} onChange={e => setExterior(e.target.value)} /> : <>
          <Input placeholder="Cidade" value={municipio ? `${municipio.nome} · ${municipio.uf}` : cidade} onChange={e => { setMunicipio(undefined); setCidade(e.target.value); }} />
          {!municipio && (busca.data ?? []).length > 0 && <ul className="mt-1 max-h-40 overflow-y-auto rounded-md border border-border">{(busca.data ?? []).map(m => <li key={m.codigo_ibge}><Button type="button" variant="ghost" className="w-full justify-start px-3 py-2 text-left text-sm hover:bg-muted" onClick={() => setMunicipio(m)}>{m.nome} · {m.uf}</Button></li>)}</ul>}
        </>}
      </div>
      {erro && <p role="alert" className="text-sm text-destructive sm:col-span-2">{erro}</p>}
      <div className="sm:col-span-2"><Button variant="secondary" disabled={ocupado || !data || (!semHora && !hora) || (fora ? !exterior.trim() : !municipio)} onClick={salvar}>Salvar nascimento</Button></div>
    </div>
  );
}
