# Changelog

Sve značajne izmjene projekta dokumentirane su u ovom fajlu.

Format prati [Keep a Changelog](https://keepachangelog.com/hr/1.0.0/) standard,
a projekt koristi [Semantic Versioning](https://semver.org/lang/hr/).

---

## [Unreleased]

### Planirano
- Backend API endpoints (radni nalozi, vozači, partneri)
- Autentikacija (JWT)
- React Native Expo app – početni ekrani
- Integracija s potpisom (signature pad)

---

## [0.1.0] – 2026-05-12

### Dodano
- Inicijalna struktura projekta (`vts-admin`, `vts-app`, `vts-api`, `vts-web`)
- Git repozitorij s 4 grane: `main`, `develop/web`, `develop/android`, `develop/ios`
- Post-commit hook za automatski git push
- **vts-admin** – Web admin portal (React 19 + Vite + TypeScript)
  - Layout s tamnim sidebarom i bijelim headerom
  - Dashboard – KPI kartice, tjedni bar chart, aktivnost feed, tablica vozača
  - Radni nalozi – tab bar, filter chips, paginirana tablica sa statusima
  - Vozači/Vozila – split prikaz, detalji vozila, SVG mock mapa
  - Partneri – lista partnera, detalj s lokacijama
  - Dijeljene UI komponente: `Card`, `Badge`, `Avatar`, `Plate`, `Table`, `Btn`, `ProgBar`, `StatRow`, `FilterChip`, `TabBar`
- **vts-web** – UI prototipovi (Login, Dashboard, Raspored, Obavijesti, Odabir spremnika)
  - 5 tipova posuda s SVG ilustracijama u boji (zelena/plava/žuta kanta, press, otvoreni kontejner)
- CSS design tokeni – OneTech brand boje i tipografija
- README.md i CHANGELOG.md

---

[Unreleased]: https://github.com/bignjato/Mobile_portal/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/bignjato/Mobile_portal/releases/tag/v0.1.0
