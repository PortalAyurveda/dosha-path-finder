import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const IMG1_URL = "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/design-sem-nome-1.svg";
const IMG2_URL = "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/element-download-1778166966.png";
const IMG3_URL = "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/design-sem-nome-2.svg";
const IMG4_URL = "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/flor-1.svg";
const IMG5_URL = "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/logo-akasha.svg";

const ALL_IMAGES = [IMG1_URL, IMG2_URL, IMG3_URL, IMG4_URL, IMG5_URL];

const SCENE_DURATION = 2500;

interface Props {
  redirectTo: string;
}

const imgClass = "max-h-full max-w-full object-contain";
const imgProps = {
  loading: "eager" as const,
  decoding: "async" as const,
  width: 260,
  height: 260,
};

const scenes = [
  {
    text: "Estamos enviando um e-mail para você salvar seu teste. Clique lá para confirmar.",
    render: () => <img src={IMG1_URL} alt="Enviando email" className={imgClass} {...imgProps} />,
  },
  {
    text: "Calculando seus doshas...",
    render: () => <img src={IMG2_URL} alt="Calculando doshas" className={imgClass} {...imgProps} />,
  },
  {
    text: "Conferindo a zona de agravamento...",
    render: () => <img src={IMG3_URL} alt="Agravamento" className={imgClass} {...imgProps} />,
  },
  {
    text: "Selecionando vídeos e calculando métricas personalizadas...",
    render: () => <img src={IMG4_URL} alt="Métricas" className={imgClass} {...imgProps} />,
  },
  {
    text: "Enviando seu resultado para nossa assistente de IA Akasha...",
    render: () => <img src={IMG5_URL} alt="Akasha" className={imgClass} {...imgProps} />,
  },
];

const InterstitialLoading = ({ redirectTo }: Props) => {
  const navigate = useNavigate();
  const [sceneIndex, setSceneIndex] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
    // Pré-carrega todas as imagens em paralelo para evitar layout shift
    ALL_IMAGES.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
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
    <div className="flex flex-col items-center justify-center px-6 py-16 min-h-[60vh]">
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
          {/* Espaço fixo reservado para imagem */}
          <div className="h-[260px] w-[260px] flex items-center justify-center">
            {scene.render()}
          </div>
          {/* Espaço mínimo reservado para texto (≈3 linhas) */}
          <p className="font-serif text-lg md:text-xl text-foreground leading-relaxed min-h-[84px] flex items-center justify-center">
            {scene.text}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default InterstitialLoading;
