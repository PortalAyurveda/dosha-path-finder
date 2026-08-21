import { useEffect, useMemo, useState } from "react";
import { Printer } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import samkhyaLogo from "@/assets/samkhya-logo-cropped.png";

const PORTAL_LOGO =
  "https://api.portalayurveda.com/storage/v1/object/public/portal_images/logo-positivo.png";

const TINTA = "#3D2233";

interface Diploma {
  id: string;
  curso_id: string;
  titulo: string;
  logo_url: string | null;
  cor_primaria: string;
  cor_escura: string;
  cor_clara: string;
  cor_acento: string;
  carga_horaria: string;
  n_aulas: number | null;
  n_modulos: number | null;
  texto_certificado: string;
  nome_exibicao: string;
}

const Petala = ({ cor, className }: { cor: string; className?: string }) => (
  <svg
    viewBox="0 0 120 120"
    className={className}
    aria-hidden
    style={{ opacity: 0.5 }}
  >
    <path
      d="M8 112C8 58 44 14 112 8 106 62 66 106 8 112Z"
      fill={cor}
      opacity="0.35"
    />
    <path
      d="M20 108C26 66 54 34 100 24 88 66 60 96 20 108Z"
      fill={cor}
      opacity="0.5"
    />
    <path d="M8 112C40 96 74 62 92 20" stroke={cor} strokeWidth="1.5" fill="none" />
  </svg>
);

const Canto = ({
  cor,
  style,
}: {
  cor: string;
  style: React.CSSProperties;
}) => (
  <span
    aria-hidden
    style={{
      position: "absolute",
      width: 26,
      height: 26,
      borderColor: cor,
      ...style,
    }}
  />
);

