import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Hero = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [nivel, setNivel] = useState('');

  const canStart = !!(nome.trim() && idade.trim() && nivel);

  const handleStart = () => {
    if (!canStart) return;
    // Store in localStorage for TesteDeDosha to read
    localStorage.setItem('dosha_test_info', JSON.stringify({ nome: nome.trim(), idade, nivel }));
    navigate('/teste-de-dosha');
  };

  return (
    <section className="relative overflow-hidden bg-surface-sun">
      {/* Warm decorative shapes */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-[10%] w-64 h-64 rounded-full bg-secondary blur-3xl" />
        <div className="absolute bottom-10 right-[15%] w-48 h-48 rounded-full bg-accent blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-kapha blur-3xl opacity-50" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 text-center">
        <h1 className="animate-fade-in mb-4">
          Portal Ayurveda: Seu guia completo para saúde e longevidade.
        </h1>
        <p
          className="text-lg md:text-xl text-primary/70 max-w-2xl mx-auto mb-8 animate-fade-in"
          style={{ animationDelay: "0.15s" }}
        >
          Descubra e cuide dos seus Doshas por meio da medicina milenar.
        </p>

        {/* Inline form */}
        <div
          className="animate-fade-in max-w-md mx-auto bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-lg space-y-4"
          style={{ animationDelay: "0.25s" }}
        >
          <p className="font-serif font-semibold text-foreground text-base">Comece seu Teste de Dosha Gratuito</p>

          <div className="text-left space-y-3">
            <div>
              <Label htmlFor="hero-nome" className="text-xs">Seu nome</Label>
              <Input
                id="hero-nome"
                placeholder="Nome"
                value={nome}
                onChange={e => setNome(e.target.value)}
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
                  onChange={e => setIdade(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Nível de Ayurveda</Label>
                <div className="grid grid-cols-3 gap-1 mt-1">
                  {['Iniciante', 'Intermediário', 'Avançado'].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNivel(n)}
                      className={cn(
                        "p-2 rounded-lg border text-[10px] sm:text-xs font-medium transition-all",
                        nivel === n ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
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

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
