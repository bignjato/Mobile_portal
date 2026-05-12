import { useState, type FormEvent } from 'react';
import OneTechLogo from '../components/OneTechLogo';
import { loginByRegistracija, type LoginResult } from '../services/api';

interface Props { onLogin: () => void; }

type Step = 'registracija' | 'potvrda';

export default function LoginPage({ onLogin }: Props) {
  const [step, setStep] = useState<Step>('registracija');
  const [registracija, setRegistracija] = useState('');
  const [loginResult, setLoginResult] = useState<LoginResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegistracija(e: FormEvent) {
    e.preventDefault();
    if (!registracija.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await loginByRegistracija(registracija.trim());
      setLoginResult(result);
      setStep('potvrda');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Vozilo nije pronađeno u sustavu.');
    } finally {
      setLoading(false);
    }
  }

  function handlePotvrda() {
    onLogin();
  }

  function handleNijeJa() {
    setStep('registracija');
    setLoginResult(null);
    setError('');
    // odjavi token jer nije pravi vozač
    localStorage.removeItem('auth_token');
    localStorage.removeItem('vozac');
    localStorage.removeItem('vozilo');
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo-wrap">
          <OneTechLogo variant="on-white" width={160} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <div className="login-title">VTS Portal</div>
          <div className="login-sub">Mobilni portal za radne naloge</div>
        </div>

        {error && <div className="login-error">⚠ {error}</div>}

        {step === 'registracija' && (
          <form onSubmit={handleRegistracija} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 13, color: '#64748B' }}>Registracija vozila</label>
              <input
                className="form-input"
                style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', letterSpacing: 3, textTransform: 'uppercase' }}
                type="text"
                autoCapitalize="characters"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                value={registracija}
                onChange={e => setRegistracija(e.target.value.toUpperCase())}
                placeholder="npr. ZG1234AB"
                disabled={loading}
              />
              <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>
                Unesite registracijsku oznaku bez crtica i razmaka
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-red"
              style={{ fontSize: 17, padding: '16px', borderRadius: 12 }}
              disabled={loading || !registracija.trim()}
            >
              {loading ? '⏳ Provjera...' : '🔍 Prijava'}
            </button>
          </form>
        )}

        {step === 'potvrda' && loginResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: '#F0FDF4', border: '2px solid #86EFAC', borderRadius: 14,
              padding: '20px', textAlign: 'center'
            }}>
              <div style={{ fontSize: 13, color: '#64748B', marginBottom: 6 }}>Vozilo pronađeno</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#242930', letterSpacing: 2, marginBottom: 4 }}>
                {loginResult.vozilo.registracija}
              </div>
              <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>{loginResult.vozilo.naziv}</div>

              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#242930', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: 28 }}>
                👤
              </div>
              <div style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Vozač na ovom vozilu</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#242930' }}>
                {loginResult.vozac.punoIme || `${loginResult.vozac.ime} ${loginResult.vozac.prezime}`.trim()}
              </div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 8 }}>
                {loginResult.brojNaloga} radnih naloga danas
              </div>
            </div>

            <button
              className="btn btn-red"
              style={{ fontSize: 18, padding: '18px', borderRadius: 12 }}
              onClick={handlePotvrda}
            >
              ✅ Da, to sam ja — Ulaz
            </button>

            <button
              className="btn btn-outline"
              style={{ fontSize: 15, padding: '14px', borderRadius: 12 }}
              onClick={handleNijeJa}
            >
              ✕ Nije moje vozilo
            </button>
          </div>
        )}

        <div style={{ fontSize: 12, color: '#CBD5E1', textAlign: 'center', marginTop: 4 }}>
          VTS Portal v2.0 · EKO-FLOR PLUS d.o.o.
        </div>
      </div>
    </div>
  );
}
