import { ArrowUp, ArrowDown, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  imagemCMS,
  moverCMS,
  objetoCMS,
  vazioCMS,
  type ValorCMS,
} from "@/lib/terapiaAdmin";

export default function EditorValor({
  valor,
  onChange,
  nome,
  id,
}: {
  valor: ValorCMS;
  onChange: (v: ValorCMS) => void;
  nome: string;
  id: string;
}) {
  if (Array.isArray(valor))
    return (
      <div className="space-y-3">
        <Label>{nome}</Label>
        {valor.map((v, i) => (
          <div
            key={`${id}-${i}`}
            className="border-b border-border pb-3 space-y-2"
          >
            <EditorValor
              valor={v}
              nome={`${nome} ${i + 1}`}
              id={`${id}-${i}`}
              onChange={(novo) =>
                onChange(valor.map((x, j) => (j === i ? novo : x)))
              }
            />
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Mover para cima"
                aria-label={`Mover ${nome} ${i + 1} para cima`}
                disabled={i === 0}
                onClick={() => onChange(moverCMS(valor, i, i - 1))}
              >
                <ArrowUp />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Mover para baixo"
                aria-label={`Mover ${nome} ${i + 1} para baixo`}
                disabled={i === valor.length - 1}
                onClick={() => onChange(moverCMS(valor, i, i + 1))}
              >
                <ArrowDown />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Tirar item"
                aria-label={`Tirar ${nome} ${i + 1}`}
                onClick={() => onChange(valor.filter((_, j) => j !== i))}
              >
                <Trash2 />
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange([...valor, valor.length ? vazioCMS(valor[0]) : ""])
          }
        >
          <Plus /> item
        </Button>
      </div>
    );
  if (objetoCMS(valor))
    return (
      <fieldset className="border-l-2 border-border pl-4 space-y-4 min-w-0">
        <legend className="text-sm font-medium mb-2 break-words">{nome}</legend>
        {Object.entries(valor).map(([k, v]) => (
          <EditorValor
            key={k}
            valor={v}
            nome={k}
            id={`${id}-${k}`}
            onChange={(novo) => onChange({ ...valor, [k]: novo })}
          />
        ))}
      </fieldset>
    );
  return (
    <div className="space-y-2 min-w-0">
      <Label htmlFor={id} className="break-words">
        {nome}
      </Label>
      {typeof valor === "boolean" ? (
        <Switch
          id={id}
          checked={valor}
          className="block data-[state=checked]:bg-secondary"
          onCheckedChange={onChange}
        />
      ) : typeof valor === "number" ? (
        <Input
          id={id}
          type="number"
          step="any"
          value={valor}
          onChange={(e) => {
            const n = e.target.valueAsNumber;
            if (Number.isFinite(n)) onChange(n);
          }}
        />
      ) : typeof valor === "string" &&
        (valor.length > 80 || valor.includes("\n")) ? (
        <Textarea
          id={id}
          rows={4}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Input
          id={id}
          value={valor ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {typeof valor === "string" && imagemCMS(valor) && (
        <img
          src={valor}
          alt={nome}
          className="h-24 max-w-full object-contain rounded-md border border-border"
        />
      )}
    </div>
  );
}
