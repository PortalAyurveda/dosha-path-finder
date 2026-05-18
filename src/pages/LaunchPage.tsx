import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TARGET_DATE = new Date("2026-05-13T19:00:00-03:00").getTime();

const calcTimeLeft = () => {
  const diff = TARGET_DATE - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

const LaunchPage = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(calcTimeLeft());

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const units: Array<{ label: string; value: number }> = [
    { label: "dias", value: timeLeft.days },
    { label: "horas", value: timeLeft.hours },
    { label: "min", value: timeLeft.minutes },
    { label: "seg", value: timeLeft.seconds },
  ];

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-surface-sun px-4 text-center">
      <img
        src="https://api.portalayurveda.com/storage/v1/object/public/portal_images/simbolo-positivo.svg"
        alt="Portal Ayurveda"
        className="max-w-[200px] mb-8"
      />
      <h1 className="font-serif text-primary text-4xl md:text-5xl font-bold">
        Portal Ayurveda
      </h1>
      <p className="font-sans text-primary text-xl mt-2">
        Lançamento oficial: 13 de Maio, às 19h!
      </p>

      <div className="mt-10 flex gap-6 md:gap-10">
        {units.map((u) => (
          <div key={u.label} className="flex flex-col items-center">
            <span className="text-secondary text-3xl md:text-4xl font-bold tabular-nums">
              {String(u.value).padStart(2, "0")}
            </span>
            <span className="text-primary text-sm mt-1">{u.label}</span>
          </div>
        ))}
      </div>

      <div
        onClick={() => navigate("/preview")}
        className="absolute bottom-4 right-4 w-10 h-10 bg-transparent opacity-0 cursor-default"
        aria-hidden="true"
      />
    </div>
  );
};

export default LaunchPage;
