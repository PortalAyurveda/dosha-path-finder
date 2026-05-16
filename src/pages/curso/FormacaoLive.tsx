import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Calendar, Users, MessageCircle } from "lucide-react";

const PRIMARY = "#6B7FF2";
const DARK = "#352F54";
const SALMON = "#f7b2b7";
const CREAM = "#FFF8EE";
const PHOTO_URL =
  "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/gemini-generated-image-w7evrdw7evrdw7ev.webp";
const WHATSAPP_URL = "https://chat.whatsapp.com/HbADqLfLGPL5IibnRFQLiI";

const FormacaoLive = () => {
  return (
    <div style={{ background: CREAM }}>
      <Helmet>
        <title>Inscrições abertas — Formação em Ayurveda com Edson Osorio</title>
        <meta
          name="description"
          content="Início 20 de maio, 19h. Apenas 50 vagas. Entre no grupo do WhatsApp e acompanhe o lançamento da Formação em Ayurveda com Edson Osorio."
        />
        <meta property="og:title" content="Inscrições abertas — Formação em Ayurveda com Edson Osorio" />
        <meta
          property="og:description"
          content="Início 20 de maio, 19h. Apenas 50 vagas. Participe do grupo do WhatsApp."
        />
        <meta property="og:image" content={PHOTO_URL} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://portalayurveda.com/curso/formacao/live" />
      </Helmet>

      <main>
        <section
          id="top"
          className="relative w-full overflow-hidden min-h-[100svh] py-10 md:py-16"
          style={{ background: CREAM }}
        >
          <div
            className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-20 pointer-events-none"
            style={{ background: PRIMARY }}
            aria-hidden
          />
          <div
            className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-15 pointer-events-none"
            style={{ background: DARK }}
            aria-hidden
          />

          <div className="relative max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 md:gap-12 items-center">
            {/* Conteúdo */}
            <div className="order-2 md:order-1 text-center md:text-left">
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-block text-[11px] md:text-xs font-bold tracking-[0.18em] uppercase px-3 py-1.5 rounded-full mb-5"
                style={{ background: `${SALMON}40`, color: DARK }}
              >
                Inscrições abertas
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="font-serif italic font-bold text-[30px] md:text-[44px] leading-[1.1] mb-5"
                style={{ color: DARK }}
              >
                Abertura das Inscrições — Formação em Ayurveda com Edson Osorio
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="flex flex-wrap justify-center md:justify-start gap-2.5 mb-6"
              >
                <span
                  className="inline-flex items-center gap-2 text-xs md:text-sm font-bold px-4 py-2 rounded-full"
                  style={{ background: `${PRIMARY}20`, color: DARK }}
                >
                  <Calendar className="h-4 w-4" />
                  Início: 20 de Maio · 19h
                </span>
                <span
                  className="inline-flex items-center gap-2 text-xs md:text-sm font-bold px-4 py-2 rounded-full"
                  style={{ background: `${SALMON}40`, color: DARK }}
                >
                  <Users className="h-4 w-4" />
                  Apenas 50 vagas
                </span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="text-base md:text-lg text-gray-700 leading-relaxed mb-7 max-w-xl mx-auto md:mx-0"
              >
                A oportunidade que você esperava para se formar terapeuta e ter confiança na sua jornada.
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="text-sm md:text-base font-semibold mb-4"
                style={{ color: DARK }}
              >
                Participe do grupo do WhatsApp para acompanhar o lançamento.
              </motion.p>

              <motion.a
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 font-bold text-xs md:text-sm uppercase tracking-wide px-8 md:px-12 py-4 shadow-md hover:shadow-xl transition-all hover:scale-[1.03] rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm w-full md:w-auto text-white"
                style={{ background: SALMON }}
              >
                <MessageCircle className="h-5 w-5" />
                Quero entrar no grupo do WhatsApp
              </motion.a>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-xs md:text-sm text-gray-600 italic mt-4"
              >
                Vagas limitadas. Avisos enviados pelo grupo.
              </motion.p>
            </div>

            {/* Foto */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="order-1 md:order-2 relative flex items-center justify-center min-h-[420px] md:min-h-[560px]"
            >
              {/* Círculo grande atrás */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] md:w-[440px] md:h-[440px] rounded-full opacity-30"
                style={{ background: PRIMARY }}
                aria-hidden
              />
              {/* Anel fino */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] md:w-[520px] md:h-[520px] rounded-full border-2 opacity-40"
                style={{ borderColor: DARK }}
                aria-hidden
              />

              {/* Foto sem moldura */}
              <img
                src={PHOTO_URL}
                alt="Edson Osorio, professor da Formação em Ayurveda"
                className="relative z-10 w-full h-[420px] md:h-[560px] object-contain"
                style={{ filter: "drop-shadow(0 20px 30px rgba(53,47,84,0.18))" }}
                loading="eager"
              />

              {/* Bolinha salmão à frente */}
              <div
                className="absolute z-20 top-6 right-2 md:top-10 md:right-6 w-16 h-16 md:w-24 md:h-24 rounded-full opacity-90 shadow-lg"
                style={{ background: SALMON }}
                aria-hidden
              />
              {/* Bolinha pequena escura */}
              <div
                className="absolute z-20 bottom-10 left-2 md:bottom-16 md:left-4 w-8 h-8 md:w-12 md:h-12 rounded-full"
                style={{ background: DARK, opacity: 0.85 }}
                aria-hidden
              />
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default FormacaoLive;
