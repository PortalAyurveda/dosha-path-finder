// Tipos leves do RPG. Tudo é opcional / defensivo — o backend pode omitir campos.
export type Modo =
  | "landing"
  | "criacao"
  | "lobby"
  | "exploracao"
  | "cidade"
  | "quest"
  | "combate"
  | "derrota"
  | "vitoria"
  | string;

export interface Heroi {
  player_id: string;
  nome: string;
  classe: string;
  glyph?: string;
  hp: number;
  max_hp: number;
  mp: number;
  max_mp: number;
  level?: number;
  vivo?: boolean;
  ready?: boolean;
}

export interface Eu {
  id: string;
  nome: string;
  classe: string;
  level?: number;
  hp: number;
  max_hp: number;
  mp: number;
  max_mp: number;
  gold?: number;
  attributes?: Record<string, number>;
  cooldowns?: Record<string, number>;
  glyph?: string;
}

export interface Relogio {
  dia?: number;
  hora?: number;
  fase?: string;
}

export interface Local {
  nome?: string;
  tipo?: string;
  tier?: number;
}

export interface CombatUnit {
  player_id?: string;
  idx?: number;
  nome: string;
  glyph?: string;
  tile: number;
  hp: number;
  max_hp: number;
  mp?: number;
  max_mp?: number;
  efeitos?: any[];
  defendendo?: boolean;
  is_boss?: boolean;
  tamanho?: string;
  comportamento?: string;
  fases?: number;
  fase_idx?: number;
  defesa?: number;
}

export interface CombatState {
  round?: number;
  turno_heroi?: string;
  herois: CombatUnit[];
  inimigos: CombatUnit[];
}

export interface Skill {
  name: string;
  type?: string;
  mana_cost?: number;
  cooldown?: number;
  target?: string;
  effect?: { alcance?: "curto" | "medio" | "longo"; [k: string]: any };
  alcance?: "curto" | "medio" | "longo";
  descricao?: string;
}

export interface Cena {
  ok?: boolean;
  modo?: Modo;
  party?: {
    turno_de?: string;
    meu_turno?: boolean;
    herois?: Heroi[];
  };
  eu?: Eu;
  relogio?: Relogio;
  local?: Local;
  level_up?: null | { picks_pendentes: number; level: number; opcoes: Skill[] };
  dica?: string;
  // por modo
  combate?: CombatState;
  skills?: Skill[];
  cidade?: any;
  npcs?: any[];
  loja?: { itens?: any[] };
  painel_pronto?: any;
  todos_prontos?: boolean;
  verbos?: string[];
  quest?: { titulo?: string; tier?: number };
  salas_total?: number;
  sala_atual?: { ordem?: number; nome?: string; tipo?: string; resumo?: string; tem_boss?: boolean; acoes_classe?: any };
  proximo?: { nome?: string; tipo?: string; tier?: number };
  pode_frente?: boolean;
  pode_tras?: boolean;
  [k: string]: any;
}

export interface LogEntry {
  id: string;
  ts: number;
  quem: string;
  texto: string;
  tipo?: "narrativa" | "sistema" | "erro" | "combate";
}
