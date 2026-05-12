import { useState } from 'react';
import type { RadniNalog } from '../types';
import { pushDolazak } from '../services/api';

interface Props {
  nalog: RadniNalog;
  onBack: () => void;
  onNavigate: (nalog: RadniNalog) => void;
  onNepravilnost: (nalog: RadniNalog) => void;
  onUpdate: (updated: RadniNalog) => void;
}

export default function NalogDetalj({ nalog, onBack, onNavigate, onNepravilnost, onUpdate }: Props) {
  const [loadingDolazak, setLoadingDolazak] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function handleDolazak() {
    setLoadingDolazak(true);
    try {
      let gps = '';
      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 6000 })
          );
          gps = `${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`;
        } catch { gps = ''; }
      }
      const vrijemeDolaska = new Date().toISOString();
      await pushDolazak(nalog.id, vrijemeDolaska, gps);
      const updated = { ...nalog, status: 'NA_LOKACIJI' as const, vrijemeDolaska, gpsDolazak: gps };
      onUpdate(updated);
      showToast('✅ Dolazak zabilježen!');
    } catch {
      showToast('⚠ Greška pri bilježenju dolaska');
    } finally {
      setLoadingDolazak(false);
    }
  }

  function openGoogleMaps() {
    const { lat, lng, adresa, mjesto } = nalog.lokacija;
    let url: string;
    if (lat && lng) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    } else {
      const q = encodeURIComponent(`${adresa}, ${mjesto}`);
      url = `https://www.google.com/maps/search/?api=1&query=${q}`;
    }
    window.open(url, '_blank');
  }

  const isPotpisan = nalog.status === 'POTPISAN';
  const isNepravilnost = nalog.status === 'NEPRAVILNOST';
  const isDone = isPotpisan || isNepravilnost;

  return (
    <div className="screen">
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="back-btn" onClick={onBack}>‹</button>
          <div>
            <div style={{ color: 'white', fontSize: 17, fontWeight: 800 }}>{nalog.brojRN}</div>
            <div className="header-subtitle">{nalog.partner.naziv}</div>
          </div>
        </div>
      </div>

      <div className="scroll-area">
        {/* Lokacija + navigacija */}
        <div className="detalj-section">
          <div className="detalj-section-header">📍 Lokacija</div>
          <div className="detalj-row">
            <span className="detalj-label">Naziv</span>
            <span className="detalj-value">{nalog.lokacija.naziv}</span>
          </div>
          <div className="detalj-row">
            <span className="detalj-label">Adresa</span>
            <span className="detalj-value">{nalog.lokacija.adresa}, {nalog.lokacija.mjesto}</span>
          </div>
          {nalog.napomena && (
            <div className="detalj-row">
              <span className="detalj-label">Napomena</span>
              <span className="detalj-value" style={{ color: '#F59E0B', fontWeight: 600 }}>{nalog.napomena}</span>
            </div>
          )}

          <button
            className="btn btn-dark"
            style={{ margin: '12px 16px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            onClick={openGoogleMaps}
          >
            🗺️ Navigacija do odredišta
          </button>
        </div>

        {/* Partner */}
        <div className="detalj-section">
          <div className="detalj-section-header">🏢 Partner</div>
          <div className="detalj-row">
            <span className="detalj-label">Naziv</span>
            <span className="detalj-value">{nalog.partner.naziv}</span>
          </div>
          <div className="detalj-row">
            <span className="detalj-label">OIB</span>
            <span className="detalj-value">{nalog.partner.oib || '—'}</span>
          </div>
          {nalog.interniBroj && (
            <div className="detalj-row">
              <span className="detalj-label">Interni br.</span>
              <span className="detalj-value">{nalog.interniBroj}</span>
            </div>
          )}
        </div>

        {/* Stavke */}
        <div className="detalj-section">
          <div className="detalj-section-header">📦 Roba</div>
          {nalog.stavke.map(s => (
            <div key={s.rbr} className="detalj-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2, padding: '10px 16px' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark)' }}>{s.rbr}. {s.nazivRobe}</span>
              <span style={{ fontSize: 12, color: '#94A3B8' }}>Šifra: {s.sifraArtikla}</span>
            </div>
          ))}
        </div>

        {/* Status info */}
        {nalog.vrijemeDolaska && (
          <div className="detalj-section">
            <div className="detalj-section-header">⏰ Dolazak</div>
            <div className="detalj-row">
              <span className="detalj-label">Vrijeme</span>
              <span className="detalj-value">
                {new Date(nalog.vrijemeDolaska).toLocaleTimeString('hr', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {nalog.gpsDolazak && (
              <div className="detalj-row">
                <span className="detalj-label">GPS</span>
                <span className="detalj-value" style={{ fontSize: 12 }}>{nalog.gpsDolazak}</span>
              </div>
            )}
          </div>
        )}

        {isPotpisan && (
          <div style={{ margin: 16, padding: 20, background: '#F0FDF4', borderRadius: 12, border: '1.5px solid #BBF7D0', textAlign: 'center' }}>
            <div style={{ fontSize: 28 }}>✅</div>
            <div style={{ fontWeight: 700, color: '#16A34A', fontSize: 16 }}>Nalog potpisan</div>
            <div style={{ fontSize: 13, color: '#16A34A', marginTop: 4 }}>Potpisao: {nalog.potpisPartner}</div>
          </div>
        )}

        {isNepravilnost && (
          <div style={{ margin: 16, padding: 20, background: '#FEF2F2', borderRadius: 12, border: '1.5px solid #FECACA', textAlign: 'center' }}>
            <div style={{ fontSize: 28 }}>⚠️</div>
            <div style={{ fontWeight: 700, color: '#DC2626', fontSize: 16 }}>Nepravilnost prijavljena</div>
          </div>
        )}

        {/* Akcije */}
        {!isDone && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 0 24px' }}>
            {nalog.status === 'PLANIRAN' && (
              <button
                className="btn btn-dark"
                style={{ fontSize: 16, padding: 16 }}
                onClick={handleDolazak}
                disabled={loadingDolazak}
              >
                {loadingDolazak ? '⏳ Bilježim dolazak...' : '📍 Zabilježi dolazak na lokaciju'}
              </button>
            )}

            {nalog.status === 'NA_LOKACIJI' && (
              <button
                className="btn btn-red"
                style={{ fontSize: 16, padding: 16 }}
                onClick={() => onNavigate(nalog)}
              >
                ▶ Počni preuzimanje otpada
              </button>
            )}

            <button
              className="btn btn-outline"
              style={{ color: '#DC2626', borderColor: '#FECACA', fontSize: 15 }}
              onClick={() => onNepravilnost(nalog)}
            >
              ⚠️ Prijavi nepravilnost
            </button>
          </div>
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
