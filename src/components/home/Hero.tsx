import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Progressive red scale — most intense at top (FIXADO) fading down (POUCO)
const LEVELS = [
  { label: "Fixado",  ranges: ["50+",   "50+",   "60+"  ], red: "hsl(0 85% 45%)", textBlur: 1,   textOpacity: 1 },
  { label: "Adoecido",ranges: ["36-49", "41-49", "51-59"], red: "hsl(0 90% 58%)", textBlur: 1.5, textOpacity: 0.9 },
  { label: "Acúmulo", ranges: ["25-35", "31-40", "36-50"], red: "hsl(0 95% 70%)", textBlur: 2,   textOpacity: 0.78 },
  { label: "Normal",  ranges: ["15-24", "15-30", "15-35"], red: "hsl(0 100% 82%)",textBlur: 2.5, textOpacity: 0.65 },
  { label: "Pouco",   ranges: ["0-14",  "0-14",  "0-14" ], red: "hsl(0 100% 92%)",textBlur: 3,   textOpacity: 0.5 },
];

const DoshaPreview = () => (
  <div className="relative select-none pointer-events-none">
    <div className="grid grid-cols-2 gap-6">
      {/* Donut chart - blurred */}
      <div className="flex flex-col items-center justify-center space-y-3" style={{ filter: "blur(8px)", opacity: 0.5 }}>
        <p className="font-serif font-bold text-primary text-base">Pontuação</p>
        <div
          className="w-40 h-40 rounded-full relative shadow-inner flex items-center justify-center"
          style={{
            background: "conic-gradient(hsl(0 100% 68%) 0% 59.7%, hsl(228 100% 71%) 59.7% 92.3%, hsl(142 69% 58%) 92.3% 100%)",
          }}
        >
          <div className="w-24 h-24 bg-card rounded-full" />
        </div>
        <div className="text-xs font-bold text-muted-foreground space-y-0.5 text-center">
          <p>Vata: 30 pts</p>
          <p>Pitta: 55 pts</p>
          <p>Kapha: 7 pts</p>
        </div>
      </div>

      {/* Clinical grid */}
      <div className="flex flex-col space-y-3">
        <p className="font-serif font-bold text-primary text-base text-center" style={{ filter: "blur(8px)", opacity: 0.5 }}>
          Quadro Clínico
        </p>
        <div className="flex gap-2">
          {/* Labels column — wider so labels + numbers fit */}
          <div className="flex flex-col justify-between w-20 shrink-0 text-[11px] font-bold py-1 pr-1 uppercase text-right leading-tight">
            {LEVELS.map((lvl) => (
              <span
                key={lvl.label}
                style={{ filter: `blur(${lvl.textBlur}px)`, opacity: lvl.textOpacity, color: lvl.red }}
              >
                {lvl.label}
              </span>
            ))}
          </div>

          {/* 3 columns × 5 rows of intensity bars (taller for vertical emphasis) */}
          <div className="grid grid-cols-3 gap-1.5 flex-1 h-[280px]">
            {/* Vata column */}
            <div className="flex flex-col gap-1" style={{ filter: "blur(7px)", opacity: 0.55 }}>
              {LEVELS.map((lvl, i) => (
                <div
                  key={`v-${i}`}
                  className="flex-1 rounded-sm flex items-center justify-center text-[9px] font-bold text-white/90"
                  style={{ background: i >= 3 ? `hsl(228 ${85 - i*5}% ${72 + i*6}%)` : "hsl(228 30% 88%)" }}
                >
                  {lvl.ranges[0]}
                </div>
              ))}
            </div>
            {/* Pitta column — focal: progressive red from top */}
            <div className="flex flex-col gap-1" style={{ filter: "blur(1px)", opacity: 0.95 }}>
              {LEVELS.map((lvl, i) => (
                <div
                  key={`p-${i}`}
                  className="flex-1 rounded-sm flex items-center justify-center text-[10px] font-bold shadow-sm"
                  style={{
                    background: lvl.red,
                    color: i < 2 ? "white" : "hsl(0 60% 30%)",
                  }}
                >
                  {lvl.ranges[1]}
                </div>
              ))}
            </div>
            {/* Kapha column */}
            <div className="flex flex-col gap-1" style={{ filter: "blur(7px)", opacity: 0.55 }}>
              {LEVELS.map((lvl, i) => (
                <div
                  key={`k-${i}`}
                  className="flex-1 rounded-sm flex items-center justify-center text-[9px] font-bold text-white/90"
                  style={{ background: i === 4 ? "hsl(142 55% 78%)" : "hsl(142 25% 90%)" }}
                >
                  {lvl.ranges[2]}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Column labels */}
        <div className="flex gap-2">
          <div className="w-20 shrink-0" />
          <div className="grid grid-cols-3 gap-1.5 flex-1 text-center">
            <span className="text-[11px] font-bold text-muted-foreground" style={{ filter: "blur(7px)", opacity: 0.55 }}>Vata</span>
            <span className="text-[11px] font-bold" style={{ filter: "blur(1px)", opacity: 0.95, color: "hsl(0 85% 50%)" }}>Pitta</span>
            <span className="text-[11px] font-bold text-muted-foreground" style={{ filter: "blur(7px)", opacity: 0.55 }}>Kapha</span>
          </div>
        </div>
      </div>
    </div>

    {/* Overlay CTA — sits in front of the blurred chart/grid */}
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <div className="bg-card/95 p-3 rounded-full shadow-lg mb-3 border border-border">
        <Lock className="w-6 h-6 text-primary" />
      </div>
      <p className="text-primary font-serif font-bold text-base md:text-lg text-center px-4 leading-tight drop-shadow-sm">
        Faça o teste para desbloquear seu mapa biológico
      </p>
      <p className="text-xs md:text-sm text-foreground/70 mt-1.5 text-center px-4 drop-shadow-sm">
        Identifique seu Agni e nível de agravamento hoje.
      </p>
    </div>
  </div>
);

const Hero = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [nivel, setNivel] = useState("");

  const canStart = !!(nome.trim() && idade.trim() && nivel);

  const handleStart = () => {
    if (!canStart) return;
    localStorage.setItem("dosha_test_info", JSON.stringify({ nome: nome.trim(), idade, nivel }));
    navigate("/teste-de-dosha");
  };

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(100deg, hsl(228 85% 88%) 0%, hsl(0 80% 90%) 50%, hsl(48 92% 85%) 100%)",
      }}
    >
      {/* Soft decorative shapes — reinforce the 3 portal tones */}
      <div className="absolute inset-0 opacity-50 pointer-events-none">
        <div className="absolute -top-10 -left-20 w-[28rem] h-[28rem] rounded-full blur-3xl" style={{ background: "#6B7FF2" }} />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[26rem] h-[26rem] rounded-full blur-3xl" style={{ background: "#F28888" }} />
        <div className="absolute -bottom-16 -right-20 w-[28rem] h-[28rem] rounded-full blur-3xl" style={{ background: "#F2CB05" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left: Preview teaser — equilibrado com card da direita (sem máscara fade) */}
          <div className="hidden lg:flex lg:col-span-7 items-center justify-center">
            <div className="bg-card/80 backdrop-blur-sm rounded-3xl px-8 py-10 xl:px-10 xl:py-12 border border-border shadow-lg w-full max-w-xl mx-auto">
              <DoshaPreview />
            </div>
          </div>

          {/* Right: Heading + Form */}
          <div className="lg:col-span-5 flex flex-col">
            <div
              className="animate-fade-in bg-card/80 backdrop-blur-sm rounded-3xl p-6 xl:p-8 border border-border shadow-lg flex flex-col justify-center space-y-5 h-full"
              style={{ animationDelay: "0.25s" }}
            >
              <div className="text-center">
                <h1 className="mb-2 text-2xl md:text-3xl lg:text-[36px]">
                  Seu guia completo para saúde e longevidade.
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Descubra e cuide dos seus Doshas por meio da medicina milenar.
                </p>
              </div>

              <hr className="border-border" />

              <p className="font-serif font-semibold text-foreground text-base text-center">
                Comece seu Teste de Dosha Gratuito
              </p>

              <div className="text-left space-y-3">
                <div>
                  <Label htmlFor="hero-nome" className="text-xs">Seu nome</Label>
                  <Input
                    id="hero-nome"
                    placeholder="Nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="hero-idade" className="text-xs">Idade</Label>
                    <Input
                      id="hero-idade"
                      type="number"
                      placeholder="30"
                      value={idade}
                      onChange={(e) => setIdade(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Nível de Ayurveda</Label>
                    <select
                      value={nivel}
                      onChange={(e) => setNivel(e.target.value)}
                      className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1",
                        "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        !nivel && "text-muted-foreground"
                      )}
                    >
                      <option value="" disabled>Selecione</option>
                      <option value="Iniciante">Iniciante</option>
                      <option value="Intermediário">Intermediário</option>
                      <option value="Avançado">Avançado</option>
                    </select>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleStart}
                disabled={!canStart}
                className="w-full bg-primary text-primary-foreground"
                size="lg"
              >
                Começar <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
