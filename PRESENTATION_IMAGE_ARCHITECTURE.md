# Presentasjonsarkitektur: strukturert innhold og illustrasjoner

Oppdatert 8. november 2026. Gjelder benchmarken `ai-context-platforms-2027` og den separate verdikjedeprototypen `insight-value-chain`. Dokumentet beskriver teknisk kontrakt og status på `main`, ikke en generell omlegging av alle lysbilder.

## Gjenbrukstest: to ulike komposisjoner fra samme produksjonsgrunnlag

**Status:** Vi har en gjenbrukbar teknisk *produksjonsbane* for nye rike bilder, men ikke en universell automatisk illustratør. To faglig forskjellige bilder er nå definert fra eksisterende `slides.json`:

| Slide-ID | Struktur | Komposisjonsoppskrift |
| --- | --- | --- |
| `ai-context-platforms-2027` | Kilder, kontekst, konsumenter og lukket beslutningssløyfe | `render-context-platform-image.py` |
| `insight-value-chain` | Spørsmål, fire kompetansetrinn, resultat og tverrgående forutsetninger | `render-insight-value-chain-image.py` |

Begge bruker `scripts/illustration_kit.py` til paneler, supersamplede streker, kurver, pilspisser, innramming og tekstbryting. Hvert lysbilde kan ha en *egen layoutoppskrift*, uten å kopiere tegneteknikk, godkjenning, bildemanifest, eksportkode eller visningsvelger. En ny faglig struktur krever fremdeles en bevisst figurkomposisjon og vurdering av lesbarhet. Å tvinge alle fortellinger inn i én «generisk graf» ville svekket figurene.

**Enkel opprettelse av et nytt bilde:**
1. Definer eller gjenbruk ett lysbilde i `docs/data/slides.json`. Ingen duplisert fagtekst.
2. Registrer en oppskrift i `docs/data/illustration-recipes.json` med `sourceSlideId`, `styleId`, `version` og generator.
3. Legg til én manifestoppføring i `docs/data/presentation-illustrations.json` med `approvalStatus: awaiting-asset`, og aktiver ønsket stil i lysbildets `visual.artDirections`.
4. Bygg utkast: `node scripts/build-illustration.mjs SLIDE_ID --preview`. Se fulloppløst PNG og optimalisert WebP under `media/illustrations/previews/`.
5. Kontroller visuell kvalitet. Publiser ved eksplisitt valg gjennom `node scripts/build-illustration.mjs SLIDE_ID --publish` eller den dedikerte GitHub Actions-jobben med publiseringsmarkør `[publish-illustrations]`. Oppskriftsversjon, kildekodehash, innholdshash, bildefilhash og filstørrelse verifiseres automatisk.
6. Én release øker `site.json.version` og cache-versjonene i `docs/index.html`; kjør `scripts/check.mjs` og reelle nedlastingstester i Chromium og WebKit for det nye lysbildet.

**Hva som faktisk kan gjenbrukes:** innholds- og kildekontrakten, tegnemotoren, felles filformater, bildekomprimering, rendring i app, logooverlegg, hashbasert ugyldiggjøring og testløpet. **Hva som fremdeles er spesialtilpasning:** komposisjon, meningsbærende illustrasjonssymboler, tekstplassering og fargevalg i hver bildereseppt. En rasterillustrasjon kan ikke bli like fritt skinnbar som native SVG bare ved CSS. En kopi til et annet designsystem kan gjenbruke diagramvisningen direkte, men rich-image må godkjennes eller regenereres med tilpasset billedprofil. Dette er en bevisst grense, ikke ferdig løst portabilitet.

**Godkjenningsstatus:** `approved` betyr publiserbar etter faglig/teknisk kontroll i repoet, ikke at brukeren har godkjent den kunstneriske utførelsen. Virkelig visuell aksept krever egen vurdering av utkastet. Prototypen legges på en allerede eksisterende, kildebelagt slide med samme ID; den oppretter ingen ny historie eller påstand.

## Kvalitetsgrenser som fortsatt er reelle

Generering av en ny figur er enklere, men ikke helautomatisk: Figuren trenger en egen komposisjon som passer budskapet. Felles motor fjerner repetert teknisk tegnearbeid, ikke redaksjonelt arbeid eller kvalitetssikring. For nye rich-image-bilder testes automatisk de faktiske PNG-, JPG-, PDF- og PowerPoint-eksportene i Chromium og WebKit. Registeret er autoritativt, og testkjøreren `scripts/check-all-illustration-exports.mjs` finner godkjente illustrasjoner uten nye CI-linjer per lysbilde.

