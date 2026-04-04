interface SubdoshaCardProps {
  number: number;
  name: string;
  subtitle: string;
  adequate: string;
  disturbed: string;
}

const SubdoshaCard = ({ number, name, subtitle, adequate, disturbed }: SubdoshaCardProps) => {
  return (
    <div className="border border-border rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm bg-card p-6 space-y-4">
      <div>
        <h4 className="text-lg font-bold text-secondary">
          {number}. {name}
        </h4>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="space-y-3">
        <div className="bg-kapha/10 border border-kapha/30 rounded-xl p-4">
          <p className="text-sm font-bold text-kapha mb-1">✅ Funcionamento Adequado</p>
          <p className="text-sm text-foreground">{adequate}</p>
        </div>
        <div className="bg-pitta/10 border border-pitta/30 rounded-xl p-4">
          <p className="text-sm font-bold text-pitta mb-1">❌ Distúrbio / Adoecido</p>
          <p className="text-sm text-foreground">{disturbed}</p>
        </div>
      </div>
    </div>
  );
};

export default SubdoshaCard;
