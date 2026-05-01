import { useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Frown,
  BatteryLow,
  Zap,
  AlertTriangle,
  ChevronDown,
  Check,
  Bot,
  Users,
  User,
} from "lucide-react";

// ============================================================
// /cursos/rotinas — Curso Rotinas Diárias Ayurvédicas
// Estrutura inspirada em /curso/formacao com identidade própria.
// ============================================================

const COLORS = {
  yellow: "#f2cb05",
  purple: "#352F54",
  graphite: "#2D3748",
  bg: "#FFF8EE",
  cta: "#FF7676",
};

const HOTMART = "https://pay.hotmart.com/F101182057Y";
const LOGO =
  "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/logo-rotinas.png";

const LeafButton = ({
  children,
  className = "",
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a
    target="_blank"
    rel="noopener noreferrer"
    className={`inline-flex items-center justify-center gap-2.5 font-bold text-xs md:text-sm uppercase tracking-wide px-8 md:px-12 py-4 shadow-md hover:shadow-xl transition-all hover:scale-[1.03] rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm w-full md:w-auto text-white ${className}`}
    style={{ background: COLORS.cta }}
    {...props}
  >
    {children}
  </a>
);

// ---------------- HERO ----------------
const Hero = () => (
  <section
    className="relative w-full py-14 md:py-20 overflow-hidden"
    style={{ background: COLORS.purple }}
  >
    <div
      className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-10 pointer-events-none"
      style={{ background: COLORS.yellow }}
      aria-hidden
    />
    <div
      className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-10 pointer-events-none"
      style={{ background: COLORS.yellow }}
      aria-hidden
    />

    <div className="relative max-w-4xl mx-auto px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="flex justify-center mb-6"
      >
        <img
          src={LOGO}
          alt="Rotinas Diárias Ayurvédicas"
          className="h-24 md:h-32 w-auto"
          loading="eager"
        />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="font-serif italic font-bold text-[28px] md:text-[44px] leading-[1.15] mb-5 text-white"
      >
        Tem hora pra tudo.
        <br />
        Até pra se cuidar da forma certa.
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-base md:text-lg max-w-2xl mx-auto mb-7 leading-relaxed space-y-4"
        style={{ color: "rgba(255,255,255,0.85)" }}
      >
        <p>
          Você acabou de descobrir seu Dosha. O próximo passo é colocar isso pra
          funcionar na sua vida — todos os dias.
        </p>
        <p>
          Até a dieta certa dá errado se o seu relógio biológico não está
          alinhado. Tudo começa com a rotina certa para o seu Dosha.
        </p>
        <p>
          Os pilares da saúde exigem horários precisos. Yoga, exercício,
          acordar, dormir, respirar, se alimentar. Tudo tem seu jeito certo e
          sua hora exata. Você vai entender como se comportar no dia a dia para
          extrair o melhor da sua saúde, energia e vitalidade.
        </p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-xs md:text-sm font-bold tracking-wide px-4 py-2 rounded-full inline-block mb-8"
        style={{ background: `${COLORS.yellow}25`, color: COLORS.yellow }}
      >
        Acesso Imediato e Vitalício | 100% Online
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <LeafButton href={HOTMART}>
          Quero organizar meu relógio biológico
        </LeafButton>
      </motion.div>
    </div>
  </section>
);

// ---------------- PARA QUEM ----------------
const PARA_QUEM = [
  {
    icon: Clock,
    title: "O Iniciante",
    text: "Quer iniciar no Ayurveda com base sólida, sem se perder no excesso de informações.",
  },
  {
    icon: Frown,
    title: "O Frustrado",
    text: "Tenta manter hábitos saudáveis, mas trava na falta de consistência e adaptação à vida real.",
  },
  {
    icon: BatteryLow,
    title: "O Exausto",
    text: "Sofre com oscilações de energia, má digestão ou sono que não restaura a vitalidade.",
  },
  {
    icon: Zap,
    title: "O Ocupado",
    text: "Não tem tempo a perder e precisa otimizar suas ações diárias com precisão.",
  },
];

const ParaQuem = () => (
  <section className="bg-white py-12 md:py-16">
    <div className="max-w-4xl mx-auto px-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="font-serif italic font-bold text-2xl md:text-3xl mb-10 text-center"
        style={{ color: COLORS.purple }}
      >
        Para Quem É Esta Jornada
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PARA_QUEM.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: (i % 2) * 0.06 }}
              className="flex items-start gap-3.5 p-5 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm"
            >
              <span
                className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: `${COLORS.yellow}30`, color: COLORS.purple }}
              >
                <Icon className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <div>
                <h3
                  className="font-serif font-bold text-base mb-1"
                  style={{ color: COLORS.purple }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: COLORS.graphite }}
                >
                  {item.text}
                </p>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  </section>
);

