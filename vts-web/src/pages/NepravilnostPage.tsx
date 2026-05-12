import { useState } from 'react';
import type { RadniNalog } from '../types';
import { pushNepravilnost } from '../services/api';

const VRSTE = [
  { id: 'PREPUNA_KANTA', label: '🗑️ Prepuna kanta', opis: 'Kanta je prepuna, nije moguće preuzeti' },
  { id: 'KRIVA_SELEKCIJA', label: '♻️ Kriva selekcija', opis: 'Otpad nije pravilno sortiran' },
  { id: 'NEDOSTUPNA_LOKACIJA', label: '🚧 Nedostupna lokacija', opis: 'Nije moguće prići lokaciji' },
  { id: 'OSTECENA_KANTA', label: '💥 Oštećena kanta', opis: 'Kanta je oštećena ili neispravna' },
  { id: 'NEMA_KANTE', label: '❓ Nema kante', opis: 'Kanta nije pronađena na lokaciji' },
  { id: 'OSTALO', label: '📝 Ostalo', opis: 'Drugi razlog nepravilnosti' },
];

interface Props {
  nalog: RadniNalog;
  onBack: () => void;
  onDone: (updated: RadniNalog) => void;
}

export default function NepravilnostPage({ nalog, onBack, onDone }: Props) {
  const [vrsta, setVrsta] = useState('');
  const [opis, setOpis] = useState('');
  const [fotografija, setFotografija] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFotografija(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSpremi() {
    if (!vrsta) { showToast('⚠ Odaberite vrstu nepravilnosti'); return; }
    if (!opis.trim()) { showToast('⚠ Unesite opis nepravilnosti'); return; }

    setLoading(true);
    try {
      try {
        await pushNepravilnost(nalog.id, vrsta, opis, fotografija ?? undefined);
      } catch {
        const nepravilnosti = JSON.parse(localStorage.getItem('pending_nepravilnosti') || '[]');
        nepravilnosti.push({ nalogId: nalog.id, vrsta, opis, fotografija, timestamp: new Date().toISOString() });
        localStorage.setItem('pending_nepravilnosti', JSON.stringify(nepravilnosti));
      }
      showToast('✅ Nepravilnost zabilježena!');
      setTimeout(() => onDone({ ...nalog, status: 'NEPRAVILNOST' }), 1500);
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
            <div style={{ color: 'white', fontSize: 17, fontWeight: 800 }}>Prijava nepravilnosti</div>
            <div className="header-subtitle">{nalog.brojRN} · {nalog.partner.naziv}</div>
          </div>
        </div>
      </div>

      <div className="scroll-area">
        {/* Vrsta */}
        <div>
          <div className="form-label" style={{ marginBottom: 10 }}>Vrsta nepravilnosti</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {VRSTE.map(v => (
              <button
                key={v.id}
                onClick={() => { setVrsta(v.id); if (!opis) setOpis(v.opis); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                  border: vrsta === v.id ? '2px solid #DC2626' : '2px solid var(--border)',
                  background: vrsta === v.id ? '#FEF2F2' : 'white',
                  fontSize: 15, fontWeight: vrsta === v.id ? 700 : 400,
                  color: vrsta === v.id ? '#DC2626' : 'var(--text)',
                  textAlign: 'left',
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Opis */}
        <div className="form-group">
          <label className="form-label">Opis nepravilnosti</label>
          <textarea
            className="form-input"
            rows={3}
            value={opis}
            onChange={e => setOpis(e.target.value)}
            placeholder="Opišite nepravilnost detaljno..."
            style={{ resize: 'none' }}
          />
        </div>

        {/* Fotografija */}
        <div className="form-group">
          <label className="form-label">Fotografija (opcijalno)</label>
          {fotografija ? (
            <div style={{ position: 'relative' }}>
              <img src={fotografija} alt="Nepravilnost" style={{ width: '100%', borderRadius: 10, maxHeight: 200, objectFit: 'cover' }} />
              <button
                onClick={() => setFotografija(null)}
                style={{ position: 'absolute', top: 8, right: 8, background: '#DC2626', color: 'white', borderRadius: 20, padding: '4px 10px', fontSize: 13, fontWeight: 700 }}
              >
                ✕ Ukloni
              </button>
            </div>
          ) : (
            <label style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: 20, border: '2px dashed var(--border)', borderRadius: 10,
              cursor: 'pointer', color: 'var(--text2)', fontSize: 15,
            }}>
              📷 Dodaj fotografiju
              <input type="file" accept="image/*" capture="environment" onChange={handleFoto} style={{ display: 'none' }} />
            </label>
          )}
        </div>

        <button
          className="btn"
          style={{ background: '#DC2626', color: 'white' }}
          onClick={handleSpremi}
          disabled={loading || !vrsta}
        >
          {loading ? '⏳ Slanje...' : '⚠️ Prijavi nepravilnost'}
        </button>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
