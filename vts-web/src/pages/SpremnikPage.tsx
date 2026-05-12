import { useState } from 'react';
import type { RadniNalog, StavkaRN } from '../types';

const TIPOVI = [
  { id: 'KANTA', label: 'Kanta', emoji: '🗑️' },
  { id: 'PRESS_KONTEJNER', label: 'Press kontejner', emoji: '🔲' },
  { id: 'OTVORENI_KONTEJNER', label: 'Otvoreni kontejner', emoji: '📦' },
  { id: 'PALBOX', label: 'Palbox', emoji: '📫' },
];

interface Props {
  nalog: RadniNalog;
  onBack: () => void;
  onDone: (updatedNalog: RadniNalog) => void;
}

export default function SpremnikPage({ nalog, onBack, onDone }: Props) {
  const [stavke, setStavke] = useState<StavkaRN[]>(
    nalog.stavke.map(s => ({ ...s, tipSpremnika: s.tipSpremnika || '', kolicina: s.kolicina || 0 }))
  );
  const [activeIdx, setActiveIdx] = useState(0);

  const current = stavke[activeIdx];

  function setTip(tip: string) {
    setStavke(prev => prev.map((s, i) => i === activeIdx ? { ...s, tipSpremnika: tip } : s));
  }

  function setKolicina(val: string) {
    const n = parseFloat(val.replace(',', '.')) || 0;
    setStavke(prev => prev.map((s, i) => i === activeIdx ? { ...s, kolicina: n } : s));
  }

  function handleNext() {
    if (activeIdx < stavke.length - 1) {
      setActiveIdx(activeIdx + 1);
    } else {
      onDone({ ...nalog, stavke });
    }
  }

  const isLast = activeIdx === stavke.length - 1;
  const canNext = !!current.tipSpremnika && current.kolicina > 0;

  return (
    <div className="screen">
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="back-btn" onClick={onBack}>‹</button>
          <div>
            <div style={{ color: 'white', fontSize: 17, fontWeight: 800 }}>Preuzimanje otpada</div>
            <div className="header-subtitle">{nalog.brojRN} · {nalog.partner.naziv}</div>
          </div>
        </div>
        {stavke.length > 1 && (
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '4px 12px', fontSize: 13, color: 'white', fontWeight: 700 }}>
            {activeIdx + 1}/{stavke.length}
          </div>
        )}
      </div>

      <div className="scroll-area">
        <div style={{ margin: '0 0 8px', padding: '16px', background: '#F8FAFC', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>Stavka {activeIdx + 1}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--dark)' }}>{current.nazivRobe}</div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Šifra: {current.sifraArtikla}</div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <div className="detalj-section-header" style={{ marginBottom: 10 }}>Tip spremnika</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {TIPOVI.map(t => (
              <button
                key={t.id}
                onClick={() => setTip(t.id)}
                style={{
                  padding: '18px 12px', borderRadius: 14,
                  border: current.tipSpremnika === t.id ? '2.5px solid var(--red)' : '2px solid var(--border)',
                  background: current.tipSpremnika === t.id ? '#FEF2F2' : 'white',
                  cursor: 'pointer', textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 6 }}>{t.emoji}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: current.tipSpremnika === t.id ? 'var(--red)' : 'var(--dark)' }}>
                  {t.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {current.tipSpremnika && (
          <div className="detalj-section" style={{ marginBottom: 8 }}>
            <div className="detalj-section-header" style={{ marginBottom: 10 }}>Količina ({current.jedMjere})</div>
            <input
              className="form-input"
              type="number"
              inputMode="decimal"
              style={{ fontSize: 32, fontWeight: 800, textAlign: 'center', padding: '20px', borderRadius: 12, width: '100%' }}
              value={current.kolicina || ''}
              onChange={e => setKolicina(e.target.value)}
              placeholder="0"
              min="0"
            />
            <div style={{ textAlign: 'center', fontSize: 13, color: '#94A3B8', marginTop: 8 }}>
              Unesite izmjerenu količinu u {current.jedMjere}
            </div>
          </div>
        )}

        {stavke.length > 1 && (
          <div style={{ padding: '12px 0' }}>
            <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' as const }}>
              Sve stavke
            </div>
            {stavke.map((s, i) => (
              <div key={s.rbr} onClick={() => setActiveIdx(i)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: 10, marginBottom: 6, cursor: 'pointer',
                border: i === activeIdx ? '2px solid var(--red)' : '1.5px solid var(--border)',
                background: i === activeIdx ? '#FEF2F2' : 'white',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{s.nazivRobe}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>
                    {s.tipSpremnika ? TIPOVI.find(t => t.id === s.tipSpremnika)?.label : 'Nije odabran'}
                    {s.kolicina > 0 ? ` · ${s.kolicina} ${s.jedMjere}` : ''}
                  </div>
                </div>
                <div style={{ fontSize: 18 }}>
                  {s.tipSpremnika && s.kolicina > 0 ? '✅' : i === activeIdx ? '✏️' : '⭕'}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          className="btn btn-red"
          style={{ fontSize: 17, padding: '18px', borderRadius: 14, marginTop: 8 }}
          onClick={handleNext}
          disabled={!canNext}
        >
          {isLast ? '✍️ Nastavi na potpis' : '➡️ Sljedeća stavka'}
        </button>
      </div>
    </div>
  );
}