// ---------------- PROBLEMA ----------------
const Problema = () => (
  <section className="py-12 md:py-16" style={{ background: COLORS.bg }}>
    <div className="max-w-2xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="flex justify-center mb-5"
      >
        <span
          className="inline-flex items-center justify-center w-16 h-16 rounded-full"
          style={{ background: `${COLORS.yellow}30`, color: COLORS.yellow }}
        >
          <AlertTriangle className="h-8 w-8" strokeWidth={2.2} />
        </span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="font-serif italic font-bold text-2xl md:text-3xl mb-6 text-center"
        style={{ color: COLORS.purple }}
      >
        O Problema: Ação na Hora Errada
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-sm md:text-base leading-relaxed mb-8 space-y-4"
        style={{ color: COLORS.graphite }}
      >
        <p>
          Você tenta meditar com a mente fervendo. Faz treinos pesados à noite e
          perde o sono. Toma o remédio certo na hora errada.
        </p>
        <p>
          Fazer a coisa certa no momento errado desgasta o corpo e queima a
          vitalidade.
        </p>
        <p>
          <strong>O problema não é falta de esforço. É lutar contra a própria biologia.</strong>
        </p>
      </motion.div>

      {/* BOX DESTACADO TDAH */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="relative p-7 md:p-9 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm shadow-lg"
        style={{ background: COLORS.purple }}
      >
        <span
          className="absolute -top-4 left-5 font-serif italic font-bold leading-none select-none"
          style={{ color: COLORS.yellow, fontSize: "5.5rem" }}
          aria-hidden
        >
          “
        </span>
        <p
          className="font-serif italic font-bold text-base md:text-lg mb-4 leading-snug pt-2 text-white"
        >
          Não é sobre ter "foco" ou "dom natural".
        </p>
        <p className="text-sm md:text-base leading-relaxed text-white/90">
          Fui diagnosticado com TDAH cedo e recusei aceitar que viveria à base
          de remédios. Eu era a definição da desorganização mental e física. O
          Ayurveda foi minha cura justamente porque me deu uma estrutura
          mecânica do tempo. Transformei essa busca pessoal em um método
          organizado. Se funcionou para mim, a desculpa de "eu sou muito
          bagunçado para ter rotina" acaba aqui.
        </p>
      </motion.div>
    </div>
  </section>
);

// ---------------- SOLUÇÃO ----------------
const Solucao = () => (
  <section className="py-12 md:py-16 bg-white">
    <div className="max-w-3xl mx-auto px-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="font-serif italic font-bold text-2xl md:text-3xl mb-6 text-center"
        style={{ color: COLORS.purple }}
      >
        A Solução: Sincronia e Adaptabilidade
      </motion.h2>

      <div
        className="text-sm md:text-base leading-relaxed space-y-4 mb-8"
        style={{ color: COLORS.graphite }}
      >
        <p>
          A solução não é uma prisão de planilhas. É a compreensão mecânica do
          tempo.
        </p>
        <p>
          O segredo é o conceito ayurvédico de <strong>Satmia</strong> —
          adaptabilidade. Não é rigidez. É mudança gradual e realista que gera
          resultados duradouros.
        </p>
        <p>
          Ao alinhar suas ações com as forças que regem cada hora do dia, a
          manutenção da energia, do foco e da boa digestão tornam-se
          automáticas.
        </p>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="font-serif italic font-bold text-lg md:text-xl text-center pt-6 border-t"
        style={{ color: COLORS.purple, borderColor: `${COLORS.yellow}55` }}
      >
        Não é só assistir aulas. É aplicar pequenos ajustes no mesmo dia.
      </motion.p>
    </div>
  </section>
);

// ---------------- PROGRAMA ----------------
type Aula = { title: string; description: string };

const AULAS_PRINCIPAIS: Aula[] = [
  {
    title: "Aula 1 | Como Criar Rotinas Diárias Ayurvédicas",
    description:
      "Estratégias práticas para acordar, meditar e comer no momento certo. O relógio biológico não é rígido — é inteligente. Você aprende a trabalhar com ele, não contra ele.",
  },
  {
    title: "Aula 2 | Equilibrar Doshas na Vida Real",
    description:
      "Como Vata, Pitta e Kapha se manifestam nas suas necessidades diárias. Os canais de movimento (Srotas) e a importância dos estímulos matinais para um dia inteiro de energia.",
  },
  {
    title: "Aula 3 | As Três Fontes de Restauração",
    description:
      "Sono, nutrição e respiração — os três pilares que restauram o corpo. Ajustes finos para cada Dosha: a diferença crucial entre o sono de Pitta (descanso precoce) e o de Kapha (evitar letargia).",
  },
  {
    title: "Aula 4 | Como Meditar em 3 Estágios",
    description:
      "Técnica de meditação em 3 etapas: controle da mente, observação do meio, expansão da consciência. Como interromper o piloto automático e perceber o que realmente está acontecendo no seu corpo.",
  },
  {
    title: "Aula 5 | Qual Tipo de Yoga é Ideal para Seu Dosha",
    description:
      "Yoga Nidra, Ashtanga, Hatha — cada um serve para um Dosha específico. Erro comum: Pitta fazendo Ashtanga e alimentando ainda mais o fogo interno. A escolha certa muda completamente o resultado.",
  },
  {
    title: "Aula 6 | Rotinas de Meditação e Respiração por Dosha",
    description:
      "Guia tático do que fazer — e do que evitar — para acalmar Vata, esfriar Pitta e ativar Kapha. Não existe meditação universal. Cada constituição exige um gatilho diferente.",
  },
  {
    title: "Aula 7 | Como Respirar Corretamente",
    description:
      "Mecânica respiratória profunda. Uso do diafragma, capacidade pulmonar total e respiração nasal para controle físico e emocional. O Pranayama Ujjayi e os erros mais comuns que drenam energia sem você perceber.",
  },
  {
    title: "Aula 8 | O Guia Completo da Rotina Diária",
    description:
      "A influência matemática dos horários sobre os Doshas. Como estruturar manhã, almoço, tarde e noite. O relógio biológico ayurvédico: dormir entre 22h30 e 5h00 para máxima regeneração celular.",
  },
];

const AULAS_LAB: Aula[] = [
  {
    title: "Aula 9 | Meditação e Respiração para Vata",
    description:
      "Aterramento, alívio de inseguranças e direcionamento do Prana. Técnica para indução de sono profundo e fim da ansiedade.",
  },
  {
    title: "Aula 10 | Meditação e Respiração para Pitta",
    description:
      "Som Bhramari e visualização de cores frias para baixar a temperatura mental. Como esfriar a cabeça literalmente e parar de queimar energia à toa.",
  },
  {
    title: "Aula 11 | Meditação e Respiração para Kapha",
    description:
      "Técnicas respiratórias intensas para aumentar termogênese, limpar toxinas e ativar o sistema digestivo. 12 repetições de respiração ativadora para derreter a letargia física e mental.",
  },
];

const AulaItem = ({
  aula,
  index,
  isOpen,
  onToggle,
}: {
  aula: Aula;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.18) }}
    className="bg-white border border-gray-200 shadow-sm rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm overflow-hidden"
  >
    <button
      onClick={onToggle}
      className="w-full flex items-start gap-3 p-4 md:p-5 text-left"
      aria-expanded={isOpen}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span
            className="inline-flex items-center gap-1 text-[10px] md:text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{ background: `${COLORS.yellow}30`, color: COLORS.purple }}
          >
            💻 Online
          </span>
        </div>
        <h3
          className="font-serif font-bold text-base md:text-lg leading-snug"
          style={{ color: COLORS.purple }}
        >
          {aula.title}
        </h3>
      </div>
      <ChevronDown
        className="shrink-0 h-4 w-4 text-gray-500 transition-transform duration-300 mt-2"
        style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
      />
    </button>

    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <p
            className="px-4 md:px-5 pb-5 text-sm md:text-base leading-relaxed"
            style={{ color: COLORS.graphite }}
          >
            {aula.description}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

