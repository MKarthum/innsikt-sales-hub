# Presentasjonsarkitektur: én scene og tre skinn

Oppdatert 8. november 2026. Gjelder `ai-context-platforms-2027` og `insight-value-chain` på `main`.

## Prinsipp

Vi bygger **ett lysbilde**, og velger etterpå visuell stil. Tekst, objekter, koordinater, ikoner og faglige forbindelser må ikke kopieres til tre forskjellige implementasjoner.

- **Kilde:** `docs/data/slides.json` eier alt faglig innhold. `docs/data/visual-assets.json` eier ikon- og bildekilder.
- **Modell og rendering:** `docs/assets/unified-slide-scene.js` lager én sceneplan (`InnsiktDiagramScene.create`) og ett SVG (`render`). Alle tre stiler bruker nøyaktig samme SVG-geometri, tekst og piler.
- **Uttrykk:** `docs/assets/unified-slide-scene.css` har `standard`, `rich` og `rich-image`. Bare farger, streker, overflater, lys og dekorative bakgrunnslag kan variere. Et fotografi kan legges bak, men får ikke eie tekst, piler eller faglige objekter.
- **Bruk:** `slide-visuals.js` delegerer begge komposisjoner til fellesmotoren. Samme scene benyttes i bibliotek, fullskjerm, Presenter og eksport.

| Stil | Virkning | Oppbygning |
| --- | --- | --- |
| Standard | Nøytral og presis forklaring | Kanonisk SVG-scene |
| Nøktern (`rich`) | Lettere glass, skygger og svak bakgrunn | Samme SVG-scene |
| Rik (`rich-image`) | Mer atmosfære og eventuell illustrasjon i bakgrunnen | Samme SVG-scene |

Dette er ikke lenger tre separate diagramrenderere. For disse lysbildene lages det heller ikke en ekstra rasterkopi med fast tekst og pilgeometri. SVG er skalérbar.

## To uavhengige komposisjoner

- `context-platforms`: Kilder, felles virksomhetskontekst, mottakere, beslutningssløyfe og mulige effekter. Den kanoniske grafen i `visual.graph.source` validerer ti retninger og relasjonstyper. Tre rettlinjede kildepiler peker til den samme kontekstsonen. De innebærer ingen én-til-én-kobling til fasettene over.
- `insight-ecosystem`: Et startspørsmål, fire prosesstrinn, mål og tverrgående forutsetninger. Ordningen bestemmes av `visual.stages` i `slides.json`.

Den faglige strukturen er forskjellig, men begge bruker den samme motoren for node-ID-er, SVG, ikoner, tekst, forbindelser, stilvalg og eksport.

## Produksjonsregel for neste lysbilde

1. Skriv eller gjenbruk alt faglig innhold i `slides.json`.
2. Velg eksisterende scenekomposisjon hvis den passer. Da kommer alle tre stiler automatisk.
3. Ved ny topologi: Implementer **én** ny layoutmodell i `unified-slide-scene.js`, ikke en renderer for hver stil.
4. Legg estetiske forskjeller i CSS-skinnet, eller registrer et uavhengig dekorativt bilde.
5. Valider semantikk, tekstplassering og eksport i Chromium og WebKit.

En ny layout kan kreve noe informasjonsdesign. Å velge en passende komposisjon er fortsatt ikke automatisert. Målet er at ny *teknisk* tegnekode og manuell eksporttilpasning ikke må gjentas for hvert lysbilde.

## Faglig prioritering og visuell retning (9. november 2026)

Kontekstbildet skal forklare **hva kontekst er**, **hva den bygger på**, **hvem som bruker den**, og **hvordan beslutninger og handlinger oppdaterer tilstanden**. Nederste prosessrekke viser mekanisme (beslutning, kontrollert utførelse, ny tilstand). Høyre kolonne skal bare vise *mulige virkninger* (felles forståelse, tryggere KI-bruk, bedre tilpasning), og ikke repetere prosessens steg. Ingen effekt er garantert; utdypingen eies av lysbildets `speakerBase`.

De seks vertikale forbindelsene beregnes fra midten av kilde- og mottakerkortene og er rette. Dette er et bevisst layoutvalg, ikke en begrensning i rutemotoren. De to store Bézier-kurvene på sidene beholdes. Pilhodene for disse og de to korte nederste overgangene plasseres direkte på den kanoniske banen der de er synlige foran objektene. Markøranimasjonen gjenbruker den samme banen. Ekstra, løsrevet nettverksillustrasjon over «Rammer» er fjernet. Den semantiske grafen og komposisjonens øvrige objektplasseringer er uendret.

## Bevegelse og nedlasting

Kontekstscenen kan vise dekorative signalmarkører som følger de **samme validerte relasjonene** som de statiske pilene. En markør er ikke en ekstra kant i kunnskapsgrafen. I rik stil kombineres markørene med bevegelse i tåkefelt og lysstrømmer, og i de interne illustrasjonene. Verken tekst, kortplassering, relasjonsretning eller pilgeometri animeres.

Bevegelsen styres av `data-motion="on"` på presentasjonsflaten, og respekterer `prefers-reduced-motion`. Offlinelesing av et enkelt lysbilde tilbys som **Animert HTML**, ved å gjenbruke den portable presentasjonseksporten med ett lysbilde. Stilark, bilder og tilstand bygges inn i filen. PNG, JPG, PDF og PowerPoint forblir tilsiktet statiske; bildeeksporten fjerner de dekorative SVG-animasjonene fra en midlertidig eksportkopi. Det levende SVG-diagrammet i portalen endres ikke.

## Kontroller

`scripts/check-context-platform-slide.mjs` verifiserer kanonisk innhold, node-ID-er, geometri, alle relasjoner, endringer i data og at både komposisjonene bruker én motor.

`scripts/check-context-platform-exports-browser.mjs` kontrollerer at nøyaktig samme SVG-markup brukes i alle tre stiler, og sammenligner reelle skjermbilder med nedlastede PNG-, JPG-, PDF- og PowerPoint-filer. Nettleserkjøringen omfatter Chromium og WebKit. Logooverlegget skal være separat og kan endres gjennom CSS.

Skinnet leser `--pres-bg`, `--pres-fg`, `--pres-muted` og `--pres-accent`. Disse skal kunne byttes når løsningen kopieres til et annet designsystem, uten å endre JSON eller tegnekoordinater.

## Avviklet og beholdt

Den gamle selvstendige `context-native-svg.js`-rendereren, eget stilark og separat SVG-eksportbane er fjernet. Den andre HTML/CSS-komposisjonen for de to scenene er også fjernet fra aktiv rendering. `slide-graph.js` validerer nå relasjoner, men tegner ikke et parallelt pilsett.

De eldre Python-oppskriftene og bildemanifestet er beholdt som referanser og som mulig verktøy for separat godkjent illustrasjonsgrafikk. De er **ikke** nødvendige for de tre aktive scenestilene. Ikke opprett nye bildekopier med innbakt tekst og piler når det finnes en kanonisk SVG-scene.

Dette er en gjenbrukbar scenemotor, ikke en automatisk illustratør for enhver tenkelig faglig figur.
