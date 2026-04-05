import DoshaSection from "./DoshaSection";

interface TimelineStep {
  icon: string;
  title: string;
  time: string;
  steps: { icon: string; text: string }[];
}

interface PrincipleCard {
  icon: string;
  title: string;
  text: string;
}

interface DoshaRoutineContentProps {
  dosha: "vata" | "pitta" | "kapha";
  clockLabel: string;
  clockValue: string;
  principlesTitle: string;
  principlesSubtitle: string;
  principles: PrincipleCard[];
  timelineTitle: string;
  timelineSubtitle: string;
  timeline: TimelineStep[];
}

const doshaAccent = {
  vata: "text-vata",
  pitta: "text-pitta",
  kapha: "text-kapha",
};

const DoshaRoutineContent = ({
  dosha,
  principlesTitle,
  principlesSubtitle,
  principles,
  timelineTitle,
  timelineSubtitle,
  timeline,
}: DoshaRoutineContentProps) => {
  const accent = doshaAccent[dosha];

  return (
    <>
      {/* Principles */}
      <section className="py-10 bg-surface-sun/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold italic text-primary mb-2">
              {principlesTitle}
            </h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">{principlesSubtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {principles.map((card, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border p-5 flex gap-4">
                <span className="text-3xl shrink-0">{card.icon}</span>
                <div>
                  <h4 className="font-sans font-bold text-primary text-base mb-1">{card.title}</h4>
                  <p className="text-sm text-foreground/70 leading-relaxed">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-10 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-serif font-bold italic text-primary mb-2">{timelineTitle}</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">{timelineSubtitle}</p>
          </div>
          <div className="space-y-6">
            {timeline.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
                  <span className="text-2xl">{step.icon}</span>
                  <div>
                    <h3 className="font-serif font-bold text-primary text-lg leading-tight">{step.title}</h3>
                    <p className={`text-xs mt-0.5 font-semibold ${accent}`}>{step.time}</p>
                  </div>
                </div>
                <div className="px-5 py-4 space-y-3">
                  {step.steps.map((s, j) => (
                    <div key={j} className="flex gap-3 text-sm">
                      <span className="text-lg shrink-0 mt-0.5">{s.icon}</span>
                      <p className="text-foreground/80 leading-relaxed">{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default DoshaRoutineContent;
