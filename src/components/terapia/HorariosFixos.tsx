import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import CTAButton from "@/components/CTAButton";
import {
  terapia,
  Painel,
  Regra,
  regrasComDuracao,
} from "@/lib/terapia";
import { Secao } from "./Comuns";
import { useToast } from "@/hooks/use-toast";
import { horariosNoMolde } from "@/lib/terapiaAgenda";
const dias = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
export default function HorariosFixos({
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
  const [regras, setRegras] = useState<Regra[]>([]);
  const [editando, setEditando] = useState<number | null>(null);
  const [duracao, setDuracao] = useState(50);
  const [intervalo, setIntervalo] = useState(10);
  const [antecedencia, setAntecedencia] = useState(
    painel.sistema.antecedencia_horas,
  );
  const [nascimento, setNascimento] = useState(painel.sistema.pedir_nascimento);
  const [salvando, setSalvando] = useState(false);
  const agenda = useQuery({
    queryKey: ["terapia-agenda", userId],
    queryFn: terapia.agenda,
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
      qc.invalidateQueries({ queryKey: ["terapia-agenda-semana", userId] }),
      qc.invalidateQueries({ queryKey: ["terapia-bloqueios", userId] }),
    ]);
  };
  const salvar = async () => {
    if (!regras.length && !window.confirm("Sem faixas, você sai do diretório até abrir horários de novo.")) return;
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
  const erro = agenda.error;
  useEffect(() => {
    if (erro) toast({ title: erro.message, variant: "destructive" });
  }, [erro, toast]);
  return (
    <div className="max-w-2xl">
      <Secao
        titulo="Meus horários de atendimento"
        className=""
      >
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
        <p className="mb-4 text-sm text-muted-foreground">Mudar o molde não mexe nas consultas já marcadas.</p><p className="mb-4 text-sm font-semibold">{horariosNoMolde(regras, duracao, intervalo)} horários por semana</p><div className="space-y-3">
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
                  disabled={agenda.isPending || salvando}
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
        <CTAButton data-terapia-principal
          disabled={
            salvando ||
            agenda.isPending ||
            !!agenda.error ||
            duracao < 15 ||
            intervalo < 0 ||
            antecedencia < 0 || antecedencia > 168 ||
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
