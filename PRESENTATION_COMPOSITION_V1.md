# Modulær presentasjonsmotor, versjon 1

## Arkitekturvalg (2026-11-08)

**Faglig scene → komposisjon → objektregister og visuelle lag → felles DOM/SVG for visning og eksport.**

Denne implementasjonen er et kontrollert første steg, ikke en full migrering av hele presentasjonsbiblioteket. Den innfører **en ny opt-in-motor**, uten å bruke tidligere AI Context Platforms-illustrasjoner som modell for ny generell geometri.

- **Faglige data:** `docs/data/slides.json` eier tekst og semantikk. `visual.composition` velger bare teknisk fremstilling, forbindelser og dekorlag.
- **Adapter:** `InnsiktVisualComposition.fromSlide` oversetter `visual.scene=list` til versjonert faglig scene. Nye slidefamilier får egne adaptere, ikke egne renderingsmotorer.
- **Komposisjoner:** `registerComposition(id, (nodes) => boxes)` gir plassering. Standardregisteret har `columns`, `stagger`, `orbit`, `hierarchy`, `network` og `flow`. Varianter kan velge ulike komposisjoner. `overrides[retning].positions[id]` gir avgrensede justeringer uten å endre faget.
- **Objekter:** `registerObject(id, {version,render,anchors?})` registrerer tegnefunksjon. `card` og `focus` er v1. Hver node beholder `data-node-id`, innhold i `content` og sin geometriboks.
- **Relasjoner:** Alle `edges` er eksplisitte, identifiserte og retningsbestemte. Bezier-kurver og ankerpunkter regnes ut fra resultatet av komposisjonen. Ruter tilpasses når en node flyttes. Ikke tegn faktiske relasjoner ut fra dekor eller bare visuell rekkefølge.
- **Lag:** `layers` kan inneholde `glow`, `grid` eller `image`; med `themeAssets.light/strong` for utskiftbare bilder. Tekst, ikoner og piler er selvstendige SVG-lag. Bildelaget bruker registrerte ressurs-ID-er, ikke hardkodede URL-er.
- **Stiler:** `docs/assets/visual-composition.css` bruker `--pres-*` og `--font-*` som temakontrakt. Enkel (`standard`), illustrert (`rich`) og avansert (`rich-image`) har frihet til både egne geometrier og ulike overflater.
- **Eksport:** Den samme scene-DOM-en brukes i bibliotek, fullskjerm og Presenter. Eksporten av enkeltlysbilder fanger DOM; HTML og utskrift inkluderer stilark fra gjeldende nettstedsmanifest. PDF og PowerPoint fra nedlasting av enkeltbilder rasteriserer lysbildet. SVG-tekst og piler er beholdt i nettleser-DOM og i HTML-presentasjonen, ikke påstått redigerbare i PowerPoint.

## Praktisk oppskrift

### Nytt lysbilde

1. Lag en ny oppføring i `docs/data/slides.json` med entydig `id`, innhold, kilder og et `visual` som kan mappes av en adapter.
2. Sett `visual.artDirections: ["rich","rich-image"]` og `visual.composition.engine: "modular-v1"`.
3. Velg `variants: {"standard":"columns","rich":"stagger","rich-image":"orbit"}` eller andre registrerte komposisjoner.
4. Legg lysbildet inn i relevant dekks `pages.json` hvis det skal vises i Presenter. `portal-three-ways` er et reelt, men bevisst avgrenset eksempel.

### Ny objekttype

Implementer `registerObject("signal", {version:1, render({node,box,esc,assets,level}) {...}})` i et dedikert modulskript som lastes før `slide-visuals.js`. `node.content` er faginnhold og `box` er beregnet geometri. Unngå CSS- og renderer-eid fagtekst. Test unik ID, escaping, valgfri ikonressurs, tekstendring og eksport.

### Forbedre et objekt

Forbedre `card` eller en annen type ett sted i `visual-composition.js` og tilhørende CSS. Scener refererer bare type-ID og faglige egenskaper. Legg til valgfrie egenskaper bakoverkompatibelt. Ved brytende endringer: introduser ny type eller kontraktsversjon, migrer deretter brukerne.

### Ny stil eller komposisjon

Bytt token, skygge, stroke og materialitet i CSS når **geometrien fortsatt er riktig**. Registrer ny komposisjon når hierarki, plassering eller informasjonsflyt bør endres. Flere varianter kan velge samme komposisjon uten å bli tvunget til det.

### Bilder og effekter

