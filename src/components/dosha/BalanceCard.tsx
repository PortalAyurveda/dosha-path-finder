interface BalanceCardProps {
  equilibriumTitle: string;
  equilibriumTexts: string[];
  disturbTitle: string;
  disturbTexts: string[];
}

const BalanceCard = ({ equilibriumTitle, equilibriumTexts, disturbTitle, disturbTexts }: BalanceCardProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-kapha/10 border border-kapha/30 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm p-6 space-y-3">
        <h4 className="text-lg font-bold text-kapha">{equilibriumTitle}</h4>
        {equilibriumTexts.map((t, i) => (
          <p key={i} className="text-sm text-foreground leading-relaxed">{t}</p>
        ))}
      </div>
      <div className="bg-pitta/10 border border-pitta/30 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm p-6 space-y-3">
        <h4 className="text-lg font-bold text-pitta">{disturbTitle}</h4>
        {disturbTexts.map((t, i) => (
          <p key={i} className="text-sm text-foreground leading-relaxed">{t}</p>
        ))}
      </div>
    </div>
  );
};

export default BalanceCard;
