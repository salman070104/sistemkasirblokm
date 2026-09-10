// Web Audio API Sound Synthesizer untuk Sistem Kasir
// Bekerja 100% offline, tanpa unduh file MP3 eksternal, instan dan ringan.

class SoundManager {
  private ctx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Cek apakah suara diizinkan di Pengaturan
  private isSoundAllowed(type: "master" | "barcode" | "checkout" | "error"): boolean {
    if (typeof window === "undefined") return false;
    const master = localStorage.getItem("pos_sound_enabled");
    if (master === "false") return false;

    if (type === "barcode") {
      const barcode = localStorage.getItem("pos_sound_barcode");
      return barcode !== "false";
    }
    if (type === "checkout") {
      const checkout = localStorage.getItem("pos_sound_checkout");
      return checkout !== "false";
    }
    if (type === "error") {
      const err = localStorage.getItem("pos_sound_error");
      return err !== "false";
    }
    return true;
  }

  // 1. Suara Beep Scanner Barcode (1800 Hz, crisp 70ms beep)
  public playBarcodeBeep(force = false): void {
    if (!force && !this.isSoundAllowed("barcode")) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1850, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Abaikan jika browser memblokir audio
    }
  }

  // 2. Suara Kaching / Transaksi Berhasil (Arpeggio Nada C Mayor ceria)
  public playSuccessChime(force = false): void {
    if (!force && !this.isSoundAllowed("checkout")) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const notes = [
        { freq: 1046.5, time: 0, dur: 0.12 },     // C6
        { freq: 1318.51, time: 0.08, dur: 0.12 },  // E6
        { freq: 1567.98, time: 0.16, dur: 0.14 },  // G6
        { freq: 2093.0, time: 0.24, dur: 0.25 },   // C7 (High bell note)
      ];

      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

        gain.gain.setValueAtTime(0.2, ctx.currentTime + time);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + dur);
      });
    } catch {
      // Abaikan jika ada error
    }
  }

  // 3. Suara Peringatan / Error (Low dual tone buzz)
  public playErrorBeep(force = false): void {
    if (!force && !this.isSoundAllowed("error")) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.setValueAtTime(220, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.22);
    } catch {
      // Abaikan
    }
  }
}

export const soundManager = new SoundManager();
