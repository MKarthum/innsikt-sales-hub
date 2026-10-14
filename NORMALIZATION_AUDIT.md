# Semantisk normalisering – v0.9.1 (14.10.2026)

Dette er den redaksjonelle oppryddingen som følger v0.9.0. Målet er **én semantisk innholdseier**, ikke én identisk formulering overalt. Samme kunnskap kan ha flere hensiktsmessige varianter, og sidene velger eier/ID/variant. Brukerrettet tekst, visningsrekkefølge og design er ikke endret ved denne migreringen.

## Reelt konsolidert

| Autoritativ eier | Tidligere separate felt | Prinsipp |
| --- | --- | --- |
| `learning.glossary[dataplattform]` | Grunnkurs kapittel 3 og ordliste | Den pedagogiske dataplattformforklaringen er en `beginner`-variant av det kanoniske begrepet. |
| `sales.sharedGuidance[customer-first]` | Hjemmets introduksjon og grunnkurs kapittel 5 | Kundens problem og mål før produktvalg eies av salgsveiledningen; særskilt `home`- og `beginner`-variant. |
| `sales.valueThemes[platform/insight/ai]` | Tre verdikort på forsiden og de tre tilsvarende fagkortene på markedssiden | Hver verdiidé har én ID, med korte visningsspesifikke `home`- og `market`-varianter. |
| `sales.valueOverview[three-needs]` | Introduksjon om hvordan plattform/analyse/KI henger sammen på forside og markedsside | Ett overordnet tema, varianter til de to sidene. |
| `market.metricGuidance[ki-use]` | KI-statistikkens forbehold på forside og markedsside (inkludert næringsfordeling) | Samme kvalifisering av KI-adopsjon, ulike tekstlengder/kontekster. |
| `pages.sharedNotices[public-boundary]` | Prototyp-/offentlighetsmelding, ansvarsforbehold, salgsregistertekst og promptadvarsel | Én offentlighets- og sikkerhetsavgrensning, kontekstuelle varianter. |
| `pages.sharedNotices[feedback-privacy]` | Kort lokal-lagringsadvarsel og informasjon i innspillsdialogen | Én eier for begrensninger ved lokal tilbakemeldingslagring. |

20 nye eksplisitte feltkoblinger inngår i denne migreringen. Totalt har materialiserte domenedata 32 `$content`-referanser (mot 12 i v0.9.0) og 67 ID-kontrollerte kanoniske objekter. Det er lagt til tre eiertyper i den eksisterende, lette resolveren: `value`, `value-overview` og `notice`. Ingen ny frontend, database, API eller CMS er innført.

## Hva som bevisst ikke er slått sammen

- **Salgsinngang mot sitert kundesignal:** «Når salg og marked ikke ser …» beskriver en salgsanledning, mens «Vi ser omsetning, men …» er en illustrativ kundereplikk. Begge eies av `sales.json`, men har forskjellige funksjoner.
- **Kompetanseliste mot arkitekturproblem:** Oppramsing av ferdigheter og kundens arkitekturfriksjon skal ikke være samme komponent selv om ordene ligner.
- **Produktfunksjon mot generelt kundebehov:** Teknologileverandørens produktbeskrivelse og Innsikts potensielle leveranse er ikke én påstand. Produktet har egen kildestatus.
- **Møtedialog mot fagforklaring:** Kundespørsmål, rollespill, diagramforbehold og markedstolkning kan dele begreper uten å kopiere samme autoritative kunnskap.
- **Generelle prompt-råd mot konkrete forberedelser:** «Bare godkjente profiler» og «bare godkjente møtenotater» nevner ulike informasjonstyper, men følger samme offentlige informasjonsramme. De beholdes som kontekstuelt relevante kontrollspørsmål.

For hver av disse er både tekstens rolle og innholdets eier vurdert. En maskinell ordlikhet alene er **ikke** tilstrekkelig for sammenslåing; det ville økt koblingen og svekket salgsverdien.

## Verifikasjon

- Før/etter-kontroll av HTML med to ulike versjoner av resolver og domenedata: **76 av 76 visninger er identiske**. Dette er gjort som migreringskontroll uten å lagre gamle tekstkopier i repoet.
- `scripts/check-semantic-propagation.mjs`: **20 navngitte koblinger** må fortsette å være referanser. **11 simulerte endringer** i kanoniske varianter må slå gjennom på riktig faktiske side og ikke på irrelevante sider.
- `scripts/check-content-contract.mjs`: nye eiere inngår i validering av stabile ID-er, evidensklasse, kilder og reviewdato.
- `node scripts/check.mjs`: kilde-, privatlivs-, integritets-, stil-, referanse-, propagerings- og HTML-kontroller.
- GitHub Actions kjører i tillegg Playwright/Chromium på mobil (390 px) og desktop (1440 px).

## Grenser og videre redaksjonell praksis

Dette gir én eier for de identifiserte gjenbrukbare temaene, men det er ikke mulig å bevise automatisk at **ingen** semantiske parafraser finnes i enhver framtidig tekst. Kilder og forretningspåstander med ulike formål må fortsatt kvalitetssikres redaksjonelt.

Ved ny tekst: undersøk først `learning.glossary`, `sales.sharedGuidance`, `sales.valueThemes`, `market.metricGuidance` og `pages.sharedNotices`. Bruk eksisterende ID og relevant variant. Opprett separat innhold bare når det faktisk er en annen påstand, brukerhandling eller dokumentasjonskontekst. Legg til kontraktstest for nye delte forbrukere.
