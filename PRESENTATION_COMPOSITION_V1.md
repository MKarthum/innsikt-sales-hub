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