const Programa = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-12 md:py-16" style={{ background: COLORS.bg }}>
      <div className="max-w-3xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-serif italic font-bold text-2xl md:text-3xl mb-4 text-center"
          style={{ color: COLORS.purple }}
        >
          O Programa
        </motion.h2>

        <p
          className="text-sm md:text-base text-center mb-10 leading-relaxed max-w-2xl mx-auto"
          style={{ color: COLORS.graphite }}
        >
          Não é apenas um curso gravado. É um manual prático. A cada conceito,
          você recebe a ferramenta exata para aplicar.
        </p>

        <div className="space-y-3 mb-10">
          {AULAS_PRINCIPAIS.map((aula, i) => (
            <AulaItem
              key={i}
              aula={aula}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>

        {/* Separador */}
        <div className="flex items-center gap-4 my-10">
          <span
            className="flex-1 h-px"
            style={{ background: `${COLORS.purple}30` }}
            aria-hidden
          />
          <p
            className="font-serif italic font-bold text-sm md:text-base text-center px-2"
            style={{ color: COLORS.purple }}
          >
            Laboratório Prático Guiado — Em Áudio e Vídeo
          </p>
          <span
            className="flex-1 h-px"
            style={{ background: `${COLORS.purple}30` }}
            aria-hidden
          />
        </div>

        <div className="space-y-3">
          {AULAS_LAB.map((aula, i) => {
            const idx = AULAS_PRINCIPAIS.length + i;
            return (
              <AulaItem
                key={idx}
                aula={aula}
                index={idx}
                isOpen={openIndex === idx}
                onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ---------------- PROFESSOR ----------------
const PROFESSOR_BULLETS = [
  "15 anos de prática clínica ativa e mais de 5.000 consultas",
  "Mais de 4.500 alunos formados no Brasil e no mundo",
  "Lógica funcional pura, adaptada à realidade, alimentos e clima do brasileiro",
];

const Professor = () => (
  <section className="py-12 md:py-16 bg-white">
    <div className="max-w-4xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-10 items-start">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto md:mx-0"
        >
          <div
            className="w-[230px] h-[260px] md:w-[280px] md:h-[320px] flex items-center justify-center shadow-md rounded-t-full rounded-b-none"
            style={{ background: COLORS.yellow, border: `5px solid ${COLORS.purple}` }}
          >
            <User className="h-24 w-24 md:h-32 md:w-32" style={{ color: COLORS.purple }} strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <p
            className="text-[11px] uppercase tracking-widest font-bold mb-2"
            style={{ color: COLORS.yellow }}
          >
            Sobre o Professor
          </p>
          <h2
            className="font-serif italic font-bold text-2xl md:text-3xl mb-1"
            style={{ color: COLORS.purple }}
          >
            Edson Osorio
          </h2>
          <p className="text-xs md:text-sm text-gray-600 mb-5">
            Terapeuta Ayurveda | Professor | Fundador do Portal Ayurveda
          </p>

          <ul className="space-y-2.5 mb-8">
            {PROFESSOR_BULLETS.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="shrink-0 inline-flex items-center justify-center rounded-full mt-0.5"
                  style={{
                    width: 20,
                    height: 20,
                    background: `${COLORS.yellow}30`,
                    color: COLORS.yellow,
                  }}
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span
                  className="text-sm md:text-base leading-relaxed"
                  style={{ color: COLORS.graphite }}
                >
                  {b}
                </span>
              </li>
            ))}
          </ul>

          <h3
            className="font-serif italic font-bold text-lg md:text-xl mb-4"
            style={{ color: COLORS.purple }}
          >
            O Ecossistema de Apoio
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                icon: Bot,
                text: "Tutor de IA Ayurveda 24h — tira suas dúvidas de rotina a qualquer hora",
              },
              {
                icon: Users,
                text: "Comunidade de Alunos — troque resultados práticos com o grupo do Portal Ayurveda",
              },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 bg-white border border-gray-200 shadow-sm rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm"
                >
                  <span
                    className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: `${COLORS.yellow}30`, color: COLORS.purple }}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2.2} />
                  </span>
                  <p
                    className="text-sm leading-relaxed pt-1.5"
                    style={{ color: COLORS.graphite }}
                  >
                    {c.text}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

// ---------------- INVESTIMENTO ----------------
const INCLUSO = [
  "As 11 aulas do Método Rotinas Diárias",
  "Laboratório Prático de Meditação e Respiração (por Dosha)",
  "Acesso ao Tutor IA Ayurveda 24h",
  "Acesso à Comunidade de Alunos",
];

const Investimento = () => (
  <section className="py-14 md:py-20" style={{ background: COLORS.purple }}>
    <div className="max-w-3xl mx-auto px-6 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="font-serif italic font-bold text-2xl md:text-3xl mb-6 text-white"
      >
        Investimento
      </motion.h2>

      <p className="text-sm md:text-base text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed">
        A desorganização é o que mais rouba sua performance. Consultas, remédios
        e suplementos não funcionam se o relógio biológico estiver invertido.
        <br />
        <strong className="text-white">Resolva a base.</strong>
      </p>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="p-6 md:p-8 mb-8 text-left rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm shadow-xl bg-white"
      >
        <p
          className="text-[11px] uppercase tracking-widest font-bold mb-4"
          style={{ color: COLORS.yellow }}
        >
          O que está incluso
        </p>
        <ul className="space-y-2.5 mb-6">
          {INCLUSO.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="shrink-0 inline-flex items-center justify-center rounded-full mt-0.5"
                style={{
                  width: 20,
                  height: 20,
                  background: `${COLORS.yellow}30`,
                  color: COLORS.yellow,
                }}
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <span
                className="text-sm md:text-base leading-relaxed"
                style={{ color: COLORS.graphite }}
              >
                {item}
              </span>
            </li>
          ))}
        </ul>

        <div
          className="pt-5 border-t text-center"
          style={{ borderColor: `${COLORS.purple}20` }}
        >
          <p
            className="font-serif italic font-bold text-3xl md:text-4xl mb-1"
            style={{ color: COLORS.purple }}
          >
            12x de R$ 9,68
          </p>
          <p className="text-sm md:text-base" style={{ color: COLORS.graphite }}>
            ou <strong>R$ 97,00</strong> à vista
          </p>
        </div>
      </motion.div>

      <LeafButton href={HOTMART}>
        Quero assumir o controle da minha rotina agora
      </LeafButton>
    </div>
  </section>
);