Registrer egne, optimaliserte raster- eller SVG-ressurser i `docs/data/visual-assets.json` og bruk `layers` med `assetId` eller `themeAssets`. Bildet skal normalt ikke inneholde fagtekst eller diagramkanter. Erstatt bare lagets ressurs-ID ved revisjon. Eksport bruker eksisterende bildeforberedelse med innbygging av lokale ressurser. Kontroller `media/images.json` og `npm run build:artifact` mot samlet størrelsesgrense.

### Kopiering til nytt designsystem

Ta med `slides.json`, adaptere, komposisjoner og objektkontrakter. Overstyr `--pres-bg`, `--pres-fg`, `--pres-muted`, `--pres-accent`, `--font-body` og `--font-display`; legg eventuelt til alternative bilder gjennom `themeAssets`. Vis frem både lys og mørk palett før du godkjenner avanserte fotolag.

### Regresjon og videreutvikling

`node scripts/check-visual-composition.mjs` tester komponentkontrakter, tre reelle komposisjoner, tekstpropagering, objektregistrering, temaspesifikke ressurser og omruting. `node scripts/check-visual-composition-browser.mjs` tester bibliotekets DOM. Kjør `npm run check:browser`, `npm run build:artifact` og CI ved relevante endringer, samt eksport av PNG/JPG/PDF/PPTX.

## Bevisste begrensninger og videre arbeid

Dagens to store figurer bruker fortsatt `unified-slide-scene.js`, som er en **legacy-adapter**, ikke generelt utgangspunkt eller en visuell målestokk. Bildegeneratorene er ennå parallelle historiske verktøy. Flytt dem først når ny motor demonstrerer tilsvarende faglig og visuell kvalitet. Neste trinn bør være en ekte relasjonsdrevet slideadapter, typografisk måling i stedet for tegnbasert linjebryting og sammenligning av eksportbilder for den nye motoren. Ingen av disse er påstått ferdig i v1.

## Pilot: AI Context Platforms (0.18.119)

Det eksisterende lysbildet `ai-context-platforms-2027` er nå en **faglig adapter** til den modulære motoren. Semantikken eies fortsatt av `slides.json` og den validerte grafen i `slide-graph.js`. Ingen tekst eller faglige relasjonsretninger er kopiert inn i CSS, generatorer eller særskilte renderingstrær.

- `docs/assets/context-atlas.js`: registrerer en adapter, tre selvstendige komposisjoner, objekttyper, en relasjonsruter og et dekorasjonslag. Endringer i objekttyper er isolert fra komposisjonens koordinater.
- `docs/assets/context-atlas.css`: definerer enkel, illustrert og avansert visuell fremstilling. Illustrasjonsvariantene har nå felles geometri. Objektene tilfører illustrasjoner innenfor egne ankere; diagram, tekst og relasjoner er fortsatt SVG. Atmosfærebilde er et byttbart lag fra ressursregisteret.
- `scripts/check-context-atlas.mjs`: tester 22 stabile objektidentiteter, alle ti kanoniske relasjoner, omplassering, invariant geometri mellom visuelle stiler, 15 motivforankrede illustrasjoner og innholdspropagering.
- `scripts/check-context-platform-exports-browser.mjs`: sammenligner reelle skjermbilder med PNG/JPG/PDF/PPTX i Chromium og WebKit. Pilotens faglige geometri skal nå være **helt lik** på tvers av stilene. Illustrasjonslaget er knyttet til objekter og kanoniske relasjoner.

Gjenstående visuell forbedring bør skje i objektstiler og dekorlag, ikke ved å bake fagtekst eller piler inn i et ferdig foto. Den historiske `unified-slide-scene.js` brukes fortsatt av verdikjeden og som regresjonsreferanse, men ikke av denne piloten i appen.

## Visuell grammatikk v2 (0.18.122)

Brukerutprøvingen avdekket to problemer: objektene flyttet seg uten faglig grunn, og den avanserte stilen tilføyde hovedsakelig et absolutt, frikoblet landskapsbilde. Dette er endret i piloten.

