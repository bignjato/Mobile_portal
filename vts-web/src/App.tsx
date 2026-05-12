import { useState } from 'react';
import { isLoggedIn } from './services/api';
import type { RadniNalog } from './types';
import LoginPage from './pages/LoginPage';
import NaloziPage from './pages/NaloziPage';
import NalogDetalj from './pages/NalogDetalj';
import SpremnikPage from './pages/SpremnikPage';
import PotpisPage from './pages/PotpisPage';
import NepravilnostPage from './pages/NepravilnostPage';

type Screen =
  | { name: 'login' }
  | { name: 'nalozi' }
  | { name: 'detalj'; nalog: RadniNalog }
  | { name: 'spremnik'; nalog: RadniNalog }
  | { name: 'potpis'; nalog: RadniNalog }
  | { name: 'nepravilnost'; nalog: RadniNalog };

export default function App() {
  const [screen, setScreen] = useState<Screen>(
    isLoggedIn() ? { name: 'nalozi' } : { name: 'login' }
  );

  if (screen.name === 'login') {
    return <LoginPage onLogin={() => setScreen({ name: 'nalozi' })} />;
  }
  if (screen.name === 'nalozi') {
    return (
      <NaloziPage
        onSelectNalog={(nalog) => setScreen({ name: 'detalj', nalog })}
        onLogout={() => setScreen({ name: 'login' })}
      />
    );
  }
  if (screen.name === 'detalj') {
    return (
      <NalogDetalj
        nalog={screen.nalog}
        onBack={() => setScreen({ name: 'nalozi' })}
        onNavigate={(nalog) => setScreen({ name: 'spremnik', nalog })}
        onNepravilnost={(nalog) => setScreen({ name: 'nepravilnost', nalog })}
        onUpdate={(updated) => setScreen({ name: 'detalj', nalog: updated })}
      />
    );
  }
  if (screen.name === 'spremnik') {
    return (
      <SpremnikPage
        nalog={screen.nalog}
        onBack={() => setScreen({ name: 'detalj', nalog: screen.nalog })}
        onDone={(nalogSaStavkama) => setScreen({ name: 'potpis', nalog: nalogSaStavkama })}
      />
    );
  }
  if (screen.name === 'potpis') {
    return (
      <PotpisPage
        nalog={screen.nalog}
        onBack={() => setScreen({ name: 'spremnik', nalog: screen.nalog })}
        onDone={(updated) => setScreen({ name: 'detalj', nalog: updated })}
      />
    );
  }
  if (screen.name === 'nepravilnost') {
    return (
      <NepravilnostPage
        nalog={screen.nalog}
        onBack={() => setScreen({ name: 'detalj', nalog: screen.nalog })}
        onDone={(updated) => setScreen({ name: 'detalj', nalog: updated })}
      />
    );
  }
  return null;
}
