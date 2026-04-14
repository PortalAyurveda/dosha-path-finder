import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Video, BarChart, LayoutGrid } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const LOGO_URL = "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/logo-positivo-png-certo.png";
const IMG1_URL = "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/1.jpeg";
const IMG2_URL = "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/2.jpeg";
const AKASHA_URL = "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/logo-akasha.png";

const SCENE_DURATION = 2500;

interface Props {
  redirectTo: string;
}

const scenes = [
  {
    text: "Estamos enviando um e-mail para você salvar seu teste. Clique lá para confirmar.",
    render: () => (
      <div className="flex flex-col items-center gap-5">
        <img src={LOGO_URL} alt="Logo" className="h-16 md:h-20 object-contain" />
        <Mail className="w-10 h-10 text-primary animate-pulse" />
      </div>
    ),
  },
  {
    text: "Calculando seus doshas...",
    render: () => (
      <div className="flex items-center justify-center">
        <img
          src={IMG1_URL}
          alt="Doshas"
          className="max-w-[280px] md:max-w-md rounded-2xl"
        />
      </div>
    ),
  },
  {
    text: "Conferindo a zona de agravamento...",
    render: () => (
      <div className="flex items-center justify-center">
        <img
          src={IMG2_URL}
          alt="Agravamento"
          className="max-w-[280px] md:max-w-md rounded-2xl"
        />
      </div>
    ),
  },
  {
    text: "Selecionando vídeos e calculando métricas personalizadas...",
    render: () => <StaggeredIcons />,
  },
  {
    text: "Enviando seu resultado para nossa assistente de IA Akasha...",
    render: () => (
      <div className="flex items-center justify-center">
        <img
          src={AKASHA_URL}
          alt="Akasha"
          className="h-24 md:h-32 object-contain animate-[akasha-pulse_2s_ease-in-out_infinite]"
        />
      </div>
    ),
  },
];

function StaggeredIcons() {
  const icons = [
    { Icon: Video, label: "Vídeos" },
    { Icon: BarChart, label: "Métricas" },
    { Icon: LayoutGrid, label: "Painel" },
  ];

  return (
    <div className="flex gap-8 justify-center">
      {icons.map(({ Icon, label }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.5, duration: 0.5 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Icon className="w-7 h-7 text-primary" />
          </div>
          <span className="text-xs text-muted-foreground font-medium">{label}</span>
        </motion.div>
      ))}
    </div>
  );
}

const InterstitialLoading = ({ redirectTo }: Props) => {
  const navigate = useNavigate();
  const [sceneIndex, setSceneIndex] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  useEffect(() => {
    if (sceneIndex >= scenes.length) {
      navigate(redirectTo, { replace: true });
      return;
    }
    const timer = setTimeout(() => setSceneIndex((i) => i + 1), SCENE_DURATION);
    return () => clearTimeout(timer);
  }, [sceneIndex, navigate, redirectTo]);

  if (sceneIndex >= scenes.length) return null;

  const scene = scenes[sceneIndex];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        {/* Progress dots */}
        <div className="flex gap-2 mb-8">
          {scenes.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i <= sceneIndex ? "bg-primary scale-110" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={sceneIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex flex-col items-center gap-6 max-w-md text-center"
          >
            {scene.render()}
            <p className="font-serif text-lg md:text-xl text-foreground leading-relaxed">
              {scene.text}
            </p>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

export default InterstitialLoading;
