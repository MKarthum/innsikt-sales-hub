# Presentasjonsarkitektur – første iterasjon (24.10.2026)

## Eiendeler og ansvar
- `docs/data/slides.json`: ett objekt per lysbilde med stabil `id`, `scope` (`shared` eller `story`), valgfri `storyId`, `type`, `tone`, innhold, `speakerBase` og `sourceIds`. Ingen tekniske HTML-fragmenter eller faste fargekoder i objektet.
- `docs/data/pages.json.presentationDecks`: historier med metadata, narrativ og en ordnet liste `{slideId, beat, delivery, note}`. Her hører de historierelaterte introduksjonene og overgangene hjemme.
- `docs/assets/slide-model.js`: ren oppslag-/oppløsningslogikk uten DOM eller nettverk. `usage` gjør deling synlig; `resolve` avviser kryssbruk av historiespesifikke lysbilder.
- `docs/assets/site.js`: presentasjonsviser og bibliotek. Kan åpne et bestemt lysbilde fra biblioteket i sin historie.
- `docs/assets/site.css`: all visuell styling. `--slide-strong-*` og `--slide-light-*` er par av bakgrunn, tekst, dempet tekst og aksent. Lysbildet velger bare `tone`; ingen lysbildekode kjenner konkret merkevarefarge.

## Avgrensninger
Første migrering beholder alle 15 eksisterende lysbildenes ordlyd, rekkefølge og visningskomponenter. Gamle notater omtaler nesten alltid sin historie, derfor er de flyttet ordrett til plasseringens `note`. `speakerBase` er tomt frem til en faglig, kontekstuavhengig forklaring er redaksjonelt godkjent. Dette hindrer kunstig duplisering og uriktig gjenbruk.

Kilder skal knyttes til lysbildet i `sourceIds` og vises på biblioteksiden. På selve lysbildet vises de bare ved `sourceDisplay: "required"` – for eksempel ved sitat eller ekstern figur. Ikke legg en universell kildeslide på slutten.

## Temakontrakt
Temaverdier skal defineres som *par*, ikke endres uavhengig:
- `--slide-strong-bg` / `--slide-strong-fg`, sammen med `--slide-strong-muted` / `--slide-strong-accent`
- `--slide-light-bg` / `--slide-light-fg`, sammen med `--slide-light-muted` / `--slide-light-accent`
- `--font-body` og `--font-display`

Dersom portalen eller Claude-artefakten bytter merkevare, skal bare disse verdiene overstyres. Bekreft kontrast for tekst, dempet tekst og aksent mot bakgrunnen, samt innebygde underflater. Kjør visuell kontroll på begge toner før publisering. Komponenter som krever egne ikke-semantiske merkefarger bør omskrives til tokens før bred temastøtte loves.

## Neste iterasjoner
1. Gjør den nye historien «Hvorfor Innsikt?» til egne lysbilder, med storyboard, relevant grafikk og gransket faglig tekst. Behold høyt nivå av redaksjonell frihet i utformingen.
2. Utvikle et lite antall gjenbrukbare scener (typografi, fullflate, kontrast, dataflyt) og en utvidelsesmulighet for helt spesielle illustrasjoner. Ikke bygg en generell dra-og-slipp-editor.
3. Forbedre forhåndsvisning og dokumentasjon av «brukes i» for både delte og historiespesifikke lysbilder. Ved en endring av et delt lysbilde må alle brukende historier testes.
4. Bygg en separat eksportpipeline for PowerPoint som baserer seg på renderte lysbilder og eventuelle fortellernotater. Nettleser er originalen; HTML/PDF-eksport beholdes inntil dette er klart.
5. Moderniser resten av `site.css` gradvis til semantiske globale designtokens. **Første iterasjon lover ikke at hver eksisterende portal-komponent er fullstendig temauavhengig.**

## Kontroller
`node scripts/check.mjs` inkluderer modellvalidering for bibliotek og historiekoblinger. Test visning i desktop/fullskjerm/mobil før publisering; det er ikke bevist gjennom statiske tester. Eksisterende presentasjonsløp skal ha samme antall lysbilder og notater etter migrering.
