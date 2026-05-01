import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Clock,
  Sprout,
  Compass,
  Zap,
  AlertCircle,
  ChevronDown,
  Check,
  Bot,
  Users,
  User,
  Sun,
  Moon,
  Sunrise,
  Wind,
  Heart,
  Leaf,
  Plus,
  Minus,
} from "lucide-react";

// ============================================================
// /cursos/rotinas — Curso Rotinas Diárias Ayurvédicas
// Design system: usa tokens semânticos (primary, secondary,
// accent, surface-sun, bg-soft). Tema dia/noite/sol/lua.
// ============================================================

const HOTMART = "https://pay.hotmart.com/F101182057Y";
const LOGO =
  "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/logo-rotinas.png";

// ---------------- BOTÃO BASE (Forma de Folha) ----------------
const LeafCTA = ({
  children,
  href = HOTMART,
  variant = "secondary",
  className = "",
}: {
  children: React.ReactNode;
  href?: string;
  variant?: "secondary" | "inverted";
  className?: string;
}) => {
  const base =
    "inline-flex items-center justify-center gap-2.5 font-bold text-xs md:text-sm uppercase tracking-wide px-8 md:px-12 py-4 shadow-md hover:shadow-xl transition-all hover:scale-[1.03] rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm";
  const styles =
    variant === "inverted"
      ? "bg-accent text-primary hover:bg-accent/90"
      : "bg-secondary text-secondary-foreground hover:bg-secondary/90";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </a>
  );
};

// ---------------- ÍCONE EM CÍRCULO SUTIL ----------------
const IconBubble = ({
  Icon,
  tone = "secondary",
  size = "md",
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tone?: "primary" | "secondary" | "white";
  size?: "md" | "lg";
}) => {
  const dim = size === "lg" ? "w-14 h-14" : "w-12 h-12";
  const inner = size === "lg" ? "w-7 h-7" : "w-6 h-6";
  const bg =
    tone === "white"
      ? "bg-white"
      : tone === "primary"
        ? "bg-white"
        : "bg-white";
  const color =
    tone === "primary"
      ? "text-primary"
      : tone === "white"
        ? "text-primary"
        : "text-secondary";
  return (
    <span
      className={`shrink-0 ${dim} rounded-full ${bg} shadow-sm flex items-center justify-center`}
    >
      <Icon className={`${inner} ${color}`} strokeWidth={2} />
    </span>
  );
};

// ---------------- SEÇÃO 1: HERO ----------------
const Hero = () => (
  <section className="relative w-full py-14 md:py-20 overflow-hidden bg-accent">
    {/* Sol gigante de fundo, sutil */}
    <Sun
      className="absolute -top-16 -right-16 w-[420px] h-[420px] text-primary opacity-[0.05] pointer-events-none"
      strokeWidth={1}
      aria-hidden
    />
    <Sunrise
      className="absolute -bottom-12 -left-12 w-72 h-72 text-primary opacity-[0.06] pointer-events-none"
      strokeWidth={1}
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
        className="font-serif italic font-bold text-[28px] md:text-[44px] leading-[1.15] mb-5 text-primary"
      >
        Tem hora pra tudo.
        <br />
        Até pra se cuidar da forma certa.
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-base md:text-lg max-w-2xl mx-auto mb-7 leading-relaxed space-y-4 text-primary/85"
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
          sua hora exata.
        </p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-xs md:text-sm font-bold tracking-wide px-4 py-2 rounded-full inline-block mb-8 bg-primary text-accent"
      >
        Acesso Imediato e Vitalício | 100% Online
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <LeafCTA href="#investimento">Quero organizar meu relógio biológico</LeafCTA>
      </motion.div>
    </div>
  </section>
);

// ---------------- SEÇÃO 2: PARA QUEM ----------------
const PARA_QUEM = [
  {
    icon: Sprout,
    title: "O Iniciante",
    text: "Quer dar o primeiro passo no Ayurveda com base sólida e clareza — sem se perder em informações soltas.",
  },
  {
    icon: Compass,
    title: "O Buscador",
    text: "Já tenta manter bons hábitos e quer um sistema que realmente funcione na sua rotina real.",
  },
  {
    icon: Zap,
    title: "O Animado",
    text: "Percebeu que energia, digestão e sono têm tudo a ver com o momento certo de cada ação.",
  },
  {
    icon: Clock,
    title: "O Ocupado",
    text: "Quer otimizar seu tempo e extrair o máximo da saúde sem complicar a rotina.",
  },
];

