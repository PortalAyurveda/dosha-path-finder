import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DoshaPreview = () => (
  <div className="relative select-none pointer-events-none">
    <div className="grid grid-cols-2 gap-6">
      {/* Donut chart - blurred */}
      <div className="flex flex-col items-center justify-center space-y-3" style={{ filter: "blur(8px)", opacity: 0.5 }}>
        <p className="font-serif font-bold text-primary text-base">Pontuação</p>
        <div
          className="w-36 h-36 rounded-full relative shadow-inner flex items-center justify-center"
          style={{
            background: "conic-gradient(hsl(0 100% 68%) 0% 59.7%, hsl(228 100% 71%) 59.7% 92.3%, hsl(142 69% 58%) 92.3% 100%)",
          }}
        >
          <div className="w-20 h-20 bg-card rounded-full" />
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
          {/* Labels — progressive pitta intensity from bottom (faint) to top (sharp) */}
          <div className="flex flex-col justify-between text-[11px] font-bold py-1 pr-1 uppercase text-right leading-none">
            <span style={{ filter: "blur(1.5px)", opacity: 0.9, color: "hsl(0 80% 50%)" }}>Fixado</span>
            <span style={{ filter: "blur(3px)", opacity: 0.75, color: "hsl(0 100% 60%)" }}>Adoecido</span>
            <span style={{ filter: "blur(4.5px)", opacity: 0.6, color: "hsl(0 100% 72%)" }}>Acúmulo</span>
            <span style={{ filter: "blur(6px)", opacity: 0.45, color: "hsl(0 100% 82%)" }}>Normal</span>
            <span style={{ filter: "blur(7.5px)", opacity: 0.35, color: "hsl(0 100% 90%)" }}>Pouco</span>
          </div>

          {/* Grid columns: Vata / Pitta / Kapha */}
          <div className="grid grid-cols-3 gap-1.5 flex-1 h-[200px]">
            {/* Vata - blurred, level 3 */}
            <div className="flex flex-col gap-1" style={{ filter: "blur(8px)", opacity: 0.5 }}>
              <div className="flex-1 bg-muted/50 rounded-sm" />
              <div className="flex-1 bg-muted/50 rounded-sm" />
              <div className="flex-1 rounded-sm" style={{ background: "hsl(228 80% 72%)" }} />
              <div className="flex-1 rounded-sm" style={{ background: "hsl(228 90% 80%)" }} />
              <div className="flex-1 rounded-sm" style={{ background: "hsl(228 95% 90%)" }} />
            </div>
            {/* Pitta - highlighted, level 5 (FIXADO at top intense) */}
            <div className="flex flex-col gap-1" style={{ filter: "blur(1.5px)", opacity: 0.9 }}>
              <div className="flex-1 rounded-sm shadow-md" style={{ background: "hsl(0 80% 50%)" }} />
              <div className="flex-1 rounded-sm" style={{ background: "hsl(0 100% 62%)" }} />
              <div className="flex-1 rounded-sm" style={{ background: "hsl(0 100% 72%)" }} />
              <div className="flex-1 rounded-sm" style={{ background: "hsl(0 100% 84%)" }} />
              <div className="flex-1 rounded-sm" style={{ background: "hsl(0 100% 92%)" }} />
            </div>
            {/* Kapha - blurred, level 1 */}
            <div className="flex flex-col gap-1" style={{ filter: "blur(8px)", opacity: 0.5 }}>
              <div className="flex-1 bg-muted/50 rounded-sm" />
              <div className="flex-1 bg-muted/50 rounded-sm" />
              <div className="flex-1 bg-muted/50 rounded-sm" />
              <div className="flex-1 bg-muted/50 rounded-sm" />
              <div className="flex-1 rounded-sm shadow-sm" style={{ background: "hsl(142 60% 88%)" }} />
            </div>
          </div>
        </div>
        {/* Column labels */}
        <div className="flex gap-2">
          <div className="w-8 shrink-0" />
          <div className="grid grid-cols-3 gap-1.5 flex-1 text-center">
            <span className="text-[10px] font-bold text-muted-foreground" style={{ filter: "blur(8px)", opacity: 0.5 }}>Vata</span>
            <span className="text-[10px] font-bold" style={{ filter: "blur(1.5px)", opacity: 0.9, color: "hsl(0 80% 55%)" }}>Pitta</span>
            <span className="text-[10px] font-bold text-muted-foreground" style={{ filter: "blur(8px)", opacity: 0.5 }}>Kapha</span>
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
          "linear-gradient(110deg, hsl(228 82% 94%) 0%, hsl(0 78% 94%) 52%, hsl(48 92% 90%) 100%)",
      }}
    >
      {/* Soft decorative shapes */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-10 left-[8%] w-72 h-72 rounded-full blur-3xl" style={{ background: "#6B7FF2" }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl" style={{ background: "#F28888" }} />
        <div className="absolute bottom-10 right-[10%] w-64 h-64 rounded-full blur-3xl" style={{ background: "#F2CB05" }} />
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
