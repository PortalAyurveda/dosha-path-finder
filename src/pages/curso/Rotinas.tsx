import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Clock,
  Sprout,
  Compass,
  Zap,
  ChevronDown,
  Check,
  Target,
  Users,
  User,
  Sun,
  Moon,
  Star,
  Cloud,
  Sunrise,
  Wind,
  Heart,
  Leaf,
  Plus,
  Minus,
} from "lucide-react";

// ============================================================
// /cursos/rotinas — Curso Rotinas Diárias Ayurvédicas
// Paleta exata:
//   Creme:        #fff4e0
//   Azul marinho: #1a2347
//   Amarelo logo: #f2cb05
//   Salmão (CTA): #ff7676
// ============================================================

const HOTMART = "https://pay.hotmart.com/F101182057Y";
const LOGO =
  "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/logo-rotinas.png";

const CREAM = "#fff4e0";
const NAVY = "#1a2347";
const YELLOW = "#f2cb05";
const SALMON = "#ff7676";

// ---------------- BOTÃO BASE (Forma de Folha) ----------------
const LeafCTA = ({
  children,
  href = HOTMART,
  variant = "salmon",
  className = "",
}: {
  children: React.ReactNode;
  href?: string;
  variant?: "salmon" | "yellow";
  className?: string;
}) => {
  const base =
    "inline-flex items-center justify-center gap-2.5 font-bold text-xs md:text-sm uppercase tracking-wide px-8 md:px-12 py-4 shadow-md hover:shadow-xl transition-all hover:scale-[1.03] rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm";
  const styles =
    variant === "yellow"
      ? "bg-[#f2cb05] text-[#1a2347] hover:bg-[#f2cb05]/90"
      : "bg-[#ff7676] text-white hover:bg-[#ff7676]/90";
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

// ---------------- SEÇÃO 1: HERO ----------------
const Hero = () => (
  <section className="relative w-full py-16 md:py-24 overflow-hidden bg-[#fff4e0]">
    <Sun
      className="absolute -top-12 -right-10 w-72 h-72 md:w-96 md:h-96 text-[#ff7676] opacity-20 pointer-events-none"
      strokeWidth={1}
      aria-hidden
    />
    <Cloud
      className="absolute top-10 left-6 w-32 h-32 md:w-40 md:h-40 text-[#1a2347] opacity-10 pointer-events-none"
      strokeWidth={1}
      aria-hidden
    />
    <Sunrise
      className="absolute -bottom-10 -left-10 w-64 h-64 text-[#1a2347] opacity-[0.06] pointer-events-none"
      strokeWidth={1}
      aria-hidden
    />

    <div className="relative max-w-4xl mx-auto px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="flex justify-center mb-8"
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
        className="font-serif italic font-bold text-[28px] md:text-[44px] leading-[1.15] mb-6 text-[#1a2347]"
      >
        Tem hora pra tudo.
        <br />
        Até pra se cuidar da forma certa.
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed space-y-4 text-[#1a2347]/80"
      >
        <p>
          Você acabou de descobrir seu Dosha. O próximo passo é colocar isso pra
          funcionar na sua vida.
        </p>
        <p>
          Até a dieta certa dá errado se o seu relógio biológico não está
          alinhado. Tudo começa com a rotina certa para o seu Dosha.
        </p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-xs md:text-sm font-bold tracking-wide px-4 py-2 rounded-full inline-block mb-10 bg-[#1a2347] text-[#f2cb05]"
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
  <section className="bg-white py-16 md:py-24">
    <div className="max-w-4xl mx-auto px-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="font-serif italic font-bold text-2xl md:text-3xl mb-12 text-center text-[#1a2347]"
      >
        Para Quem É Esta Jornada
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {PARA_QUEM.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: (i % 2) * 0.06 }}
              className="flex items-start gap-4 p-6 bg-[#fff4e0] border border-[#1a2347]/10 hover:border-[#f2cb05] transition-colors rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm"
            >
              <span className="shrink-0 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Icon className="w-6 h-6 text-[#ff7676]" strokeWidth={2} />
              </span>
              <div>
                <h3 className="font-serif font-bold text-base md:text-lg mb-1.5 text-[#1a2347]">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#1a2347]/80">
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

// Util: marca-texto amarelo
const Mark = ({ children }: { children: React.ReactNode }) => (
  <span
    className="px-1 font-semibold"
    style={{ background: "rgba(242,203,5,0.4)", color: NAVY }}
  >
    {children}
  </span>
);

// ---------------- SEÇÃO 3: PROBLEMA ----------------
const Problema = () => (
  <section className="py-16 md:py-24 bg-[#fff4e0]">
    <div className="max-w-2xl mx-auto px-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="font-serif italic font-bold text-2xl md:text-3xl mb-8 text-center text-[#1a2347]"
      >
        O Problema: <Mark>Ação na Hora Errada</Mark>
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-base md:text-lg leading-relaxed space-y-5 text-[#1a2347]/80"
      >
        <p>
          Você tenta <Mark>meditar com a mente fervendo</Mark>. Faz treinos
          pesados à noite e perde o sono. Toma o remédio certo na hora errada.
        </p>
        <p>
          Fazer a coisa certa no momento errado{" "}
          <Mark>desgasta o corpo</Mark> e queima a vitalidade.
        </p>
        <p className="font-serif italic font-bold text-lg md:text-xl text-[#1a2347] pt-4">
          O problema não é falta de esforço. É lutar contra a própria biologia.
        </p>
      </motion.div>
    </div>
  </section>
);

// ---------------- SEÇÃO 4: SOLUÇÃO ----------------
const SOLUCAO_BENEFITS = [
  {
    icon: Compass,
    title: "Sincronia",
    text: "Alinhe suas ações com as forças que regem cada hora do dia.",
  },
  {
    icon: Leaf,
    title: "Satmia",
    text: "Adaptabilidade gradual e realista — sem rigidez, sem prisão de planilhas.",
  },
  {
    icon: Zap,
    title: "Automatismo",
    text: "Energia, foco e boa digestão tornam-se naturais no seu dia.",
  },
];

const Solucao = () => (
  <section className="py-16 md:py-24 bg-white">
    <div className="max-w-3xl mx-auto px-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="font-serif italic font-bold text-2xl md:text-3xl mb-4 text-center text-[#1a2347]"
      >
        A Solução: Sincronia e Adaptabilidade
      </motion.h2>

      <p className="text-base md:text-lg text-center leading-relaxed mb-12 max-w-2xl mx-auto text-[#1a2347]/80">
        A solução não é controle rígido. É a compreensão mecânica do tempo —
        e o conceito ayurvédico de <Mark>Satmia</Mark>, a adaptação inteligente.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SOLUCAO_BENEFITS.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="text-center px-4"
            >
              <div className="relative inline-flex items-center justify-center mb-4">
                <Icon className="w-10 h-10 text-[#1a2347]" strokeWidth={1.5} />
                <span
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                  style={{ background: YELLOW }}
                  aria-hidden
                />
              </div>
              <h3 className="font-serif font-bold text-lg mb-2 text-[#1a2347]">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#1a2347]/75">
                {item.text}
              </p>
            </motion.div>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="font-serif italic font-bold text-lg md:text-xl text-center pt-12 mt-12 border-t border-[#1a2347]/10 text-[#1a2347]"
      >
        Não é só assistir aulas. É aplicar pequenos ajustes no mesmo dia.
      </motion.p>
    </div>
  </section>
);

// ---------------- SEÇÃO 5: PROGRAMA ----------------
type Aula = { title: string; description: string; icon: LucideIcon };

const BLOCO_1: Aula[] = [
  {
    icon: Clock,
    title: "Como Criar Rotinas Diárias Ayurvédicas",
    description:
      "Estratégias práticas para acordar, meditar e comer no momento certo. O relógio biológico não é rígido — é inteligente.",
  },
  {
    icon: Compass,
    title: "Equilibrar Doshas na Vida Real",
    description:
      "Como Vata, Pitta e Kapha se manifestam nas suas necessidades diárias. Os canais de movimento (Srotas) e a importância dos estímulos matinais.",
  },
  {
    icon: Sun,
    title: "O Guia Completo da Rotina Diária",
    description:
      "A influência matemática dos horários sobre os Doshas. Como estruturar manhã, almoço, tarde e noite. Dormir entre 22h30 e 5h00 para máxima regeneração celular.",
  },
];

const BLOCO_2: Aula[] = [
  {
    icon: Moon,
    title: "As Três Fontes de Restauração",
    description:
      "Sono, nutrição e respiração — os três pilares que restauram o corpo. Ajustes finos para cada Dosha.",
  },
  {
    icon: Heart,
    title: "Como Meditar em 3 Estágios",
    description:
      "Técnica de meditação em 3 etapas: controle da mente, observação do meio, expansão da consciência.",
  },
  {
    icon: Leaf,
    title: "Qual Tipo de Yoga é Ideal para Seu Dosha",
    description:
      "Yoga Nidra, Ashtanga, Hatha — cada um serve para um Dosha específico. A escolha certa muda completamente o resultado.",
  },
  {
    icon: Sprout,
    title: "Rotinas de Meditação e Respiração por Dosha",
    description:
      "Guia tático do que fazer — e do que potencializar — para acalmar Vata, esfriar Pitta e ativar Kapha.",
  },
  {
    icon: Wind,
    title: "Como Respirar Corretamente",
    description:
      "Mecânica respiratória profunda. Diafragma, capacidade pulmonar total e respiração nasal. O Pranayama Ujjayi no dia a dia.",
  },
];

const BLOCO_3: Aula[] = [
  {
    icon: Wind,
    title: "Prática para Vata",
    description:
      "Aterramento, alívio de inseguranças e direcionamento do Prana. Técnica para indução de sono profundo.",
  },
  {
    icon: Sun,
    title: "Prática para Pitta",
    description:
      "Som Bhramari e visualização de cores frias para baixar a temperatura mental e liberar o estresse acumulado.",
  },
  {
    icon: Zap,
    title: "Prática para Kapha",
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
      className="bg-white shadow-sm rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm overflow-hidden border border-[#1a2347]/10"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 md:p-5 text-left"
        aria-expanded={isOpen}
      >
        <span
          className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm"
          style={{ background: YELLOW, color: NAVY }}
        >
          {String(number).padStart(2, "0")}
        </span>
        <Icon className="shrink-0 w-5 h-5 text-[#1a2347]/60" strokeWidth={2} />
        <h3 className="flex-1 font-serif font-bold text-sm md:text-base leading-snug text-[#1a2347]">
          Aula {number} | {aula.title}
        </h3>
        <ChevronDown
          className="shrink-0 h-4 w-4 text-[#f2cb05] transition-transform duration-300"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          strokeWidth={3}
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
            <p className="px-4 md:px-5 pb-5 text-sm md:text-base leading-relaxed text-[#1a2347]/80">
              {aula.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const BlocoTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="pl-4 py-2 mb-5 border-l-4" style={{ borderColor: YELLOW }}>
    <p className="font-serif italic font-bold text-lg md:text-xl text-[#1a2347]">
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
    <section className="py-16 md:py-24 bg-[#fff4e0]">
      <div className="max-w-3xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-serif italic font-bold text-2xl md:text-3xl mb-4 text-center text-[#1a2347]"
        >
          O Programa
        </motion.h2>

        <p className="text-base md:text-lg text-center mb-12 leading-relaxed max-w-2xl mx-auto text-[#1a2347]/75">
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
          <p className="text-sm md:text-base text-center mb-5 italic text-[#1a2347]/70">
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
  <section className="py-16 md:py-24 bg-[#1a2347]">
    <div className="max-w-4xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-10 md:gap-12 items-start">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto md:mx-0"
        >
          {/* Forma de Portal */}
          <div
            className="w-[230px] h-[280px] md:w-[260px] md:h-[320px] flex items-center justify-center shadow-2xl rounded-t-full rounded-b-none overflow-hidden"
            style={{ background: CREAM, border: `4px solid ${YELLOW}` }}
          >
            <User className="h-24 w-24 md:h-32 md:w-32 text-[#1a2347]" strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <p className="text-[11px] uppercase tracking-widest font-bold mb-2 text-[#f2cb05]">
            Sobre o Professor
          </p>
          <h2 className="font-serif italic font-bold text-2xl md:text-3xl mb-1 text-[#fff4e0]">
            Edson Osorio
          </h2>
          <p className="text-xs md:text-sm text-[#fff4e0]/70 mb-6">
            Terapeuta Ayurveda | Professor | Fundador do Portal Ayurveda
          </p>

          <ul className="space-y-3 mb-8">
            {PROFESSOR_BULLETS.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full mt-0.5"
                  style={{ background: YELLOW, color: NAVY }}
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span className="text-sm md:text-base leading-relaxed text-[#fff4e0]/90">
                  {b}
                </span>
              </li>
            ))}
          </ul>

          <h3 className="font-serif italic font-bold text-lg md:text-xl mb-4 text-[#f2cb05]">
            O Ecossistema de Apoio
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                icon: Target,
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
                  className="flex items-start gap-3 p-4 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm"
                  style={{ background: "rgba(255,244,224,0.08)" }}
                >
                  <span className="shrink-0 w-10 h-10 rounded-full bg-[#fff4e0] flex items-center justify-center">
                    <Icon className="h-5 w-5 text-[#ff7676]" strokeWidth={2} />
                  </span>
                  <p className="text-sm leading-relaxed pt-1.5 text-[#fff4e0]/90">
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

// ---------------- SEÇÃO 7: INVESTIMENTO ----------------
const INCLUSO = [
  "As 11 aulas do Método Rotinas Diárias",
  "Laboratório Prático de Meditação e Respiração (por Dosha)",
  "Acesso ao Tutor IA Ayurveda 24h",
  "Acesso à Comunidade de Alunos",
];

const Investimento = () => (
  <section id="investimento" className="py-16 md:py-24 bg-[#fff4e0]">
    <div className="max-w-3xl mx-auto px-6 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="font-serif italic font-bold text-2xl md:text-3xl mb-6 text-[#1a2347]"
      >
        Investimento
      </motion.h2>

      <p className="text-base md:text-lg max-w-2xl mx-auto mb-12 leading-relaxed text-[#1a2347]/80">
        A desorganização é o que mais rouba sua performance. Consultas, remédios
        e suplementos não funcionam se o relógio biológico estiver invertido.{" "}
        <strong className="text-[#1a2347]">Resolva a base.</strong>
      </p>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="p-8 md:p-12 mb-8 text-left rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm shadow-xl bg-white border-2 border-[#f2cb05]"
      >
        <p className="text-[11px] uppercase tracking-widest font-bold mb-5 text-[#ff7676]">
          O que está incluso
        </p>
        <ul className="space-y-3 mb-8">
          {INCLUSO.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full mt-0.5"
                style={{ background: YELLOW, color: NAVY }}
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <span className="text-sm md:text-base leading-relaxed text-[#1a2347]/85">
                {item}
              </span>
            </li>
          ))}
        </ul>

        <div className="pt-8 border-t border-[#1a2347]/10 text-center">
          <p className="font-serif italic font-bold text-3xl md:text-5xl mb-2 text-[#1a2347]">
            12x de R$ 9,68
          </p>
          <p className="text-sm md:text-base text-[#1a2347]/70 mb-8">
            ou <strong className="text-[#1a2347]">R$ 97,00</strong> à vista
          </p>
          <LeafCTA className="w-full md:w-auto md:!px-16 !py-5 !text-sm md:!text-base">
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
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-serif italic font-bold text-2xl md:text-3xl mb-12 text-center text-[#1a2347]"
        >
          Perguntas Frequentes
        </motion.h2>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="bg-[#fff4e0] rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center gap-3 p-5 md:p-6 text-left"
                  aria-expanded={isOpen}
                >
                  <h3 className="flex-1 font-serif font-bold text-base md:text-lg leading-snug text-[#1a2347]">
                    {item.question}
                  </h3>
                  <span className="shrink-0 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
                    {isOpen ? (
                      <Minus className="h-4 w-4 text-[#f2cb05]" strokeWidth={3} />
                    ) : (
                      <Plus className="h-4 w-4 text-[#f2cb05]" strokeWidth={3} />
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
                      <p className="px-5 md:px-6 pb-6 text-sm md:text-base leading-relaxed text-[#1a2347]/80">
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
    <div className="bg-white leading-none">
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="w-full h-12 md:h-16 block"
        aria-hidden
      >
        <path
          d="M0,40 C240,80 480,0 720,30 C960,60 1200,20 1440,50 L1440,80 L0,80 Z"
          fill={NAVY}
        />
      </svg>
    </div>

    <section className="relative py-16 md:py-24 bg-[#1a2347] overflow-hidden">
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <Moon className="w-10 h-10 text-[#f2cb05]" strokeWidth={1.5} />
          <Star className="w-5 h-5 text-[#f2cb05]" strokeWidth={1.5} fill={YELLOW} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-base md:text-lg leading-relaxed space-y-4 mb-12 text-[#fff4e0]/90"
        >
          <p>Você já percebeu que copiar a rotina dos outros não funciona.</p>
          <p>
            Você continuará lutando contra o próprio corpo até entender como ele
            foi projetado para operar.
          </p>
          <p className="font-serif italic font-bold text-xl md:text-2xl pt-2 text-[#f2cb05]">
            Agora é a hora de organizar a fundação.
          </p>
          <p>
            De parar de mascarar o cansaço e a má digestão — e alinhar sua vida
            ao seu ritmo natural.
          </p>
        </motion.div>

        <LeafCTA variant="yellow" className="!text-base md:!text-lg !px-10 md:!px-14 !py-5">
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
        <Investimento />
        <Faq />
        <FinalCta />
      </main>
    </div>
  );
};

export default Rotinas;