const ParaQuem = () => (
  <section className="bg-surface-sun py-12 md:py-16">
    <div className="max-w-4xl mx-auto px-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="font-serif italic font-bold text-2xl md:text-3xl mb-10 text-center text-primary"
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
              className="flex items-start gap-4 p-5 bg-white shadow-sm hover:shadow-md transition-shadow rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm"
            >
              <IconBubble Icon={Icon} tone="secondary" />
              <div>
                <h3 className="font-serif font-bold text-base mb-1 text-primary">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-primary/75">
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

// ---------------- SEÇÃO 3: PROBLEMA ----------------
const Problema = () => (
  <section className="relative py-14 md:py-18 bg-secondary overflow-hidden">
    <Clock
      className="absolute -top-10 -right-10 w-72 h-72 text-white opacity-[0.08] pointer-events-none"
      strokeWidth={1}
      aria-hidden
    />
    <div className="relative max-w-2xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="flex justify-center mb-5"
      >
        <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-sm">
          <AlertCircle className="w-7 h-7 text-secondary" strokeWidth={2} />
        </span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="font-serif italic font-bold text-2xl md:text-3xl mb-6 text-center text-white"
      >
        O Problema: Ação na Hora Errada
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-sm md:text-base leading-relaxed space-y-4 text-white/95"
      >
        <p>
          Você tenta meditar com a mente fervendo. Faz treinos pesados à noite e
          perde o sono. Toma o remédio certo na hora errada.
        </p>
        <p>
          Fazer a coisa certa no momento errado desgasta o corpo e queima a
          vitalidade.
        </p>
        <p className="font-serif italic font-bold text-base md:text-lg text-white">
          O problema não é falta de esforço. É lutar contra a própria biologia.
        </p>
      </motion.div>
    </div>
  </section>
);

// ---------------- SEÇÃO 4: SOLUÇÃO ----------------
const Solucao = () => (
  <section className="py-12 md:py-16 bg-bg-soft">
    <div className="max-w-3xl mx-auto px-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="font-serif italic font-bold text-2xl md:text-3xl mb-8 text-center text-primary"
      >
        A Solução: Sincronia e Adaptabilidade
      </motion.h2>

      <div className="text-sm md:text-base leading-relaxed space-y-4 mb-8 text-primary/85">
        <p>
          A solução não é uma <span className="bg-accent/30 px-1">prisão de planilhas</span>.
          É a compreensão mecânica do tempo.
        </p>
        <p>
          O segredo é o conceito ayurvédico de{" "}
          <span className="bg-accent/30 px-1 font-bold">Satmia</span> —
          adaptabilidade. Não é rigidez. É mudança gradual e realista que gera
          resultados duradouros.
        </p>
        <p>
          Ao alinhar suas ações com as forças que regem cada hora do dia, a
          manutenção da <span className="bg-accent/30 px-1">energia</span>, do{" "}
          <span className="bg-accent/30 px-1">foco</span> e da{" "}
          <span className="bg-accent/30 px-1">boa digestão</span> tornam-se
          automáticas.
        </p>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="font-serif italic font-bold text-lg md:text-xl text-center pt-6 border-t border-accent/40 text-primary"
      >
        Não é só assistir aulas. É aplicar pequenos ajustes no mesmo dia.
      </motion.p>
    </div>
  </section>
);

// ---------------- SEÇÃO 5: PROGRAMA ----------------
type Aula = { title: string; description: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> };

const BLOCO_1: Aula[] = [
  {
    icon: Clock,
    title: "Aula 1 | Como Criar Rotinas Diárias Ayurvédicas",
    description:
      "Estratégias práticas para acordar, meditar e comer no momento certo. O relógio biológico não é rígido — é inteligente.",
  },
  {
    icon: Compass,
    title: "Aula 2 | Equilibrar Doshas na Vida Real",
    description:
      "Como Vata, Pitta e Kapha se manifestam nas suas necessidades diárias. Os canais de movimento (Srotas) e a importância dos estímulos matinais.",
  },
  {
    icon: Sun,
    title: "Aula 8 | O Guia Completo da Rotina Diária",
    description:
      "A influência matemática dos horários sobre os Doshas. Como estruturar manhã, almoço, tarde e noite. Dormir entre 22h30 e 5h00 para máxima regeneração celular.",
  },
];

const BLOCO_2: Aula[] = [
  {
    icon: Moon,
    title: "Aula 3 | As Três Fontes de Restauração",
    description:
      "Sono, nutrição e respiração — os três pilares que restauram o corpo. Ajustes finos para cada Dosha.",
  },
  {
    icon: Heart,
    title: "Aula 4 | Como Meditar em 3 Estágios",
    description:
      "Técnica de meditação em 3 etapas: controle da mente, observação do meio, expansão da consciência.",
  },
  {
    icon: Leaf,
    title: "Aula 5 | Qual Tipo de Yoga é Ideal para Seu Dosha",
    description:
      "Yoga Nidra, Ashtanga, Hatha — cada um serve para um Dosha específico. A escolha certa muda completamente o resultado.",
  },
  {
    icon: Sprout,
    title: "Aula 6 | Rotinas de Meditação e Respiração por Dosha",
    description:
      "Guia tático do que fazer — e do que potencializar — para acalmar Vata, esfriar Pitta e ativar Kapha.",
  },
  {
    icon: Wind,
    title: "Aula 7 | Como Respirar Corretamente",
    description:
      "Mecânica respiratória profunda. Diafragma, capacidade pulmonar total e respiração nasal. O Pranayama Ujjayi no dia a dia.",
  },
];

const BLOCO_3: Aula[] = [
  {
    icon: Wind,
    title: "Aula 9 | Prática para Vata",
    description:
      "Aterramento, alívio de inseguranças e direcionamento do Prana. Técnica para indução de sono profundo.",
  },
  {
    icon: Sun,
    title: "Aula 10 | Prática para Pitta",
    description:
      "Som Bhramari e visualização de cores frias para baixar a temperatura mental e liberar o estresse acumulado.",
  },
  {
    icon: Zap,
    title: "Aula 11 | Prática para Kapha",
    description:
      "Técnicas respiratórias para aumentar termogênese e ativar o sistema digestivo. 12 repetições de respiração ativadora.",
  },
];

const AulaItem = ({
  aula,
  number,
  isOpen,
  onToggle,
}: {
  aula: Aula;
  number: number;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const Icon = aula.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35 }}
      className="bg-white shadow-sm rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 md:p-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="shrink-0 inline-flex items-center justify-center px-3 py-1 rounded-full bg-accent text-primary font-bold text-xs">
          {String(number).padStart(2, "0")}
        </span>
        <span className="shrink-0 w-9 h-9 rounded-full bg-surface-sun flex items-center justify-center">
          <Icon className="w-5 h-5 text-secondary" strokeWidth={2} />
        </span>
        <h3 className="flex-1 font-serif font-bold text-sm md:text-base leading-snug text-primary">
          {aula.title}
        </h3>
        <ChevronDown
          className="shrink-0 h-4 w-4 text-primary/50 transition-transform duration-300"
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
            <p className="px-4 md:px-5 pb-5 text-sm md:text-base leading-relaxed text-primary/75">
              {aula.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const BlocoTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="pl-4 py-2 mb-5 border-l-4 border-accent">
    <p className="font-serif italic font-bold text-lg md:text-xl text-primary">
      {children}
    </p>
  </div>
);

const Programa = () => {
  const [openKey, setOpenKey] = useState<string | null>("0-0");
  let counter = 0;
  const renderBloco = (aulas: Aula[], blocoIdx: number) => (
    <div className="space-y-3">
      {aulas.map((aula, i) => {
        counter += 1;
        const key = `${blocoIdx}-${i}`;
        return (
          <AulaItem
            key={key}
            aula={aula}
            number={counter}
            isOpen={openKey === key}
            onToggle={() => setOpenKey(openKey === key ? null : key)}
          />
        );
      })}
    </div>
  );

  return (
    <section className="py-12 md:py-16 bg-surface-sun">
      <div className="max-w-3xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-serif italic font-bold text-2xl md:text-3xl mb-4 text-center text-primary"
        >
          O Programa
        </motion.h2>

        <p className="text-sm md:text-base text-center mb-10 leading-relaxed max-w-2xl mx-auto text-primary/75">
          Não é apenas um curso gravado. É um manual prático. A cada conceito,
          você recebe a ferramenta exata para aplicar.
        </p>

        <div className="mb-10">
          <BlocoTitle>Bloco 1 — A Lógica dos Horários</BlocoTitle>
          {renderBloco(BLOCO_1, 0)}
        </div>

        <div className="mb-10">
          <BlocoTitle>Bloco 2 — Práticas para o Seu Dosha</BlocoTitle>
          {renderBloco(BLOCO_2, 1)}
        </div>

        <div>
          <BlocoTitle>Bloco 3 — Laboratório Prático Guiado</BlocoTitle>
          <p className="text-sm md:text-base text-center mb-5 italic text-primary/70">
            Práticas guiadas em áudio e vídeo, prontas para usar hoje.
          </p>
          {renderBloco(BLOCO_3, 2)}
        </div>
      </div>
    </section>
  );
};

// ---------------- SEÇÃO 6: PROFESSOR ----------------
const PROFESSOR_BULLETS = [
  "15 anos de prática clínica ativa e mais de 5.000 consultas",
  "Mais de 4.500 alunos formados no Brasil e no mundo",
  "Lógica funcional pura, adaptada à realidade, alimentos e clima do brasileiro",
];

const Professor = () => (
  <section className="py-14 md:py-20 bg-primary">
    <div className="max-w-4xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-10 items-start">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto md:mx-0"
        >
          {/* Forma de Portal — rounded-t-full rounded-b-none */}
          <div className="w-[230px] h-[280px] md:w-[260px] md:h-[320px] flex items-center justify-center shadow-xl rounded-t-full rounded-b-none overflow-hidden bg-accent border-4 border-accent">
            <User className="h-24 w-24 md:h-32 md:w-32 text-primary" strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <p className="text-[11px] uppercase tracking-widest font-bold mb-2 text-accent">
            Sobre o Professor
          </p>
          <h2 className="font-serif italic font-bold text-2xl md:text-3xl mb-1 text-white">
            Edson Osorio
          </h2>
          <p className="text-xs md:text-sm text-white/70 mb-5">
            Terapeuta Ayurveda | Professor | Fundador do Portal Ayurveda
          </p>

          <ul className="space-y-2.5 mb-8">
            {PROFESSOR_BULLETS.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-primary mt-0.5">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span className="text-sm md:text-base leading-relaxed text-white/90">
                  {b}
                </span>
              </li>
            ))}
          </ul>

          <h3 className="font-serif italic font-bold text-lg md:text-xl mb-4 text-accent">
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
                  className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm"
                >
                  <span className="shrink-0 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                    <Icon className="h-5 w-5 text-secondary" strokeWidth={2} />
                  </span>
                  <p className="text-sm leading-relaxed pt-1.5 text-white/90">
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

