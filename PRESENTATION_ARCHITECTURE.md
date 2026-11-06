# Presentasjonsarkitektur – gjeldende kontrakt v0.13.0

Dette dokumentet beskriver **nåværende** implementasjon. Historiske iterasjoner er erstattet av denne kontrakten. Bruk også STORY_EDITORIAL_CONTRACT.md, NAVIGATION_CONTRACT.md og SLIDE_EDITORIAL_AUDIT_2026-10-24.md.

## Kanoniske nivåer

- docs/data/slides.json: Ett lysbilde per stabil ID. Eier fagtekst, sceneparametere, speakerBase, kilde-ID-er og eventuelle figur-ID-er.
- docs/data/pages.json.presentationDecks: Kuraterte historier med egen målgruppe, dramaturgi, beats, rekkefølge, overgangsnotater og fargeplan. Ikke dupliser lysbildeinnhold her.
- docs/data/visual-assets.json og docs/assets/library/: Ett sentralt register over leverandørlogoer, lisensierte eksterne bilder og egne SVG-figurer. Ett asset kan oppdateres uten å redigere alle lysbilder.
- docs/data/architecture-profiles.json: Konkrete generiske og leverandørspesifikke arkitekturprofiler.
- docs/assets/slide-model.js: Ren logikk for oppslag, bruk i historier, notes-komposisjon og temavalg.
- docs/assets/slide-visuals.js og docs/assets/slide-visuals.css: Scenefamilier og elementplassering for redaksjonelle lysbilder. Motivet kommer fra asset-ID.
- docs/assets/architecture-visuals.js og vendor-architectures.js: Ulike arkitekturscener. Del komponenter der de faktisk er like, men ikke tving leverandørene inn i samme layout.
- docs/assets/site.js: Library, Presenter, navigasjon og route-handling. Tekster og kilder skal komme fra datafiler.
- docs/assets/presenter-export.js: HTML/PDF, med lokale figurer innebygd i portable filer.

## Fem distinkte historier

1. Hvorfor Innsikt? – overordnet faglig sammenheng og motivasjon.
2. Innsikt, marked og veien videre – markedstrender, behov og strategisk fokus.
3. Vis løsningen – konkret oppgaveorientert demonstrasjon av portalens verdi.
4. Kundeeksempel – ett fiktivt problem og kvalifisering før teknologivalg.
5. Dataarkitektur – valgfri teknisk fordypning, ikke generisk salgsforedrag.

De tidligere fire overlappende kortversjonene/pilotene er ikke lenger separate dekk. De gode lysbildene er beholdt som frittstående objekter.

## Innhold og visuell kvalitet

En story er ikke et løp som opprettes fordi biblioteket tilbyr komposisjon. Målgruppe, spørsmål, vendepunkt, effekt og kilder skal begrunne hvert presentasjonsløp. Ikke legg på et nytt løp hvis det bare er en kortere eller omstokket versjon av samme historie.

Ett lysbilde skal ha ett hovedbudskap, lettlest komposisjon og relevante notater. Bruk egne SVG-figurer for å løse faktiske forklaringsbehov, ikke bare for å fylle tomrom. For felleslister kan itemAssetIds brukes, for prosesskjeder stepAssetIds, og for sentrale åpninger figureAssetId. Disse må referere et kanonisk objekt med dokumentert opphav og rettigheter.

Bilder og leverandørlogoer lagres lokalt med rettighetsinformasjon. Eksterne illustrasjoner må ha en gyldig lisens. Leverandørens logo kan identifisere produktet, men bruk betyr ikke partnerskap eller godkjenning. Kilder legges på relevante lysbilder; vises på selve bildet bare om en sitat-/figurkontrakt krever det.

## Visningskontekst er ikke lysbildeinnhold