Det finnes også en selvstendig svakhet i den eldre HTML-baserte `insight-ecosystem`-visningen: utskriftsrenderingen gir delvis annen tekstrekkefølge og kortstørrelse enn bibliotekets 960 × 540-forhåndsvisning. Dette er observert i sammenlikning av ekte eksport og skjermbilde. Det gjelder den eksisterende HTML/CSS-visningen, ikke den nye godkjente rich-image-illustrasjonen. **Ikke løs dette ved å øke tillatte pikselforskjeller eller kreve lik rastervisning i alle designsystemer.** Det bør undersøkes samlet for de øvrige HTML-lysbilder, uten å gjøre en urelatert totalombygging av eksportøren her. Bildevarianten kjøres separat gjennom streng eksportsammenligning; ordinær HTML er fortsatt testet gjennom hele biblioteket.

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

Bakgrunnen i den rike bildeoppskriften er nå en selvstendig, deterministisk illustrasjon med datanettverk, glassarkitektur og lys, **ikke** landskapsmotivet som brukes i den nøkterne visningen. `scripts/render-context-platform-image.py` tegner hele motivet fra `slides.json`, mens `scripts/presentation-illustrations.mjs` eier import, publiseringskandidat, godkjenning og hash. Oppskriften og kildefilene er ikke del av webdistribusjonen. Den publiserte WebP-filen ligger innenfor grensen på 250 kB. Filstørrelse og SHA kontrolleres av manifestet, ikke av hardkodede tall i denne dokumentasjonen.

## Visuell kvalitetssikring av de tre visningene

Gjennomgang av de tre benchmark-visningene viste en tydelig arbeidsdeling: `standard` er den mest lesbare og portable diagramvisningen, `rich` kan gi en roligere hybrid med native semantiske objekter, og `rich-image` har det sterkeste illustrerte uttrykket. Det gir ikke grunnlag for å endre den kanoniske relasjonsmodellen.

Følgende feil er rettet med geometri- og kodekontroller: Den nøkterne visningen benyttet generiske ikoner som ikke samsvarte med dataplattform, system, eksterne kilder eller beslutningsløkken. Den har nå semantisk riktige ikoner som kan spores med `data-icon-role`. De dekorative bølgelinjene gjennom kontekstflaten er fjernet, og fjellfotografiet er tonet kraftig ned for ikke å konkurrere med faginformasjonen. Den rike bildeoppskriften gir lengre forbindelser fra kontekst til mottakere og holder returforbindelsen unna sidepanelet for mulig verdi. Felles kildeinntak beholdes uten tre overlappende pilspisser.

Bildeoppskriften er versjonert i `illustration-recipes.json`; enhver endring må genereres, undersøkes og registreres med ny filhash før publisering. Vurder fortsatt de reelle skjermbildene i alle tre stiler og eksportene i Chromium og WebKit, ikke bare om JS-/Python-testene er grønne.

## Piktogrammer med entydig betydning

Revisjon av selve figurene viste at flere ikoner var dekorativt konsistente, men faglig svake. En taleboble representerte «Mennesker», et pulssignal representerte «Situasjon», en eske eller et målsymbol representerte «Beslutning», og en avspillingsknapp eller gjentakelsespiler representerte «Kontrollert handling». Det kunne gi feil forståelse av arkitekturen, særlig i eksport der muntlig forklaring mangler.

Vi har derfor innført sju egne, gjenbrukbare SVG-ikoner: `context-people`, `context-timeline`, `context-choice`, `context-guarded-action`, `context-state-update`, `context-evidence` og `context-external`. Disse viser henholdsvis mennesker, hendelser over tid, et valgpunkt, autorisert utførelse, endret tilstand, dokumenterte resultater og eksterne forbindelser. «Oppdatert kontekst» vises bevisst som endret tilstand, ikke som automatisk modelltrening. «Læring underveis» symboliserer sporbar evidens og forbedring, ikke at en KI-modell lærer uten godkjenning.

`slides.json` eier hvert `assetId`. `standard` bruker de registrerte SVG-filene direkte. `rich` velger tilsvarende native SVG-piktogram via `assetId`, og `rich-image` velger et tilsvarende Pillow-piktogram via samme ID. Ingen av disse to rendererene skal velge faglige ikoner ut fra radposisjon, og en ukjent ID skal gi feil i stedet for et tilfeldig symbol. Bildeoppskrift v5 krever ny godkjent filhash. Linjetykkelse og farger følger hvert uttrykk, mens betydningen er felles.

## Presis form- og strekgeometri, 8. november 2026

