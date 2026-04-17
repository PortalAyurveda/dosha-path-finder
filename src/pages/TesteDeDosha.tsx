import { useState, useEffect, useRef } from "react";
import InterstitialLoading from "@/components/dosha/InterstitialLoading";
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
import { useUser } from "@/contexts/UserContext";
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
  { id: 'aliment', label: '🥗 Nutrição, Alimentação e Culinária' },
  { id: 'remedios', label: '🌿 Dravya Guna - Alquimia e Herbologia' },
  { id: 'mentoria', label: '📚 Estudos, mentoria e aprofundamento' },
  { id: 'espiritual', label: '🕉️ Espiritualidade e Existência' },
  { id: 'produtos', label: '🧴 Produtos Ayurvédicos e naturais' },
];

const TesteDeDosha = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setDoshaResultFromId } = useUser();
const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interstitialTarget, setInterstitialTarget] = useState<string | null>(null);

  // Info from Hero (localStorage)
  const [info, setInfo] = useState({ nome: '', idade: '', nivel: 'Iniciante', email: '', altura: '', peso: '', estado: '', cidade: '', paisCidade: '' });
  const [moraFora, setMoraFora] = useState(false);
  const [estados, setEstados] = useState<{ sigla: string; nome: string }[]>([]);
  const [cidades, setCidades] = useState<{ nome: string }[]>([]);
  const [loadingCidades, setLoadingCidades] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('dosha_test_info');
      if (stored) {
        const parsed = JSON.parse(stored);
        setInfo(prev => ({
          ...prev,
          nome: parsed.nome || '',
          idade: parsed.idade || '',
          nivel: parsed.nivel || 'Iniciante',
          email: parsed.email || '',
          altura: parsed.altura || '',
          peso: parsed.peso || '',
          estado: parsed.estado || '',
          cidade: parsed.cidade || '',
          paisCidade: parsed.paisCidade || '',
        }));
        if (parsed.paisCidade && !parsed.estado) setMoraFora(true);
      }
    } catch {}

    // Fetch estados from IBGE
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(r => r.json())
      .then(data => setEstados(data.map((e: any) => ({ sigla: e.sigla, nome: e.nome }))))
      .catch(() => {});
  }, []);

  // Fetch cidades when estado changes — preserve pre-filled cidade on first load
  const isFirstCidadesFetch = useRef(true);
  useEffect(() => {
    if (!info.estado || moraFora) return;
    setLoadingCidades(true);
    setCidades([]);
    if (!isFirstCidadesFetch.current) {
      setInfo(prev => ({ ...prev, cidade: '' }));
    }
    isFirstCidadesFetch.current = false;
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${info.estado}/municipios?orderBy=nome`)
      .then(r => r.json())
      .then(data => setCidades(data.map((c: any) => ({ nome: c.nome }))))
      .catch(() => {})
      .finally(() => setLoadingCidades(false));
  }, [info.estado, moraFora]);

  // Multi-select answers: each question can have multiple selected option indices
  const [answers, setAnswers] = useState<Record<string, number[]>>({});

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

  const toggleAnswer = (questionId: string, optionIndex: number) => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      if (current.includes(optionIndex)) {
        return { ...prev, [questionId]: current.filter(i => i !== optionIndex) };
      }
      return { ...prev, [questionId]: [...current, optionIndex] };
    });
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
    if (currentStep.part === 'interests') {
      if (!info.email || !info.altura || !info.peso) return false;
      if (moraFora) return !!info.paisCidade.trim();
      return !!(info.estado && info.cidade);
    }
    return true;
  };

  const handleNext = () => {
    if (!canAdvance()) {
      toast({ title: "Preencha os dados", description: "E-mail, altura e peso são obrigatórios.", variant: "destructive" });
      return;
    }
    if (step < totalSteps - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  const calculateResults = () => {
    let v = 0, p = 0, k = 0;
    let agni_irregular = 0, agni_forte = 0, agni_fraco = 0;

    // Sum from multi-select answers
    for (const [qId, optIndices] of Object.entries(answers)) {
      const question = ALL_QUESTIONS.find(q => q.id === qId);
      if (question) {
        for (const optIdx of optIndices) {
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
    }

    // Food tags: each adds 1 to its dosha
    selectedFoods.forEach(label => {
      const food = FOOD_TAGS.find(f => f.label === label);
      if (food) {
        if (food.dosha === 'v') v++;
        else if (food.dosha === 'p') p++;
        else k++;
      }
    });

    // Agravamentos: each adds 2 to its dosha
    v += agravVata.length * 2;
    p += agravPitta.length * 2;
    k += agravKapha.length * 2;

    // Age modifier
    const idade = parseInt(info.idade);
    if (idade > 50) v += 2;
    else if (idade >= 13) p += 2;
    else if (idade >= 1) k += 2;

    // IMC modifier
    let altura = parseFloat(info.altura);
    const peso = parseFloat(info.peso);
    if (altura > 3) altura = altura / 100; // cm to m
    const imc = peso / (altura * altura);

    if (imc < 18.5) v += 3;
    else if (imc <= 22.9) v += 2;
    else if (imc <= 26.9) { p += 1; k += 1; }
    else if (imc <= 29.9) { p += 2; k += 2; }
    else k += 3;

    // Dosha principal determination
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

    // Agni calculation with irregularity override
    const agniMap: Record<string, number> = { irregular: agni_irregular, forte: agni_forte, fraco: agni_fraco };
    const agniEntries = Object.entries(agniMap).sort(([, a], [, b]) => b - a);
    let agniWinner = agniEntries[0][0];
    const agniMaxScore = agniEntries[0][1];

    // Irregularity override: if winner is forte/fraco but irregular is within 2 pts, irregular wins
    if ((agniWinner === 'forte' || agniWinner === 'fraco') && agniMaxScore - agniMap.irregular <= 2) {
      agniWinner = 'irregular';
    }

    const agniNames: Record<string, string> = {
      irregular: 'Digestão inconstante ou irregular',
      forte: 'Digestão forte e intensa',
      fraco: 'Digestão fraca ou lenta',
    };

    // Use the winner's actual score for severity classification
    const agniWinnerScore = agniMap[agniWinner];

    let agniPrincipal: string;
    if (agniWinnerScore <= 2) {
      agniPrincipal = 'Digestão constante - boa';
    } else if (agniWinnerScore <= 6) {
      agniPrincipal = `${agniNames[agniWinner]} (nivel 1 Iniciando)`;
    } else if (agniWinnerScore <= 10) {
      agniPrincipal = `${agniNames[agniWinner]} (nivel 2 Moderado)`;
    } else {
      agniPrincipal = `${agniNames[agniWinner]} (nivel 3 Agravado)`;
    }

    return { v, p, k, doshaPrincipal, agniPrincipal, agni_irregular, agni_forte, agni_fraco, imc: parseFloat(imc.toFixed(2)) };
  };

  const handleSubmit = async () => {
    if (!canAdvance()) {
      toast({ title: "Preencha os dados", description: "E-mail, altura e peso são obrigatórios.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const idPublico = Math.random().toString(36).substring(2, 10).toUpperCase();
      const results = calculateResults();

      const vataTags = selectedFoods.filter(f => FOOD_TAGS.find(ft => ft.label === f)?.dosha === 'v');
      const pittaTags = selectedFoods.filter(f => FOOD_TAGS.find(ft => ft.label === f)?.dosha === 'p');
      const kaphaTags = selectedFoods.filter(f => FOOD_TAGS.find(ft => ft.label === f)?.dosha === 'k');

      // Visitor ID from browser
      const visitorIdBrowser = `${navigator.userAgent.slice(0, 20)}_${Date.now()}`;

      const dbPayload = {
        idPublico,
        email: info.email.toLowerCase(),
        nome: info.nome,
        idade: parseInt(info.idade),
        conhecimentoAyurveda: info.nivel || 'Iniciante',
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
        pais: moraFora ? 'Exterior' : 'Brasil',
        estado: moraFora ? null : info.estado,
        cidade: moraFora ? info.paisCidade.trim() : info.cidade,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('doshas_registros').insert(dbPayload);
      if (error) throw error;

      // Make this NEW test the active one immediately, so Header pie + name,
      // /meu-dosha, /metricas references and Akasha context all point to the
      // most recent test. Akasha can still fall back to email when no id is
      // in the URL.
      localStorage.setItem("activeDoshaId", idPublico);
      try {
        await setDoshaResultFromId(idPublico);
      } catch (e) {
        console.warn("[TesteDeDosha] setDoshaResultFromId failed", e);
      }

      // Webhook n8n in background
      const webhookPayload = {
        email: info.email.toLowerCase(),
        idPublico,
        visitorIdBrowser,
        title: info.nome,
        nome: info.nome,
        idade: parseInt(info.idade),
        'conhecimento ayurveda': info.nivel || 'Iniciante',
        altura: info.altura,
        peso: info.peso,
        imc: results.imc,
        datateste: new Date().toISOString(),
        vatascore: results.v,
        pittascore: results.p,
        kaphascore: results.k,
        doshaprincipal: results.doshaPrincipal,
        agniPrincipal: results.agniPrincipal,
        agniirregular: results.agni_irregular,
        agniforte: results.agni_forte,
        agnifraco: results.agni_fraco,
        relato_aberto: relatoAberto || '',
        agravVataTags: agravVata.join(', '),
        agravPittaTags: agravPitta.join(', '),
        agravKaphaTags: agravKapha.join(', '),
        alimVata: vataTags.join(', '),
        alimPitta: pittaTags.join(', '),
        alimKapha: kaphaTags.join(', '),
        aliment: interesses.includes('aliment') ? 'sim' : '',
        remedios: interesses.includes('remedios') ? 'sim' : '',
        mentoria: interesses.includes('mentoria') ? 'sim' : '',
        diagn: interesses.includes('mentoria') ? 'sim' : '',
        espiritual: interesses.includes('espiritual') ? 'sim' : '',
        produtos: interesses.includes('produtos') ? 'sim' : '',
      };

      fetch('https://n8n.portalayurveda.com/webhook/teste-dosha-ayurveda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload),
      }).catch(() => {});

      setInterstitialTarget(`/meu-dosha?id=${idPublico}`);
    } catch (err: any) {
      console.error(err);
      toast({ title: "Erro ao salvar", description: err.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionCard = (q: Question) => {
    const selected = answers[q.id] || [];
    return (
      <div key={q.id} className="space-y-3">
        <p className="font-serif font-semibold text-foreground text-base leading-snug">{q.text}</p>
        <p className="text-[10px] text-muted-foreground/60 italic">Pode marcar mais de uma opção</p>
        <div className="space-y-2">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => toggleAnswer(q.id, idx)}
              className={cn(
                "w-full text-left p-3.5 rounded-xl border-2 transition-all text-sm leading-snug",
                selected.includes(idx)
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
  };

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: '💨 Vata', items: AGRAVAMENTOS_VATA, selected: agravVata, dosha: 'v' as const, color: 'border-vata' },
          { label: '🔥 Pitta', items: AGRAVAMENTOS_PITTA, selected: agravPitta, dosha: 'p' as const, color: 'border-pitta' },
          { label: '🪨 Kapha', items: AGRAVAMENTOS_KAPHA, selected: agravKapha, dosha: 'k' as const, color: 'border-kapha' },
        ].map(group => (
          <div key={group.dosha} className={cn("border-l-4 pl-3 space-y-2", group.color)}>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{group.label}</p>
            <div className="space-y-1.5">
              {group.items.map(tag => (
                <label key={tag} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={group.selected.includes(tag)}
                    onCheckedChange={() => toggleAgrav(tag, group.dosha)}
                  />
                  <span className="text-sm">{tag}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInterestsStep = () => (
    <div className="space-y-5">
      {/* Email + Location */}
      <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border">
        <p className="font-serif font-semibold text-foreground text-sm">Dados complementares</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-3">
            <div>
              <Label htmlFor="email" className="text-xs">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={info.email} onChange={e => setInfo({ ...info, email: e.target.value })} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="altura" className="text-xs">Altura (m)</Label>
                <Input id="altura" placeholder="1.70" value={info.altura} onChange={e => setInfo({ ...info, altura: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="peso" className="text-xs">Peso (kg)</Label>
                <Input id="peso" placeholder="70" value={info.peso} onChange={e => setInfo({ ...info, peso: e.target.value })} className="mt-1" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {moraFora ? (
              <div>
                <Label htmlFor="paisCidade" className="text-xs">País e Cidade</Label>
                <Input
                  id="paisCidade"
                  placeholder="Lisboa, Portugal"
                  value={info.paisCidade}
                  onChange={e => setInfo({ ...info, paisCidade: e.target.value })}
                  className="mt-1"
                />
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="estado" className="text-xs">Estado</Label>
                  <select
                    id="estado"
                    value={info.estado}
                    onChange={e => setInfo({ ...info, estado: e.target.value })}
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1",
                      "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      !info.estado && "text-muted-foreground"
                    )}
                  >
                    <option value="" disabled>Selecione o estado</option>
                    {estados.map(e => (
                      <option key={e.sigla} value={e.sigla}>{e.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <Label htmlFor="cidade" className="text-xs">Cidade</Label>
                  <Input
                    id="cidade"
                    placeholder={loadingCidades ? "Carregando cidades..." : info.estado ? "Digite sua cidade..." : "Selecione o estado primeiro"}
                    value={info.cidade}
                    onChange={e => setInfo({ ...info, cidade: e.target.value })}
                    disabled={!info.estado || loadingCidades}
                    className="mt-1"
                    list="cidades-list"
                  />
                  {info.estado && cidades.length > 0 && (
                    <datalist id="cidades-list">
                      {cidades.map(c => (
                        <option key={c.nome} value={c.nome} />
                      ))}
                    </datalist>
                  )}
                  {loadingCidades && (
                    <Loader2 className="absolute right-3 top-8 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </>
            )}
            <button
              type="button"
              onClick={() => setMoraFora(!moraFora)}
              className="text-xs text-muted-foreground hover:text-primary underline transition-colors"
            >
              {moraFora ? "Moro no Brasil" : "Moro fora do Brasil"}
            </button>
          </div>
        </div>
      </div>

      {/* Interests */}
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

      {/* Relato */}
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

  if (interstitialTarget) {
    return <InterstitialLoading redirectTo={interstitialTarget} />;
  }

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
          {currentStep.part !== 'interests' && (
            <p className="text-xs text-muted-foreground/70 mt-2 italic">💡Atenção! Se não se encontrar em alguma pergunta, pode deixar em branco ou se ficar na dúvida pode marcar mais de uma. O teste se balanceia.</p>
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