// ---------------- FAQ ----------------
const FAQ_ITEMS = [
  {
    question: "Preciso ter feito outro curso de Ayurveda antes?",
    answer:
      "Não. Este é o ponto de partida ideal para sua saúde física e mental.",
  },
  {
    question: "Sou muito ansioso e nunca consegui meditar. Vou conseguir?",
    answer:
      "Sim. O método explica que tentar meditar com a mente agitada é um erro. Você aprenderá a usar a respiração mecânica para baixar a fervura antes de exigir foco da sua mente.",
  },
  {
    question: "Como recebo o acesso?",
    answer:
      "Imediatamente após a confirmação, no seu e-mail cadastrado. Garantia incondicional de 7 dias — cancele com um clique e receba 100% do valor de volta.",
  },
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-12 md:py-16" style={{ background: COLORS.bg }}>
      <div className="max-w-3xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-serif italic font-bold text-2xl md:text-3xl mb-10 text-center"
          style={{ color: COLORS.purple }}
        >
          Perguntas Frequentes
        </motion.h2>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="bg-white border border-gray-200 shadow-sm rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center gap-3 p-4 md:p-5 text-left"
                  aria-expanded={isOpen}
                >
                  <h3
                    className="flex-1 font-serif font-bold text-sm md:text-base leading-snug"
                    style={{ color: COLORS.purple }}
                  >
                    {item.question}
                  </h3>
                  <ChevronDown
                    className="shrink-0 h-4 w-4 text-gray-500 transition-transform duration-300"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p
                        className="px-4 md:px-5 pb-5 text-sm md:text-base leading-relaxed"
                        style={{ color: COLORS.graphite }}
                      >
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ---------------- FINAL CTA ----------------
const FinalCta = () => (
  <section className="py-14 md:py-20" style={{ background: COLORS.purple }}>
    <div className="max-w-3xl mx-auto px-6 text-center text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="text-base md:text-lg leading-relaxed space-y-4 mb-10"
      >
        <p>
          Você já percebeu que copiar a rotina dos outros não funciona.
        </p>
        <p>
          Você continuará lutando contra o próprio corpo até entender como ele
          foi projetado para operar.
        </p>
        <p className="font-serif italic font-bold text-xl md:text-2xl pt-2" style={{ color: COLORS.yellow }}>
          Agora é a hora de organizar a fundação.
        </p>
        <p>
          De parar de mascarar o cansaço e a má digestão — e alinhar sua vida ao
          seu ritmo natural.
        </p>
      </motion.div>

      <LeafButton href={HOTMART} className="!text-base !md:text-lg !px-10 !md:px-14 !py-5">
        Garantir minha vaga agora
      </LeafButton>
    </div>
  </section>
);

// ---------------- PAGE ----------------
const Rotinas = () => {
  useCallback(() => {}, []);

  return (
    <div className="bg-white">
      <Helmet>
        <title>Curso Rotinas Diárias Ayurvédicas | Portal Ayurveda</title>
        <meta
          name="description"
          content="Organize seu relógio biológico com o método ayurvédico. 11 aulas online, laboratório prático de meditação e respiração por Dosha. Acesso vitalício."
        />
        <meta property="og:title" content="Curso Rotinas Diárias Ayurvédicas | Portal Ayurveda" />
        <meta
          property="og:description"
          content="Organize seu relógio biológico com o método ayurvédico. 11 aulas, laboratório prático e tutor IA 24h."
        />
        <meta property="og:image" content={LOGO} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://www.portalayurveda.com/cursos/rotinas" />
      </Helmet>

      <main>
        <Hero />
        <ParaQuem />
        <Problema />
        <Solucao />
        <Programa />
        <Professor />
        <Investimento />
        <Faq />
        <FinalCta />
      </main>
    </div>
  );
};

export default Rotinas;
