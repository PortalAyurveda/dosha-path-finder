import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  PART1_QUESTIONS, PART2_QUESTIONS, PART3_QUESTIONS, PART4_QUESTIONS,
  PART5_QUESTIONS, PART6_QUESTIONS, PART7_QUESTIONS,
  FOOD_TAGS, AGRAVAMENTOS_VATA, AGRAVAMENTOS_PITTA, AGRAVAMENTOS_KAPHA,
  ALL_QUESTIONS, STEP_CONFIG, type Question,
} from "@/data/doshaTestQuestions";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const QUESTIONS_BY_STEP: Record<string, Question[]> = {
  part1: PART1_QUESTIONS,
  part2: PART2_QUESTIONS,
  part3: PART3_QUESTIONS,
  part4: PART4_QUESTIONS,
  part5: PART5_QUESTIONS,
  part6: PART6_QUESTIONS,
  part7: PART7_QUESTIONS,
};

const INTERESSE_OPTIONS = [
  { id: 'aliment', label: '🥗 Nutrição Ayurvédica' },
  { id: 'remedios', label: '🌿 Herbologia / Remédios' },
  { id: 'mentoria', label: '📚 Estudos / Mentoria' },
  { id: 'espiritual', label: '🕉️ Espiritualidade' },
  { id: 'produtos', label: '🧴 Produtos Naturais' },
];

