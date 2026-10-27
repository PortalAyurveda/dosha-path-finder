import { describe, it, expect } from 'vitest';
import { textoAtende, contarAtendimento } from './terapiaPublica';
describe('atendimento', () => {
  it('junta com e', () => { expect(textoAtende(['Presencial','Online'])).toBe('Presencial e Online'); expect(textoAtende(null)).toBe(''); });
  it('conta cada opção', () => { expect(contarAtendimento([{atendimento:['Online']},{atendimento:['Online','Presencial']},{}])).toEqual([{nome:'Online',total:2},{nome:'Presencial',total:1}]); });
});
