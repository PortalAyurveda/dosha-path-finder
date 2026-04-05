import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

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

interface ClockSegment {
  label: string;
  dosha: string;
  color: string;
  highlight?: boolean;
}

interface DoshaRoutinePageProps {
  dosha: "vata" | "pitta" | "kapha";
  emoji: string;
  heroTitle: string;
  heroDescription: string;
  clockLabel: string;
  clockSubtitle: string;
  clockSegments: ClockSegment[];
  principlesTitle: string;
  principlesSubtitle: string;
  principles: PrincipleCard[];
  timelineTitle: string;
  timelineSubtitle: string;
  timeline: TimelineStep[];
  metaTitle: string;
  metaDescription: string;
}

const doshaStyles = {
  vata: {
    heroBg: "from-blue-50 to-background",
    accent: "text-vata",
    accentBg: "bg-vata/10",
    cardBorder: "border-vata/20",
    btnBg: "bg-vata text-white hover:opacity-90",
    clockBorder: "border-vata/20",
    timelineDot: "bg-vata",
  },
  pitta: {
    heroBg: "from-red-50 to-background",
    accent: "text-pitta",
    accentBg: "bg-pitta/10",
    cardBorder: "border-pitta/20",
    btnBg: "bg-pitta text-white hover:opacity-90",
    clockBorder: "border-pitta/20",
    timelineDot: "bg-pitta",
  },
  kapha: {
    heroBg: "from-green-50 to-background",
    accent: "text-kapha",
    accentBg: "bg-kapha/10",
    cardBorder: "border-kapha/20",
    btnBg: "bg-kapha text-white hover:opacity-90",
    clockBorder: "border-kapha/20",
    timelineDot: "bg-kapha",
  },
};

const otherDoshas = {
  vata: [
    { label: "Ver Rotina Pitta 🔥", to: "/biblioteca/pitta/horarios" },
    { label: "Ver Rotina Kapha 🪨", to: "/biblioteca/kapha/horarios" },
  ],
  pitta: [
    { label: "Ver Rotina Vata 💨", to: "/biblioteca/vata/horarios" },
    { label: "Ver Rotina Kapha 🪨", to: "/biblioteca/kapha/horarios" },
  ],
  kapha: [
    { label: "Ver Rotina Vata 💨", to: "/biblioteca/vata/horarios" },
    { label: "Ver Rotina Pitta 🔥", to: "/biblioteca/pitta/horarios" },
  ],
};

const DoshaRoutinePage = ({
  dosha,
  emoji,
  heroTitle,
  heroDescription,
  clockLabel,
  clockSubtitle,
  clockSegments,
  principlesTitle,
  principlesSubtitle,
  principles,
  timelineTitle,
  timelineSubtitle,
  timeline,
  metaTitle,
  metaDescription,
}: DoshaRoutinePageProps) => {
  const styles = doshaStyles[dosha];

  return (
    <>
      <Helmet>
        <title>{metaTitle} — Portal Ayurveda</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={`https://dosha-path-finder.lovable.app/horarios/${dosha}`} />
      </Helmet>

      {/* Hero */}
      <section className={`bg-gradient-to-b ${styles.heroBg} py-12 md:py-20`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className={`text-sm font-semibold uppercase tracking-wider mb-2 ${styles.accent}`}>Compêndio Específico</p>
              <h1 className="text-3xl md:text-5xl font-serif font-bold italic text-primary leading-tight mb-4">
                {heroTitle} {emoji}
              </h1>
              <p className="text-foreground/80 text-base md:text-lg leading-relaxed mb-6">
                {heroDescription}
              </p>
              <a
                href="#dinacharya"
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-opacity ${styles.btnBg}`}
              >
                Explorar a Rotina
              </a>
            </div>

            {/* Clock */}
            <div className="flex justify-center">
              <div className={`relative w-64 h-64 md:w-80 md:h-80 rounded-full border-4 ${styles.clockBorder} bg-white/60 backdrop-blur-sm flex items-center justify-center`}>
                <div className="text-center">
                  <p className={`text-xs font-bold uppercase tracking-widest ${styles.accent}`}>{clockLabel}</p>
                  <p className="text-2xl md:text-3xl font-serif font-bold text-primary">{clockSubtitle}</p>
                </div>
                {clockSegments.map((seg, i) => {
                  const angle = (i * 45) - 90;
                  const rad = (angle * Math.PI) / 180;
                  const r = 52;
                  const x = 50 + r * Math.cos(rad);
                  const y = 50 + r * Math.sin(rad);
                  return (
                    <div
                      key={seg.label}
                      className="absolute text-center"
                      style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
                    >
                      <p className={`text-[10px] font-bold ${seg.highlight ? styles.accent : "text-muted-foreground"}`}>{seg.label}</p>
                      <p className={`text-xs font-bold ${seg.color}`}>{seg.dosha}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-12 bg-surface-sun/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold italic text-primary mb-2">{principlesTitle}</h2>
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
      <section id="dinacharya" className="py-12 bg-background">
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
                    <p className={`text-xs mt-0.5 font-semibold ${styles.accent}`}>{step.time}</p>
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

      {/* Nav footer */}
      <section className="py-10 bg-surface-sky/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h3 className="font-serif font-bold text-primary text-xl mb-4">Navegue pelas Rotinas</h3>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/horarios"
              className="px-5 py-2.5 rounded-full border border-primary/30 text-primary font-semibold text-sm hover:bg-primary/5 transition-colors"
            >
              Voltar ao Dinacharya Geral
            </Link>
            {otherDoshas[dosha].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-5 py-2.5 rounded-full border border-primary/30 text-primary font-semibold text-sm hover:bg-primary/5 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default DoshaRoutinePage;