const AdminCertificados = () => {
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [cursoId, setCursoId] = useState("");
  const [aluno, setAluno] = useState("");
  const [turma, setTurma] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("curso_diplomas")
        .select("*, cursos!inner(titulo)")
        .order("nome_exibicao");
      const lista = (data ?? []).map((d: any) => ({
        ...d,
        titulo: d.cursos?.titulo ?? d.nome_exibicao,
      })) as Diploma[];
      setDiplomas(lista);
      if (lista.length) setCursoId(lista[0].curso_id);
      setCarregando(false);
    })();
  }, []);

  const dip = useMemo(
    () => diplomas.find((d) => d.curso_id === cursoId) ?? null,
    [diplomas, cursoId],
  );

  const estatisticas = dip
    ? [
        { valor: dip.carga_horaria || "—", rotulo: "Carga horária" },
        { valor: dip.n_aulas ?? "—", rotulo: "Aulas concluídas" },
        { valor: dip.n_modulos ?? "—", rotulo: "Módulos" },
        { valor: turma || "—", rotulo: "Turma" },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Certificados — Admin" noindex />
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { size: A4 landscape; margin: 0; }
          html, body { background: #fff !important; }
          #cert-wrap { padding: 0 !important; background: none !important; }
          #certificado {
            box-shadow: none !important;
            margin: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
            border-radius: 0 !important;
            page-break-after: avoid;
          }
        }
      `}</style>

      <div className="no-print">
        <AdminNav />
      </div>

      <div className="no-print max-w-5xl mx-auto px-4 py-6">
        <h1 className="font-serif text-2xl font-bold mb-4">Certificados</h1>
        <div className="grid gap-4 md:grid-cols-4 items-end">
          <div>
            <Label htmlFor="curso">Curso</Label>
            <select
              id="curso"
              value={cursoId}
              onChange={(e) => setCursoId(e.target.value)}
              className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {carregando && <option>Carregando…</option>}
              {diplomas.map((d) => (
                <option key={d.curso_id} value={d.curso_id}>
                  {d.titulo}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="aluno">Nome do aluno</Label>
            <Input
              id="aluno"
              value={aluno}
              onChange={(e) => setAluno(e.target.value)}
              placeholder="Maria da Silva"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="turma">Turma</Label>
            <Input
              id="turma"
              value={turma}
              onChange={(e) => setTurma(e.target.value)}
              placeholder="2024"
              className="mt-1"
            />
          </div>
          <Button onClick={() => window.print()} className="gap-2">
            <Printer className="w-4 h-4" /> Baixar PDF
          </Button>
        </div>
      </div>

      <div id="cert-wrap" className="px-4 pb-12 flex justify-center bg-muted/40">
        {dip && (
          <div
            id="certificado"
            style={{
              width: "297mm",
              height: "210mm",
              position: "relative",
              overflow: "hidden",
              background:
                "radial-gradient(ellipse at 50% 35%, #FBF3E7 0%, #F7EBD9 55%, #F1E2CB 100%)",
              color: TINTA,
              boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
              margin: "24px 0",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {/* moldura externa */}
            <div
              style={{
                position: "absolute",
                inset: "10mm",
                border: `2px solid ${dip.cor_acento}`,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: "13mm",
                border: `1px solid ${dip.cor_primaria}55`,
                pointerEvents: "none",
              }}
            />

            {/* cantos em ângulo reto */}
            <div style={{ position: "absolute", inset: "16mm", pointerEvents: "none" }}>
              <Canto
                cor={dip.cor_acento}
                style={{ top: 0, left: 0, borderTop: "2px solid", borderLeft: "2px solid" }}
              />
              <Canto
                cor={dip.cor_acento}
                style={{ top: 0, right: 0, borderTop: "2px solid", borderRight: "2px solid" }}
              />
              <Canto
                cor={dip.cor_acento}
                style={{ bottom: 0, left: 0, borderBottom: "2px solid", borderLeft: "2px solid" }}
              />
              <Canto
                cor={dip.cor_acento}
                style={{ bottom: 0, right: 0, borderBottom: "2px solid", borderRight: "2px solid" }}
              />
            </div>

            {/* pétalas ornamentais */}
            <Petala
              cor={dip.cor_primaria}
              className="absolute"
              // eslint-disable-next-line react/no-unknown-property
            />
            <div style={{ position: "absolute", top: "14mm", left: "14mm", width: 90, height: 90 }}>
              <Petala cor={dip.cor_primaria} className="w-full h-full" />
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "14mm",
                right: "14mm",
                width: 90,
                height: 90,
                transform: "rotate(180deg)",
              }}
            >
              <Petala cor={dip.cor_primaria} className="w-full h-full" />
            </div>

            {/* conteúdo */}
            <div
              style={{
                position: "relative",
                height: "100%",
                padding: "20mm 26mm",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                textAlign: "center",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <img src={PORTAL_LOGO} alt="Portal Ayurveda" style={{ width: 150 }} />
                <p
                  style={{
                    fontSize: 13,
                    letterSpacing: "0.42em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    color: dip.cor_acento,
                    marginLeft: "0.42em",
                  }}
                >
                  Certificado de Conclusão
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 4 }}>
                  {dip.logo_url && (
                    <img src={dip.logo_url} alt="" aria-hidden style={{ width: 50, height: 50, objectFit: "contain" }} />
                  )}
                  <div style={{ textAlign: "left" }}>
                    <p
                      style={{
                        fontFamily: "'Roboto Serif', Georgia, serif",
                        fontStyle: "italic",
                        fontWeight: 700,
                        fontSize: 30,
                        lineHeight: 1.1,
                        color: dip.cor_primaria,
                      }}
                    >
                      {dip.nome_exibicao}
                    </p>
                    <p
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.36em",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        color: dip.cor_escura,
                      }}
                    >
                      Ayurveda
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ maxWidth: 660 }}>
                <p style={{ fontSize: 15, color: `${TINTA}CC` }}>Certificamos que</p>
                <p
                  style={{
                    fontFamily: "'Roboto Serif', Georgia, serif",
                    fontStyle: "italic",
                    fontWeight: 600,
                    fontSize: 42,
                    lineHeight: 1.2,
                    margin: "6px 0 10px",
                    color: TINTA,
                  }}
                >
                  {aluno || "Nome do aluno"}
                </p>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: `${TINTA}E6` }}>
                  concluiu com dedicação o curso{" "}
                  <em style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontWeight: 600, color: dip.cor_escura }}>
                    {dip.nome_exibicao} do Ayurveda
                  </em>
                  , {dip.texto_certificado}.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 34,
                  paddingTop: 14,
                  borderTop: `1px solid ${dip.cor_primaria}40`,
                  width: "70%",
                }}
              >
                {estatisticas.map((e, i) => (
                  <div
                    key={e.rotulo}
                    style={{
                      paddingLeft: i === 0 ? 0 : 34,
                      borderLeft: i === 0 ? "none" : `1px solid ${dip.cor_clara}`,
                      minWidth: 96,
                    }}
                  >
                    <p style={{ fontSize: 22, fontWeight: 700, color: dip.cor_primaria }}>{e.valor}</p>
                    <p
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: `${TINTA}99`,
                      }}
                    >
                      {e.rotulo}
                    </p>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <img src={PORTAL_LOGO} alt="Portal Ayurveda" style={{ height: 50 }} />
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: "'Roboto Serif', Georgia, serif",
                      fontStyle: "italic",
                      fontWeight: 600,
                      fontSize: 22,
                      color: TINTA,
                    }}
                  >
                    Edson Osorio
                  </p>
                  <p style={{ fontSize: 11, letterSpacing: "0.1em", color: `${TINTA}AA` }}>
                    Professor &amp; Diretor Pedagógico
                  </p>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <img src={samkhyaLogo} alt="Samkhya" style={{ height: 42 }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCertificados;
