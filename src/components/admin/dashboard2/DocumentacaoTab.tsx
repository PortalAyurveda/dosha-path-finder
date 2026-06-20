import { useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Decisao = { data?: string; decisao?: string; porque?: string; origem?: string };

export type DocEntry = {
  id: string;
  tipo: string;
  vertical: string | null;
  modulo: string | null;
  titulo: string;
  status: string;
  descricao: string | null;
  hipotese: string | null;
  depende_de: string[] | null;
  impacta: string[] | null;
  tabelas_relacionadas: string[] | null;
  decisoes?: Decisao[] | null;
};

const STATUS_LABEL: Record<string, string> = {
  planejado: "Planejado",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  bloqueado: "Bloqueado",
  em_revisao: "Em revisão",
};

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default function DocumentacaoTab({ entries }: { entries: DocEntry[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { abertura, verticais, infra, decisoes } = useMemo(() => {
    const abertura = entries.find((e) => e.modulo === "00_leia_primeiro" || /leia.*primeiro/i.test(e.titulo)) || null;
    const verticaisRaw = entries.filter((e) => e.tipo === "vertical");
    const verticais = verticaisRaw.map((v) => ({
      entry: v,
      modulos: entries.filter(
        (e) => e.tipo !== "vertical" && e.tipo !== "infra" && e.vertical === v.titulo,
      ),
    }));
    const infra = entries.filter((e) => e.tipo === "infra");

    const decisoes: (Decisao & { origemTitulo: string })[] = [];
    entries.forEach((e) => {
      (e.decisoes || []).forEach((d) => decisoes.push({ ...d, origemTitulo: e.titulo }));
    });
    decisoes.sort((a, b) => (b.data || "").localeCompare(a.data || ""));

    return { abertura, verticais, infra, decisoes };
  }, [entries]);

  const indice = useMemo(() => {
    return [
      ...verticais.map((v) => ({
        id: `v-${slugify(v.entry.titulo)}`,
        label: v.entry.titulo,
        children: v.modulos.map((m) => ({ id: `m-${slugify(m.titulo)}`, label: m.titulo })),
      })),
      ...(infra.length
        ? [{ id: "sec-infra", label: "Infraestrutura", children: infra.map((m) => ({ id: `m-${slugify(m.titulo)}`, label: m.titulo })) }]
        : []),
      { id: "sec-decisoes", label: "Decisões", children: [] },
    ];
  }, [verticais, infra]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const copiarTudo = async () => {
    const lines: string[] = [];
    if (abertura?.descricao) {
      lines.push(`# ${abertura.titulo}\n\n${abertura.descricao}\n`);
    }
    verticais.forEach((v) => {
      lines.push(`\n## ${v.entry.titulo}\n`);
      if (v.entry.descricao) lines.push(`${v.entry.descricao}\n`);
      if (v.entry.hipotese) lines.push(`> A aposta: ${v.entry.hipotese}\n`);
      v.modulos.forEach((m) => {
        lines.push(`\n### ${m.titulo} — ${STATUS_LABEL[m.status] || m.status}\n`);
        if (m.descricao) lines.push(`${m.descricao}\n`);
        if (m.hipotese) lines.push(`Hipótese: ${m.hipotese}\n`);
        const dep = (m.depende_de || []).join(", ");
        const imp = (m.impacta || []).join(", ");
        if (dep || imp) {
          const partes = [];
          if (dep) partes.push(`Depende de ${dep}.`);
          if (imp) partes.push(`Impacta ${imp}.`);
          lines.push(`${partes.join(" ")}\n`);
        }
        if (m.tabelas_relacionadas?.length) {
          lines.push(`Usa as tabelas: ${m.tabelas_relacionadas.join(", ")}.\n`);
        }
      });
    });
    if (infra.length) {
      lines.push(`\n## Infraestrutura\n`);
      infra.forEach((m) => {
        lines.push(`\n### ${m.titulo} — ${STATUS_LABEL[m.status] || m.status}\n`);
        if (m.descricao) lines.push(`${m.descricao}\n`);
        if (m.hipotese) lines.push(`Hipótese: ${m.hipotese}\n`);
      });
    }
    if (decisoes.length) {
      lines.push(`\n## Decisões\n`);
      decisoes.forEach((d) => {
        lines.push(`- **${d.data || "—"}** (${d.origemTitulo}): ${d.decisao}${d.porque ? ` — *porque:* ${d.porque}` : ""}`);
      });
    }
    const text = lines.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Documento copiado", description: `${text.length} caracteres` });
    } catch {
      toast({ title: "Erro ao copiar", variant: "destructive" });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
      {/* Índice */}
      <aside className="md:sticky md:top-4 md:self-start max-h-[calc(100vh-140px)] overflow-y-auto border-r pr-3">
        <nav className="space-y-1 text-sm">
          {indice.map((sec) => (
            <div key={sec.id}>
              <button
                onClick={() => scrollTo(sec.id)}
                className="block w-full text-left py-1 font-semibold text-foreground hover:text-primary transition"
                style={{ fontFamily: "'Roboto Serif', serif" }}
              >
                {sec.label}
              </button>
              {sec.children.map((c) => (
                <button
                  key={c.id}
                  onClick={() => scrollTo(c.id)}
                  className="block w-full text-left py-0.5 pl-3 text-xs text-muted-foreground hover:text-primary transition"
                >
                  {c.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Documento */}
      <div ref={containerRef} className="max-w-[72ch] mx-auto w-full">
        <div className="flex justify-end mb-4">
          <Button onClick={copiarTudo} variant="outline" size="sm" className="gap-2">
            <Copy className="h-4 w-4" /> Copiar tudo
          </Button>
        </div>

        <article
          className="space-y-10 leading-relaxed text-[15px] text-foreground"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {abertura?.descricao && (
            <section>
              <p className="text-lg italic text-muted-foreground whitespace-pre-wrap">{abertura.descricao}</p>
            </section>
          )}

          {verticais.map((v) => {
            const vid = `v-${slugify(v.entry.titulo)}`;
            return (
              <section key={v.entry.id} id={vid} className="scroll-mt-6">
                <h2
                  className="text-3xl mb-3 text-foreground"
                  style={{ fontFamily: "'Roboto Serif', serif", fontWeight: 700 }}
                >
                  {v.entry.titulo}
                </h2>
                {v.entry.descricao && (
                  <p className="whitespace-pre-wrap mb-4">{v.entry.descricao}</p>
                )}
                {v.entry.hipotese && (
                  <blockquote className="border-l-4 border-primary bg-primary/5 px-4 py-3 italic mb-6">
                    <span className="font-semibold not-italic">A aposta:</span> {v.entry.hipotese}
                  </blockquote>
                )}

                <div className="space-y-8 pl-1">
                  {v.modulos.map((m) => (
                    <ModuloBloco key={m.id} m={m} />
                  ))}
                </div>
              </section>
            );
          })}

          {infra.length > 0 && (
            <section id="sec-infra" className="scroll-mt-6">
              <h2
                className="text-3xl mb-4 text-foreground"
                style={{ fontFamily: "'Roboto Serif', serif", fontWeight: 700 }}
              >
                Infraestrutura
              </h2>
              <div className="space-y-8">
                {infra.map((m) => (
                  <ModuloBloco key={m.id} m={m} />
                ))}
              </div>
            </section>
          )}

          <section id="sec-decisoes" className="scroll-mt-6">
            <h2
              className="text-3xl mb-2 text-foreground"
              style={{ fontFamily: "'Roboto Serif', serif", fontWeight: 700 }}
            >
              Decisões
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Registro histórico do raciocínio do produto, mais recente primeiro.
            </p>
            {decisoes.length === 0 ? (
              <p className="text-muted-foreground italic">Nenhuma decisão registrada.</p>
            ) : (
              <ul className="space-y-5">
                {decisoes.map((d, i) => (
                  <li key={i} className="border-l-2 border-border pl-4">
                    <div className="text-xs text-muted-foreground mb-1">
                      {d.data || "sem data"} · <span className="italic">{d.origemTitulo}</span>
                    </div>
                    <div className="font-medium">{d.decisao}</div>
                    {d.porque && (
                      <div className="text-sm text-muted-foreground mt-1">
                        <span className="italic">Porque:</span> {d.porque}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </article>
      </div>
    </div>
  );
}

function ModuloBloco({ m }: { m: DocEntry }) {
  const mid = `m-${slugify(m.titulo)}`;
  const dep = (m.depende_de || []).filter(Boolean);
  const imp = (m.impacta || []).filter(Boolean);
  const tabs = (m.tabelas_relacionadas || []).filter(Boolean);
  return (
    <div id={mid} className="scroll-mt-6">
      <h3
        className="text-xl mb-2 text-foreground"
        style={{ fontFamily: "'Roboto Serif', serif", fontWeight: 600 }}
      >
        {m.titulo}{" "}
        <span className="text-sm font-normal text-muted-foreground">
          — {STATUS_LABEL[m.status] || m.status}
        </span>
      </h3>
      {m.descricao && <p className="whitespace-pre-wrap mb-3">{m.descricao}</p>}
      {m.hipotese && (
        <p className="text-muted-foreground italic mb-3">
          <span className="not-italic font-semibold">Hipótese:</span> {m.hipotese}
        </p>
      )}
      {(dep.length > 0 || imp.length > 0) && (
        <p className="text-sm mb-1">
          {dep.length > 0 && <>Depende de <span className="font-medium">{dep.join(", ")}</span>. </>}
          {imp.length > 0 && <>Impacta <span className="font-medium">{imp.join(", ")}</span>.</>}
        </p>
      )}
      {tabs.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Usa as tabelas: <span className="font-mono text-xs">{tabs.join(", ")}</span>
        </p>
      )}
    </div>
  );
}
