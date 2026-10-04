import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const h = vi.hoisted(() => {
  const state: any = {
    minhasSeq: [] as any[],
    minhasCalls: 0,
    bucket: null as string | null,
    upload: vi.fn(async () => ({ error: null })),
    signed: vi.fn(async (p: string) => ({ data: { signedUrl: "https://api.portalayurveda.com/" + p } })),
    salvarArgs: null as any,
    rpc: async (name: string, args: any) => {
      if (name === "lingua_minhas") {
        const i = state.minhasCalls;
        state.minhasCalls += 1;
        return { data: state.minhasSeq[i] ?? state.minhasSeq[state.minhasSeq.length - 1], error: null };
      }
      if (name === "lingua_salvar") {
        state.salvarArgs = args;
        return { data: { ok: true }, error: null };
      }
      return { data: null, error: new Error("rpc inesperada: " + name) };
    },
  };
  const supabase = {
    rpc: state.rpc,
    storage: {
      from: (b: string) => {
        state.bucket = b;
        return { upload: state.upload, createSignedUrl: state.signed };
      },
    },
  };
  return { state, supabase };
});

vi.mock("@/integrations/supabase/client", () => ({ supabase: h.supabase }));
vi.mock("@/contexts/UserContext", () => ({ useUser: () => ({ user: { id: "u1" } }) }));
vi.mock("@/lib/imageOptimize", () => ({
  optimizeImageToJpeg: async (f: File) => ({
    file: new File([f], "otimizada.jpg", { type: "image/jpeg" }),
    blob: new Blob(),
    originalSize: f.size,
    optimizedSize: f.size,
    width: 1600,
    height: 1200,
    optimized: true,
  }),
}));

import LinguaMomentos from "@/components/curso/LinguaMomentos";

const base = {
  agora: "2026-10-04T18:00:00+00:00",
  tem_direito: true,
  programa: {
    slug: "detox-primavera-2026",
    titulo: "Detox da Primavera",
    chamada: "Leitura da língua",
    titulo_tela: "As três fotos da sua língua",
    descricao: "No começo, no fim dos 10 dias e um mês depois.",
    dica: "Luz natural, língua relaxada.",
  },
  marcos: [
    {
      n: 1,
      titulo: "Começo do Detox",
      texto: null,
      abre_em: "2026-10-04T03:00:00+00:00",
      fecha_em: "2026-10-22T02:59:59+00:00",
      aberta: true,
      foto_path: null,
      enviada_em: null,
      estado: "aberta",
    },
    {
      n: 2,
      titulo: "Fim dos 10 dias",
      texto: "Fica guardada para quando o Detox terminar.",
      abre_em: "2026-10-15T03:00:00+00:00",
      fecha_em: "2026-11-01T02:59:59+00:00",
      aberta: false,
      foto_path: null,
      enviada_em: null,
      estado: "futura",
    },
    {
      n: 3,
      titulo: "Um mês depois",
      texto: "Fica guardada para um mês depois.",
      abre_em: "2026-11-14T03:00:00+00:00",
      fecha_em: "2026-12-01T02:59:59+00:00",
      aberta: false,
      foto_path: null,
      enviada_em: null,
      estado: "futura",
    },
  ],
};

const comFoto = {
  ...base,
  marcos: base.marcos.map((m) =>
    m.n === 1
      ? { ...m, foto_path: "u1/detox-primavera-2026/1/1727000000000.jpg", enviada_em: "2026-10-04T18:00:00+00:00", estado: "feita" }
      : m,
  ),
};

beforeEach(() => {
  h.state.minhasSeq = [];
  h.state.minhasCalls = 0;
  h.state.bucket = null;
  h.state.salvarArgs = null;
  h.state.upload = vi.fn(async () => ({ error: null }));
});

describe("LinguaMomentos", () => {
  it("mostra os três momentos com os selos e as fotos certos", async () => {
    h.state.minhasSeq = [base];
    render(<LinguaMomentos programa="detox-primavera-2026" />);

    expect(await screen.findByText("As três fotos da sua língua")).toBeInTheDocument();
    expect(screen.getByText("Começo do Detox")).toBeInTheDocument();
    expect(screen.getByText("Aberta até 21/10")).toBeInTheDocument();
    expect(screen.getByText("Abre em 14/10")).toBeInTheDocument();
    expect(screen.getByText("Abre em 13/11")).toBeInTheDocument();
    expect(screen.getByText("Fica guardada para quando o Detox terminar.")).toBeInTheDocument();

    // só o momento aberto tem botões de foto
    expect(screen.getAllByText("Tirar a foto agora")).toHaveLength(1);
    expect(screen.getAllByText("Escolher uma foto do celular")).toHaveLength(1);
    expect(screen.queryByText(/trocar a foto/i)).not.toBeInTheDocument();
  });

  it("guarda a foto no caminho da pessoa e mostra a foto guardada", async () => {
    h.state.minhasSeq = [base, comFoto];
    render(<LinguaMomentos programa="detox-primavera-2026" />);
    await screen.findByText("Começo do Detox");

    const campo = document.querySelector('input[type="file"]') as HTMLInputElement;
    const arquivo = new File([new Uint8Array([1, 2, 3])], "lingua.png", { type: "image/png" });
    fireEvent.change(campo, { target: { files: [arquivo] } });

    await waitFor(() => expect(h.state.salvarArgs).not.toBeNull());
    expect(h.state.bucket).toBe("linguas-leituras");
    expect(h.state.upload).toHaveBeenCalledTimes(1);
    const path = h.state.salvarArgs.p_foto_path as string;
    expect(path).toMatch(/^u1\/detox-primavera-2026\/1\/\d+\.jpg$/);
    expect(h.state.salvarArgs).toEqual({
      p_programa: "detox-primavera-2026",
      p_n: 1,
      p_foto_path: path,
    });
    expect(h.state.upload.mock.calls[0][2]).toMatchObject({ contentType: "image/jpeg" });

    expect(await screen.findByText("Guardada em 04/10")).toBeInTheDocument();
    expect(screen.getByText("Só você vê essa foto.")).toBeInTheDocument();
    expect(screen.getByAltText("A foto da sua língua")).toHaveAttribute(
      "src",
      "https://api.portalayurveda.com/u1/detox-primavera-2026/1/1727000000000.jpg",
    );
    expect(screen.getByText("Trocar a foto")).toBeInTheDocument();
    expect(screen.queryByText("Tirar a foto agora")).not.toBeInTheDocument();
  });

  it("avisa quando a foto não consegue ser guardada", async () => {
    h.state.upload = vi.fn(async () => ({ error: new Error("storage") }));
    h.state.minhasSeq = [base];
    render(<LinguaMomentos programa="detox-primavera-2026" />);
    await screen.findByText("Começo do Detox");

    const campo = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(campo, { target: { files: [new File(["x"], "l.jpg", { type: "image/jpeg" })] } });

    expect(await screen.findByText("Não consegui guardar a foto. Tente de novo.")).toBeInTheDocument();
    expect(h.state.salvarArgs).toBeNull();
  });

  it("não mostra nada para quem não está no curso", async () => {
    h.state.minhasSeq = [{ agora: base.agora, tem_direito: false, programa: null, marcos: [] }];
    const { container } = render(<LinguaMomentos programa="detox-primavera-2026" />);
    await waitFor(() => expect(h.state.minhasCalls).toBeGreaterThan(0));
    expect(container.textContent).toBe("");
  });
});
