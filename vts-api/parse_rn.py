#!/usr/bin/env python3
"""
Parser za EKO-FLOR PLUS radne naloge (PDF → JSON)
Koristi pdfplumber za ekstrakciju teksta.
"""
import pdfplumber
import json
import re
import os
import sys

# GPS koordinate za poznate lokacije (adresa → lat/lng)
GPS_MAP = {
    "savska cesta 1a": (45.8194, 16.1053),
    "mokrice 180": (46.0322, 15.8556),
    "puškarićeva ulica 15": (45.7731, 15.8872),
    "karlovačka 46": (45.8103, 16.0897),
    "pavlenski put 5g": (45.8456, 16.0234),
    "slavonska avenija 51": (45.8031, 16.0412),
    "bjelovarska 48b": (45.8341, 16.1012),
    "ulica marijana čavića": (45.8150, 15.9800),
}

def get_gps(adresa: str):
    a = adresa.lower().strip()
    for key, coords in GPS_MAP.items():
        if key in a:
            return coords
    return (45.8150, 15.9819)  # default Zagreb centar

def parse_registracija(reg: str) -> str:
    """KR 902 OC → KR902OC"""
    return re.sub(r'[\s\-/]', '', reg).upper()

def find_vozilo_id(reg: str, vozila: list) -> str:
    clean = parse_registracija(reg)
    for v in vozila:
        # vozilo može imati više reg (npr. ZG3917JP / ZG7450JR)
        for part in re.split(r'[/\s]+', v['registracija'].replace(' ', '')):
            if clean == part.upper():
                return v['id']
    return None

def find_vozac_id(vozac_ime: str, vozaci: list, vozilo_id: str) -> str:
    """Traži vozača po imenu ili po vozilu"""
    name = vozac_ime.strip().upper()
    for d in vozaci:
        puno = f"{d['ime']} {d['prezime']}".strip().upper()
        if name in puno or d['ime'].upper() in name or d['prezime'].upper() in name:
            return d['id']
    # fallback — po vozilu
    for d in vozaci:
        if d['voziloId'] == vozilo_id:
            return d['id']
    return None

