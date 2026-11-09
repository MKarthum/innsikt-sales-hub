# Presentasjonssystemet: kanonisk innhold, modulær rendering og eksport

Oppdatert 9. november 2026. Denne filen beskriver gjeldende implementasjon, ikke tidligere prototyper.

## Autoritet og produksjonslinje

1. `docs/data/slides.json` eier budskap, faglige objekter, referanser, notater og relasjoner. `docs/data/visual-assets.json` eier ressursene. Bildepiksler og CSS må ikke bli en skjult ekstra faglig sannhet.
2. `docs/assets/slide-visuals.js` ruter et lysbilde til riktig aktiv scene. `visual.composition.engine: "modular-v1"` bruker `visual-composition.js`. Adaptere, komposisjoner, objektroller og semantiske rutere er registrerbare og kan gjenbrukes mellom flere lysbilder.
3. `context-atlas.js` beskriver **én bestemt fagmodell** med 22 sceneobjekter og ti kanoniske relasjoner. Den skal ikke være standardmal for andre faglige problemstillinger.
4. `visual.scene: "list"`, `composition.family: "story-flow"` og `flow-with-outcome` demonstrerer en **generell** firetrinnsflyt med en konklusjon. Den brukes av `delivery-time-context-flow` og har ingen bransjetekst eller organisasjonsfarger kodet i motoren.
5. `insight-value-chain` bruker fortsatt den aktive, eldre `unified-slide-scene.js`. Ikke fjern denne motoren før siste bruker er migrert og hele biblioteket er verifisert. Eldre, ikke aktive alternativer er ikke normative.

De tre stilene er `standard`, `rich` og `rich-image`. De bygger på identiske fagobjekter, tekster, koordinater og grafrelasjoner. Stiler eies av `visual-composition.css`, `context-atlas.css`, `context-illustrations.css` og eventuelt et organisasjonsskin. Ikke opprett tre forskjellige renderere eller tre JSON-kopier av samme lysbilde.

## To konkrete lysbilder som produksjonskontroll

| Lysbilde | Budskap | Struktur |
| --- | --- | --- |
| `ai-context-platforms-2027` | Kontekst, kilder, brukere, kontrollert beslutningssløyfe og potensielle gevinster | `context-atlas`, 22 sceneobjekter, 10 relasjoner |
| `delivery-time-context-flow` | Økt leveringstid kan ikke tolkes uten definisjon og situasjon | `story-flow`, 4 steg, 1 konklusjon, 3 relasjoner |

Det siste er eksplisitt et **illustrativt eksempel**, ikke en dokumentert kundehistorie. Nye lysbilder skal starte med spørsmålet og de nødvendige sammenhengene, ikke med en ønsket mengde bokser, ikoner eller bakgrunnsbilder.

## Visuell kvalitet og oppdatering

- Eksempel og budskap først: hvert objekt må ha en funksjon; konsekvens er noe annet enn mekanisme.
- Piler er **kanonisk SVG-geometri**, uavhengig av illustrasjonsnivå. Marker hvilken vei forbindelsen går også uten animasjon.
- Animerte datapunkter er dekorative. De gjenbruker de semantiske pilbanene og skaper ingen ekstra relasjoner.
- Vær særlig varsom med selvstendige glødende prikker, doble rammer, løse rutenett og absolutte dekorobjekter. Tidligere, ubrukte bildeoppskrifter og hub-nettverk er fjernet fra kontekstscenen.
- `prefers-reduced-motion`, valget «Bevegelse av» og utskrift må fortsatt gi et meningsfullt stillbilde.
- Oppdater presentatørnotater når faglig betydning, avgrensninger eller forholdet mellom mekanisme og mulig verdi endres.

## Nedlasting og deling

| Format | Formål | Bevegelse |
| --- | --- | --- |
| PNG og JPG | Stillbilder, dokumenter og innlegg | Nei |
| PDF og PowerPoint | Statisk deling og videre bruk | Nei |
| Animert HTML | Full SVG- og CSS-animasjon, også offline | Ja |
| Animert GIF | Kort, enkel animasjon til sosiale medier | Ja, bevegelige markører over SVG-basert stillbilde |
| Video | Videopost, helst MP4; WebM ved manglende MP4-støtte | Ja, bevegelige markører over SVG-basert stillbilde |

GIF og video lages på klienten av den **samme** modulære SVG-scenen, ikke en separat bildefil med innbakt tekst. GIF har 640 × 360 piksler, 8 bilder per sekund i 6 sekunder. Video har 1280 × 720 piksler, 12 bilder per sekund i 6 sekunder. Disse to eksportene prioriterer markører langs sammenhengene fremfor full gjengivelse av alle CSS-effektene i livevisningen. Animert HTML er valget for full bevegelse og høyeste visuelle trofasthet.

For GIF/video brukes nettleserens egen SVG-rasterisering, og videoformatet avgjøres med `MediaRecorder.isTypeSupported`. Oppstår det feil, skal eksporten stoppe tydelig og aldri gi en mislabeled eller stillestående fil. GIF-komprimeringen er enkel og prioriterer portabilitet; GIF kan bli betydelig større enn video og har begrenset fargedybde.

## Vedlikehold og testport

Ved en ny `story-flow`-slide bør det bare kreves et nytt JSON-objekt og eventuelle registrerte bilde-ID-er. Ved en virkelig ny faglig topologi: lag én gjenbrukbar komposisjon og dens relasjoner i den modulære motoren, ikke en ny renderer for hvert nivå. Det er tillatt å lage nye objektroller når det er faglig begrunnet.

Kjør `node scripts/check.mjs`, og spesielt `scripts/check-context-atlas.mjs`, `scripts/check-context-platform-slide.mjs`, `scripts/check-modular-production.mjs` og nettlesertestene for eksport. Test kildebytte, dataendring, lys/mørk, layout, tilpasset skin, animasjon av/på og reell nedlasting. En syntaktisk grønn kontroll alene er ikke tilstrekkelig for godkjenning av visuell kvalitet.

## Oppryddingsprinsipp

Ikke behold en parallell, inaktiv versjon av et lysbilde som sikkerhet når den ikke er koblet til aktiv rendering. Slett bare kode som kan dokumenteres ubrukt. Ikke slett en eldre motor eller publiserte ressurs-ID-er som fortsatt brukes av andre lysbilder, gamle lenker eller kontrollskript. Når gamle tester påbyr et fjernet dekorelement, skal testen oppdateres til faktisk gjeldende faglig kontrakt.