Biblioteket viser alltid et selvstendig lysbilde uten nummer. Historier eier sekvens og beregner nummer fra gjeldende plassering; presentatøren kan slå nummer av/på for visning og HTML/PDF-eksport. Paginering i navigasjonskontrollene vises uavhengig av denne innstillingen. Nummerering **inne i** figurer, arbeidsflyter og spørsmål er faglig innhold og skal ikke påvirkes. Fortellingsstyrt tema, placement-notater og historieoverganger eies av deck, ikke av det felles lysbildet. Ikke utled bibliotekets nummer eller historietilhørighet fra første forekomst i en historie. Test bibliotek, detaljside, fullskjerm, Presenter, tema og offline-eksport sammen.

## Tema og portabilitet

Lys visning er standard. Presenter og biblioteket bruker ett delt tema-valg, med Mørk eller Fortellingsstyrt som alternativer. Fargene styres med kontrast-par for --pres-* og --slide-*; grafikk og tekst følger de semantiske rollene. Logoer beholder offisielle farger på nøytral flate. Test begge visninger, også i nedlastet HTML/PDF og på mobil.

Alt offentlig innhold skal være på GitHub Pages uten autentiseringspåstander. Internt materiale hentes kun via separat tilgangsbeskyttet distribusjon i henhold til INTERNAL_CONTENT_CONTRACT.md.

## Forvaltning og automatiske kvalitetsporter

- AGENTS.md og START_HERE.md beskriver arbeidsmåte og ansvar.
- NAVIGATION_CONTRACT.md er obligatorisk for detaljruter; ingen ny seksjon/id uten klikkbar forelder og nettlesertest.
- STORY_EDITORIAL_CONTRACT.md beskriver inntakskriteriet for nye historier og kriterier for å avvikle overlapp.
- SLIDE_EDITORIAL_AUDIT_2026-10-24.md dokumenterer gjennomgang av alle 39 aktive slideobjekter, tilhørende figurer og historietilhørighet.
- scripts/check-editorial-governance.mjs krever distinkte historier, kildekoblinger, gyldige bilder og oppdatert audit.
- scripts/check-navigation-browser.mjs tester samtlige lysbildedetaljer på desktop og mobil, pluss andre detaljtyper.
- scripts/check-library-v1-browser.mjs rendrer alle lysbilder, sjekker tekst- og scenebundethet og beholder bilder til manuell gjennomgang. Nye scener skal tas inn i samme test.
- scripts/check-architecture-assets.mjs verifiserer opprinnelse, SHA256 og lisens. scripts/check-presentation-mode-browser.mjs tester tema- og eksportlogikken.
- node scripts/check.mjs er et obligatorisk statisk trinn, men ikke erstatning for Chromium og visuell inspeksjon.

Nye lysbilder: endre datafil først, velg eksisterende scene og figur før du legger til ny scene, legg relevante kilder på objektet, dokumenter bruk, kjør tester og se faktisk skjermbilde. Endringer i delte bilder skal testes mot **alle** brukende historier. 

## Visuell revisjon v0.14.0

Se SLIDE_VISUAL_REVIEW_2026-10-24.md for individuell evaluering og begrunnelse for 39 lysbilder. Det visuelle oppsettet velges etter budskap (valg, spørsmål, kundestemmer, trinn eller hovedresonnement), mens kilde-, tema-, scene- og objektsystemene beholdes.
## 0.15.0: spesialiserte forklaringsscener

Åtte svake lysbilder bruker slide-story-scenes.js med egen modul og CSS. Komposisjonene har dataeid forklaringsinnhold, samme semantiske temaroller og samme eksportvei som de øvrige lysbildene. Se individuell vurdering i SLIDE_VISUAL_REVIEW_2026-10-24.md.

## 0.17.0: konkretisering av gjenstående generiske kort

Fire lysbilder fikk spesialiserte, dataeide forklaringsscener for møtebrief, konkret kundespørsmål, fagsamspill og avgrenset avklaring. Figurreferanser skal bare eksistere når figuren brukes. Kontrakttesten tillater meningsbærende typografi/diagram uten dekorative ikoner og verifiserer også `stages[].assetId`. Se SLIDE_QUALITY_REVIEW_V017.md.

## Bibliotekskort i skjermdekkende visning (v0.17.1)

