# Presentasjonsarkitektur: strukturert innhold og illustrasjoner

Oppdatert 7. november 2026. Gjelder benchmarken `ai-context-platforms-2027`. Dette er en teknisk kontrakt og status for implementasjonen på `main`, ikke en generell omlegging av alle lysbilder.

## Prinsipp og autoritet

`docs/data/slides.json` eier all faglig tekst, kontekstbegreper, kilder, prosessbeskrivelser og relasjoner. `visual.graph.source` beskriver ti eksplisitte, retningsbestemte relasjoner mellom datakilder, virksomhetskontekst, konsumenter og løkken beslutning, kontrollert handling og oppdatert kontekst. `docs/assets/slide-graph.js` validerer at ingen relasjoner eller pilretninger tilføyes, forsvinner eller snus. Visningsmoduser er **ikke** parallelle faglige datakilder.

Presentasjonskomponentene deler semantikken, men kan ha svært ulike grafiske komposisjoner. Det er bare tre brukerrettede valg, og stilvelgeren vises bare på benchmark-lysbildet:

| Visning | Rendering | Hva kan skin endre? |
| --- | --- | --- |
| Enkel diagramvisning (`standard`) | HTML/CSS, SVG-piler og ikonressurser | Hele uttrykket gjennom CSS-variabler og organisasjonsskin |
| Nøktern illustrasjon (`rich`) | Ett native SVG-koordinatsystem for faglige objekter, tekster, ikoner og relasjoner, med separat landskapsbilde | Native objekter og typografi følger skin; bakgrunnsmotivet beholdes som en bevisst illustrativ ressurs |
| Rik illustrasjon (`rich-image`) | Ferdigrendret WebP fra Python/Pillow, inkludert faglige etiketter, paneler og piler | Ikke piksler inne i bildet; logo og andre separerte overlegg forblir uavhengige |

Navnet `rich` er en teknisk stil-ID og tilsvarer «Nøktern illustrasjon» i brukergrensesnittet. Unngå en fjerde stil for tekniske implementasjonsvalg.

## Arkitekturvalget

**En kontrollert hybridarkitektur er valgt, med to komplementære metoder, ikke én tvungen renderer.** For den nøkterne visningen er ett native SVG for faglige objekter og forbindelser kombinert med et atmosfærisk rasterbilde. Det gir justerbar typografi, organisasjonsskin og en kontrollert eksportbane. De opprinnelige HTML-kortene og den gamle scenegrafikken forvaltes foreløpig for enkel visning og bakoverkompatibilitet; de skal ikke publiseres som ekstra valgmuligheter.

Den rike visningen er foreløpig **bevisst ferdigrendret**, fordi det gir best samspill mellom lys, perspektiv, glød, figurer og kurvede piler med et lite distribusjonsfotavtrykk. Et hybridlag over denne kan vurderes hvis redigering, tilgjengelighet eller hyppige tekstendringer faktisk krever det. En slik overgang skal ikke antas å gi samme visuelle kvalitet uten skjermbildebasert kontroll.

Bakgrunnen i den rike v2-oppskriften er nå en selvstendig, deterministisk illustrasjon med datanettverk, glassarkitektur og lys, **ikke** landskapsmotivet som brukes i den nøkterne visningen. `scripts/render-context-platform-image.py` tegner hele motivet fra `slides.json`, mens `scripts/presentation-illustrations.mjs` eier import, publiseringskandidat, godkjenning og hash. Oppskriften og kildefilene er ikke del av webdistribusjonen. Godkjent v2-WebP er 128 286 byte.

## Sporbarhet og godkjenning

`docs/assets/presentation-illustrations.js` bygger en normalisert fagmodell med tekster og grafens kanoniske relasjonslinjer, og beregner SHA-256. `docs/data/presentation-illustrations.json` registrerer stil-ID, oppskriftsversjon, `contentHash`, `fileSha256`, masterhash, `approvalStatus`, `approvedAt` og `reviewedBy`. En faglig endring gjør godkjent snapshot utdatert. Endring av logo eller CSS-skin gjør **ikke** det.

Statusene er `awaiting-asset`, `in-review`, `approved` og `rejected`. Bare `approved` med riktig innholdshash og publisert bane gjengis som aktivt bilde. Den nåværende v2-filen er gjennomgått og merket godkjent av assistentens faglige/visuelle kontroll. **Det betyr ikke at brukeren har gitt endelig visuell godkjenning.** Nye faglige endringer krever nytt snapshot og ny kontroll; verktøyet skal ikke automatisk godkjenne sitt eget utkast.

Arbeidsflyt i en autorisert repo-klone:

```sh
python3 scripts/render-context-platform-image.py
node scripts/presentation-illustrations.mjs revoke ai-context-platforms-2027 rich-image
node scripts/presentation-illustrations.mjs import ai-context-platforms-2027 rich-image media/illustrations/input-rich-image.png
# Gjennomfør reell faglig og visuell kontroll før denne kommandoen:
node scripts/presentation-illustrations.mjs approve ai-context-platforms-2027 rich-image GODKJENNER --faglig-ok --visuelt-ok
node scripts/presentation-illustrations.mjs check
```

Oppskriftsversjonen økes når renderingsoppskriften endres vesentlig. Utkast og masterbilder blir liggende utenfor `docs/`. Selve release-committen øker `docs/data/site.json.version` og den tilsvarende ressursversjonen i `docs/index.html`.

## Relasjoner og pilgeometri

