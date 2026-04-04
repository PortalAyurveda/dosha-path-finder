interface PrakritiItem {
  label: string;
  text: string;
}

interface PrakritiSectionProps {
  description: string;
  traits: PrakritiItem[];
}

const PrakritiSection = ({ description, traits }: PrakritiSectionProps) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground leading-relaxed">{description}</p>
      <div className="space-y-2">
        {traits.map((t, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-foreground">
              <span className="font-bold text-secondary">• {t.label}:</span> {t.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrakritiSection;