// ---------------- BOX TDAH (depoimento, fundo claro) ----------------
const BoxTdah = () => (
  <section className="bg-bg-soft py-12 md:py-16">
    <div className="max-w-2xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="relative p-7 md:p-9 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm shadow-md border-l-4 border-accent bg-white"
      >
        <span
          className="absolute -top-4 left-5 font-serif italic font-bold leading-none select-none text-accent"
          style={{ fontSize: "5.5rem" }}
          aria-hidden
        >
          “
        </span>
        <div className="text-sm md:text-base leading-relaxed space-y-4 pt-2 text-primary/85">
          <p>
            Durante anos, busquei entender por que minha mente e meu corpo
            pareciam trabalhar contra mim — mesmo quando eu me esforçava.
          </p>
          <p>
            A resposta não estava em fazer mais. Estava em fazer na hora certa.
          </p>
          <p>
            O Ayurveda me deu uma estrutura mecânica do tempo que transformou
            minha saúde, meu foco e minha vitalidade.
          </p>
          <p className="font-serif italic font-bold text-base md:text-lg text-primary">
            Se funcionou para mim, funciona para você.
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);

// ---------------- SEÇÃO 7: INVESTIMENTO ----------------
const INCLUSO = [
  "As 11 aulas do Método Rotinas Diárias",
  "Laboratório Prático de Meditação e Respiração (por Dosha)",
  "Acesso ao Tutor IA Ayurveda 24h",
  "Acesso à Comunidade de Alunos",
];

