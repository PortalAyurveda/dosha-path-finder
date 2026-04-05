import DoshaSection from "./DoshaSection";

interface FoodPrinciple {
  icon: string;
  title: string;
  text: string;
}

interface MealTip {
  icon: string;
  text: string;
}

interface SnackItem {
  title: string;
  text: string;
}

interface MealSection {
  icon: string;
  title: string;
  subtitle: string;
  intro?: string;
  tips: MealTip[];
  highlight?: { title: string; text: string; items?: string[] };
}

interface DoshaFoodContentProps {
  dosha: "vata" | "pitta" | "kapha";
  heroTitle: string;
  heroDescription: string;
  principles: FoodPrinciple[];
  meals: MealSection[];
  snacks: { intro: string; items: SnackItem[] };
  ctaTitle: string;
  ctaText: string;
}

const doshaAccent = {
  vata: "text-vata",
  pitta: "text-pitta",
  kapha: "text-kapha",
};

const doshaBorder = {
  vata: "border-vata/30",
  pitta: "border-pitta/30",
  kapha: "border-kapha/30",
};

const doshaBg = {
  vata: "bg-vata/5",
  pitta: "bg-pitta/5",
  kapha: "bg-kapha/5",
};

const DoshaFoodContent = ({
  dosha,
  heroTitle,
  heroDescription,
  principles,
  meals,
  snacks,
  ctaTitle,
  ctaText,
}: DoshaFoodContentProps) => {
  const accent = doshaAccent[dosha];

  return (
    <>
      {/* Hero */}
      <section className="py-10 bg-surface-sun/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold italic text-primary mb-3">
            {heroTitle}
          </h2>
          <p className="text-foreground/70 leading-relaxed max-w-2xl mx-auto">
            {heroDescription}
          </p>
        </div>
      </section>

      {/* Principles */}
      <section className="py-8 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-4">
            {principles.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border p-5 text-center space-y-2">
                <span className="text-3xl block">{p.icon}</span>
                <h4 className={`font-sans font-bold text-base ${accent}`}>{p.title}</h4>
                <p className="text-sm text-foreground/70 leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meals */}
      <section className="py-8 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          {meals.map((meal, i) => (
            <div key={i} className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
                <span className="text-2xl">{meal.icon}</span>
                <div>
                  <h3 className="font-serif font-bold text-primary text-lg leading-tight">{meal.title}</h3>
                  <p className={`text-xs mt-0.5 font-semibold ${accent}`}>{meal.subtitle}</p>
                </div>
              </div>
              <div className="px-5 py-4 space-y-3">
                {meal.intro && (
                  <p className="text-sm text-foreground/80 leading-relaxed">{meal.intro}</p>
                )}
                {meal.tips.map((tip, j) => (
                  <div key={j} className="flex gap-3 text-sm">
                    <span className="text-lg shrink-0 mt-0.5">{tip.icon}</span>
                    <p className="text-foreground/80 leading-relaxed">{tip.text}</p>
                  </div>
                ))}
                {meal.highlight && (
                  <div className={`mt-4 rounded-xl ${doshaBg[dosha]} border ${doshaBorder[dosha]} p-4`}>
                    <h4 className={`font-bold text-sm ${accent} mb-1`}>{meal.highlight.title}</h4>
                    <p className="text-sm text-foreground/80 leading-relaxed">{meal.highlight.text}</p>
                    {meal.highlight.items && (
                      <ul className="mt-2 space-y-1">
                        {meal.highlight.items.map((item, k) => (
                          <li key={k} className="text-sm text-foreground/80">{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Snacks */}
      <section className="py-8 bg-surface-sun/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
              <span className="text-2xl">☕</span>
              <div>
                <h3 className="font-serif font-bold text-primary text-lg">Lanches de Sustentação</h3>
              </div>
            </div>
            <div className="px-5 py-4 space-y-1">
              <p className="text-sm text-foreground/80 leading-relaxed mb-3">{snacks.intro}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {snacks.items.map((s, i) => (
                  <div key={i} className={`rounded-xl ${doshaBg[dosha]} border ${doshaBorder[dosha]} p-4`}>
                    <h4 className={`font-bold text-sm ${accent} mb-1`}>{s.title}</h4>
                    <p className="text-sm text-foreground/70 leading-relaxed">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className={`rounded-2xl border ${doshaBorder[dosha]} ${doshaBg[dosha]} p-8`}>
            <h3 className="text-xl font-serif font-bold italic text-primary mb-3">{ctaTitle}</h3>
            <p className="text-sm text-foreground/70 leading-relaxed mb-5">{ctaText}</p>
            <a
              href="https://samkhya.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-primary text-white font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
            >
              Acessar a Loja Oficial
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default DoshaFoodContent;