- **Fast faglig geometri:** Alle tre visningsstiler bruker `context-architecture`. Et objekt eller en relasjon flytter seg bare ved en eksplisitt komposisjonsendring. Justering av stil skal ikke endre leserekkefølgen eller ankerpunktene.
- **Objektforankret motivregister:** Hver av de 15 faglige kortnodene får et `visual.motif` fra en gjenbrukbar grammatikk for mennesker, applikasjoner, agenter, semantikk, tid, rammer, systemer, beslutning, handling og verdi. Motivet er geometrisk relativt til kortets egen boks, ikke til lysbildets globale koordinater. Motiver kan overstyres med `visual.composition.motifs[nodeId]` uten å endre fagtekst.
- **Lagvis progresjon:** `standard` er et rent diagram; `rich` viser struktur og kunnskapsnettverk; `rich-image` tilfører lokale volumer, linseeffekter og relasjonslys. De tre er samme SVG-scene; CSS bestemmer hvilket nivå som synes. Den avanserte stilen krever ikke et rasterbilde.
- **Relasjonsforankret lys:** `mc-edge-ambient` bruker eksakt samme beregnede kurve som den kanoniske pilen. Den har ingen egen rute eller faglig betydning. Andre slidefamilier har standard `stroke:none`.
- **Kontekstobjektet eier kunnskapsnettverket:** Nettverket er lokalisert relativt til hovedobjektets dimensjoner. Det er konseptuell illustrasjon, ikke en påstand om nye autoritative faglige relasjoner.
- **Regresjonskrav:** 22 identiteter, 10 kanoniske piler og identisk SVG-markup på tvers av stiler. Kontroll av lys og mørk palett og faktisk eksport beholdes.

Læringen er generell, men er foreløpig implementert på ett lysbilde. En eventuelt ny komposisjon er et eget faglig/redaksjonelt valg, ikke en automatisk effekt av å velge en illustrasjonsstil.

## Avansert illustrasjonsnivå i repo (0.18.125)

De tre stilene har fortsatt identisk semantisk scene og graf. Denne piloten er begrenset til AI Context Platforms, men det avanserte nivået har nå **en separat, utvidbar illustrasjonsmotor** (`docs/assets/context-illustrations.js`) og stilark (`context-illustrations.css`). Det er ikke et ferdig, statisk lysbildebilde.

- **Enkel:** Diagram, ikonografi og kanoniske piler uten dekorative objektillustrasjoner.
- **Illustrert:** Kraftigere farger, vektormotiver, relasjonslys og tydeligere kunnskapsnettverk.
- **Avansert:** 15 ulike semantiske 2,5D-illustrasjoner, blant annet mennesker, applikasjonsstabler, KI-agent, semantisk nettverk, tidslinje, regelverk, dataplattformer, operative systemer, API-kilder, beslutning, kontrollert handling og mulige gevinster. Et større kunnskapsnettverk og lokale banelinjer eies av hovedobjektet.

Hvert motiv velges via `node.visual.motif` og beregnes fra objektets `box`; både illustrasjonen og det faglige objektet følger komposisjonen. Den avanserte stilen bytter intern materialitet og disponering av kortets innhold, men **ikke** kortenes eller pilenes plassering. Motivet kan byttes uten at data, relasjoner eller layout endres. Hver SVG-illustrasjon får `data-illustration-owner` og `data-illustration-motif` for inspeksjon og testing. CSS bruker bare temaroller, slik at skin fortsatt kan byttes.

Dette er tegnet som SVG-komponenter, ikke fotografiske KI-bilder. Det kan gi vesentlig større visuell forskjell og holde redigerbarhet og eksport samlet. Full evaluering av uttrykket bør skje på skjermbilder i både lys og mørk visning.

## Avansert bildegrafikk knyttet til objekter (0.18.126)

Pilotens avanserte stil kombinerer nå vektorfigurer med **16 individuelle, optimaliserte WebP-illustrasjoner**. De er generert som konseptkunst for dette arbeidet og beskåret til gjenbrukbare motiver uten autoritativ tekst. Alle ligger i `docs/assets/library/original/context-motif-*.webp` og er registrert med ID, opphavstype og SHA-256 i `docs/data/visual-assets.json`.

Illustrasjonen velges via det eksisterende `node.visual.motif` og slås opp i ressursregisteret (`context-motif-${motif}`). Hvert motiv tegnes i kortets lokale koordinater, med SVG-grafikk som fallback. Et utskiftet motiv påvirker verken semantisk graf, kortets posisjon eller tekst. Hovednettverket har eget bildeobjekt og følger kontekstrammen. Dette er **ikke** en rasterisert helside eller et bilde som flyter uavhengig av scenen.

Ved videre bearbeiding: erstatt bildets WebP-fil, oppdater sjekksummen i `visual-assets.json`, og kontroller lys/mørk palett og faktisk eksport. Konseptkilden er generert i arbeidet med piloten; kuttede bilder er produksjonsfiler, ikke originale foto eller en endelig illustrasjonsmaster. Unngå å bruke tekst i slike motiver ved senere regenerering.
