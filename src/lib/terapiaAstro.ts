import {
  Body,
  GeoVector,
  Ecliptic,
  SunPosition,
  EclipticGeoMoon,
  SiderealTime,
} from "astronomy-engine";
import type { NascimentoPaciente } from "./terapiaPaciente";
const normal = (n: number) => ((n % 360) + 360) % 360;
const RAD = Math.PI / 180;
const SIGNOS = [
  "Áries",
  "Touro",
  "Gêmeos",
  "Câncer",
  "Leão",
  "Virgem",
  "Libra",
  "Escorpião",
  "Sagitário",
  "Capricórnio",
  "Aquário",
  "Peixes",
];
const NAKSHATRAS = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
];
export function nascimentoUTC(data: string, hora: string, fuso: string): Date {
  const alvo = Date.parse(`${data}T${hora.slice(0, 5)}:00Z`);
  if (!Number.isFinite(alvo)) throw new Error("Data de nascimento inválida.");
  let t = alvo;
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: fuso,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  for (let i = 0; i < 4; i++) {
    const p = fmt.formatToParts(new Date(t));
    const v = (k: string) => p.find((x) => x.type === k)?.value ?? "";
    const local = Date.parse(
      `${v("year")}-${v("month")}-${v("day")}T${v("hour")}:${v("minute")}:${v("second")}Z`,
    );
    const delta = alvo - local;
    t += delta;
    if (!delta) break;
  }
  return new Date(t);
}
// Lahiri mean ayanamsa at J2000, advanced by the IAU precession polynomial (degrees).
export function lahiri(data: Date) {
  const T = (data.getTime() - Date.UTC(2000, 0, 1, 12)) / (36525 * 86400000);
  return (
    23.8530556 +
    (5028.796195 * T + 1.1054348 * T * T + 0.00007964 * T * T * T) / 3600
  );
}
export function ascendente(data: Date, lat: number, lon: number) {
  const T = (data.getTime() - Date.UTC(2000, 0, 1, 12)) / (36525 * 86400000);
  const eps = (23.43929111 - 0.013004167 * T) * RAD;
  const theta = normal(SiderealTime(data) * 15 + lon) * RAD;
  return normal(
    Math.atan2(
      -Math.cos(theta),
      Math.sin(eps) * Math.tan(lat * RAD) + Math.cos(eps) * Math.sin(theta),
    ) /
      RAD +
      180,
  );
}
export function signo(n: number) {
  const a = normal(n);
  return `${SIGNOS[Math.floor(a / 30)]} ${Math.floor(a % 30)}°${String(Math.floor((a % 1) * 60)).padStart(2, "0")}′`;
}
export function calcularMapa(
  n: NascimentoPaciente,
  modo: "tradicional" | "vedico",
) {
  if (!n.fuso)
    throw new Error(
      "O local de nascimento precisa de fuso para calcular o mapa.",
    );
  const conhecida = n.hora_conhecida !== false && !!n.hora;
  const data = nascimentoUTC(
    n.data,
    conhecida ? (n.hora ?? "12:00") : "12:00",
    n.fuso,
  );
  const ay = lahiri(data);
  const deslocamento = modo === "vedico" ? ay : 0;
  const sol = SunPosition(data).elon;
  const lua = EclipticGeoMoon(data).lon;
  const venus = Ecliptic(GeoVector(Body.Venus, data, true)).elon;
  const asc =
    conhecida && n.latitude != null && n.longitude != null
      ? signo(ascendente(data, n.latitude, n.longitude) - deslocamento)
      : "precisa da hora";
  const lunar = normal(lua - ay);
  return [
    { nome: "Sol", valor: signo(sol - deslocamento) },
    {
      nome: "Lua",
      valor: signo(lua - deslocamento) + (conhecida ? "" : " · ao meio-dia"),
    },
    { nome: "Ascendente", valor: asc },
    { nome: "Vênus", valor: signo(venus - deslocamento) },
    {
      nome: "Nakshatra da Lua",
      valor: `${NAKSHATRAS[Math.floor(lunar / (360 / 27))]} · pada ${Math.floor((lunar % (360 / 27)) / (360 / 108)) + 1}${conhecida ? "" : " · ao meio-dia"}`,
    },
  ];
}
