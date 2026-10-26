import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CTAButton from "@/components/CTAButton";
import { Paciente, diaBR, horaBR } from "@/lib/terapia";
import { inicial } from "./Comuns";
export function filtrarPacientes(
  lista: Paciente[],
  busca: string,
  filtro: string,
) {
  return lista.filter(
    (p) =>
      p.nome
        .toLocaleLowerCase("pt-BR")
        .includes(busca.toLocaleLowerCase("pt-BR")) &&
      (filtro !== "consulta" || !!p.proxima) &&
      (filtro !== "atencao" || (p.teste?.atencao ?? 0) > 0),
  );
}
function Pontos({ p }: { p: Paciente }) {
  return p.teste ? (
    <div className="flex flex-wrap gap-1 text-xs font-semibold">
      <span className="rounded bg-vata/15 px-1.5 text-vata">
        V{p.teste.vata ?? "—"}
      </span>
      <span className="rounded bg-pitta/15 px-1.5 text-pitta">
        P{p.teste.pitta ?? "—"}
      </span>
      <span className="rounded bg-kapha/15 px-1.5 text-kapha">
        K{p.teste.kapha ?? "—"}
      </span>
    </div>
  ) : (
    <span className="text-muted-foreground">—</span>
  );
}
function Atencao({ p }: { p: Paciente }) {
  return (
    <div className="flex flex-wrap gap-1">
      {p.teste?.pontos.map((ponto, i) => (
        <span
          key={i}
          className="rounded bg-accent px-2 py-1 text-xs text-accent-foreground"
        >
          {ponto}
        </span>
      ))}
    </div>
  );
}
function Permissoes({ p }: { p: Paciente }) {
  return (
    <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
      {(["teste", "fotos", "rotina", "akasha"] as const).map((k) => (
        <span
          key={k}
          className={`rounded border border-border px-1.5 ${p[`perm_${k}`] ? "" : "line-through opacity-50"}`}
        >
          {k === "akasha" ? "Akasha" : k}
        </span>
      ))}
    </div>
  );
}
export default function Pacientes({
  lista,
  convidar,
}: {
  lista: Paciente[];
  convidar: () => void;
}) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const pacientes = filtrarPacientes(lista, busca, filtro);
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Input
          aria-label="Buscar paciente"
          placeholder="Buscar paciente"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="min-w-0 flex-1 basis-44"
        />
        {[
          ["todos", "Todos"],
          ["consulta", "Com consulta marcada"],
          ["atencao", "Precisa de atenção"],
        ].map(([v, l]) => (
          <Button
            key={v}
            variant={filtro === v ? "secondary" : "ghost"}
            size="sm"
            aria-pressed={filtro === v}
            onClick={() => setFiltro(v)}
          >
            {l}
          </Button>
        ))}
        <CTAButton onClick={convidar} className="h-9 px-3 py-2 text-sm">
          + Convidar paciente
        </CTAButton>
      </div>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs text-muted-foreground">
            <tr>
              {[
                "Paciente",
                "Teste (pontos)",
                "Pontos de atenção",
                "Última",
                "Próxima",
                "Ela deixa ver",
              ].map((h) => (
                <th key={h} className="p-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pacientes.map((p) => (
              <tr key={p.paciente_id} className="border-b border-border">
                <td className="p-3">
                  <Link
                    className="font-semibold hover:underline"
                    to={`/painel-terapeuta/paciente/${p.paciente_id}`}
                  >
                    {p.nome}
                  </Link>
                </td>
                <td className="p-3">
                  <Pontos p={p} />
                </td>
                <td className="max-w-64 p-3">
                  <Atencao p={p} />
                </td>
                <td className="whitespace-nowrap p-3">{diaBR(p.ultima)}</td>
                <td className="p-3">
                  {diaBR(p.proxima)}
                  {p.proxima && (
                    <div className="text-xs text-muted-foreground">
                      {horaBR(p.proxima)}
                    </div>
                  )}
                </td>
                <td className="p-3">
                  <Permissoes p={p} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 lg:hidden">
        {pacientes.map((p) => (
          <article
            key={p.paciente_id}
            className="rounded-lg border border-border bg-background p-4"
          >
            <div className="mb-3 flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-primary">
                {inicial(p.nome)}
              </span>
              <div>
                <Link
                  className="text-sm font-semibold"
                  to={`/painel-terapeuta/paciente/${p.paciente_id}`}
                >
                  {p.nome}
                </Link>
                <p className="text-xs text-muted-foreground">
                  Última: {diaBR(p.ultima)} · Próxima: {diaBR(p.proxima)}
                  {p.proxima && ` · ${horaBR(p.proxima)}`}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Pontos p={p} />
              <Atencao p={p} />
              <Permissoes p={p} />
            </div>
          </article>
        ))}
      </div>
      {!pacientes.length && (
        <p className="py-8 text-sm text-muted-foreground">
          Nenhum paciente encontrado.
        </p>
      )}
    </>
  );
}