Et vanlig klikk på et lysbildekort viser det eksisterende kanoniske 16:9-lysbildeobjektet i en skjermdekkende dialog, uten å endre URL eller bibliotekets filtre. Knappen «Lukk», Escape og klikk på bakgrunnen returnerer fokus til det valgte kortet. «Notater og kilder» åpner den eksisterende detaljruten for direkte lenking. Kortets opprinnelige `href` beholdes som semantisk fallback, samt for åpning i ny fane med modifikasjonstaster. Ingen innholdskopi eller egen renderer.

## 0.17.2 – mobil lukking

Bibliotekets skjermdekkende visning lukkes på touch-`pointerup` ved trykk utenfor 16:9-flaten eller på «Lukk», med `click` og Escape som alternativer. Det gir én entydig lukkemekanisme selv der mobil Safari ikke leverer forventet syntetisk click. Dette påvirker ikke lenken til notater/kilder. Mobilens hovedmeny har egen tilgjengelig lukkeknapp, et backdrop med trykk-utenfor og Escape, med fokus tilbake til menyknappen.

## v0.17.3 – berøringssekvens og lukking i iOS

Et mobiltrykk på «Lukk» eller utenfor 16:9-lysbildeflaten fullføres nå via en ikke-passiv `touchend` før dialogen fjernes. Det forhindrer at den etterfølgende syntetiske `click`-hendelsen treffer kortet eller kontroller bak dialogen. En ekstra posisjonsspesifikk guard stopper uventede kompatibilitetsklikk i WebViews som ikke respekterer kansellering. Vanlige `click`- og tastaturhandlinger er uendret. Test med ekte berøringshendelser og kontroller at visningen fortsatt er lukket etter at klikksekvensen er ferdig.

## v0.17.3 – totrinns navigasjon er autoritativ

Korrekt flyt er **kort i bibliotek → lysbildets detaljside med notater/kilder/gjenbruk → trykk på lysbildet → fullskjerm**. Kort er vanlige lenker, og data/notes beholdes i detaljsiden. Fullskjerm er en frivillig ekstra visning, ikke en erstatning for detaljsiden. Trykk på selve lysbildet eller Enter/Mellomrom ved tastaturfokus åpner; Lukk/berøring utenfor/Escape returnerer til samme detaljside uten ruteendring.

**Gjeldende regel:** Avsnittene fra v0.17.1 om fullskjerm direkte fra kort, og v0.17.2 om `pointerup`, er historiske og erstattes av v0.17.3. Kortet leder alltid først til detaljsiden.

## v0.17.4 – enkel og robust fullskjermlukking

Gjeldende implementering for detaljsidens lysbildefullskjerm bruker dedikerte hendelseslyttere på dialogens lukkeknapp og på området utenfor selve lysbildet. Den tidligere globale `pointerup`-/`touchend`-håndteringen er fjernet. En `touchend` på lukkekontroll eller bakgrunn kansellerer kompatibilitetsklikk og lar dialogen bli stående til neste hendelsessyklus før den fjernes. En kort gjenåpningsbeskyttelse hindrer at sent leverte mobilklikk åpner forhåndsvisningen på nytt. Lukking via tastatur eller mus følger vanlige klikk-/Escape-hendelser. Lukkeknappen ligger nederst i mobilvisningen, utenfor lysbildet og med et større trykkfelt.

**Behold totrinnsflyten:** bibliotekskort → detaljside med notater og kilder → trykk på lysbildet → fullskjerm → tilbake til samme detaljside. Nytt lyd-/touchregime må ha en regresjonstest som simulerer sent kompatibilitetsklikk etter lukking.

## v0.18.32 – hovedfortellingen

`innsikt` har åtte kuraterte bilder. Ny `insight-ecosystem`-scene tegner en pedagogisk sammenheng fra virksomhetsbehov gjennom dataplattform, datateknikk/modellering, analyse/BI og KI/arbeidsflyt til handling; det er ikke en ny teknisk referansearkitektur. Data og ikon-ID-er eies av `slides.json` og assetregisteret. `architecture-conceptual` eier fortsatt teknisk utdypning. Ingen fiktive pilotbilder eller teknisk dypdykk i hovedløpet.


