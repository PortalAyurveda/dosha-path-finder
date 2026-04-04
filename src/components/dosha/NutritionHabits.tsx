interface NutritionHabitsProps {
  approachTitle: string;
  approachText: string;
  approachDetail?: string;
  avoidTitle: string;
  avoidText: string;
  avoidDetail?: string;
  doItems: string[];
  dontItems: string[];
}

const NutritionHabits = ({
  approachTitle, approachText, approachDetail,
  avoidTitle, avoidText, avoidDetail,
  doItems, dontItems,
}: NutritionHabitsProps) => {
  return (
    <div className="space-y-8">
      {/* Nutrition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-kapha/10 border border-kapha/30 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm p-6 space-y-2">
          <h4 className="text-lg font-bold text-kapha">{approachTitle}</h4>
          <p className="text-sm text-foreground leading-relaxed">{approachText}</p>
          {approachDetail && <p className="text-sm text-foreground leading-relaxed">{approachDetail}</p>}
        </div>
        <div className="bg-pitta/10 border border-pitta/30 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm p-6 space-y-2">
          <h4 className="text-lg font-bold text-pitta">{avoidTitle}</h4>
          <p className="text-sm text-foreground leading-relaxed">{avoidText}</p>
          {avoidDetail && <p className="text-sm text-foreground leading-relaxed">{avoidDetail}</p>}
        </div>
      </div>

      {/* Habits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface-sky border border-vata/20 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm p-6 space-y-2">
          <h4 className="text-lg font-bold text-primary">O que Fazer</h4>
          <ul className="space-y-2">
            {doItems.map((item, i) => (
              <li key={i} className="text-sm text-foreground leading-relaxed flex gap-2">
                <span className="text-kapha">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-surface-sun border border-pitta/20 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm p-6 space-y-2">
          <h4 className="text-lg font-bold text-primary">O que Evitar</h4>
          <ul className="space-y-2">
            {dontItems.map((item, i) => (
              <li key={i} className="text-sm text-foreground leading-relaxed flex gap-2">
                <span className="text-pitta">✗</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NutritionHabits;
