import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DoshaPreview = () => (
  <div className="relative select-none pointer-events-none">
    <div className="grid grid-cols-2 gap-6 items-center">
      {/* Left: donut chart, blurred/faded */}
      <div className="flex flex-col items-center justify-center space-y-2" style={{ filter: "blur(6px)", opacity: 0.55 }}>
        <p className="font-serif font-bold text-primary text-sm">Pontuação</p>
        <div
          className="relative flex h-32 w-32 items-center justify-center rounded-full shadow-inner"
          style={{
            background: "conic-gradient(hsl(0 100% 78%) 0% 59.7%, hsl(228 92% 78%) 59.7% 92.3%, hsl(142 70% 76%) 92.3% 100%)",
          }}
        >
          <div className="h-20 w-20 rounded-full bg-card" />
        </div>
        <div className="space-y-0.5 text-center text-[11px] font-bold text-muted-foreground">
          <p>Vata: 30 pts</p>
          <p>Pitta: 55 pts</p>
          <p>Kapha: 7 pts</p>
        </div>
      </div>

      {/* Right: clinical chart, mostly faded but Pitta column highlighted */}
      <div className="flex flex-col space-y-2">
        <p className="text-center font-serif text-sm font-bold text-primary" style={{ filter: "blur(6px)", opacity: 0.55 }}>
          Quadro Clínico
        </p>

        <div className="flex gap-2">
          <div className="flex w-16 shrink-0 flex-col justify-between py-0.5 pr-1 text-right text-[10px] font-bold uppercase leading-tight">
            <span style={{ filter: "blur(0.5px)", opacity: 0.95, color: "hsl(0 85% 50%)" }}>Fixado</span>
            <span style={{ filter: "blur(1px)", opacity: 0.85, color: "hsl(0 92% 62%)" }}>Adoecido</span>
            <span style={{ filter: "blur(1.5px)", opacity: 0.7, color: "hsl(0 98% 74%)" }}>Acúmulo</span>
            <span style={{ filter: "blur(2px)", opacity: 0.55, color: "hsl(0 100% 84%)" }}>Normal</span>
            <span style={{ filter: "blur(2.5px)", opacity: 0.4, color: "hsl(0 100% 92%)" }}>Pouco</span>
          </div>

          <div className="grid h-[180px] flex-1 grid-cols-3 gap-1.5">
            <div className="flex flex-col gap-1" style={{ filter: "blur(6px)", opacity: 0.5 }}>
              <div className="flex-1 rounded-md bg-transparent" />
              <div className="flex-1 rounded-md bg-transparent" />
              <div className="flex-1 rounded-md" style={{ background: "hsl(228 88% 82%)" }} />
              <div className="flex-1 rounded-md" style={{ background: "hsl(228 90% 86%)" }} />
              <div className="flex-1 rounded-md bg-transparent" />
            </div>

            <div className="flex flex-col gap-1" style={{ filter: "blur(0.5px)", opacity: 0.95 }}>
              <div className="flex-1 rounded-md shadow-sm" style={{ background: "hsl(0 88% 54%)" }} />
              <div className="flex-1 rounded-md shadow-sm" style={{ background: "hsl(0 95% 68%)" }} />
              <div className="flex-1 rounded-md shadow-sm" style={{ background: "hsl(0 100% 78%)" }} />
              <div className="flex-1 rounded-md shadow-sm" style={{ background: "hsl(0 100% 86%)" }} />
              <div className="flex-1 rounded-md shadow-sm" style={{ background: "hsl(0 100% 92%)" }} />
            </div>

            <div className="flex flex-col gap-1" style={{ filter: "blur(6px)", opacity: 0.5 }}>
              <div className="flex-1 rounded-md bg-transparent" />
              <div className="flex-1 rounded-md bg-transparent" />
              <div className="flex-1 rounded-md bg-transparent" />
              <div className="flex-1 rounded-md bg-transparent" />
              <div className="flex-1 rounded-md" style={{ background: "hsl(142 62% 84%)" }} />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="w-16 shrink-0" />
          <div className="grid flex-1 grid-cols-3 gap-1.5 text-center">
            <span className="text-[10px] font-bold text-muted-foreground" style={{ filter: "blur(6px)", opacity: 0.55 }}>Vata</span>
            <span className="text-[10px] font-bold" style={{ filter: "blur(0.5px)", opacity: 0.95, color: "hsl(0 85% 50%)" }}>Pitta</span>
            <span className="text-[10px] font-bold text-muted-foreground" style={{ filter: "blur(6px)", opacity: 0.55 }}>Kapha</span>
          </div>
        </div>
      </div>
    </div>

    {/* Lock overlay centered */}
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <div className="mb-3 rounded-full border border-border bg-card/95 p-2.5 shadow-lg">
        <Lock className="h-5 w-5 text-primary" />
      </div>
      <p className="px-4 text-center font-serif text-[20px] font-bold leading-tight text-primary drop-shadow-sm md:text-[24px]">
        Faça o teste para desbloquear seu mapa biológico
      </p>
      <p className="mt-1.5 px-4 text-center text-xs text-foreground/70 drop-shadow-sm md:text-sm">
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
          "linear-gradient(100deg, hsl(228 70% 96%) 0%, hsl(0 70% 97%) 50%, hsl(48 80% 95%) 100%)",
      }}
    >
      {/* Soft decorative shapes — reinforce the 3 portal tones (very subtle) */}
      <div className="absolute inset-0 opacity-25 pointer-events-none">
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
              <div className="text-center not-italic">
                <h1 className="mb-2 text-2xl md:text-3xl font-semibold lg:text-2xl not-italic">
                  Seu guia completo para saúde e longevidade.
                </h1>
                <p className="text-sm md:text-base lg:text-base text-muted-foreground not-italic">
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