## Selvstendige redaksjonelle scener og valgfri bevegelse

Piloten fra november 2026 beholder stabile lysbilde-ID-er, dataeide tekster, kilde-ID-er og presentatørnotater. Tre lysbilder får ulike sceniske uttrykk: stor kapasitetsmetafor, typografisk KI-utbredelse og todelt konsekvensscene. Visuell forskjell er bevisst; de bruker samme semantiske fargeroller og kan gjenbrukes i flere fortellinger.

Presenter har et separat valg for Bevegelse: På/Av, uavhengig av Lys, Mørk og Fortellingsstyrt. Selve lysbildet eier eventuelle oppbyggingsanimasjoner (som aldri er nødvendig for å forstå bildet); fortellingen kan oppgi transition: fade eller reveal på plasseringen. Uten angitt overgang brukes fade. Biblioteket er statisk. prefers-reduced-motion har forrang; PDF/print er statisk. Ingen fagfakta eller sluttilstander skal være skjult uten animasjon.

Kopiløsninger kan laste et ekstra organisasjonsstilark etter de delte stilarkene; merk lenken data-innsikt-skin for at HTML-eksporten skal hente og bygge inn CSS fra samme domene. Historisk organization/-sti oppdages også. Organisasjonen eier paletten, kjernen eier struktur og animasjon. Se THEME_CONTRACT.md.


## Nedlasting av ett lysbilde

Detaljsiden i biblioteket og aktiv slide i Presenter tilbyr PNG, JPG, PDF og PowerPoint (PPTX). Formater genereres fra samme statiske, nummerfrie 16:9-visning med gjeldende lys/mørk/fortellingsstil og eventuelle organisasjonsskins. Eksporten kjøres lokalt i nettleseren, uten ekstern tjeneste. PPTX og PDF inneholder et høyoppløselig bilde (ikke redigerbare PPTX-elementer); dette fremgår i UI. Animasjoner tas ikke med i disse statiske formatene. Eksport fra beskyttede interne presentasjoner krever fortsatt eksplisitt bekreftelse. Implementasjon: scripts/slide-download-entry.mjs, bygget til docs/assets/slide-download.js med npm run build:slide-download.


## Eksportkvalitet og iPhone-lukking (0.18.48)

Enkeltlysbilde-eksport serialiserer HTML og innvevd SVG til bilde. Beregnede SVG-farger og `fill:none` fryses kun i eksportklonen før rasterisering, slik at eksterne CSS-skins beholdes uten at arvede SVG-stiler faller bort. Automatisert Chromium-regresjon kontrollerer faktiske PNG-piksler (ikke bare filsignatur), samt PDF, JPEG, PPTX og tilpasset skin.

På iPhone flyttes fullskjermens eneste Lukk-knapp til et fast lag direkte under skjermdekkende overlay, utenfor den rullbare dialogen. `touchstart` håndteres direkte på knappen med `preventDefault` og tidlig opprydding, mens `click` beholder mus/tastaturstøtte. Beskyttelse mot kompatibilitetsklikk/ghost-click hindrer gjenåpning. Berøringsemulering testes både med nedlastingsmenyen åpen og lukket. Ekte iOS Safari må fortsatt verifiseres separat ved anledning.


## iPhone: fullskjerm som en egen navigasjonsrute (0.18.49)

Tidligere lukking baserte seg på JavaScript-håndtering av `touchstart`/`click`. Dette fungerte i Chromium-emulering, men brukertest på fysisk iPhone viste at knappen bare ble markert. Derfor er fullskjerm nå en egen intern hash-rute (`#lysbilder/<id>~fullskjerm`); vanlig visning bruker `#lysbilder/<id>`. Lukk-knappen er en ekte `<a href>` som lar Safari navigere direkte til vanlig visning. Det mørke området utenfor lysbildet har også en innebygd, klikkbar navigasjonslenke. Lysbildet og nedlastingsmenyen beholder normal interaksjon. Rutehendelsen bygger opp eller fjerner modalen, og nettleserens tilbakeknapp fungerer også. Ingen spesialhåndterer av touchstart/touchend brukes for dette. Testene verifiserer navigasjon, tilbakeknapp og lukking via vanlige ankerlenker selv om en klikk-lytter stopper videre hendelsesbobling.

