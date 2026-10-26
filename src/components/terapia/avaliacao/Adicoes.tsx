import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ADICOES,
  extras,
  gruposClinicos,
  removerAdicao,
} from "@/lib/terapiaAdicoes";
import type { Adicao, Modelo } from "@/lib/terapiaAdicoes";
import type {
  DadosAvaliacao,
  Biblioteca,
  ConteudoFicha,
  Setor,
  ItemClinico,
} from "@/lib/terapiaAvaliacao";
import Marcacao from "./Marcacao";
import Tarot from "./Tarot";
import Nascimento from "./Nascimento";
export function Adicionar({
  dados,
  mudar,
  abrir,
  biblioteca,
}: {
  dados: DadosAvaliacao;
  mudar: (d: DadosAvaliacao) => void;
  abrir: (s: Setor) => void;
  biblioteca: Biblioteca;
}) {
  const [open, setOpen] = useState(false);
  const e = extras(dados);
  const adicionar = (a: Adicao) => {
    mudar({ ...dados, extras: { ...e, adicoes: [...e.adicoes, a] } });
    abrir(a.id);
    setOpen(false);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full text-xs">
          + Adicionar
        </Button>
      </PopoverTrigger>
      <PopoverContent
        collisionPadding={16}
        className="max-h-[65dvh] w-72 max-w-[calc(100vw-32px)] overflow-y-auto"
      >
        {ADICOES.filter(([id]) => !e.adicoes.some((a) => a.id === id)).map(
          ([id, nome]) => (
            <Button
              key={id}
              variant="ghost"
              className="h-auto w-full justify-start whitespace-normal"
              onClick={() => adicionar({ id, nome })}
            >
              {nome}
            </Button>
          ),
        )}
        {((biblioteca.areas ?? []) as Adicao[])
          .filter((a) => !e.adicoes.some((x) => x.id === a.id))
          .map((a) => (
            <Button
              key={a.id}
              variant="ghost"
              className="h-auto w-full justify-start whitespace-normal"
              onClick={() => adicionar(a)}
            >
              {a.nome}
            </Button>
          ))}
        <Button
          variant="outline"
          className="mt-2 w-full"
          onClick={() =>
            adicionar({
              id: `custom:${crypto.randomUUID()}`,
              nome: "Nova área",
              itens: [],
            })
          }
        >
          Criar do zero
        </Button>
      </PopoverContent>
    </Popover>
  );
}
export default function Adicoes({
  setor,
  dados,
  mudar,
  conteudo,
  biblioteca,
  guardar,
  paciente,
  abrir,
}: {
  setor: Setor;
  dados: DadosAvaliacao;
  mudar: (d: DadosAvaliacao) => void;
  conteudo: ConteudoFicha;
  biblioteca: Biblioteca;
  guardar: (b: Biblioteca) => Promise<boolean>;
  paciente: string;
  abrir: (s: Setor) => void;
}) {
  const e = extras(dados);
  const a = e.adicoes.find((a) => a.id === setor);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dosha, setDosha] = useState("");
  const mudarExtra = (v: typeof e) => mudar({ ...dados, extras: v });
  const item = (i: ItemClinico) => (
    <Marcacao
      key={i.id}
      item={i}
      marca={dados.marcas[i.id]}
      mudar={(m) => mudar({ ...dados, marcas: { ...dados.marcas, [m.id]: m } })}
      tirar={(id) => {
        const m = { ...dados.marcas };
        delete m[id];
        mudar({ ...dados, marcas: m });
      }}
    />
  );
  const area = (area: Adicao) =>
    mudarExtra({
      ...e,
      adicoes: e.adicoes.map((x) => (x.id === setor ? area : x)),
    });
  if (!a) return null;
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-serif text-lg font-bold text-primary">{a.nome}</h2>
        <Button
          variant="link"
          className="text-muted-foreground"
          onClick={() => {
            mudar(removerAdicao(dados, setor));
            abrir("dosha");
          }}
        >
          Tirar da ficha
        </Button>
      </div>
      {gruposClinicos(setor, conteudo).map((g) => (
        <section key={g.nome} className="mb-6 border-b border-border pb-5">
          <h3 className="mb-3 text-sm font-semibold text-primary">{g.nome}</h3>
          <div className="flex flex-wrap gap-2">{g.itens.map(item)}</div>
        </section>
      ))}
      {setor === "etapa" && (
        <div className="space-y-3">
          {(conteudo.ETAPAS ?? []).map((n, i) => (
            <div key={n} className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                aria-pressed={e.etapa === n}
                className={
                  e.etapa === n
                    ? "h-auto whitespace-normal border-secondary bg-secondary/15"
                    : "h-auto whitespace-normal"
                }
                onClick={() =>
                  mudarExtra({ ...e, etapa: e.etapa === n ? undefined : n })
                }
              >
                {i + 1} · {n}
              </Button>
              {item({ id: `etapa:${n}`, nome: n, setor })}
            </div>
          ))}
        </div>
      )}
      {setor === "conversa" && (
        <div className="space-y-5">
          {(conteudo.CONVERSA ?? []).map((q) => (
            <section key={q}>
              {item({ id: `conversa:${q}`, nome: q, setor })}
              <Textarea
                aria-label={q}
                value={e.conversa[q] ?? ""}
                onChange={(ev) =>
                  mudarExtra({
                    ...e,
                    conversa: { ...e.conversa, [q]: ev.target.value },
                  })
                }
                className="mt-2 min-h-24"
              />
            </section>
          ))}
        </div>
      )}
      {setor === "tarot" && (
        <Tarot
          valor={e.tarot}
          mudar={(tarot) => mudarExtra({ ...e, tarot })}
          modelos={[
            ...(conteudo.TIRAGENS ?? []),
            ...((biblioteca.tiragens ?? []) as Modelo[]),
          ]}
          guardar={(m) =>
            guardar({
              ...biblioteca,
              tiragens: [
                ...((biblioteca.tiragens ?? []) as Modelo[]).filter(
                  (x) => x.nome !== m.nome,
                ),
                m,
              ],
            })
          }
        />
      )}{" "}
      {(setor === "aniversario" || setor === "mapa") && (
        <Nascimento
          paciente={paciente}
          setor={setor}
          valor={e}
          mudar={mudarExtra}
        />
      )}{" "}
      {setor.startsWith("custom:") && (
        <div className="space-y-4">
          <label className="block text-sm">
            Nome da área
            <Input
              aria-label="Nome da área"
              value={a.nome}
              onChange={(ev) => area({ ...a, nome: ev.target.value })}
            />
          </label>
          <div className="flex flex-wrap gap-2">{a.itens?.map(item)}</div>
          <Input
            aria-label="Nome do item"
            placeholder="Nome do item"
            value={nome}
            onChange={(ev) => setNome(ev.target.value)}
          />
          <Textarea
            aria-label="Descrição do item"
            placeholder="Descrição (opcional)"
            value={descricao}
            onChange={(ev) => setDescricao(ev.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {["", "V", "P", "K"].map((d) => (
              <Button
                key={d}
                variant="outline"
                size="sm"
                aria-pressed={dosha === d}
                onClick={() => setDosha(d)}
              >
                {d || "Sem dosha"}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            disabled={!nome.trim()}
            onClick={() => {
              const i: ItemClinico = {
                id: `${setor}:${crypto.randomUUID()}`,
                nome: nome.trim(),
                texto: descricao || undefined,
                setor,
                sugestao: dosha ? [dosha as "V" | "P" | "K"] : undefined,
              };
              area({ ...a, itens: [...(a.itens ?? []), i] });
              setNome("");
              setDescricao("");
            }}
          >
            Adicionar item
          </Button>
          <Button
            variant="outline"
            disabled={!a.nome.trim()}
            onClick={() =>
              void guardar({
                ...biblioteca,
                areas: [
                  ...((biblioteca.areas ?? []) as Adicao[]).filter(
                    (x) => x.id !== a.id,
                  ),
                  a,
                ],
              })
            }
          >
            Guardar área na minha biblioteca
          </Button>
        </div>
      )}
    </>
  );
}
