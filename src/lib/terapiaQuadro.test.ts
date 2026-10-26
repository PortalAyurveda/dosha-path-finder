import {describe,it,expect,vi} from 'vitest';
import {fotosDoQuadro,tamanhoQuadro} from './terapiaQuadro';
import {ordenarMinhas,inicioYoutube,enderecoAcervo} from './terapiaAcervo';
vi.mock('@/integrations/supabase/client',()=>({supabase:{rpc:vi.fn(),storage:{from:vi.fn()}}}));
import {supabase} from '@/integrations/supabase/client';
import {terapia} from './terapia';
describe('Parte 6',()=>{
 it('limita PNG a 1600 px no lado maior sem deformar',()=>{expect(tamanhoQuadro(3200,2000)).toEqual({width:1600,height:1000});expect(tamanhoQuadro(800,2000)).toEqual({width:640,height:1600});});
 it('não retorna fotos nem língua sem permissão',()=>{expect(fotosDoQuadro({permitido:false,fotos:[{id:'f',bucket:'b',path:'p',criado_em:''}],lingua:[{id:'l',bucket:'b',path:'l',criado_em:''}]})).toEqual([]);});
 it('preserva bucket e path de fotos e língua',()=>{const f={id:'f',bucket:'fotos',path:'u/f',criado_em:''};const l={id:'l',bucket:'lingua',path:'u/l',criado_em:''};expect(fotosDoQuadro({permitido:true,fotos:[f],lingua:[l]})).toEqual([f,l]);});
 it('assina cada foto no bucket retornado por uma hora',async()=>{const signed=vi.fn().mockResolvedValue({data:{signedUrl:'signed'},error:null});vi.mocked(supabase.storage.from).mockReturnValue({createSignedUrl:signed} as never);await terapia.fotoAssinada({id:'l',bucket:'lingua',path:'u/l',criado_em:''});expect(supabase.storage.from).toHaveBeenCalledWith('lingua');expect(signed).toHaveBeenCalledWith('u/l',3600);});
 it('exclui o caminho devolvido pelo quadro no bucket correto',async()=>{vi.mocked(supabase.rpc as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({data:'u/q.png',error:null} as never);const remove=vi.fn().mockResolvedValue({error:null});vi.mocked(supabase.storage.from).mockReturnValue({remove} as never);const path=await terapia.quadroApagar('q');if(path)await terapia.arquivoApagar('terapia-quadros',path);expect(supabase.rpc).toHaveBeenCalledWith('terapia_quadro_apagar',{p_id:'q'});expect(supabase.storage.from).toHaveBeenCalledWith('terapia-quadros');expect(remove).toHaveBeenCalledWith(['u/q.png']);});
 it('põe itens que servem antes dos outros sem alterar a fonte',()=>{const itens=[{id:'a',serve:false},{id:'b',serve:true}];expect(ordenarMinhas(itens).map(i=>i.id)).toEqual(['b','a']);expect(itens[0].id).toBe('a');});
 it('usa o endereço aprovado do acervo',()=>expect(enderecoAcervo('juliana','cha')).toBe('/terapeutas/juliana/acervo/cha'));
 it('converte mm:ss em segundos',()=>expect(inicioYoutube('02:35')).toBe(155));
});