Utgangspunktet for denne revisjonen er *kildekoden på `main`*, ikke en tidligere eksportert Artifact-pakke. I forrige arbeidsrunde ble en gammel portabel pakke feilaktig behandlet som om den var autoritativ. Endringene ble aldri skrevet til repoet, og en ny ZIP kan ikke erstatte en reell kildekodeendring. Kun de versjonerte kildefilene i repoet, og den publiserte bildevarianten som genereres fra dem, kan være leveransegrunnlag for senere kopiering til andre designsystemer.

Den nøkterne `rich`-varianten fungerer som referanse for strekhierarki og komposisjon, mens det ikke er et krav at alle tre visninger har identiske bildepunkter eller farger. Felles kontrakt er grafens ti relasjoner, innfesting på faktiske objekter, synlige underbokser med målbar klaring, og et visuelt skille mellom primær struktur, sekundære forbindelser og dekor.

I `rich` er superellipsen strammet inn uten at underboksene går utenfor 10 px sikkerhetsmargin; pilspissene, rammer og glød er mindre dominerende. I `standard` er rammer, prosesslinjer og pilspisser gjort lettere uten å endre den semantiske grafen. I `rich-image` er superellipsens høyde redusert fra 280 til 248 piksler, og de tre begrepsboksene plassert tilsvarende smalere. Hovedkonturen og hver meningsbærende pil tegnes med 4× antialiasing og skaleres til 1600 × 900 før WebP-publisering; sekundær glød og dekor er tonet ned. Dette retter pikseltrapper ved normal presentasjonsstørrelse og moderat zoom, men et ferdigrendret bilde forblir raster og kan ikke forventes å være uendelig skalerbart. Den native SVG-varianten er fortsatt riktig grunnlag når reell vektoruavhengighet er viktig.

Bildeoppskriften må regenereres og registreres sammen med manifestets hash. Kjøretester kontrollerer både geometri og teknisk eksport i Chromium og WebKit. Ikke vurder dette som visuell brukergodkjenning.

## Sporbarhet og godkjenning

`docs/assets/presentation-illustrations.js` bygger en normalisert fagmodell med tekster og grafens kanoniske relasjonslinjer, og beregner SHA-256. `docs/data/presentation-illustrations.json` registrerer stil-ID, oppskriftsversjon, `contentHash`, `fileSha256`, masterhash, `approvalStatus`, `approvedAt` og `reviewedBy`. En faglig endring gjør godkjent snapshot utdatert. Endring av logo eller CSS-skin gjør **ikke** det.

Statusene er `awaiting-asset`, `in-review`, `approved` og `rejected`. Bare `approved` med riktig innholdshash og publisert bane gjengis som aktivt bilde. Den nåværende v2-filen er gjennomgått og merket godkjent av assistentens faglige/visuelle kontroll. **Det betyr ikke at brukeren har gitt endelig visuell godkjenning.** Nye faglige endringer krever nytt snapshot og ny kontroll; verktøyet skal ikke automatisk godkjenne sitt eget utkast.

Arbeidsflyt i en autorisert repo-klone:

```sh
python3 scripts/render-context-platform-image.py
node scripts/build-illustration.mjs ai-context-platforms-2027 --preview
node scripts/build-illustration.mjs ai-context-platforms-2027 --publish
# Gjennomfør reell faglig og visuell kontroll før denne kommandoen:
node scripts/presentation-illustrations.mjs approve ai-context-platforms-2027 rich-image GODKJENNER --faglig-ok --visuelt-ok
node scripts/presentation-illustrations.mjs check
```

Oppskriftsversjonen økes når renderingsoppskriften endres vesentlig. Utkast og masterbilder blir liggende utenfor `docs/`. Selve release-committen øker `docs/data/site.json.version` og den tilsvarende ressursversjonen i `docs/index.html`.

## Relasjoner og pilgeometri

Kildene informerer virksomhetskonteksten. Virksomhetskonteksten tilgjengeliggjøres for mennesker, applikasjoner og KI-agenter. En **separat** løkke viser at en beslutning kan lede til kontrollert/autoriserbar handling, og at resultater kan oppdatere konteksten. Den skal ikke fremstilles som en ubegrenset rett for en KI-agent til å endre systemer.

Kontekstboksen er i de to illustrasjonene nå en superellipse, fordi en ordinær ellipse skar av hjørnene på de tre underboksene. Konturene har en målsatt sikkerhetsmargin på minst 10 px, validert både i native SVG og bildeoppskriften. Kildene samles i én visuell innpil og én pilspiss. Rutenes betydning og de tre separate kilde-ID-ene beholdes i `slides.json`. Den rike illustrasjonen må derfor alltid regenereres ved endret geometri, og bilderevisjonen er økt til oppskrift 3.

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
