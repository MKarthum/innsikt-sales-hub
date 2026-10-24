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

## Iterasjon 2: kuratert bibliotek og visuell pilot (24.10.2026)

- De gamle presentasjonsstegene er fortsatt historiespesifikke. Kun tre eksisterende lysbilder med gjenbrukbar kundedialog er foreløpig klassifisert som `shared`. Deling er et redaksjonelt valg, ikke et teknisk krav.
- `slides.json` eier `topic`, `keywords`, `scope`, `sourceIds`, `speakerBase` og eventuelt `visual.scene` med innholdsparametere. Historier i `pages.json` eier rekkefølge og overgangsnotater.
- Bibliotekets tema, historietilhørighet, fritekstsøk og scope kan kombineres. Oversikten bruker faktisk lysbilderendering som miniatyr i stedet for typekort.
- De tre prøvescenene (tusen analytikere, to utfall, samspill) rendres gjennom `slide-visuals.js` og `slide-visuals.css`. Den modulære renderer henter all synlig fagtekst fra datafilene; illustrasjonene tegnes med SVG.
- Fargene styres av presentasjonens semantiske toner (`strong` og `light`), inkludert `warning`. Ny merkevareprofil kan endre tokenparene uten at illustrasjonskoden omskrives. Standardkontrasten valideres automatisk, men andre merkevarepaletter må gjennomgå egne kontrast- og skjermtester.
- Ingen generell kildeslide: Kilder eies per lysbilde, er synlige i bibliotekets detaljvisning og vises på selve lysbildet bare ved `sourceDisplay: "required"`.
- Eksportert HTML får de samme visuelle CSS-reglene som nettstedet; PDF via nettleserens utskrift består. PowerPoint ligger fortsatt utenfor denne iterasjonen.
- Tre nye lysbilder er en **visuell pilot**, ikke et ferdig foredrag. Foredragsnotatene tilhører historien og inkluderer overganger. De kan erstattes eller utvides enkeltvis.
- `scripts/check-visual-pilot.mjs` produserer visuelle skjermbilder fra Chromium, og CI bevarer dem som kortlivet artefakt for faktisk designgjennomgang. Skjermbildene er verifikasjon, ikke kanonisk innhold.

## Bibliotek v1: komposisjon og visuell kvalitet (24.10.2026)

- 30 selvstendige objekt-ID-er, sju historier, fem faglige emner. Historier refererer lysbilde-ID og eier overgangsnotater; grunnforklaring er eid av lysbildet.
- De opprinnelige portal- og salgsslidene beholder ID, kanoniske lenker og forklaringer, men rendres gjennom samme scenesystem som nye bilder. visual.scene og tilhørende data avgjør grafikken; renderer og CSS er temaavhengige men innholdsuavhengige.
- Scenefamilier: dramatisk åpningsbilde, forgrening, verdi-orbit, redaksjonell åpning, nummerert problemliste, veivalg, kundesignal, definisjonslinser, kontrast, læringsløkke, fagområder og portalbro.
- Nye tekster er kvalitative faglige vurderinger/eksempler uten oppdiktede effektmål. Risikosliden knytter bare relevante kilder fra NIST og OECD til seg; ingen universell sluttslide.
- For redigering: endre docs/data/slides.json for innhold; docs/data/pages.json for historie og overganger; docs/assets/slide-visuals.js og .css for layoutfamilier. Unngå å endre globale farger for å fikse ett lysbilde.
- Kvalitetsport: statiske eier- og kildetester og reell Chromium-verifikasjon av samtlige lysbilder, med skjermbilder og manuell inspeksjon.

### Manus og to-nivåsnotater

I biblioteket eier `speakerBase` den selvstendige faglige forklaringen. Hver historieplassering eier bare manusdelen som er spesiell for akkurat denne fortellingen: åpning, rytme og overgang. Presentasjonen setter dem sammen. Kvalitetstesten vurderer totalen (minst 300 tegn), men krever også en selvstendig plasseringstekst; det er ikke et krav om to lange kopier. Hovedfortellingen og tre alternative formater har fått redaksjonelt gjennomgåtte, individuelle overganger.

### Visuell gjennomgang

Etter første fullrendrede bibliotekrunde ble de lengste portal-/salgstitlene strammet inn og portalbroens visuelle symboler styrket. Formålet er å få naturlige linjebrudd og sikre at store interne flater har et kommunikativt tyngdepunkt. CI rendrer hver av de 30 ID-ene og sjekker tekstens grenser i tillegg til ordinære mobil-/presentertester.

## Fortellingsstyrt presentasjonspalett (24.10.2026)

Tidligere sprang mørk/lys-tonen tilfeldig mellom ulike lysbilder i en historie, fordi tonen lå i lysbildeobjektet. Nå er historienes visualStyle autoritativ for visning: defaultTone + beats (farge per fortellerdel). Mørkt brukes vanligvis som sterk åpning og landing; lysere flater ved utforskning og problemavklaring. Ingen tvunget 1:1-veksling. InnsiktSlides.tone er den felles oppløseren for Presenter, eksport og tester.

Presenter tilbyr i tillegg Fortellingsstyrt (standard), Alltid lys og Alltid mørk. Dette er en presentasjonsinnstilling – ingen duplisering eller modifisering av lysbildeinnhold. Bibliotekets forhåndsvisning fortsetter å bruke lysbildets lokale tone som nøytral redigeringsreferanse.

## Internt innhold

INTERNAL_CONTENT_CONTRACT.md beskriver hvordan en separat tilgangsbeskyttet installasjon kan laste egne historier og lysbilder, samt reserverer typede samlinger for fremtidige interne løsninger og kundehistorier. Det finnes ikke interne kundedata i GitHub Pages. docs/data/deployment.json er låst til offentlig modus i publiseringsvalideringen, og krever beskyttet intern endepunktkonfigurasjon for intern distribusjon.
