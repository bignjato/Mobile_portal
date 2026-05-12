import { useEffect, useState } from 'react';
import type { RadniNalog } from '../types';
import { fetchDnevniNalozi, getSavedVozac, getSavedVozilo, logout } from '../services/api';

interface Props {
  onSelectNalog: (nalog: RadniNalog) => void;
  onLogout: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  PLANIRAN: 'Planiran',
  NA_LOKACIJI: 'Na lokaciji',
  POTPISAN: 'Potpisan ✅',
  NEPRAVILNOST: 'Nepravilnost ⚠',
};
const STATUS_COLOR: Record<string, string> = {
  PLANIRAN: '#2563EB',
  NA_LOKACIJI: '#D97706',
  POTPISAN: '#16A34A',
  NEPRAVILNOST: '#DC2626',
};
const STATUS_BG: Record<string, string> = {
  PLANIRAN: '#EFF6FF',
  NA_LOKACIJI: '#FFFBEB',
  POTPISAN: '#F0FDF4',
  NEPRAVILNOST: '#FEF2F2',
};

export default function NaloziPage({ onSelectNalog, onLogout }: Props) {
  const [nalozi, setNalozi] = useState<RadniNalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const vozac = getSavedVozac();
  const vozilo = getSavedVozilo();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const datum = new Date().toISOString().split('T')[0];
      const data = await fetchDnevniNalozi(datum, vozilo?.id);
      setNalozi(data);
    } catch {
      setError('Nije moguće dohvatiti naloge. Provjerite vezu.');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    onLogout();
  }

  const ime = vozac?.punoIme ?? `${vozac?.ime ?? ''} ${vozac?.prezime ?? ''}`.trim();
  const potpisan = nalozi.filter(n => n.status === 'POTPISAN').length;
  const ukupno = nalozi.length;

  return (
    <div className="screen">
      <div className="header">
        <div>
          <div style={{ color: 'white', fontSize: 17, fontWeight: 800 }}>Radni nalozi</div>
          <div className="header-subtitle">{vozilo?.registracija} · {ime}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {ukupno > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '4px 10px', fontSize: 13, color: 'white', fontWeight: 700 }}>
              {potpisan}/{ukupno}
            </div>
          )}
          <button className="icon-btn" onClick={load} title="Osvježi">🔄</button>
          <button className="icon-btn" onClick={handleLogout} title="Odjava" style={{ fontSize: 18 }}>⏏</button>
        </div>
      </div>

      <div className="scroll-area">
        {loading && (
          <div className="loader-screen">
            <div className="spinner" />
            <div style={{ color: '#9CA3AF', fontSize: 15 }}>Učitavam naloge...</div>
          </div>
        )}

        {error && (
          <div className="login-error" style={{ margin: 16 }}>⚠ {error}</div>
        )}

        {!loading && !error && nalozi.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#94A3B8' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Nema naloga za danas</div>
            <div style={{ fontSize: 14, marginTop: 8 }}>Kontaktirajte dispečera</div>
          </div>
        )}

        {!loading && nalozi.map((rn) => (
          <div
            key={rn.id}
            className="nalog-card"
            onClick={() => onSelectNalog(rn)}
            style={{ opacity: rn.status === 'POTPISAN' || rn.status === 'NEPRAVILNOST' ? 0.7 : 1 }}
          >
            <div className="nalog-card-top">
              <div className="nalog-card-rn">{rn.brojRN}</div>
              <span style={{
                background: STATUS_BG[rn.status] ?? '#F1F5F9',
                color: STATUS_COLOR[rn.status] ?? '#64748B',
                borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700,
              }}>
                {STATUS_LABEL[rn.status] ?? rn.status}
              </span>
            </div>
            <div className="nalog-card-partner">{rn.partner.naziv}</div>
            <div className="nalog-card-adresa">
              📍 {rn.lokacija.adresa}, {rn.lokacija.mjesto}
            </div>
            {rn.stavke.length > 0 && (
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 6 }}>
                📦 {rn.stavke.map(s => s.nazivRobe).join(', ')}
              </div>
            )}
            {rn.napomena && (
              <div style={{ fontSize: 12, color: '#F59E0B', marginTop: 4, fontStyle: 'italic' }}>
                💬 {rn.napomena}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
