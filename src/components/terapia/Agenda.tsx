import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import CTAButton from "@/components/CTAButton";
import {
  terapia,
  Painel,
  Regra,
  Semana,
  limitesSemana,
  minutos,
  mudarSemana,
  diaBR,
  horaBR,
  dataBR,
  regrasComDuracao,
} from "@/lib/terapia";
import { Secao } from "./Comuns";
import { useToast } from "@/hooks/use-toast";
const dias = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
export function GradeSemana({ semana }: { semana: Semana }) {
  const limites = limitesSemana(semana.regras);
  const horas = Array.from(
    { length: (limites.fim - limites.inicio) / 60 },
    (_, i) => limites.inicio + i * 60,
  );
  if (!limites.dias.length)
    return (
      <p className="py-8 text-sm text-muted-foreground">
        Nenhum horário de atendimento configurado.
      </p>
    );
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-separate border-spacing-1 text-xs">
        <thead>
          <tr>
            <th className="w-9" />
            {limites.dias.map((d) => {
              const dia = mudarDia(semana.inicio, d);
              return (
                <th key={d} className="min-w-14 py-2 font-medium">
                  {dias[d]} {diaBR(dia).split("/")[0]}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {horas.map((h) => (
            <tr key={h}>
              <th className="align-top font-normal text-muted-foreground">
                {h / 60}h
              </th>
              {limites.dias.map((d) => {
                const dia = mudarDia(semana.inicio, d);
                const bloqueio = semana.bloqueios.find((b) => b.dia === dia);
                const regras = semana.regras.filter((r) => r.dia_semana === d);
                const livre = regras.some(
                  (r) => minutos(r.inicio) < h + 60 && minutos(r.fim) > h,
                );
                const consultas = semana.consultas.filter(
                  (c) =>
                    dataBR(c.inicio) === dia &&
                    minutos(horaBR(c.inicio)) < h + 60 &&
                    minutos(horaBR(c.fim)) > h,
                );
                return (
                  <td
                    key={d}
                    className={`h-16 align-top rounded p-1 ${bloqueio ? "terapia-bloqueado border border-border" : consultas.length ? "bg-primary text-primary-foreground" : livre ? "border border-dashed border-secondary/40 bg-background" : "bg-muted"}`}
                    title={bloqueio?.motivo ?? undefined}
                  >
                    {bloqueio ? (
                      <span className="text-muted-foreground">Bloqueado</span>
                    ) : (
                      consultas.map((c) => (
                        <div
                          key={c.id}
                          className="break-words text-[10px] leading-tight"
                        >
                          <strong>{c.nome}</strong>
                          <br />
                          {horaBR(c.inicio)}–{horaBR(c.fim)}
                          <br />
                          {c.primeira ? "Primeira consulta" : "Retorno"}
                        </div>
                      ))
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function mudarDia(inicio: string, dia: number) {
  const data = new Date(`${inicio}T12:00:00`);
  data.setDate(data.getDate() + (dia === 0 ? 6 : dia - 1));
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}
export default function Agenda({
  painel,
  executar,
  userId,
}: {
  userId?: string;
  painel: Painel;
  executar: (fn: () => Promise<unknown>) => Promise<boolean>;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [inicio, setInicio] = useState<string>();
  const [regras, setRegras] = useState<Regra[]>([]);
  const [editando, setEditando] = useState<number | null>(null);
  const [duracao, setDuracao] = useState(50);
  const [intervalo, setIntervalo] = useState(10);
  const [antecedencia, setAntecedencia] = useState(
    painel.sistema.antecedencia_horas,
  );
  const [nascimento, setNascimento] = useState(painel.sistema.pedir_nascimento);
  const [dia, setDia] = useState("");
  const [motivo, setMotivo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const semana = useQuery({
    queryKey: ["terapia-semana", userId, inicio],
    queryFn: () => terapia.semana(inicio),
  });
  const agenda = useQuery({
    queryKey: ["terapia-agenda", userId],
    queryFn: terapia.agenda,
  });
  const bloqueios = useQuery({
    queryKey: ["terapia-bloqueios", userId],
    queryFn: terapia.bloqueios,
  });
  useEffect(() => {
    if (agenda.data) {
      setRegras(agenda.data);
      setDuracao(agenda.data[0]?.duracao_min ?? 50);
      setIntervalo(agenda.data[0]?.intervalo_min ?? 10);
    }
  }, [agenda.data]);
  const atualizar = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["terapia-semana", userId] }),
      qc.invalidateQueries({ queryKey: ["terapia-bloqueios", userId] }),
    ]);
  };
  const salvar = async () => {
    setSalvando(true);
    try {
      await executar(async () => {
        await terapia.salvarAgenda(
          regrasComDuracao(regras, duracao, intervalo),
        );
        await terapia.preferencias({
          antecedencia_horas: antecedencia,
          pedir_nascimento: nascimento,
        });
        await Promise.all([
          atualizar(),
          qc.invalidateQueries({ queryKey: ["terapia-agenda", userId] }),
          qc.invalidateQueries({ queryKey: ["terapia-painel", userId] }),
        ]);
      });
    } finally {
      setSalvando(false);
    }
  };
  const erro = semana.error || agenda.error || bloqueios.error;
  useEffect(() => {
    if (erro) toast({ title: erro.message, variant: "destructive" });
  }, [erro, toast]);
  return (
    <div className="grid gap-7 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
      <Secao>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">
            {semana.data
              ? `${diaBR(semana.data.inicio)} a ${diaBR(semana.data.fim)}`
              : "Semana"}
          </h2>
          <div className="flex gap-1">
            {[-1, 1].map((dir) => (
              <Button
                key={dir}
                variant="outline"
                size="icon"
                className="h-8 w-8"
                aria-label={dir < 0 ? "Semana anterior" : "Próxima semana"}
                disabled={!semana.data || semana.isFetching}
                onClick={() => {
                  if (semana.data)
                    setInicio(mudarSemana(semana.data.inicio, dir));
                }}
              >
                {dir < 0 ? <ChevronLeft /> : <ChevronRight />}
              </Button>
            ))}
          </div>
        </div>
        {semana.data && <GradeSemana semana={semana.data} />}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span>■ Consulta</span>
          <span>□ Livre para marcar</span>
          <span>Fora do horário</span>
          <span>▧ Bloqueado</span>
        </div>
        {semana.isPending && <p role="status">Carregando semana…</p>}
      </Secao>
      <Secao
        titulo="Meus horários de atendimento"
        className="xl:border-l xl:border-border xl:pl-6"
      >
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 0].map((d) => (
            <div key={d}>
              <div className="flex items-center gap-2 text-sm">
                <strong className="w-8">{dias[d]}</strong>
                <div className="flex flex-1 flex-wrap gap-1">
                  {regras.filter((r) => r.dia_semana === d).length ? (
                    regras
                      .filter((r) => r.dia_semana === d)
                      .map((r, i) => (
                        <span key={i} className="rounded bg-muted px-2 text-xs">
                          {r.inicio}–{r.fim}
                        </span>
                      ))
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      não atende
                    </span>
                  )}
                </div>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setEditando(editando === d ? null : d)}
                >
                  mudar
                </Button>
              </div>
              {editando === d && (
                <div className="my-2 space-y-2 border-l-2 border-secondary pl-3">
                  {regras.map(
                    (r, i) =>
                      r.dia_semana === d && (
                        <div key={i} className="flex items-center gap-1">
                          <Input
                            type="time"
                            aria-label={`Início ${dias[d]}`}
                            value={r.inicio}
                            onChange={(e) =>
                              setRegras(
                                regras.map((x, j) =>
                                  j === i
                                    ? { ...x, inicio: e.target.value }
                                    : x,
                                ),
                              )
                            }
                          />
                          <Input
                            type="time"
                            aria-label={`Fim ${dias[d]}`}
                            value={r.fim}
                            onChange={(e) =>
                              setRegras(
                                regras.map((x, j) =>
                                  j === i ? { ...x, fim: e.target.value } : x,
                                ),
                              )
                            }
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Remover faixa"
                            onClick={() =>
                              setRegras(regras.filter((_, j) => j !== i))
                            }
                          >
                            <X />
                          </Button>
                        </div>
                      ),
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setRegras([
                        ...regras,
                        {
                          dia_semana: d,
                          inicio: "09:00",
                          fim: "12:00",
                          duracao_min: duracao,
                          intervalo_min: intervalo,
                        },
                      ])
                    }
                  >
                    <Plus />
                    Adicionar faixa
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="my-5 grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="duracao">Duração (min)</Label>
            <Input
              id="duracao"
              type="number"
              min={15}
              required
              value={duracao}
              onChange={(e) => setDuracao(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="intervalo">Intervalo (min)</Label>
            <Input
              id="intervalo"
              type="number"
              min={0}
              required
              value={intervalo}
              onChange={(e) => setIntervalo(Number(e.target.value))}
            />
          </div>
        </div>
        <Label htmlFor="antecedencia">Marcar com antecedência de (horas)</Label>
        <Input
          id="antecedencia"
          type="number"
          min={0}
          max={168}
          value={antecedencia}
          onChange={(e) => setAntecedencia(Number(e.target.value))}
        />
        <h3 className="mt-5 mb-3 text-xs font-semibold uppercase text-muted-foreground">
          Dias bloqueados
        </h3>
        <div className="mb-3 flex flex-wrap gap-2">
          {bloqueios.data?.map((b) => (
            <span
              key={b.id}
              className="inline-flex items-center rounded bg-muted pl-2 text-xs"
            >
              {diaBR(b.dia)}
              {b.motivo && ` · ${b.motivo}`}
              <Button
                variant="ghost"
                className="h-7 w-7 p-0"
                aria-label={`Tirar bloqueio ${b.dia}`}
                onClick={() =>
                  executar(async () => {
                    await terapia.desbloquear(b.id);
                    await atualizar();
                  })
                }
              >
                <X className="h-3 w-3" />
              </Button>
            </span>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void executar(async () => {
              await terapia.bloquear(dia, motivo);
              setDia("");
              setMotivo("");
              await atualizar();
            });
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="bloqueio-dia">Dia</Label>
              <Input
                id="bloqueio-dia"
                type="date"
                required
                value={dia}
                onChange={(e) => setDia(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="bloqueio-motivo">Motivo (opcional)</Label>
              <Input
                id="bloqueio-motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            </div>
          </div>
          <Button variant="outline" type="submit">
            Bloquear este dia
          </Button>
        </form>
        <div className="my-5 flex items-center justify-between gap-3">
          <Label htmlFor="pedir-nascimento" className="text-sm leading-relaxed">
            Pedir data, hora e cidade de nascimento antes
          </Label>
          <Switch
            id="pedir-nascimento"
            checked={nascimento}
            onCheckedChange={setNascimento}
            className="data-[state=checked]:bg-secondary"
          />
        </div>
        <CTAButton
          disabled={
            salvando ||
            duracao < 15 ||
            intervalo < 0 ||
            regras.some((r) => r.inicio >= r.fim)
          }
          onClick={salvar}
          className="h-11 w-full px-4 py-2 text-base"
        >
          {salvando ? "Salvando…" : "Salvar"}
        </CTAButton>
        {erro && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {erro.message}
          </p>
        )}
      </Secao>
    </div>
  );
}
