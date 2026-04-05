import { Eye, Hand, Languages, User } from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface PrakritiItem {
  label: string;
  text: string;
  icon?: string;
}

interface PrakritiSectionProps {
  description: string;
  traits: PrakritiItem[];
}

const traitIcons: Record<string, LucideIcon> = {
  Olhos: Eye,
  Unhas: Hand,
  Língua: Languages,
};

const PrakritiSection = ({ description, traits }: PrakritiSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 bg-card border border-border rounded-xl p-4">
        <User className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
        <p className="text-sm text-foreground leading-relaxed">{description}</p>
      </div>
      <div className="space-y-2">
        {traits.map((t, i) => {
          const Icon = traitIcons[t.label] || User;
          return (
            <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
              <Icon className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
              <p className="text-sm text-foreground">
                <span className="font-bold text-secondary">{t.label}:</span> {t.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PrakritiSection;
