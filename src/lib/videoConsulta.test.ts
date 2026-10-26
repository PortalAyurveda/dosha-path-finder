import {afterEach,describe,it,expect,vi} from 'vitest';
import {VIDEO_CONFIG,iniciarGravacaoLocal,nomeGravacao,tipoGravacao} from './videoConsulta';
afterEach(()=>vi.unstubAllGlobals());
describe('Vídeo e gravação da consulta',()=>{
  it('pede 720p com queda até 180p e máximo de 30 quadros',()=>{expect(VIDEO_CONFIG.resolution).toBe(720);expect(VIDEO_CONFIG.constraints.video).toEqual({height:{ideal:720,max:720,min:180},frameRate:{ideal:30,max:30}});});
  it('mantém simulcast e adaptação de rede ativos',()=>{expect(VIDEO_CONFIG.disableSimulcast).toBe(false);expect(VIDEO_CONFIG.videoQuality.enableAdaptiveMode).toBe(true);});
  it('prefere VP9 no computador e VP8 no celular antes de AV1',()=>{expect(VIDEO_CONFIG.videoQuality.codecPreferenceOrder).toEqual(['VP9','VP8','H264','AV1']);expect(VIDEO_CONFIG.videoQuality.mobileCodecPreferenceOrder).toEqual(['VP8','H264','VP9']);});
  it('habilita conexão direta para duas pessoas',()=>{expect(VIDEO_CONFIG.p2p).toMatchObject({enabled:true,codecPreferenceOrder:['VP9','VP8','H264']});});
  it('limita compartilhamento entre 5 e 15 quadros',()=>{expect(VIDEO_CONFIG.desktopSharingFrameRate).toEqual({min:5,max:15});});
  it('baixa com nome, data e horário local',()=>{expect(nomeGravacao('Maria Aparecida',new Date(2026,9,26,18,23),'video/webm')).toBe('Consulta Maria Aparecida 26-10-2026 18h23.webm');});
  it('usa mp4 quando webm não é aceito',()=>{expect(tipoGravacao(t=>t==='video/mp4')).toBe('video/mp4');expect(nomeGravacao('Maria',new Date(2026,9,26,18,23),'video/mp4')).toBe('Consulta Maria 26-10-2026 18h23.mp4');});
  it('recusa captura sem permissão sem abrir o microfone',async()=>{const mic=vi.fn();vi.stubGlobal('navigator',{mediaDevices:{getDisplayMedia:vi.fn().mockRejectedValue(new Error('denied')),getUserMedia:mic}});vi.stubGlobal('MediaRecorder',class {});await expect(iniciarGravacaoLocal('Maria',vi.fn())).rejects.toThrow('Seu navegador não deixou gravar. No computador, use o Chrome e escolha esta aba.');expect(mic).not.toHaveBeenCalled();});
  it('libera captura da aba quando o microfone é negado',async()=>{const stop=vi.fn();const track={stop,readyState:'live'};vi.stubGlobal('navigator',{mediaDevices:{getDisplayMedia:vi.fn().mockResolvedValue({getVideoTracks:()=>[track],getTracks:()=>[track]}),getUserMedia:vi.fn().mockRejectedValue(new Error('denied'))}});vi.stubGlobal('MediaRecorder',class {});await expect(iniciarGravacaoLocal('Maria',vi.fn())).rejects.toThrow();expect(stop).toHaveBeenCalledOnce();expect(track).toHaveProperty('contentHint','detail');});
});