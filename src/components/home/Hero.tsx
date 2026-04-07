import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DoshaPreview = () => (
  <div className="relative select-none pointer-events-none">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          {/* Labels */}
          <div className="flex flex-col justify-between text-[10px] font-bold py-1 pr-1 uppercase text-right leading-none">
            <span style={{ filter: "blur(1.5px)", opacity: 0.85 }} className="text-pitta">Fixado</span>
            <span style={{ filter: "blur(8px)", opacity: 0.5 }} className="text-muted-foreground">Adoecido</span>
            <span style={{ filter: "blur(8px)", opacity: 0.5 }} className="text-muted-foreground">Acúmulo</span>
            <span style={{ filter: "blur(8px)", opacity: 0.5 }} className="text-muted-foreground">Normal</span>
            <span style={{ filter: "blur(8px)", opacity: 0.5 }} className="text-muted-foreground">Pouco</span>
          </div>

          {/* Grid columns: Vata / Pitta / Kapha */}
          <div className="grid grid-cols-3 gap-1.5 flex-1 h-[220px]">
            {/* Vata - blurred, level 3 */}
            <div className="flex flex-col gap-1" style={{ filter: "blur(8px)", opacity: 0.5 }}>
              <div className="flex-1 bg-muted/50 rounded-sm" />
              <div className="flex-1 bg-muted/50 rounded-sm" />
              <div className="flex-1 rounded-sm" style={{ background: "hsl(228 80% 72%)" }} />
              <div className="flex-1 rounded-sm" style={{ background: "hsl(228 90% 80%)" }} />
              <div className="flex-1 rounded-sm" style={{ background: "hsl(228 95% 90%)" }} />
            </div>
            {/* Pitta - highlighted, level 5 */}
            <div className="flex flex-col gap-1" style={{ filter: "blur(1.5px)", opacity: 0.85 }}>
              <div className="flex-1 rounded-sm shadow-md" style={{ background: "hsl(0 80% 50%)" }} />
              <div className="flex-1 rounded-sm" style={{ background: "hsl(0 100% 68%)" }} />
              <div className="flex-1 rounded-sm" style={{ background: "hsl(0 100% 76%)" }} />
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
        <div className="grid grid-cols-3 gap-1.5 ml-8 text-center">
          <span className="text-[10px] font-bold text-muted-foreground" style={{ filter: "blur(8px)", opacity: 0.5 }}>Vata</span>
          <span className="text-[10px] font-bold text-pitta" style={{ filter: "blur(1.5px)", opacity: 0.85 }}>Pitta</span>
          <span className="text-[10px] font-bold text-muted-foreground" style={{ filter: "blur(8px)", opacity: 0.5 }}>Kapha</span>
        </div>
      </div>
    </div>

    {/* Overlay CTA */}
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div className="bg-card/90 p-3 rounded-full shadow-lg mb-3 border border-border">
        <Lock className="w-7 h-7 text-primary" />
      </div>
      <p className="text-primary font-serif font-bold text-lg text-center px-4 leading-tight">
        Faça o teste para desbloquear seu mapa biológico
      </p>
      <p className="text-sm text-muted-foreground mt-1.5">
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
    <section className="relative overflow-hidden bg-surface-sun">
      {/* Warm decorative shapes */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-[10%] w-64 h-64 rounded-full bg-secondary blur-3xl" />
        <div className="absolute bottom-10 right-[15%] w-48 h-48 rounded-full bg-accent blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Preview teaser */}
          <div className="hidden lg:block lg:col-span-7">
            <div
              className="bg-card/80 backdrop-blur-sm rounded-3xl p-6 xl:p-8 border border-border shadow-lg"
              style={{
                maskImage: "linear-gradient(to right, black 80%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to right, black 80%, transparent 100%)",
              }}
            >
              <DoshaPreview />
            </div>
          </div>

          {/* Right: Heading + Form — same height as preview */}
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
