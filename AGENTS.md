# Arbeidsregler for KI-agenter

Start alltid med `START_HERE.md`. Les siste `main`, og bruk repoet – aldri gammel samtalehistorikk – som implementasjonsautoritet.

## Grunnprinsipper

1. **Én kanonisk dataeier per domene.** `docs/data/site.json`, `pages.json`, `sources.json`, `market.json`, `sales.json`, `technologies.json` `backlog.json` og `learning.json` er autoritative. Ikke lag parallelle JSON-kopier.
2. **Alt innhold utenfor layouten.** HTML/JS/CSS skal være visningslag. Overskrifter, sidebudskap, kvalifiseringsinnhold, presentasjon, produktnavn og markedsfakta skal hentes fra datafilene.
3. **Ingen hardkodede fakta.** Ikke skriv SSB-tall, produktpåstander eller historiske hendelser i HTML/JS. Felles data skal brukes i alle visninger.
4. **Nøktern og kildebasert fagtekst.** Skill dokumenterte fakta, leverandørpåstander, hypotese og salgsmessig tolkning. Ikke framstill scenarioer som ekte oppdrag.
5. **Klart førstelinjeperspektiv.** Fra kundens problem → spørsmål → mulig databehov → passende kompetanse → oppfølging. Ikke foreslå teknologi før behovet er forstått.
6. **Beskytt åpenhetsgrensen.** `OPEN_DATA_POLICY.md` gjelder uavhengig av repoets synlighet. Ingen interne kundedata, arbeidsavtaler, pipeline, priser, personopplysninger eller tokens.
7. **Design én gang.** Bruk delte CSS-komponenter. Ikke dupliser HTML-kort, legg på CSS-overstyringer eller innfør nytt rammeverk uten behov.
8. **Portabel løsning.** Statisk GitHub Pages, relative ressursstier, ingen ekstern backend eller skjult tracking. Skal kunne overtas av Claude Code/Gemini og flyttes til Webstep.
9. **Tilgjengelighet.** Kontroller mobil, skjermbredder, tastatur, ikoner, kontrast og lenker. Brandlogoer må ha kilde/bruksvilkår.
10. **Releasekontrakt.** Øk `site.json.version`, samsvarende CSS/JS-assetversjon, én atomisk flerfilrelease og alle kontroller grønne før publisering.
11. **Faglig vedlikehold.** Vis gjeldende status, ikke implementasjonslogg i brukerrettet tekst. Registrer forbedringer i backlog og dokumenter kontrolltid ved volatile forhold.

## Kontroller

```sh
node --check docs/assets/site.js
node --check docs/assets/learning.js
node --check docs/assets/prompts.js
node --check docs/assets/horizon.js
node scripts/check.mjs
```

I tillegg: inspiser endret skjerm visuelt og sjekk faktisk kilde/lenke. En grønn CI erstatter ikke manuell vurdering.

## Før flytting til Webstep

Innholdet skal fortsatt kunne være offentlig. Interne data vurderes først etter godkjent enterprise-publisering med tilgangskontroll. GitHub Issues brukes ikke som CRM.

## Ulike brukernivåer

«Start her» gir grunnleggende introduksjon som kun leses ved behov. Det er ikke en obligatorisk velkomstskjerm. Erfarne brukere skal raskt finne arkitektur, teknologier, salgsinnganger og kopierbare maler. Arkitekturskisser og praktiske maler eies av `learning.json`. Nye presentasjonsløp eies av `pages.json` og skal være datadrevne.


## Promptbibliotek

- `prompts.json` er autoritativ kilde. Alle maler har rolle/oppgave, anvendelse, generiske inputfelt, forventet resultat, kontrollpunkter og kildedisiplin.
- Ikke legg inn kundenavn/ansatte/CRM-innhold/Drive-innhold, konfidensielle partneropplysninger eller ekte intern kapasitet i det offentlige repoet.
- Ikke hev at KI-agenten har kobling til HubSpot, Drive eller CV-/bemanningssystem. En integrasjon skal bare omtales som mulig etter godkjent intern flytting.
- In-browser redigering er lokal; den skal ikke lagre eller sende innhold, og er ikke et sikkert sted for kundedata.
- Dataeier bevares ved flytting; tilgangs- og datakoblingslaget bygges separat. Se `INTERNAL_MIGRATION.md`.


## Strengere innholdsautoritet og teknologifordypning

- Les `CONTENT_CONTRACT.md` før enhver endring av fagtekst. Et element kan ha kort/langform og vises null, én eller mange ganger, men det finnes bare én dataeier.
- Skille dokumentert funksjon, leverandørbeskrivelse, hypotese og åpent spørsmål; angi kilder, datoer og preview der relevant.
- `horizon.json` eier original fordypningsanalyse, ikke parallelle definisjoner, produktfakta eller kildekopier.
- «Ikke presentert» er ikke privat: JSON og historikk i personlig repo er offentlige.
- Ikke introduser database/CMS uten å vurdere enklere JSON-/ID-løsninger.
- Les `REFACTOR_AUDIT.md` og `REFACTOR_NEXT_CHAT.md` før den planlagte innholdsrefaktoreringen.