Utformingen er fortsatt CSS-basert med åpne `--slide-*`-roller for skinn i kopiløsninger. Endringen er begrenset til biblioteksvisning i fullskjerm og endrer ikke innhold, lysbilde-ID-er eller presentasjonsfortellinger.


## Endelig arkitektonisk grep for visning av ett lysbilde – 0.18.50

Fullskjermvisning i biblioteket er nå en **egen, ordinær dokumentvisning**, ikke en modal. URL-en ?fullslide=<slide-id> utløser en ny sidelasting av nettstedet med samme datadrevne lysbilde og 16:9-renderer som bibliotek og Presenter, direkte i #main. Normal visning er #lysbilder/<slide-id>. Åpning og lukking gjøres med vanlig nettlesernavigasjon; knappen «Lukk» og feltene *utenfor* lysbildet er ordinære lenker i dokumentflyten. Sidens verktøylinje for enkeltlysbilde-eksport er også i dokumentflyten. Ingen position:fixed, 100dvh, pointer-events:none, overgangsmodal, touchstart/touchend-håndtering eller pseudo-knapp i denne visningen. 100svh brukes som minste sidelengde med lovlig scrolling, ikke som absolutt viewport-klipp. Paletten følger fremdeles --slide-* og --pres-*-rollene.

**Grunnlag for arkitekturbyttet:** Dokumenterte WebKit-feil (bl.a. https://bugs.webkit.org/show_bug.cgi?id=312149, https://bugs.webkit.org/show_bug.cgi?id=281063 og https://bugs.webkit.org/show_bug.cgi?id=299003) beskriver feil ved iPhone, dynamisk Safari-toolbar, fastplasserte elementer og helskjerm-overlays. Den gamle implementasjonen kombinerte alle disse risikofaktorene; det er en begrunnet årsakshypotese, ikke en verifisert WebKit-diagnose på brukerens enhet.

Både inngang via lysbildekort, direkte dyplenke, full sidelasting, nettleserens tilbakeknapp, lukkelenke, klikk utenfor, Esc, mobile liggende/stående layouter og eksport kontrolleres nå. Andre URL-parametere som brukes av kopiløsninger, beholdes. Regresjonstester kontrollerer at fullskjerm ikke har fastplasserte underkomponenter og at vanlige ruter aldri feilaktig aktiverer fullskjerm. Tredjeparts kopier kan fortsette å overstyre CSS-rollene; ingen nettleser- eller organisasjonsspesifikke inline-farger er innført.

**Verifikasjonsbegrensning:** Linux Chromium-emulering er ikke fysisk iOS Safari/WebKit. Funksjonen kan først kalles bekreftet på iPhone etter faktisk enhetstest.


## Redaksjonell pilot: behov, data og kontroll (0.18.51)

Det stabile, selvstendige lysbildet `ai-value-in-context` bruker nå datadrevne noder under `visual.nodes`, i én klart avgrenset layoutvariant `editorial-triad`. Det formidler at verdi i praksis forutsetter sammenheng mellom virksomhetsbehov, pålitelig datagrunnlag og trygg kontroll. Overskrift, spørsmål, sentrum, forklaring og budskap ligger kun i `docs/data/slides.json`, ikke i SVG-illustrasjon, CSS eller fortellinger. Presenter-notater og ID beholdes, og `value-system` har gammel layout som kompatibilitetsfallback for eldre innhold.

Scenen tegner sirkler, sammenhengslinjer og tre ikoner med enkel HTML/SVG. CSS bruker bare felles `--pres-*`-roller som følger de offentlige `--slide-strong-*` og `--slide-light-*`-rollene. Den har ingen fast leverandørpalett, rasterbilde eller klippende overflate. Kopiløsninger kan omsette kun CSS-roller og samtidig beholde innhold, layout, 16:9, metadata, kildegrense og nedlasting. Frivillig animasjon er kun tilleggsopplevelse. Biblioteket, eksportert PNG/PDF/PPTX og redusert bevegelse fungerer statisk.

Regresjon: `scripts/check-value-system-browser.mjs` validerer begge temaer, tre tekstnoder, geometrien i riktig størrelse, ingen klippet tekst, syntetisk tredjepartspalett og faktisk eksportert PNG. I tillegg gjelder bibliotek-, temakontrakt-, eksport- og fullskjermtestene.


## Felles designsystem for alle 40 selvstendige lysbilder (0.18.52)

Hele biblioteket er gjennomgått og har nå en eksplisitt, faglig begrunnet `design`-rolle per objekt. `slideWithDesign` legger dataene på en eksisterende sceneflate (`data-editorial`, `data-design-focus`) uten å skape flere kopier eller nytt presentasjonsformat. `docs/assets/slide-editorial-system.css` gir gjennomgående redaksjonelle grep, men ti ulike archetypes for henholdsvis hero, workbench, choice, journey, dialogue, evidence, system, decision, contrast og blueprint. De seks tekniske diagrammene beholder særegen oppbygning, kilde-/brandlogoer og faglige krav. Ingen av rollene krever en bestemt merkepalett.

HTML/offline-eksport bygger det nye stilarket **før** organisasjonens skin. Statisk bilde/PDF/PPTX bruker samme scenemarkup som Presenter. Valgfri oppbyggingsanimasjon er separat fra innhold og tema. Se `SLIDE_DESIGN_SYSTEM.md` for obligatoriske redaksjonelle krav, klassifiseringer og tester.


## Korrigering: ikke alle 40 var strukturelt redesignet (v0.18.53)

Forrige release, 0.18.52, forbedret et felles CSS-uttrykk, men komposisjonene var i hovedsak uendret. Vurderingen «alle 40 redesignet» var derfor misvisende. Denne versjonen bygger konkret om sju scenevarianter: kapasitetsforsterker, kvalitetsulikhet, balansert pilot, to sammenhengsfigurer og to portaloppgaver/prosessbilder. Figurer og tekster er dataeid og bruker semantiske tema-/skinroller. Eldre scener forblir kompatibilitetsfallback, ikke aktiv visning for disse objektene.

Det gjenstår redaksjonelt arbeid på flere lysbilder. Individuell prioritering og de reviderte godkjenningskravene ligger i `SLIDE_REDESIGN_AUDIT_2026-11-03.md` og `SLIDE_DESIGN_SYSTEM.md`. Ingen omtale av fullført redesign uten faktisk komposisjons- og skjermbildekontroll av hvert objekt.


## 0.18.56 – AI Context Platforms som selvstendig 2027-scene

`ai-context-platforms-2027` er et delt, selvstendig objekt i lysbildebiblioteket, ikke automatisk lagt inn i en eksisterende historie. Det har egen scene `context-platforms` i `slide-visuals.js`, scene-CSS i `slide-visual-narratives.css`, og alle brukerrettede tekster, kilder og notater i `slides.json`. Landskapet med vei og flagg er en dekorativ, lokalt generert SVG med temastyrte streker og flater; ingen fargede PNG-er, ekstern hosting eller organisasjonspalett. Visuell intensitet følger `--pres-*` og fungerer i lyst, mørkt og organisasjonsskin. Dette er en logisk fremtidsmodell og innebærer ikke én sentral kontekstplattform. Eksisterende løp og det enklere `ai-context-for-agents` er uendret. Nye nettleserskjermbilder må fortsatt vurderes før redaksjonell godkjenning.


## 0.18.57 – alternativ illustrert art direction

AI Context Platforms-scenen har fått et lagdelt vektorlandskap. Et nytt valg «Illustrert» aktiverer `data-art-direction="illustrated"` på samme scene-root; `tone()` gjenbruker mørk palett. Lys, mørk og fortellingsstyrt er beholdt. Innhold, kilder og notater er fremdeles kanonisk dataeid og portable gjennom eksisterende renderer. Ingen øvrige lysbilder eller kuraterte historier er omskrevet.


## 0.18.58 – komponerbare sceneobjekter

Ny renderer `docs/assets/scene-art.js` har en minimal, gjenbrukbar objektkontrakt: `asset` (vektor eller bilde fra canonical `visual-assets.json`), `glow` (temastyrt lyseffekt) og `shape` (temastyrte former). Hvert objekt har selvstendig `id`, `role`, posisjon og størrelse i prosent av 16:9-flaten samt valgfri rotasjon, skalering, opasitet og `mode`. Objektene rendres i valgt rekkefølge som uavhengige, semantisk dekorative HTML-objekter med `aria-hidden`. De kan byttes, skjules, flyttes eller tones uten å endre fagtekst eller opprette kopier av lysbildet.

`ai-context-platforms-2027` er første migrerte scene. Den gamle, monolittiske SVG-strengen er erstattet med seks katalogførte illustrasjonsressurser: himmel, fjell i bakgrunnen, fjelltopp, vei, skog og flagg. Databoksene og handlingssløyfen er fortsatt separate, native komponenter. `scene-art.css` lastes i Presenter og eksport og eksponerer få visuelle kunstneriske parametre, mens company-skin-kontrakten for tekst og layout består. Nye scener kan gjenbruke rendererens objekttyper, men må selv definere hvorfor og hvordan motivene underbygger historien.


## 0.18.59 – to illustrasjonsnivåer, ett faginnhold

«Enkel illustrasjon» (`illustrated`) består fortsatt av seks separate vektorlag. «Rik illustrasjon» (`illustrated-rich`) benytter et separat KI-generert og registrert WebP-bakteppe, som aktiveres med `mode: rich` i samme `visual.artwork`-liste. Renderer, data og innholdsobjekter er felles. Ingen tittel, begrep, boks, kilde, styringspunkt eller semantisk pil finnes i bakgrunnsbildet. To horisontale piler og en tydelig returforbindelse er native SVG-elementer og inngår i alle visningsstilene. Visningsvalg og bildekomposisjon kan dermed endres uavhengig av selskapets fullstendige CSS-skin-kontrakt for tekst og fagobjekter.


## 0.18.60 – robust eksport og mer helhetlig kontekstscene

Nedlasting av enkeltlysbildet bruker nå faktisk valgt og rendret lysbilde fra bibliotek, fullskjerm eller Presenter i stedet for å generere en ny standardvisning. `slide-export-prep.js` pakker lokale, katalogførte bilder og SVG-ressurser inn som data-URI før PNG/JPG/PDF/PowerPoint-capture. Ukjente ressursbaner eller manglende rik bakgrunn avvises eksplisitt. Dette bevarer både art direction, bildefiler og skin i det eksporterte resultatet.

I `ai-context-platforms-2027` er kilde- og handlingslaget knyttet sammen med en enkelt nedoverrettet, native SVG-pil (ikke en villedende én-til-én-relasjon mellom kildekolonner og prosessledd). Tre nye, native og dataeide verdi-kort vises til høyre: bedre beslutninger, mer målrettet handling og læring underveis. Kortene er konseptuelle muligheter, ikke garanterte effekter. Bakgrunnens fotografi, lys, dybde og skygger er fortsatt dekorative og kan byttes uten å endre faginnholdet.


## 0.18.61 – synlig anbefalt motiv og eksportsamsvar

Visningsmodusen `auto` er nå standard bare når brukeren ikke har lagret et eksplisitt valg. Den følger lysbildets `visual.preferredArtDirection`; for `ai-context-platforms-2027` er dette `rich`. Alle andre lysbilder følger den eksisterende, fortellingsstyrte paletten. Eksplisitte valg av lys, mørk, enkel eller rik overstyrer alltid anbefalingen og beholdes. I rik variant er alle de flate vektor-fjellene fjernet, slik at bare ett fullformat fotografisk bakgrunnsobjekt vises. All tekst, piler, kildefelt og verdikort ligger uendret i HTML/JSON. PNG-regresjonstesten sammenligner faktisk skjermbilde med nedlastet bilde, ikke bare om det finnes varme piksler.


### 0.18.61 – palette og art direction er uavhengige

For å unngå at «Mørk» skjuler den rike illustrasjonen er fargeprofil (`light`, `strong`, `story`) skilt fra illustrasjonsstil (`auto`, `standard`, `illustrated`, `rich`). Tidligere ble disse valgene feilaktig blandet i én dropdown. Gamle lagrede fargevalg migreres til de nye palette- og art-nøklene. Velger man mørk palett og «Anbefalt», vises den rike scenen på 2027-lysbildet. Eksplisitte illustrasjonsvalg overstyrer anbefalingen. Den samme strukturen rendres og eksporteres uansett valgt kombinasjon.

## Portabel filmisk illustrasjon og bildeeksport (v0.18.62)

De fire presentasjonsretningene standard, illustrated, rich og cinematic bruker de samme kanoniske fagfeltene. Filmisk uttrykk gjenbruker det registrerte fotografiet fra rik stil, og legger til selvstendige glow- og beam-objekter i visual.artwork.objects. Ingen tekst, begreper, relasjoner, piler eller kilder rasteriseres som del av illustrasjonen.

Ved portering leser mottakerens renderer fagdata og generiske kunstobjekter med id, type, rolle, art direction, posisjon, størrelse og effekt. Mottakerens egne semantiske fargetokens avgjør tekst, typografi og komponentuttrykk. Faginnhold krever ikke Innsikt-spesifikke CSS-klasser. En mottaker som ikke støtter de avanserte kunsttypene, kan bruke standard uten tap av faglig innhold. Illustrative bildelag kan beholde sin fotografiske egenart.

Enkeltlysbilde-eksport konverterer lokale rasterressurser til PNG-data i en midlertidig klone for å redusere feil i WebKit/SVG foreignObject. Hver bildekomponent må dekodes før rasterisering, og manglende foto i rik/filmisk stil skal gi en eksportfeil i stedet for en tilsynelatende vellykket fil uten bilde. SVG-ikoner forblir skalerbare data-URI-er. PDF/PPTX av ett lysbilde er fortsatt bildebasert.

## Filmisk komposisjon (v0.18.63)

Filmisk stil kan gjengi et nytt deklarativt formobjekt, orbit. Det er plassert i artwork-data og representerer kun en dekorativ, lysende ring. En mottaker kan rendere dette med sitt eget visuelle system eller utelate objektet helt. Det faglige diagrammet er det samme. Filmisk variant bruker også andre glassflater, en elliptisk kontekstflate og et samlet verdipanel, mens alle faglige tekst- og relasjonsobjekter fortsatt er native HTML/SVG.

Nettlesertesten sammenligner faktiske skjermbilder mellom rik og filmisk stil. Dermed er filmisk modus ikke bare et ekstra valg som tilfeldigvis rendrer identisk.


## Felles faglige relasjoner og kildebildelagring (v0.18.66)

Benchmarksliden har et kanonisk relasjonskart under visual.graph.edges i slides.json:
fra/til-node, stabil relasjons-ID og relasjonsrolle. Felles modul slide-graph.js validerer noder og bygger SVG-baner og pilhoder.
Stilene endrer aldri retningen, og ingen faglige piler tegnes i et bakgrunnsbilde.
Tilbakekoblingen går fra oppdatert kontekst tilbake til virksomhetskontekst, mens datakildene peker inn mot konteksten og konteksten mot brukerne.
Eksport av lysbildet serialiserer de samme SVG-pilene som nettsiden.

Se media/README.md for arkiverte masterfiler, gjenskapbar WebP-publisering, budsjett, URL-skille og regler for historiske bilder.
Kun kilder med et konkret formål beholdes som separate arkivobjekter; normal filhistorikk dekkes av Git.
En brukerkopi kan legge på logo via CSS-variabler over scenen uten at bakgrunnsbildet regenereres.
