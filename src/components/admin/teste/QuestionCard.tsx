import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Copy } from "lucide-react";
import ScoreTagPicker from "./ScoreTagPicker";
import { summarizeScores, type Question, type QuestionOption } from "@/lib/doshaTest";

interface Props {
  question: Question;
  onChange: (next: Question) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}

const QuestionCard = ({ question, onChange, onRemove, onDuplicate }: Props) => {
  const [open, setOpen] = useState(true);

  const updateOption = (idx: number, patch: Partial<QuestionOption>) => {
    onChange({
      ...question,
      options: question.options.map((o, i) => (i === idx ? { ...o, ...patch } : o)),
    });
  };

  const addOption = () => {
    onChange({
      ...question,
      options: [...question.options, { label: "Nova opção", scores: {} }],
    });
  };

  const removeOption = (idx: number) => {
    onChange({ ...question, options: question.options.filter((_, i) => i !== idx) });
  };

  return (
    <div className="border rounded-lg bg-card p-4 space-y-3">
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="text-xs text-muted-foreground hover:text-foreground shrink-0 mt-2"
          aria-label="Recolher"
        >
          {open ? "▼" : "▶"}
        </button>
        <Textarea
          value={question.text}
          onChange={e => onChange({ ...question, text: e.target.value })}
          rows={2}
          className="font-medium"
          placeholder="Texto da pergunta"
        />
        <div className="flex flex-col gap-1 shrink-0">
          <Button type="button" variant="ghost" size="icon" onClick={onDuplicate} title="Duplicar">
            <Copy className="w-4 h-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={onRemove} title="Remover pergunta">
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>

      {open && (
        <div className="space-y-3 pl-6">
          {question.options.map((opt, idx) => (
            <div key={idx} className="border rounded-md p-3 space-y-2 bg-muted/30">
              <div className="flex items-start gap-2">
                <Textarea
                  value={opt.label}
                  onChange={e => updateOption(idx, { label: e.target.value })}
                  rows={2}
                  className="text-sm"
                  placeholder="Texto da resposta"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(idx)}
                  title="Remover opção"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
              <ScoreTagPicker
                value={opt.scores}
                onChange={scores => updateOption(idx, { scores })}
              />
              {summarizeScores(opt.scores) && (
                <p className="text-xs text-muted-foreground italic">
                  Pontuação: {summarizeScores(opt.scores)}
                </p>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addOption} className="gap-1">
            <Plus className="w-3.5 h-3.5" /> Adicionar opção
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
