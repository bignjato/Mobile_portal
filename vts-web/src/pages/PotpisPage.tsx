import { useRef, useState, useEffect } from 'react';
import type { RadniNalog } from '../types';
import { pushPotpis } from '../services/api';

interface Props {
  nalog: RadniNalog;
  onBack: () => void;
  onDone: (updated: RadniNalog) => void;
}

export default function PotpisPage({ nalog, onBack, onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [potpisPartner, setPotpisPartner] = useState('');
  const [isEmpty, setIsEmpty] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    } else {
      return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
    }
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setDrawing(true);
    setIsEmpty(false);
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function stopDraw() { setDrawing(false); }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  }

  async function handleSpremi() {
    if (isEmpty) { showToast('⚠ Potpis je prazan'); return; }
    if (!potpisPartner.trim()) { showToast('⚠ Unesite ime potpisnika'); return; }

    setLoading(true);
    try {
      const canvas = canvasRef.current!;
      const potpis = canvas.toDataURL('image/png');

      let gps = '';
      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
          );
          gps = `${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`;
        } catch { gps = ''; }
      }

      try {
        await pushPotpis(nalog.id, potpis, potpisPartner, gps, nalog.stavke);
      } catch {
        // Spremi lokalno ako API nedostupan
        localStorage.setItem(`potpis_${nalog.id}`, JSON.stringify({
          potpis, potpisPartner, gps, stavke: nalog.stavke, timestamp: new Date().toISOString()
        }));
      }

      showToast('✅ Potpisano i spremljeno!');
      setTimeout(() => onDone({ ...nalog, status: 'POTPISAN', potpis, potpisPartner }), 1200);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen">
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="back-btn" onClick={onBack}>‹</button>
          <div>
            <div style={{ color: 'white', fontSize: 17, fontWeight: 800 }}>Digitalni potpis</div>
            <div className="header-subtitle">{nalog.brojRN} · {nalog.partner.naziv}</div>
          </div>
        </div>
      </div>

      <div className="scroll-area">
        {/* Pregled stavki */}
        <div className="detalj-section">
          <div className="detalj-section-header">📦 Preuzeto</div>
          {nalog.stavke.map(s => (
            <div key={s.rbr} style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{s.nazivRobe}</div>
                {s.tipSpremnika && (
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                    {s.tipSpremnika === 'KANTA' ? '🗑️ Kanta' :
                     s.tipSpremnika === 'PRESS_KONTEJNER' ? '🏗️ Press kontejner' :
                     s.tipSpremnika === 'OTVORENI_KONTEJNER' ? '📦 Otvoreni kontejner' :
                     s.tipSpremnika === 'PALBOX' ? '🧺 Palbox' : s.tipSpremnika}
                  </div>
                )}
              </div>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--dark)' }}>
                {s.kolicina.toLocaleString('hr')} {s.jedMjere}
              </div>
            </div>
          ))}
        </div>

        {/* Ime potpisnika */}
        <div className="form-group">
          <label className="form-label">Ime i prezime potpisnika (partner)</label>
          <input
            className="form-input"
            type="text"
            value={potpisPartner}
            onChange={e => setPotpisPartner(e.target.value)}
            placeholder="npr. Ivan Horvat"
            style={{ fontSize: 18, padding: '14px 12px' }}
          />
        </div>

        {/* Područje za potpis */}
        <div className="detalj-section">
          <div className="detalj-section-header">
            ✍️ Potpis partnera
            <button
              onClick={clearCanvas}
              style={{ float: 'right', fontSize: 13, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, padding: '0 4px' }}
            >
              Obriši
            </button>
          </div>
          <div style={{ padding: '12px 12px 16px', position: 'relative' }}>
            <canvas
              ref={canvasRef}
              width={900}
              height={320}
              style={{
                width: '100%',
                height: 220,
                borderRadius: 10,
                border: isEmpty ? '2px dashed #CBD5E1' : '2px solid var(--dark)',
                touchAction: 'none',
                cursor: 'crosshair',
                background: '#FFFFFF',
                display: 'block',
              }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />
            {isEmpty && (
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#CBD5E1', fontSize: 15, fontWeight: 600,
                pointerEvents: 'none', textAlign: 'center',
              }}>
                Potpišite ovdje prstom
              </div>
            )}
          </div>
        </div>

        <button
          className="btn btn-red"
          style={{ fontSize: 17, padding: 18, marginBottom: 24 }}
          onClick={handleSpremi}
          disabled={loading || isEmpty || !potpisPartner.trim()}
        >
          {loading ? '⏳ Spremanje...' : '✅ Potvrdi i završi nalog'}
        </button>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
