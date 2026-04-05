import { ExternalLink } from "lucide-react";
import type { DoshaRemediesData } from "@/data/remediesData";

interface Props extends DoshaRemediesData {
  dosha: "vata" | "pitta" | "kapha";
}

const doshaAccent: Record<string, string> = {
  vata: "text-vata",
  pitta: "text-pitta",
  kapha: "text-kapha",
};

const doshaBg: Record<string, string> = {
  vata: "bg-vata/10",
  pitta: "bg-pitta/10",
  kapha: "bg-kapha/10",
};

const doshaBorder: Record<string, string> = {
  vata: "border-vata/30",
  pitta: "border-pitta/30",
  kapha: "border-kapha/30",
};

const doshaGradient: Record<string, string> = {
  vata: "from-vata/20 to-vata/5",
  pitta: "from-pitta/20 to-pitta/5",
  kapha: "from-kapha/20 to-kapha/5",
};

const DoshaRemediesContent = ({ dosha, ...data }: Props) => {
  const accent = doshaAccent[dosha];
  const bg = doshaBg[dosha];
  const border = doshaBorder[dosha];
  const gradient = doshaGradient[dosha];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Hero */}
      <div className="text-center space-y-4">
        <p className={`text-sm font-semibold uppercase tracking-widest ${accent}`}>
          {data.heroSubtitle}
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary whitespace-pre-line leading-tight">
          {data.heroTagline}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {data.heroDescription}
        </p>
      </div>

      {/* Journey steps (Kapha only) */}
      {data.journeySteps && (
        <div className={`border ${border} ${bg} rounded-2xl p-6 space-y-4`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🌪️</span>
            <h2 className="font-serif text-xl font-bold text-primary">A Jornada Clínica do Muco (Ama)</h2>
          </div>
          {data.journeySteps.map((s) => (
            <div key={s.step} className="flex gap-4">
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${dosha === "kapha" ? "bg-kapha" : dosha === "pitta" ? "bg-pitta" : "bg-vata"}`}>
                {s.step}
              </div>
              <div>
                <h3 className="font-bold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Foundations */}
      <div className={`border ${border} ${bg} rounded-2xl p-6 space-y-4`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">📜</span>
          <h2 className="font-serif text-xl font-bold text-primary">{data.foundationTitle}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {data.foundations.map((f, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-2">
              <span className="text-2xl">{f.emoji}</span>
              <h3 className={`font-bold ${accent}`}>{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Grimory */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="font-serif text-2xl font-bold text-primary">{data.grimoryTitle}</h2>
          <p className="text-sm text-muted-foreground">{data.grimorySubtitle}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {data.remedies.map((r, i) => (
            <div key={i} className={`border ${border} rounded-2xl overflow-hidden`}>
              <div className={`bg-gradient-to-r ${gradient} px-4 py-3 flex items-center justify-between`}>
                <span className="text-sm font-semibold text-foreground">{r.badge}</span>
                <span className="text-2xl">{r.badgeEmoji}</span>
              </div>
              <div className="p-4 space-y-2">
                <h3 className={`font-bold text-lg ${accent}`}>{r.title}</h3>
                <p className="text-sm text-muted-foreground">{r.subtitle}</p>
                <div className="space-y-1 pt-1">
                  {r.details.map((d, j) => (
                    <p key={j} className="text-sm text-foreground leading-relaxed">
                      <span className={`font-semibold ${accent}`}>→</span> {d}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cut list (Pitta) */}
      {data.cutList && (
        <div className={`border ${border} ${bg} rounded-2xl p-6 space-y-3`}>
          <h2 className="font-serif text-xl font-bold text-primary">O Que Cortar com Firmeza</h2>
          <p className="text-sm text-muted-foreground">Retirar o agravante é o primeiro remédio. Evite:</p>
          <div className="flex flex-wrap gap-2">
            {data.cutList.map((item, i) => (
              <span key={i} className={`px-3 py-1.5 rounded-full text-sm font-medium border ${border} ${bg}`}>
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Measures (Kapha) */}
      {data.measures && (
        <div className={`border ${border} ${bg} rounded-2xl p-6 space-y-4`}>
          <h2 className="font-serif text-xl font-bold text-primary">Como Medir o Sucesso do Tratamento</h2>
          {data.measures.map((m, i) => (
            <div key={i} className="space-y-1">
              <h3 className={`font-bold ${accent}`}>{m.title}</h3>
              <p className="text-sm text-muted-foreground">{m.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Habit block (Kapha) */}
      {data.habitBlock && (
        <div className={`border ${border} rounded-2xl p-6 space-y-3`}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏃🏽‍♂️</span>
            <div>
              <h2 className="font-serif text-xl font-bold text-primary">{data.habitBlock.title}</h2>
              <p className={`text-sm font-semibold ${accent}`}>{data.habitBlock.subtitle}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{data.habitBlock.text}</p>
          <p className="text-sm text-foreground font-medium">{data.habitBlock.extraText}</p>
        </div>
      )}

      {/* Tip block */}
      <div className={`border ${border} rounded-2xl p-6 space-y-3`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{data.tipBlock.emoji}</span>
          <h2 className="font-serif text-lg font-bold text-primary">{data.tipBlock.title}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{data.tipBlock.text}</p>
        {data.tipBlock.extraText && (
          <p className="text-sm text-foreground font-medium">{data.tipBlock.extraText}</p>
        )}
      </div>

      {/* Alert block */}
      {data.alertBlock.emoji !== data.tipBlock.emoji && (
        <div className="border border-amber-500/30 bg-amber-500/5 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{data.alertBlock.emoji}</span>
            <h2 className="font-serif text-lg font-bold text-primary">{data.alertBlock.title}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{data.alertBlock.text}</p>
        </div>
      )}

      {/* CTA */}
      <div className={`border ${border} ${bg} rounded-2xl p-8 text-center space-y-4`}>
        <h2 className="font-serif text-2xl font-bold text-primary">{data.ctaTitle}</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">{data.ctaText}</p>
        <a
          href={data.ctaLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition-all ${
            dosha === "vata" ? "bg-vata hover:bg-vata/90" : dosha === "pitta" ? "bg-pitta hover:bg-pitta/90" : "bg-kapha hover:bg-kapha/90"
          }`}
        >
          {data.ctaButtonText}
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
};

export default DoshaRemediesContent;
