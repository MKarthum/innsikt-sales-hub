# Innsikt – marked og salg

Responsiv, statisk salgs- og kunnskapsportal for Innsikt, basert på åpent dokumenterbart innhold. **Offentlig beta – ikke godkjent som offisielt internt salgsmateriell.**

[Åpne nettsiden](https://mkarthum.github.io/innsikt-sales-hub/)

## Et enklere hovedbudskap

**Datagrunnlag og plattform → analyse og beslutninger → KI og nye arbeidsmåter.** Dette er tre mulige kundebehov, ikke tre like statistikkort. Den sterke KI-veksten har egen, kildebelagt plass. Et generelt EU-tall for dataanalyse er bevisst fjernet – det ga lite salgsinnsikt.

## Prompter for salg

Et nytt offentlig promptbibliotek med 14 redigerbare, kopierbare instrukser i fem kategorier: forstå kunden, forberede møte, finne kompetanse, lage salgsmateriell og følge opp. Alle inneholder kontekst, ønsket utdata, usikkerhet/kildekrav og menneskelig kontroll. Enkelte maler er merket for anonymisert bruk før intern flytting. **Ingen CRM- eller Drive-tilkobling finnes i denne versjonen.**

- Prompter eies av `docs/data/prompts.json`. Felles kildeinstruksjoner eies av `prompts.rules` og settes sammen med `promptParts`. UI i `docs/assets/prompts.js`.
- Tekst i redigeringsfeltet forblir i brukerens nettleser mens siden er åpen; den lagres ikke og sendes ikke av portalen.
- Salg kopierer selv til en KI-tjeneste godkjent for de faktiske opplysningene.
- Se `INTERNAL_MIGRATION.md` for videre utvikling mot Webstep-konto med riktige rettigheter.

## Fordypning og innholdskontrakt

- Ny valgfri side **I grenselandet mellom data og KI** (`#horisont`), med tydelig skille mellom fakta, leverandørpåstander og hypoteser.
- Definisjoner av kunnskapsgraf, ontologi, Company Brain, dataprodukt og datasuverenitet eies av kanonisk ordliste i `learning.json`. Fordypningen i `horizon.json` refererer til dem med ID.
- **Bindende innholdskontrakt:** `CONTENT_CONTRACT.md`. Én dataeier per semantisk innholdselement, selv om det er kort/langt eller vises null, én eller mange ganger.
- **Refaktorering v0.9.0–v0.9.1:** `docs/assets/content.js` løser referanser mellom autoritative JSON-eiere; Presenter, søk, fordypning og promptbibliotek benytter felles innhold der det er normalisert. Se `CONTENT_CONTRACT.md`, `REFACTOR_REVIEW.md` (historisk v0.9.0) og `NORMALIZATION_AUDIT.md` (gjeldende semantisk gjennomgang).

## Formål

Hjelpe førstelinjeselgere med å forstå markedet, gjenkjenne behov hos forretning og IT, stille spørsmål og involvere riktig fagkompetanse. Fagansvarlig skal kunne se faktiske visninger og forbedre løsning og innhold iterativt.

## Læring og støtte for ulike nivåer

- **Start her:** et kort grunnkurs med eksempler og ordforklaringer.
- **Data og KI i praksis:** fire generiske arkitekturskisser om rapportering, KI på strukturerte data, KI-assistert utvikling og dokumentbasert KI.
- **Verktøykasse:** fire kopierbare maler for kundedialog, mulighetskvalifisering, KI-vurdering og overlevering. Ingen person- eller kundedata lagres av malene.
- **Presenter:** to redaksjonelle løp: en gjennomgang av selve Innsikt-løsningen og et kort, illustrativt eksempel fra «Forretningsbehov». Med gjennomarbeidet fortelling og presentatørnotater.

## Kjør lokalt

```sh
python3 -m http.server 8000
```

Åpne `http://localhost:8000/docs/`. Ingen bygg- eller backend-avhengigheter.

## Filansvar

| Fil | Autoritativt ansvar |
|---|---|
| `docs/data/site.json` | Versjon og publiseringsmetadata |
| `docs/data/pages.json` | Sideunike titler, komposisjon, felles offentlige meldinger, presentasjonsnotater og kvalifisering; øvrig felles fagtekst refereres |
| `docs/data/sources.json` | Felles kildebibliotek |
| `docs/data/market.json` | Statistikk, markedsutvikling, oppkjøp |
| `docs/data/sales.json` | Salgsinnganger, felles verdibudskap, forretningsbehov, samtaleøvelser og kompetanse |
| `docs/data/technologies.json` | Produktinformasjon, KI-funksjoner, logoattributter |
| `docs/data/backlog.json` | Forbedringsoversikt |
| `docs/data/learning.json` | Grunnkurs, begreper, arkitekturskisser, risiko og maler |
| `docs/assets/content.js` | Referanseløser for stabile innholds-ID-er og komponerte prompter |
| `docs/assets/learning.js` | Generisk visning for grunnkurs, arkitektur og verktøykasse |
| `docs/assets/site.js` | Generiske visninger og interaksjoner – ingen egen faglig faktaautoritet |
| `docs/assets/site.css` | Design og responsive komponenter |
| `docs/index.html` | Strukturelt skall og navigasjon |
| `scripts/check-*.mjs` | Kontroller for innhold, integritet, stil, referanser, endringspropagering og release |

**Hovedregel:** Én autoritativ kilde per semantisk innholdselement. Referanser (`$content`) kan velge `short`, `normal` og `long` hos samme ID. HTML/JS bestemmer visning og henter faginnhold fra JSON. Ikke innfør nye hardkodede fakta eller budskap. V0.9.1 samler også eldre delte tekster om hovedverdier, kundens behov, KI-forbehold og offentlighet. Se `NORMALIZATION_AUDIT.md` for begrunnet skille mellom felles innhold og legitime konteksttekster.

## Bruk og begrensninger

- Teknologikart og innebygd KI, salgsinnganger og samtaler, marked og kilder.
- Pedagogiske scenarioer er fiktive; intern leveranseevne og partnerordninger er ikke kvalitetssikret.
- Tilbakemeldinger lagres kun i nettleseren; eksporter dem for å bevare dem.
- Produktlogoer har separat rettighets-/kildeinformasjon i `technologies.json.logoAssets`; merkevarer tilhører eierne.
- Pages fra `main` og `/docs` er offentlig tilgjengelig. Et privat personlig repo betyr ikke privat Pages.
- Ikke legg inn kundenavn, intern pipeline, lisenser, tilbud, personopplysninger eller andre ikke-offentlige opplysninger.

## Publisering

```sh
node --check docs/assets/content.js
node --check docs/assets/site.js
node --check docs/assets/learning.js
node --check docs/assets/prompts.js
node --check docs/assets/horizon.js
node scripts/check.mjs
```

CI kjører de samme kontrollene. Bump `docs/data/site.json.version` og CSS/JS-referanser i `docs/index.html` per publisert versjon. Relevante filer oppdateres **atomisk**. Følg `START_HERE.md` og `AGENTS.md`.

## Automatiserte nettlesertester

Testavhengigheten Playwright er **kun for CI og utviklere** – den lastes ikke av nettsidens brukere. `npm ci`, deretter `npx playwright install --with-deps chromium` i et miljø med nødvendige systembiblioteker. Start `python3 -m http.server 8769` fra repoets rot og kjør `npm run check:browser`. GitHub Actions kjører dette automatisk ved push og PR, for 390 px mobil og 1440 px desktop.

## Overføring til Webstep

Kontroller sikkerhet og rettigheter, overfør repoets kode og åpne innhold til godkjent enterprise-repo, og publiser først bak dokumentert tilgangskontroll. Deretter kan interne referanser og kontaktpunkter eventuelt kvalitetssikres og legges inn.

## Bransjedrevne kundedialoger (v0.9.2)

«Forretningsbehov» har nå to innganger: 9 bransjer med 36 konkrete, illustrative problemstillinger og de tidligere generiske behovene i økonomi, salg, drift mv. Begynn med et operativt problem, mål og en forretningseier; gå videre til databehov, avgrenset test og relevant fagkompetanse. Casene er **salgs- og utforskningshypoteser**, ikke dokumenterte Webstep-leveranser.

Bransjeinformasjon og caser eies av `sales.json.industrySectors`, `sales.json.industryUseCases` og `sales.json.industryJourney`; felles presentasjons- og sideord eies av `pages.json.industryUi`. `sources.json` er kanonisk kilderegister. Se [bransjeanalyse og innholdsmodell](INDUSTRY_BUSINESS_DIALOGUE.md) for utvalg, eksempler, metoden, kildekritikk, begrensninger og videre testing. Nye ruter `#forretning/sektor-ID` og `#forretning/case-ID` er inkludert i søk og Presenter.

## Kontekstuell begrepshjelp (v0.9.3)

`learning.json.glossary` eier definisjoner og eksempler. `inline`-metadata aktiverer ord og alternative skrivemåter, mens `glossary.js` har ansvar for selektiv tekstmarkering, oppslag, popup og tilgjengelighet. Ingen nye backendtjenester eller avhengigheter. Sjekkes i `scripts/check.mjs` og `scripts/check-browser.mjs`.


## Presenter (v0.9.4)

Historisk v0.9.4 hadde fire løp, inkludert salgsworkshop og Data/KI. Disse er siden konsolidert i v0.10.0 til to tydelige formål: produktdemonstrasjon og kort illustrativt innholdseksempel. Presenter har fast 16:9-visning og notater utenfor lysbildet. Tilpasningsprompten finnes fortsatt i promptbiblioteket, men vises ikke som en løsrevet avslutning i presentasjonene.

Hvert løp kan lastes ned som selvstendig HTML-presentasjon uten runtimeavhengigheter, eller åpnes for utskrift/«Lagre som PDF» i nettleseren. Dette er ikke en PowerPoint-fil og er ikke ferdig formgitt kundemateriell. Redigerbar PPTX er registrert i backlog B-25. Innholds-, kilde- og releaseversjoner følger JSON-kontrakten. Se også `INTERNAL_MIGRATION.md` for senere Webstep/Artifacts-vurdering.

## Presenter: tilpasning til visningsflaten (v0.9.5)

Presenter bruker en fast logisk 960 × 540-flate (16:9), men hele flaten skaleres etter faktisk ledig plass inni presentasjonsdialogen. Størrelsen på modal, valg, notater, navigasjon og eksport er regnet inn; presentasjonen skal ikke kreve vertikal eller horisontal scrolling. På mobil i stående format blir teksten nødvendigvis mindre; liggende skjerm gir bedre lesbarhet. Playwright verifiserer viewportplassering også ved kort skjermhøyde.


## Fullskjerm i Presenter (v0.9.6)

Knappen **Fullskjerm** i Presenter viser det valgte lysbildet uten portalnavigasjon, presentasjonstitler, kildekontekst og eksportkontroller. Bruk piltaster eller diskrete navigasjonsknapper for å bytte lysbilde. Trykk **Esc** eller **Avslutt fullskjerm** for å gå tilbake til vanlig Presenter-dialog uten å miste valgt presentasjon eller aktivt lysbilde.

Der nettleseren støtter Fullscreen API, brukes ekte nettleserfullskjerm. Hvis det ikke er tillatt (typisk på enkelte iOS-nettlesere), brukes et CSS-basert fullskjermoppsett innenfor tilgjengelig nettsideviewport; operativsystemets nettleserkrom kan da bli værende synlig. Fullskjerm bevarer det logiske 16:9-formatet og skalerer proporsjonalt. Verifiseres på mobil/desktop via Playwright.


## Trendradar og datastyrt verdiarkitektur (v0.9.7)

- **Trendradar** (`#trendradar`) er en egen side for tidlige, usikre signaler. Den er ikke en produktkatalog eller automatisk salgsprioritering. De fem signalene forvaltes kun i `docs/data/market.json.emergingSignals`, med egne kilder, usikkerhet, vurderingsdato og observasjonspunkter. Sideoverskrift og etiketter ligger i `pages.json`.
- **Arkitektur nedenfra og opp**: `learning.json.diagrams[id=ai-on-data]` beskriver data → kontekst → analyse/KI → organisasjon, med `direction: up`. CSS/JS kan rendere modellen ulikt, men får ikke eie fagtekst eller trinnrekkefølge.
- **Gjenbruk uten layout**: `market.json`, `learning.json`, `horizon.json`, `sales.json` og `pages.json` er innholds- og komposisjonskilder. En fremtidig Webstep-artefakt skal kunne lese disse filene uten å kopiere HTML, CSS eller dagens visningskomponenter. Se `CONTENT_CONTRACT.md`.
- Et nytt signal skal bare innarbeides i kjerneinnholdet dersom det gir en dokumenterbar endring i kundebehov, prosess, arkitekturvalg eller kompetansebehov. Ellers oppdateres eller fjernes det ved redaksjonell gjennomgang.

## To tydelige Presenter-fortellinger (v0.10.0)

Den aktive Presenter-flaten har **to** løp, begge skrevet som selvstendige fortellinger før de ble delt i lysbilder:

1. **Presenter Innsikt (7 min, 8 lysbilder):** Hvorfor løsningen finnes, hvilke spørsmål den hjelper med, hvordan Marked, Trendradar, Forretningsbehov, Salgsinnganger og fagstoff inngår i en sammenhengende forberedelse, og hvor grensene går. Bruk denne når selve portalen skal vises frem.
2. **Eksempel fra Innsikt (4 min, 6 lysbilder):** Et fiktivt økonomibehov fra den kanoniske samlingen `sales.json.businessSignals[id=okonomi]`. Historien går fra symptom via mulige forklaringer til et relevant neste steg. Eksempelet er ikke en kundereferanse, teknisk løsningsskisse eller treningsworkshop.

Autoritativt manus, formål, scener, lysbildetekster og notater eies av `docs/data/pages.json.presentationDecks`. Faglige innholdspåstander gjenbrukes fra rett dataeier. Tidligere introduksjons-, salgsworkshop- og teknologiløp er fjernet fra aktivt innhold for å unngå overlappende og fragmenterte fortellinger. Prinsipparkitekturer finnes fortsatt under `Arkitektur`. Testene må følge faktisk relevant innhold – de skal ikke gjøre historiene avhengige av tilfeldige diagramskisser.
