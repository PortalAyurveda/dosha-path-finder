const ENDERECO_EMPRESA = "Henrique Homem de Melo 189, Pindamonhangaba - SP";

const MESES_PT = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function dataPorExtenso(iso: string): { dia: string; mes: string; ano: string } {
  if (!iso) return { dia: "", mes: "", ano: "" };
  const [y, m, d] = iso.split("-");
  const mesIdx = Math.max(0, Math.min(11, Number(m) - 1));
  return { dia: String(Number(d)), mes: MESES_PT[mesIdx], ano: String(Number(y)) };
}

export type ContratoFormacaoProps = {
  nome_completo: string;
  cpf?: string | null;
  email: string;
  whatsapp?: string | null;
  cidade?: string | null;
  contrato_valor_total?: string | null;
  contrato_forma_pagamento?: string | null;
  contrato_observacao?: string | null;
  data: string; // ISO YYYY-MM-DD
};

export default function ContratoFormacao(props: ContratoFormacaoProps) {
  const d = dataPorExtenso(props.data);
  return (
    <div
      className="mx-auto my-8 bg-white px-10 py-12"
      style={{
        maxWidth: 720,
        fontFamily: "'Georgia', 'Times New Roman', serif",
        fontSize: 14,
        lineHeight: 1.7,
        color: "#111",
      }}
    >
      <h1 style={{ fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: 4 }}>
        CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS
      </h1>
      <h2 style={{ fontSize: 15, fontWeight: 600, textAlign: "center", marginBottom: 24 }}>
        FORMAÇÃO AYURVEDA PROFISSIONALIZANTE — TURMA 2026/2027
      </h2>

      <p style={{ textAlign: "justify", marginBottom: 18 }}>
        De um lado, Samkhya &amp; Portal Ayurveda LTDA, CNPJ nº 34.806.611/0001-43,
        com sede em {ENDERECO_EMPRESA}, representada por Edson Osorio ("CONTRATADA");
        de outro, {props.nome_completo}, CPF nº {props.cpf || "—"},
        e-mail {props.email}, telefone {props.whatsapp || "—"} ("CONTRATANTE").
        As partes firmam o presente contrato de prestação de serviços educacionais,
        mediante as cláusulas a seguir:
      </p>

      <p style={{ fontWeight: 700, marginTop: 16 }}>1. Objeto</p>
      <p style={{ textAlign: "justify" }}>
        Prestação de serviços educacionais referentes à Formação Ayurveda
        Profissionalizante — Turma 2026/2027, com 15 módulos em 3 semestres e
        carga horária certificada de 400 horas (12 módulos on-line e 3 presenciais
        em São Paulo/SP), conforme programa e calendário já disponibilizados ao
        CONTRATANTE.
      </p>

      <p style={{ fontWeight: 700, marginTop: 16 }}>2. Obrigações da Contratada</p>
      <p style={{ textAlign: "justify" }}>
        Ministrar as aulas nas datas previstas, disponibilizar gravações, apostilas
        e material de cada módulo, manter a qualidade do conteúdo, e emitir
        certificado de conclusão ao CONTRATANTE que cumprir os requisitos do curso
        (questionários, diário clínico, TCC e estágio supervisionado).
      </p>

      <p style={{ fontWeight: 700, marginTop: 16 }}>3. Obrigações do Contratante</p>
      <p style={{ textAlign: "justify" }}>
        Participar das aulas e atividades do curso, efetuar o pagamento conforme a
        Cláusula 4ª, e utilizar o material recebido (aulas, gravações, apostilas)
        exclusivamente para uso pessoal, sem reprodução, compartilhamento ou revenda
        a terceiros.
      </p>

      <p style={{ fontWeight: 700, marginTop: 16 }}>4. Investimento</p>
      <p>Valor total: {props.contrato_valor_total || "—"}</p>
      <p>Forma de pagamento: {props.contrato_forma_pagamento || "—"}</p>
      <p style={{ whiteSpace: "pre-wrap" }}>Observação: {props.contrato_observacao || "—"}</p>

      <p style={{ fontWeight: 700, marginTop: 16 }}>5. Disposições Finais</p>
      <p style={{ textAlign: "justify" }}>
        Os dados pessoais do CONTRATANTE serão usados apenas para os fins deste
        contrato. Qualquer alteração deste contrato só é válida se feita por escrito
        e assinada por ambas as partes.
      </p>

      <p style={{ marginTop: 24 }}>
        E, por estarem de acordo, as partes assinam o presente instrumento.
      </p>

      <p style={{ marginTop: 24 }}>
        {(props.cidade || "—")}, {d.dia || "—"} de {d.mes || "—"} de {d.ano || "—"}.
      </p>

      <div style={{ marginTop: 64 }}>
        <div style={{ fontFamily: "'Great Vibes', cursive", fontSize: 42, lineHeight: 1.1, color: "#1a1a1a", marginBottom: 2 }}>
          Edson Osorio
        </div>
        <div style={{ borderTop: "1px solid #333", width: 300, paddingTop: 4, fontSize: 14 }}>
          CONTRATADA — Edson Osorio
        </div>
      </div>

      <div style={{ marginTop: 64 }}>
        <div style={{ borderTop: "1px solid #111", width: 320, marginBottom: 4 }} />
        <p>CONTRATANTE — {props.nome_completo}</p>
      </div>
    </div>
  );
}