const Investimento = () => (
  <section id="investimento" className="relative py-14 md:py-20 bg-accent overflow-hidden">
    <Sun
      className="absolute -top-16 -left-16 w-80 h-80 text-primary opacity-[0.05] pointer-events-none"
      strokeWidth={1}
      aria-hidden
    />
    <div className="relative max-w-3xl mx-auto px-6 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="font-serif italic font-bold text-2xl md:text-3xl mb-6 text-primary"
      >
        Investimento
      </motion.h2>

      <p className="text-sm md:text-base max-w-2xl mx-auto mb-10 leading-relaxed text-primary/85">
        A desorganização é o que mais rouba sua performance. Consultas, remédios
        e suplementos não funcionam se o relógio biológico estiver invertido.{" "}
        <strong className="text-primary">Resolva a base.</strong>
      </p>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="p-6 md:p-10 mb-8 text-left rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm shadow-2xl bg-white"
      >
        <p className="text-[11px] uppercase tracking-widest font-bold mb-4 text-secondary">
          O que está incluso
        </p>
        <ul className="space-y-2.5 mb-6">
          {INCLUSO.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-primary mt-0.5">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <span className="text-sm md:text-base leading-relaxed text-primary/85">
                {item}
              </span>
            </li>
          ))}
        </ul>

        <div className="pt-6 border-t border-primary/15 text-center">
          <p className="font-serif italic font-bold text-3xl md:text-5xl mb-2 text-primary">
            12x de R$ 9,68
          </p>
          <p className="text-sm md:text-base text-primary/70 mb-6">
            ou <strong className="text-primary">R$ 97,00</strong> à vista
          </p>
          <LeafCTA className="w-full md:w-auto md:px-14">
            Quero assumir o controle agora
          </LeafCTA>
        </div>
      </motion.div>
    </div>
  </section>
);