Kildene informerer virksomhetskonteksten. Virksomhetskonteksten tilgjengeliggjøres for mennesker, applikasjoner og KI-agenter. En **separat** løkke viser at en beslutning kan lede til kontrollert/autoriserbar handling, og at resultater kan oppdatere konteksten. Den skal ikke fremstilles som en ubegrenset rett for en KI-agent til å endre systemer.

De tre datakildene føres nå sammen til én felles innlesning i virksomhetskonteksten. Tidligere vertikale piler var visuelt misvisende fordi de koblet dataplattformer til «Betydning», operative systemer til «Situasjon» og eksterne kilder til «Rammer», selv om relasjonsgrafen aldri hevdet dette. Pilene er nå geometrisk forankret i faktiske objekter. Den enkle visningen går fra venstre kontekstkant til venstre beslutningskant og fra høyre oppdateringskant tilbake til høyre kontekstkant, uten å peke på beslutningsikonet. Native SVG beregner pilene til og fra den elliptiske kontekstens faktiske omriss, og holder returbanen unna panelet for mulige gevinster. Den rike bildegeneratoren bruker ellipsegeometri og korrigerte inngangs- og utgangspunkter. Dette handler om å unngå at visuelle piler antyder andre relasjoner enn grafmodellen. Nye visuelle varianter skal kontrollere innfestingspunkter og hindringer, ikke bare at pilene har riktig semantisk ID.

`slide-graph.js` eier validering og den enkle diagramvisningens relasjonsruter. Kurvede returforbindelser er lagt til som begrensede, gjenbrukbare SVG-«paths» på de to utvendige korridorene. Native SVG-visningen bruker egne innfestingspunkter tilpasset sin komposisjon, men **samme** ti relasjons-ID-er. Den rike bildeoppskriften validerer relasjonsmengden før den tegner illustrasjonen. Pilene er meningsbærende relasjoner, ikke dekor for symmetri. Ikke innfør automatisk diagrammotor uten et konkret behov.

## Eksport: én 16:9-scene og tre kontrollerte opptaksmetoder

`docs/assets/site.js` velger faktisk synlig lysbilde i detaljvisning, fullskjerm eller Presenter, inkludert valgt stil og skin. `slide-export-prep.js` konverterer aktuelle lokale rasterressurser til innebygde PNG i en **midlertidig kopi**, uten å endre den levende scenen. Deretter:

1. Standard: `html-to-image` rendrer ordinær scene og native piler til PNG/JPEG.
2. Nøktern: `context-native-export.js` tegner verifisert bakgrunn og alle SVG-objektene i én PNG-scene. Denne går videre som raster til den felles eksportmodulen.
3. Rik: `slide-download-entry.mjs` tegner allerede godkjent WebP direkte på canvas, og komponerer eventuelt separat logobilde. SVG `foreignObject` blir ikke brukt til å «skjermfotografere» det ferdige bildet i Safari/WebKit.

PNG er 1920 × 1080. JPG har samme geometri. PDF har én 960 × 540 pt-side med det faktiske rasterinnholdet; PowerPoint har én 13,333 × 7,5 tommers slide med samme bilde. Dette er **bildebaserte**, ikke individuelt redigerbare, PDF- og PPTX-eksporter. Det er et bevisst kvalitets-/portabilitetskompromiss.

## Testkontrakt og bevis

`scripts/check-context-platform-exports-browser.mjs` laster ned **faktiske** filer fra alle tre visningsmodusene i PNG, JPG, PDF og PowerPoint og dekoder bildeinnholdet. Testen skal feile dersom bildet er ensfarget, sentrale bildepartier mangler, 16:9 ikke stemmer eller avviket mot skjermbildet blir for stort. Egen kontroll aktiverer en kunstig organisasjonslogo i CSS og verifiserer at den er med i alle formatene. Alle eksportformater kjøres også fra fullskjerm og fra det lysbildet Presenter faktisk viser. Testen kjøres i Chromium og WebKit via `.github/workflows/check.yml`. Tidligere WebKit-regresjon produserte en nesten ensfarget rik PNG og ble oppdaget gjennom pikselkontroll.

`scripts/check-context-platform-slide.mjs` verifiserer faglig konsistens og retninger, `scripts/presentation-illustrations.mjs check` kontrollerer kildehash, bildefil og størrelsesbudsjett, og `scripts/package-artifact.mjs` lager en portabel pakke kun fra `docs/`. Skjermbilder, pikselmetrikker og nedlastede filer er tilgjengelige som artefakter fra GitHub Actions.

**Ramme:** Mål 100–150 KB per bilde, normalt maks 250 KB. Ikke optimaliser bort nødvendig lesbarhet. Ikke bygg hele bildebiblioteket inn i nettsiden som Base64; konverter bare ressurser som faktisk inngår i en eksport. Ingen master- eller utkastbilder sendes i den portable pakken. En virkelig import i en målplattform som Claude Artifacts er fortsatt ikke verifisert, og må kontrolleres separat før det kan hevdes full plattformportabilitet.

## Hva som fremdeles krever vurdering

Den nye rike illustrasjonen er en egen komposisjon og har fungert teknisk i CI. Endelig redaksjonell godkjenning fra brukeren gjenstår, særlig prioriteringen av virksomhetskontekst, tekstrytme og lesbarhet på vanlig presentasjonsstørrelse. CI kan bevise at tekst og piler ikke forsvinner ved eksport; den kan ikke alene bevise at de er best mulig utformet.

Andre slides skal ikke massekonverteres før benchmarkens visuelle og faglige uttrykk er godkjent.
