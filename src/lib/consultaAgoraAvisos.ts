let audio: AudioContext | undefined;
export function prepararAvisosConsulta() {
  try { audio ??= new AudioContext(); void audio.resume(); } catch { /* navegador sem áudio */ }
  if ('Notification' in window && Notification.permission === 'default' && !localStorage.getItem('consulta-notificacao-pedida')) {
    localStorage.setItem('consulta-notificacao-pedida', '1');
    void Notification.requestPermission().catch(() => undefined);
  }
}
export function somConsulta() {
  try {
    audio ??= new AudioContext();
    if (audio.state !== 'running') return;
    [0, 0.22].forEach((delay, i) => {
      const osc = audio?.createOscillator(), ganho = audio?.createGain();
      if (!audio || !osc || !ganho) return;
      const inicio = audio.currentTime + delay;
      osc.type = 'sine'; osc.frequency.value = i ? 880 : 660;
      ganho.gain.setValueAtTime(0, inicio); ganho.gain.linearRampToValueAtTime(0.09, inicio + 0.015); ganho.gain.exponentialRampToValueAtTime(0.001, inicio + 0.2);
      osc.connect(ganho); ganho.connect(audio.destination); osc.start(inicio); osc.stop(inicio + 0.22);
    });
  } catch { /* som não impede atendimento */ }
}