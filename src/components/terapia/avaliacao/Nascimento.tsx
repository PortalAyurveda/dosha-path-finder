import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { terapia } from "@/lib/terapia";
import type { MunicipioNascimento } from "@/lib/terapia";
import type { Extras } from "@/lib/terapiaAdicoes";
import { calcularMapa } from "@/lib/terapiaAstro";
export default function Nascimento({
  paciente,
  setor,
  valor,
  mudar,
}: {
  paciente: string;
  setor: "mapa" | "aniversario";
  valor: Extras;
  mudar: (e: Extras) => void;
}) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["paciente-nascimento", paciente],
    queryFn: () => terapia.nascimentoPaciente(paciente),
  });
  const n = q.data;
  const [editar, setEditar] = useState(false);
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [conhecida, setConhecida] = useState(true);
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [municipio, setMunicipio] = useState<MunicipioNascimento>();
  const [exterior, setExterior] = useState("");
  const [fora, setFora] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  useEffect(() => {
    if (n) {
      setData(n.data);
      setHora(n.hora ?? "");
      setConhecida(n.hora_conhecida !== false);
      setCidade(n.cidade ?? "");
      setUf(n.uf ?? "");
      setExterior(n.local_exterior ?? "");
      setFora(!!n.local_exterior);
      if (n.municipio_ibge)
        setMunicipio({
          codigo_ibge: n.municipio_ibge,
          nome: n.cidade ?? "",
          uf: n.uf ?? "",
          fuso: n.fuso ?? "",
        });
    }
  }, [n]);
  const municipios = useQuery({
    queryKey: ["nascimento-municipios", cidade, uf],
    queryFn: () => terapia.municipios(cidade, uf || undefined),
    enabled: !fora && (editar || !n) && cidade.trim().length >= 2 && !municipio,
  });
  const aniversario = useQuery({
    queryKey: ["avaliacao-aniversario", n?.data],
    queryFn: () =>
      terapia.aniversario(
        Number(n?.data.split("-")[1]),
        Number(n?.data.split("-")[2]),
      ),
    enabled: setor === "aniversario" && !!n?.data,
  });
  useEffect(() => {
    if (
      setor === "aniversario" &&
      aniversario.data &&
      JSON.stringify(valor.aniversario) !== JSON.stringify(aniversario.data)
    )
      mudar({ ...valor, aniversario: aniversario.data });
  }, [aniversario.data, setor, valor, mudar]);
  const modo = valor.mapa?.modo ?? "tradicional";
  let linhas: { nome: string; valor: string }[] = [];
  let erroMapa = "";
  if (n && setor === "mapa") {
    try {
      linhas = calcularMapa(n, modo);
    } catch (e) {
      erroMapa = e instanceof Error ? e.message : String(e);
    }
  }
  const serial = JSON.stringify(linhas);
  useEffect(() => {
    if (
      setor === "mapa" &&
      linhas.length &&
      JSON.stringify(valor.mapa?.linhas) !== serial
    )
      mudar({ ...valor, mapa: { modo, linhas } });
  }, [serial, setor, modo, valor, mudar]);
  const salvar = async () => {
    setSalvando(true);
    setErro("");
    try {
      const r = await terapia.nascimentoSalvar(paciente, {
        data,
        hora: conhecida ? hora : undefined,
        hora_conhecida: conhecida,
        municipio: fora ? undefined : municipio?.codigo_ibge,
        exterior: fora ? exterior : undefined,
      });
      qc.setQueryData(["paciente-nascimento", paciente], r);
      setEditar(false);
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    } finally {
      setSalvando(false);
    }
  };
  return (
    <div className="space-y-5">
      {q.isPending && <p role="status">Carregando nascimento…</p>}
      {(erro || q.error) && (
        <p role="alert" className="text-destructive">
          {erro || q.error?.message}
        </p>
      )}
      {n && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm">
            {new Date(n.data + "T12:00:00").toLocaleDateString("pt-BR")} ·{" "}
            {n.hora_conhecida !== false && n.hora ? n.hora : "Não sei a hora"} ·{" "}
            {n.local_exterior ?? `${n.cidade ?? ""}/${n.uf ?? ""}`}
          </p>
          <Button variant="link" onClick={() => setEditar(!editar)}>
            Editar nascimento
          </Button>
        </div>
      )}
      {((!q.isPending && !n) || editar) && (
        <div className="space-y-3">
          <label className="block text-sm">
            Data de nascimento
            <Input
              type="date"
              aria-label="Data de nascimento"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={!conhecida}
              onCheckedChange={(v) => setConhecida(v !== true)}
            />
            Não sei a hora
          </label>
          {conhecida && (
            <label className="block text-sm">
              Hora
              <Input
                type="time"
                aria-label="Hora de nascimento"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
              />
            </label>
          )}
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={fora}
              onCheckedChange={(v) => setFora(v === true)}
            />
            Nasceu no exterior
          </label>
          {fora ? (
            <Input
              aria-label="Cidade no exterior"
              placeholder="Cidade e país"
              value={exterior}
              onChange={(e) => setExterior(e.target.value)}
            />
          ) : (
            <>
              <div className="flex gap-2">
                <Input
                  aria-label="Cidade de nascimento"
                  placeholder="Cidade"
                  value={cidade}
                  onChange={(e) => {
                    setCidade(e.target.value);
                    setMunicipio(undefined);
                  }}
                />
                <Input
                  aria-label="Estado de nascimento"
                  placeholder="UF"
                  maxLength={2}
                  value={uf}
                  onChange={(e) => {
                    setUf(e.target.value.toUpperCase());
                    setMunicipio(undefined);
                  }}
                  className="w-20"
                />
              </div>
              {municipios.error && (
                <p role="alert">{municipios.error.message}</p>
              )}
              {municipios.data?.map((m) => (
                <Button
                  key={m.codigo_ibge}
                  variant="ghost"
                  className="block h-auto w-full text-left"
                  onClick={() => {
                    setMunicipio(m);
                    setCidade(m.nome);
                    setUf(m.uf);
                  }}
                >
                  {m.nome}/{m.uf}
                </Button>
              ))}
            </>
          )}
          <Button
            variant="outline"
            disabled={
              salvando ||
              !data ||
              (conhecida && !hora) ||
              (!fora && !municipio) ||
              (fora && !exterior.trim())
            }
            onClick={() => void salvar()}
          >
            Salvar nascimento
          </Button>
        </div>
      )}
      {setor === "aniversario" && (
        <>
          {aniversario.error && <p role="alert">{aniversario.error.message}</p>}
          {aniversario.isFetching && (
            <p role="status">Carregando texto do dia…</p>
          )}
          {n && aniversario.data === null && (
            <p>Texto do dia não encontrado.</p>
          )}
          {aniversario.data &&
            Object.entries(aniversario.data)
              .filter(
                ([, v]) =>
                  (typeof v === "string" && v.trim()) || Array.isArray(v),
              )
              .map(([k, v]) => (
                <section key={k} className="border-b border-border pb-3">
                  <h3 className="mb-2 font-serif font-semibold text-primary">
                    {k.replace(/_/g, " ")}
                  </h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {Array.isArray(v) ? v.join(" · ") : String(v)}
                  </p>
                </section>
              ))}
        </>
      )}
      {setor === "mapa" && n && (
        <>
          <div className="flex gap-2">
            {(["tradicional", "vedico"] as const).map((m) => (
              <Button
                key={m}
                variant="outline"
                aria-pressed={modo === m}
                className={modo === m ? "border-secondary bg-secondary/15" : ""}
                onClick={() => {
                  try {
                    mudar({
                      ...valor,
                      mapa: { modo: m, linhas: calcularMapa(n, m) },
                    });
                  } catch (e) {
                    setErro(e instanceof Error ? e.message : String(e));
                  }
                }}
              >
                {m === "tradicional" ? "Tradicional" : "Védico · Lahiri"}
              </Button>
            ))}
          </div>
          {erroMapa && <p role="alert">{erroMapa}</p>}
          <dl className="divide-y divide-border">
            {linhas.map((l) => (
              <div
                key={l.nome}
                className="flex flex-wrap justify-between gap-2 py-3"
              >
                <dt className="font-serif font-semibold">{l.nome}</dt>
                <dd className="text-sm">{l.valor}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </div>
  );
}
