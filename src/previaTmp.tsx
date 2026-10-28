import "./index.css";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import ConstanciaFolha from "@/components/terapia/ConstanciaFolha";
import CuidadosDoDia from "@/components/rotina/CuidadosDoDia";
const qc = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } });
const hoje = "2026-10-27";
const d = (n: number) => { const x = new Date(`${hoje}T12:00:00`); x.setDate(x.getDate() - n); return x.toISOString().slice(0, 10); };
const mapa = Array.from({ length: 30 }, (_, i) => { const dia = d(29 - i); const w = new Date(`${dia}T12:00:00`).getDay(); return { dia, dow: w === 0 ? 7 : w, cuidou: i % 4 !== 2 }; });
qc.setQueryData(["terapia-constancia", "p1"], { mapa, dias_com_cuidado: 22, dias_total: 30, inclui_rotina: true, folha: { id: "f", enviada_em: "2026-10-24T12:00:00Z", desde: "2026-10-24", dias_desde: 4 }, itens: [
 { item_id: "1", titulo: "Panacéia Desidratada", secao: "manha", esperados: 4, feitos: 4 },
 { item_id: "2", titulo: "Ghee no dia a dia", secao: "refeicoes", esperados: 4, feitos: 2 },
 { item_id: "3", titulo: "Chá de erva doce, tansagem e cominho", secao: "todo_dia", dias: [3,5,7], esperados: 1, feitos: 0 },
 { item_id: "4", titulo: "Digestão e Ayurveda", secao: "ler", visto_em: "2026-10-25" } ] });
qc.setQueryData(["cuidados-fita"], { hoje, dias: Array.from({ length: 7 }, (_, i) => { const dia = d(6 - i); const w = new Date(`${dia}T12:00:00`).getDay(); return { dia, dow: w === 0 ? 7 : w, cuidou: i !== 2 && i !== 4, pode_marcar: i >= 3 }; }), mes: { nome: "outubro", dias_com_cuidado: 1 }, folha_desde: "2026-10-24", primeiro_cuidado: null });
qc.setQueryData(["rotina-cuidados", "u", d(3)], [{ data: hoje, tipo: "acerto_rotina", referencia: "dia2:rotina_manha" }, { data: hoje, tipo: "evitei", referencia: "dia2:Frutas cruas e saladas frias como refeição" }]);
createRoot(document.getElementById("r")!).render(<QueryClientProvider client={qc}><MemoryRouter><div style={{ maxWidth: 1120, margin: "20px auto", padding: "0 12px" }}>
 <ConstanciaFolha paciente="p1" />
 <div style={{ maxWidth: 800, margin: "30px auto" }}><CuidadosDoDia userId="u" habitos={[{ habito: "Tomar água morna ao acordar", periodo: "manhã" }, { habito: "Dormir antes das 22h — Vata piora muito com vigília noturna" }]} alertas={["Frutas cruas e saladas frias como refeição", "Água gelada e refrigerantes — fecham os tecidos digestivos"]}
  praticas={() => [{ slot: "rotina_manha", label: "ritual da manhã", nuggetId: "n", nugget: { id: "n", titulo: "Prática matinal com despertar cedo" } as never }]} /></div>
</div></MemoryRouter></QueryClientProvider>);
