import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { terapia } from '@/lib/terapia';
import type { FichaPaciente } from '@/lib/terapiaPaciente';
import type { FolhaIndicacoes, FontesIndicacoes } from '@/lib/terapiaIndicacoes';
import { Editor as EditorIndicacoes } from '@/pages/IndicacoesTerapeuta';

const FONTES_VAZIAS: FontesIndicacoes = { para_ela: [], rotina_dela: null, rotina: {}, samkhya: [], aulas: [], versos: [] };

/** Folha da consulta que já está ligada a esta avaliação; as mais recentes são conferidas primeiro. */
async function folhaDaAvaliacao(paciente: string, avaliacao: string): Promise<FolhaIndicacoes | null> {
  const lista = (await terapia.folhasDa(paciente)).slice().sort((a, b) => Date.parse(b.criado_em) - Date.parse(a.criado_em)).slice(0, 5);
  for (const f of lista) {
    const folha = await terapia.folha(f.id);
    if (folha.avaliacao_id === avaliacao || folha.avaliacao?.id === avaliacao) return folha;
  }
  return null;
}

/** Aba "Indicações" da sala: a mesma folha em 5 momentos, sem sair da sala. No treino, nada é gravado. */
export default function IndicacoesSala({ ficha, avaliacao, consulta, treino = false, userId, onSaveReady }: { ficha: FichaPaciente; avaliacao: string; consulta?: string; treino?: boolean; userId?: string; onSaveReady?: (salvar: () => Promise<boolean>) => void }) {
  const qc = useQueryClient(); const [ocupado, setOcupado] = useState(false); const [erro, setErro] = useState('');
  const chave = ['sala-indicacoes', userId, ficha.paciente_id, avaliacao];
  const q = useQuery({ queryKey: chave, enabled: !treino, retry: false, queryFn: async () => { const [folha, fontes] = await Promise.all([folhaDaAvaliacao(ficha.paciente_id, avaliacao), terapia.indicacoesFontes(ficha.paciente_id)]); return { folha, fontes }; } });
  const [folhaTreino] = useState<FolhaIndicacoes>(() => ({ id: 'treino', paciente_user_id: 'treino', paciente_nome: ficha.nome, criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString(), enviada_em: null, vista_em: null, dados: {}, diagnostico: '', tratamento: '', retorno: '', secoes: [], avaliacao: null } as unknown as FolhaIndicacoes));
  if (treino) return <EditorIndicacoes sala treino folha={folhaTreino} fontes={FONTES_VAZIAS} terapeuta="" userId={userId} ficha={ficha} onSaveReady={onSaveReady} />;
  if (q.error) return <div role="alert" className="space-y-3 p-5">{q.error.message}<button type="button" className="m-btn" onClick={() => void q.refetch()}>Tentar novamente</button></div>;
  if (!q.data) return <p role="status" className="p-5">Carregando indicações…</p>;
  if (!q.data.folha) {
    const comecar = async () => { setOcupado(true); setErro(''); try { await terapia.folhaNova(ficha.paciente_id, avaliacao, consulta); await qc.invalidateQueries({ queryKey: chave }); } catch (e) { setErro(e instanceof Error ? e.message : String(e)); } finally { setOcupado(false); } };
    return <div className="sala-ind-vazia"><p>A folha desta consulta ainda não começou.</p><button type="button" data-terapia-principal className="m-btn pri" disabled={ocupado} onClick={() => void comecar()}>{ocupado ? 'Começando…' : 'Começar a folha'}</button>{erro && <p role="alert">{erro}</p>}</div>;
  }
  return <EditorIndicacoes key={q.data.folha.id} sala folha={q.data.folha} fontes={q.data.fontes} terapeuta="" userId={userId} ficha={ficha} onSaveReady={onSaveReady} />;
}