// ---------------- SEÇÃO 8: FAQ ----------------
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
    <section className="py-12 md:py-16 bg-bg-soft">
      <div className="max-w-3xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-serif italic font-bold text-2xl md:text-3xl mb-10 text-center text-primary"
        >
          Perguntas Frequentes
        </motion.h2>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="bg-white shadow-sm rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center gap-3 p-4 md:p-5 text-left"
                  aria-expanded={isOpen}
                >
                  <h3 className="flex-1 font-serif font-bold text-sm md:text-base leading-snug text-primary">
                    {item.question}
                  </h3>
                  <span className="shrink-0 w-8 h-8 rounded-full bg-surface-sun flex items-center justify-center">
                    {isOpen ? (
                      <Minus className="h-4 w-4 text-secondary" strokeWidth={2.5} />
                    ) : (
                      <Plus className="h-4 w-4 text-secondary" strokeWidth={2.5} />
                    )}
                  </span>
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
                      <p className="px-4 md:px-5 pb-5 text-sm md:text-base leading-relaxed text-primary/75">
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

// ---------------- SEÇÃO 9: ENCERRAMENTO ----------------
const FinalCta = () => (
  <>
    {/* Wave divider orgânica */}
    <div className="bg-bg-soft leading-none">
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="w-full h-12 md:h-16 block"
        aria-hidden
      >
        <path
          d="M0,40 C240,80 480,0 720,30 C960,60 1200,20 1440,50 L1440,80 L0,80 Z"
          className="fill-primary"
        />
      </svg>
    </div>

    <section className="relative py-14 md:py-20 bg-primary overflow-hidden">
      <Moon
        className="absolute -top-12 -left-12 w-72 h-72 text-accent opacity-[0.07] pointer-events-none"
        strokeWidth={1}
        aria-hidden
      />
      <Sun
        className="absolute -bottom-16 -right-16 w-80 h-80 text-accent opacity-[0.07] pointer-events-none"
        strokeWidth={1}
        aria-hidden
      />
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-base md:text-lg leading-relaxed space-y-4 mb-10 text-white/90"
        >
          <p>Você já percebeu que copiar a rotina dos outros não funciona.</p>
          <p>
            Você continuará lutando contra o próprio corpo até entender como ele
            foi projetado para operar.
          </p>
          <p className="font-serif italic font-bold text-xl md:text-2xl pt-2 text-accent">
            Agora é a hora de organizar a fundação.
          </p>
          <p>
            De parar de mascarar o cansaço e a má digestão — e alinhar sua vida
            ao seu ritmo natural.
          </p>
        </motion.div>

        <LeafCTA variant="inverted" className="!text-base md:!text-lg !px-10 md:!px-14 !py-5">
          Garantir minha vaga agora
        </LeafCTA>
      </div>
    </section>
  </>
);

// ---------------- PAGE ----------------
const Rotinas = () => {
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
        <BoxTdah />
        <Investimento />
        <Faq />
        <FinalCta />
      </main>
    </div>
  );
};

export default Rotinas;