def parse_pdf(path: str, vozila: list, vozaci: list) -> dict:
    with pdfplumber.open(path) as pdf:
        text = "\n".join(page.extract_text() or "" for page in pdf.pages)

    lines = [l.strip() for l in text.splitlines() if l.strip()]
    full = "\n".join(lines)

    def find(pattern, default=""):
        m = re.search(pattern, full, re.IGNORECASE | re.MULTILINE)
        return m.group(1).strip() if m else default

    # Osnovni podaci
    broj_rn    = find(r'RADNI NALOG:\s*(\d+)')
    datum_str  = find(r'Datum usluge:\s*(\d{2}\.\d{2}\.\d{4})')
    interni    = find(r'Interni broj:\s*(\S+(?:\s*/\s*\S+)?)')
    registr    = find(r'Registracija vozila:\s*(.+?)(?:\n|$)')
    vozac_raw  = find(r'Voza[cč]:\s*(.+?)(?:\n|Partner:|$)')
    napomena   = find(r'Napomena:\s*(.+?)(?:\n|Voza[cč]:|$)')

    # Datum usluge → ISO format
    if datum_str:
        d, m, y = datum_str.split('.')
        datum_iso = f"{y}-{m.zfill(2)}-{d.zfill(2)}"
    else:
        datum_iso = "2026-05-11"

    # Partner
    partner_naziv = find(r'Partner:\s*\n(.+?)(?:\n)')
    partner_adresa_line = find(r'Partner:\s*\n.+?\n(.+?)(?:\n)')
    partner_mjesto = find(r'HR-\d+\s+([A-ZŠĐČĆŽ][A-ZŠĐČĆŽ\s]+)(?:\n|OIB)')
    partner_oib = find(r'OIB partnera:\s*(\d+)')

    # Lokacija (desna strana)
    lok_naziv = find(r'Lokacija:\s*\n(.+?)(?:\n)')
    lok_adresa = find(r'Lokacija:\s*\n.+?\n(.+?)(?:\n)')
    lok_mjesto_m = re.search(r'Lokacija:.*?HR-\d+\s+([A-ZŠĐČĆŽ][A-ZŠĐČĆŽ\s]+)', full, re.DOTALL)
    lok_mjesto = lok_mjesto_m.group(1).strip() if lok_mjesto_m else partner_mjesto

    if not lok_naziv:
        lok_naziv = partner_naziv
    if not lok_adresa:
        lok_adresa = partner_adresa_line

    lat, lng = get_gps(lok_adresa or partner_adresa_line)

    # Stavke — iz tablice
    stavke = []
    table_match = re.findall(
        r'(\d+)\s+(.+?)\s+((?:R|USI|K|P)\d+[\w\-]*)\s*(\S*)\s+(\d+(?:[.,]\d+)?)\s+(kg|usl|Kg|KG|kom)',
        full, re.IGNORECASE
    )
    for i, row in enumerate(table_match):
        rbr, naziv, sifra, spremnik, kol, jm = row
        try:
            kolicina = float(kol.replace(',', '.'))
        except:
            kolicina = 0
        stavke.append({
            "rbr": int(rbr),
            "sifraArtikla": sifra.strip(),
            "nazivRobe": naziv.strip(),
            "tipSpremnika": "",
            "kolicina": int(kolicina) if kolicina == int(kolicina) else kolicina,
            "jedMjere": jm.lower() if jm.lower() != 'kg' else 'kg',
        })

    if not stavke:
        # fallback — jednostavniji regex
        for m in re.finditer(r'^(\d+)\s{2,}(.{10,}?)\s{2,}(\w[\w\-]+)\s+(\d+)\s+(kg|usl)', full, re.MULTILINE):
            stavke.append({
                "rbr": int(m.group(1)),
                "sifraArtikla": m.group(3).strip(),
                "nazivRobe": m.group(2).strip(),
                "tipSpremnika": "",
                "kolicina": int(m.group(4)),
                "jedMjere": m.group(5).lower(),
            })

    reg_clean = parse_registracija(registr) if registr else ""
    vozilo_id = find_vozilo_id(registr, vozila) if registr else None
    vozac_id  = find_vozac_id(vozac_raw, vozaci, vozilo_id) if vozac_raw else None

    return {
        "id": broj_rn,
        "brojRN": broj_rn,
        "interniBroj": interni,
        "datumUsluge": datum_iso,
        "voziloId": vozilo_id,
        "vozacId": vozac_id,
        "_registracija": reg_clean,
        "_vozacRaw": vozac_raw.strip() if vozac_raw else "",
        "status": "PLANIRAN",
        "partner": {
            "naziv": partner_naziv,
            "adresa": partner_adresa_line,
            "mjesto": partner_mjesto,
            "oib": partner_oib,
        },
        "lokacija": {
            "naziv": lok_naziv,
            "adresa": lok_adresa,
            "mjesto": lok_mjesto,
            "lat": lat,
            "lng": lng,
        },
        "stavke": stavke,
        "napomena": napomena,
    }

if __name__ == "__main__":
    base = os.path.dirname(os.path.abspath(__file__))
    rn_dir = os.path.join(base, '..', 'RN-Baza_test')
    data_file = os.path.join(base, 'data.json')

    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    vozila = data['vozila']
    vozaci = data['vozaci']

    parsed = []
    errors = []
    pdfs = sorted(f for f in os.listdir(rn_dir) if f.endswith('.pdf'))
    print(f"Parsiram {len(pdfs)} PDF-ova...")

    for pdf_file in pdfs:
        path = os.path.join(rn_dir, pdf_file)
        try:
            rn = parse_pdf(path, vozila, vozaci)
            parsed.append(rn)
            reg = rn.get('_registracija', '?')
            vozac = rn.get('_vozacRaw', '?')
            stavke_n = len(rn['stavke'])
            print(f"  ✓ {pdf_file}: RN {rn['id']} | {rn['partner']['naziv'][:30]} | reg:{reg} | vozač:{vozac} | {stavke_n} stavki")
        except Exception as e:
            errors.append((pdf_file, str(e)))
            print(f"  ✗ {pdf_file}: {e}")

    # Ukloni privremena _ polja
    for rn in parsed:
        rn.pop('_registracija', None)
        rn.pop('_vozacRaw', None)

    # Spoji s postojećim — po ID-u
    existing_ids = {rn['id'] for rn in data['radniNalozi']}
    new_count = 0
    update_count = 0
    for rn in parsed:
        if rn['id'] in existing_ids:
            # update
            data['radniNalozi'] = [rn if r['id'] == rn['id'] else r for r in data['radniNalozi']]
            update_count += 1
        else:
            data['radniNalozi'].append(rn)
            new_count += 1

    with open(data_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Gotovo! {new_count} novih, {update_count} ažuriranih, {len(errors)} grešaka.")
    if errors:
        print("Greške:")
        for name, err in errors:
            print(f"  {name}: {err}")