const TesteDeDosha = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Personal info
  const [info, setInfo] = useState({ nome: '', email: '', idade: '', altura: '', peso: '', nivel: '' });

  // Answers for radio questions
  const [answers, setAnswers] = useState<Record<string, number>>({});

  // Food tags (multi-select)
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);

  // Agravamentos (checkboxes)
  const [agravVata, setAgravVata] = useState<string[]>([]);
  const [agravPitta, setAgravPitta] = useState<string[]>([]);
  const [agravKapha, setAgravKapha] = useState<string[]>([]);

  // Interests
  const [interesses, setInteresses] = useState<string[]>([]);
  const [relatoAberto, setRelatoAberto] = useState('');

  const totalSteps = STEP_CONFIG.length;
  const progress = ((step + 1) / totalSteps) * 100;
  const currentStep = STEP_CONFIG[step];

  const setAnswer = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const toggleFood = (label: string) => {
    setSelectedFoods(prev =>
      prev.includes(label) ? prev.filter(f => f !== label) : [...prev, label]
    );
  };

  const toggleAgrav = (tag: string, dosha: 'v' | 'p' | 'k') => {
    const setter = dosha === 'v' ? setAgravVata : dosha === 'p' ? setAgravPitta : setAgravKapha;
    setter(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const toggleInteresse = (id: string) => {
    setInteresses(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const canAdvance = (): boolean => {
    if (currentStep.part === 'info') {
      return !!(info.nome && info.email && info.idade && info.altura && info.peso && info.nivel);
    }
    return true; // all question steps are optional now
  };

  const handleNext = () => {
    if (!canAdvance()) {
      toast({ title: "Preencha os dados básicos", description: "Nome, e-mail, idade, altura, peso e nível são obrigatórios.", variant: "destructive" });
      return;
    }
    if (step < totalSteps - 1) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const calculateResults = () => {
    let v = 0, p = 0, k = 0;
    let agni_irregular = 0, agni_forte = 0, agni_fraco = 0;

    // Sum from radio answers
    for (const [qId, optIdx] of Object.entries(answers)) {
      const question = ALL_QUESTIONS.find(q => q.id === qId);
      if (question) {
        const opt = question.options[optIdx];
        if (opt) {
          v += opt.scores.v || 0;
          p += opt.scores.p || 0;
          k += opt.scores.k || 0;
          agni_irregular += opt.scores.agni_irregular || 0;
          agni_forte += opt.scores.agni_forte || 0;
          agni_fraco += opt.scores.agni_fraco || 0;
        }
      }
    }

    // Food tags
    selectedFoods.forEach(label => {
      const food = FOOD_TAGS.find(f => f.label === label);
      if (food) {
        if (food.dosha === 'v') v++;
        else if (food.dosha === 'p') p++;
        else k++;
      }
    });

    // Agravamentos
    v += agravVata.length;
    p += agravPitta.length;
    k += agravKapha.length;

    // Age scoring
    const idade = parseInt(info.idade);
    if (idade > 50) v += 2;
    else if (idade >= 13) p += 2;
    else k += 2;

    // IMC scoring
    let altura = parseFloat(info.altura);
    const peso = parseFloat(info.peso);
    if (altura > 3) altura = altura / 100; // cm to m
    const imc = peso / (altura * altura);

    if (imc < 18.5) v += 3;
    else if (imc < 23) v += 2;
    else if (imc < 27) { p += 1; k += 1; }
    else if (imc < 30) { p += 2; k += 2; }
    else k += 3;

    // Dosha principal
    const scores = [
      { name: 'Vata', score: v },
      { name: 'Pitta', score: p },
      { name: 'Kapha', score: k },
    ].sort((a, b) => b.score - a.score);

    let doshaPrincipal: string;
    if (scores[0].score - scores[1].score >= 5) {
      doshaPrincipal = scores[0].name;
    } else {
      const top2 = [scores[0].name, scores[1].name];
      const ordered = ['Vata', 'Pitta', 'Kapha'].filter(d => top2.includes(d));
      doshaPrincipal = ordered.join('-');
    }

    // Agni calculation
    const agniMap: Record<string, number> = { irregular: agni_irregular, forte: agni_forte, fraco: agni_fraco };
    const agniEntries = Object.entries(agniMap).sort(([, a], [, b]) => b - a);
    let agniWinner = agniEntries[0][0];
    const agniMaxScore = agniEntries[0][1];

    if ((agniWinner === 'forte' || agniWinner === 'fraco') && agniMaxScore - agniMap.irregular <= 2) {
      agniWinner = 'irregular';
    }

    const agniNames: Record<string, string> = {
      irregular: 'Agni Irregular (Vishama)',
      forte: 'Agni Intenso (Tikshna)',
      fraco: 'Agni Fraco (Manda)',
    };

    let agniPrincipal: string;
    if (agniMaxScore <= 2) {
      agniPrincipal = 'Digestão constante - boa';
    } else if (agniMaxScore <= 6) {
      agniPrincipal = `${agniNames[agniWinner]} (nível 1 Iniciando)`;
    } else if (agniMaxScore <= 10) {
      agniPrincipal = `${agniNames[agniWinner]} (nível 2 Moderado)`;
    } else {
      agniPrincipal = `${agniNames[agniWinner]} (nível 3 Agravado)`;
    }

    return { v, p, k, doshaPrincipal, agniPrincipal, agni_irregular, agni_forte, agni_fraco, imc: parseFloat(imc.toFixed(2)) };
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const idPublico = Math.random().toString(36).substring(2, 10).toUpperCase();
      const results = calculateResults();

      const vataTags = selectedFoods.filter(f => FOOD_TAGS.find(ft => ft.label === f)?.dosha === 'v');
      const pittaTags = selectedFoods.filter(f => FOOD_TAGS.find(ft => ft.label === f)?.dosha === 'p');
      const kaphaTags = selectedFoods.filter(f => FOOD_TAGS.find(ft => ft.label === f)?.dosha === 'k');

      const payload = {
        id: crypto.randomUUID(),
        idPublico,
        email: info.email.toLowerCase(),
        nome: info.nome,
        idade: parseInt(info.idade),
        conhecimentoAyurveda: info.nivel,
        altura: info.altura,
        peso: info.peso,
        imc: results.imc,
        vatascore: results.v,
        pittascore: results.p,
        kaphascore: results.k,
        doshaprincipal: results.doshaPrincipal,
        agniPrincipal: results.agniPrincipal,
        agniirregular: results.agni_irregular,
        agniforte: results.agni_forte,
        agnifraco: results.agni_fraco,
        relato_aberto: relatoAberto || null,
        agravVataTags: agravVata.join(', ') || null,
        agravPittaTags: agravPitta.join(', ') || null,
        agravKaphaTags: agravKapha.join(', ') || null,
        alimVata: vataTags.join(', ') || null,
        alimPitta: pittaTags.join(', ') || null,
        alimKapha: kaphaTags.join(', ') || null,
        aliment: interesses.includes('aliment') ? 'sim' : null,
        remedios: interesses.includes('remedios') ? 'sim' : null,
        mentoria: interesses.includes('mentoria') ? 'sim' : null,
        diagn: interesses.includes('mentoria') ? 'sim' : null,
        espiritual: interesses.includes('espiritual') ? 'sim' : null,
        produtos: interesses.includes('produtos') ? 'sim' : null,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('doshas_registros2').insert(payload);
      if (error) throw error;

      // Webhook in background
      fetch('https://n8n.portalayurveda.com/webhook/teste-dosha-ayurveda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});

      navigate(`/meu-dosha?id=${idPublico}`);
    } catch (err: any) {
      console.error(err);
      toast({ title: "Erro ao salvar", description: err.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionCard = (q: Question) => (
    <div key={q.id} className="space-y-3">
      <p className="font-serif font-semibold text-foreground text-base leading-snug">{q.text}</p>
      <div className="space-y-2">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setAnswer(q.id, idx)}
            className={cn(
              "w-full text-left p-3.5 rounded-xl border-2 transition-all text-sm leading-snug",
              answers[q.id] === idx
                ? "border-primary bg-primary/10 font-medium"
                : "border-border bg-card hover:border-primary/40"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  const renderInfoStep = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" placeholder="Seu nome" value={info.nome} onChange={e => setInfo({ ...info, nome: e.target.value })} />
      </div>
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" placeholder="seu@email.com" value={info.email} onChange={e => setInfo({ ...info, email: e.target.value })} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="idade">Idade</Label>
          <Input id="idade" type="number" placeholder="30" value={info.idade} onChange={e => setInfo({ ...info, idade: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="altura">Altura (m)</Label>
          <Input id="altura" placeholder="1.70" value={info.altura} onChange={e => setInfo({ ...info, altura: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="peso">Peso (kg)</Label>
          <Input id="peso" placeholder="70" value={info.peso} onChange={e => setInfo({ ...info, peso: e.target.value })} />
        </div>
      </div>
      <div>
        <Label>Nível de Ayurveda</Label>
        <div className="grid grid-cols-3 gap-2 mt-1">
          {['Iniciante', 'Intermediário', 'Avançado'].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setInfo({ ...info, nivel: n })}
              className={cn(
                "p-3 rounded-xl border-2 text-sm font-medium transition-all",
                info.nivel === n ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFoodStep = () => (
    <div className="space-y-4 mt-4">
      <p className="font-serif font-semibold text-foreground text-base">Quais alimentos você mais consome? (múltipla escolha)</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: '💨 Vata', subtitle: 'Secos / Leves / Frios', dosha: 'v' as const, color: 'border-vata' },
          { label: '🔥 Pitta', subtitle: 'Quentes / Ácidos / Picantes', dosha: 'p' as const, color: 'border-pitta' },
          { label: '🪨 Kapha', subtitle: 'Pesados / Doces / Densos', dosha: 'k' as const, color: 'border-kapha' },
        ].map(group => (
          <div key={group.dosha} className={cn("border-l-4 pl-3 space-y-2", group.color)}>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{group.label}</p>
            <p className="text-[10px] text-muted-foreground/70">{group.subtitle}</p>
            <div className="space-y-1.5">
              {FOOD_TAGS.filter(f => f.dosha === group.dosha).map(f => (
                <label key={f.label} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedFoods.includes(f.label)}
                    onCheckedChange={() => toggleFood(f.label)}
                  />
                  <span className="text-sm">{f.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAgravamentosStep = () => (
    <div className="space-y-6">
      {[
        { label: '💨 Agravamentos Vata', items: AGRAVAMENTOS_VATA, selected: agravVata, dosha: 'v' as const, color: 'border-vata' },
        { label: '🔥 Agravamentos Pitta', items: AGRAVAMENTOS_PITTA, selected: agravPitta, dosha: 'p' as const, color: 'border-pitta' },
        { label: '🪨 Agravamentos Kapha', items: AGRAVAMENTOS_KAPHA, selected: agravKapha, dosha: 'k' as const, color: 'border-kapha' },
      ].map(group => (
        <div key={group.dosha} className={cn("border-l-4 pl-3 space-y-2", group.color)}>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{group.label}</p>
          <div className="flex flex-wrap gap-2">
            {group.items.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleAgrav(tag, group.dosha)}
                className={cn(
                  "px-3 py-1.5 rounded-full border text-xs transition-all",
                  group.selected.includes(tag)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:border-primary/40"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderInterestsStep = () => (
    <div className="space-y-5">
      <div>
        <p className="font-serif font-semibold text-foreground text-base mb-3">Quais áreas te interessam mais?</p>
        <div className="space-y-2">
          {INTERESSE_OPTIONS.map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggleInteresse(opt.id)}
              className={cn(
                "w-full text-left p-3.5 rounded-xl border-2 transition-all text-sm",
                interesses.includes(opt.id)
                  ? "border-primary bg-primary/10 font-medium"
                  : "border-border hover:border-primary/40"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="relato">Relato aberto (opcional)</Label>
        <Textarea
          id="relato"
          placeholder="Descreva suas queixas, objetivos ou qualquer informação que considere relevante..."
          value={relatoAberto}
          onChange={e => setRelatoAberto(e.target.value)}
          className="mt-1 min-h-[120px]"
        />
      </div>
    </div>
  );

  const renderStepContent = () => {
    const part = currentStep.part;
    if (part === 'info') return renderInfoStep();
    if (part === 'part8') return renderAgravamentosStep();
    if (part === 'interests') return renderInterestsStep();

    const questions = QUESTIONS_BY_STEP[part];
    if (!questions) return null;

    return (
      <div className="space-y-6">
        {questions.map(q => renderQuestionCard(q))}
        {part === 'part2' && renderFoodStep()}
      </div>
    );
  };

  const isLastStep = step === totalSteps - 1;

  return (
    <PageContainer title="Teste de Dosha" description="Descubra seu dosha predominante com nosso teste personalizado baseado no Ayurveda.">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-3 pt-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Etapa {step + 1} de {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Header */}
        <div className="mb-6 mt-4">
          <h1 className="font-serif text-2xl font-bold text-foreground">{currentStep.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{currentStep.subtitle}</p>
          {currentStep.part !== 'info' && currentStep.part !== 'interests' && (
            <p className="text-xs text-muted-foreground/70 mt-2 italic">💡 Se não se encontrar em alguma pergunta, pode deixar em branco.</p>
          )}
        </div>

        {/* Content */}
        <div className="min-h-[40vh]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-8 mb-12 sticky bottom-4">
          {step > 0 && (
            <Button variant="outline" onClick={handlePrev} className="flex-1">
              <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
            </Button>
          )}
          {isLastStep ? (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-primary text-primary-foreground">
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...</> : '🧘 Calcular Resultado'}
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex-1">
              Próximo <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default TesteDeDosha;
