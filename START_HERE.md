# Start her – Innsikt

Arbeidsinstruks for mennesker, ChatGPT, Claude Code og Gemini. **Hent alltid siste `main` først.**

## Rehydrering

1. Les `START_HERE.md`, `AGENTS.md` og `OPEN_DATA_POLICY.md`.
2. Les `README.md` og `docs/data/site.json` (versjon og publiseringsdato).
3. Les de relevante kanoniske datafilene nedenfor.
4. Inspiser aktuell side og sjekk om tilsvarende innhold allerede finnes før du lager nye data.
5. Kjør alle kontroller og test både mobil og desktop før publisering.

Tidligere samtaler er kun spor til mulige behov. **Repoets gjeldende `main` er autoritativ.**

## Kanoniske dataeiere

- `site.json`: versjon, publiseringsdato og siste faglige gjennomgang.
- `pages.json`: sidetitler, overskrifter, generelt sidebudskap, kvalifiseringsspørsmål og presentasjon.
- `sources.json`: felles kilderegister. ID-er refereres av alle domenefiler.
- `market.json`: SSB-statistikk, trender, oppkjøp og markedssignaler.
- `sales.json`: salgsinnganger, forretningsbehov, scenarioer, målgrupper og kompetanseområder.
- `technologies.json`: teknologier, innebygde KI-funksjoner, merkeikoner og produktbeskrivelser.
- `backlog.json`: synlige forbedringspunkter og status. Ingen personopplysninger.
- `prompts.json`: promptmaler og kanoniske felles promptregler.
- `horizon.json`: fordypningens egne hypoteser og spørsmål; referanser til begreper/diagrammer fra andre eiere.
- `learning.json`: introduksjon, ordbok, generiske arkitekturskisser, risiko og maler. Disse skal ikke hardkodes i JS.

**Bindende kontrakt: `CONTENT_CONTRACT.md`.** Én semantisk opplysning har én dataeier, også når den omskrives, forkortes eller brukes flere steder. Kort-/langvariant skal eies av samme stabile ID. Koble via ID-er; ikke kopier faktapåstander og definisjoner. HTML/CSS/JS er kun struktur, visning og interaksjon. **Ingen nye eller endrede faglige fakta eller sidebudskap skal hardkodes i visningskode.**

## Produktets formål

Gi selgere innsikt i markedsutviklingen, hjelp til å oppdage forretnings- og IT-behov, og konkrete spørsmål fra problem til mulig oppdrag. Nettsiden er i tillegg fagansvarliges arbeidsflate for direkte vurdering og iterativ forbedring.

## Innholds- og designkontrakt

- Offentlig tekst skal være tidløs, presis og forståelig uten forkunnskap om repoet.
- Skille fakta, leverandørpåstander, faglige vurderinger og hypoteser.
- Siter kilden og kontrollér lenker ved tidsfølsomme påstander; kildepubliseringsdato er ikke lik kontrolldato.
- Ikke bruk falske kundecaser eller lov kompetanse, kapasitet eller partnerfordeler.
- Forside og navigasjon skal være skannbare; detaljer finnes ett klikk ned.
- Gjenbruk samme komponent og CSS-regel. Ikke legg på nye versjonsvise override-lag.
- Logoer og annet media krever dokumentert kilde, rettighetsgrunnlag og lokal lagring.
- Nye kilder og kategorier lagres hos riktig dataeier. Ikke bruk JSON-kopier per side.
- Synlig forbedringsliste i `backlog.json`; oppdater den ved vesentlige funn.
- Tilbakemeldinger lagres **bare lokalt i nettleseren**, ikke på GitHub. Eksport er brukerens ansvar.

## Før publisering

Kjør i repoets rot:

```sh
node --check docs/assets/content.js
node --check docs/assets/site.js
node --check docs/assets/learning.js
node --check docs/assets/prompts.js
node --check docs/assets/horizon.js
node scripts/check.mjs
```

Skriptet kjører offentlig-innhold, dataintegritet, innholdsstil og releasekontroll separat. GitHub Actions kjører de samme kontrollene ved push/PR. Test også filtrering, søk, redigering, kopiering og tilbakestilling av prompter, startkurset, arkitekturlenker, kopiering av maler, begge gjeldende presentasjonsløp med notater, søk, filtrering, detaljsider, feedback, mobil og desktop.

Ved hver publisert endring: oppdater `docs/data/site.json.version` og dato. CSS/JS-referansene i `docs/index.html` skal bruke samme versjon. Samle flerfilendringer i én atomisk commit/PR, ikke publiser mellomtrinn som krever hverandre.

## Åpne data og flytting

Denne personlige Pages-utgaven kan ses offentlig. Bruk kun informasjon som tåler det, uavhengig av repository-visibility. Les `OPEN_DATA_POLICY.md`. Etter godkjent flytting til Webstep kan riktig tilgangsstyring og interne data vurderes.


## Innholdsprioritet og framtidig bruk

Faglig sparring skal først og fremst gjøre salgsbudskapet, eksemplene og promptene bedre. Ikke opprett tekniske løsninger fordi det er mulig. Forsidens tre spor er datagrunnlag/plattform, analyse/beslutninger og KI. KI-statistikk skal understøtte fortellingen; tilfeldige eller usammenlignbare tall skal ikke gis hovedplass.

Se `INTERNAL_MIGRATION.md` før vurdering av HubSpot, Google Drive, konsulentprofiler eller annet internt innhold. Det offentlige GitHub-repoet, inkludert commit-historikken, må aldri tilføres private data.


## Referansebasert innholdsmodell (v0.9.1)

`docs/assets/content.js` løser `$content`-referanser ved lasting av offentlige JSON-filer. For eksempel viser `{"$content":"glossary:dataplattform","variant":"normal"}` den kanoniske ordlisteforklaringen. Prompter kan komponeres fra `promptParts` og `prompts.rules`, slik at kopiert resultat forblir selvstendig uten kopiert vedlikehold. `CONTENT_CONTRACT.md` er bindende.

`REFACTOR_AUDIT.md` er historisk før-kartlegging; `REFACTOR_PLAN.md` beskriver arbeidet, `REFACTOR_REVIEW.md` dokumenterer v0.9.0, og `NORMALIZATION_AUDIT.md` dokumenterer gjennomgangen og normaliseringen i v0.9.1. Ikke hev at all eldre fagtekst er semantisk normalisert, eller at mobil/desktop er visuelt verifisert uten faktisk nettlesertest. Publiser først etter godkjent PR og relevante nettleserkontroller.

## Bransjedrevet inngang (v0.9.2)

Les [INDUSTRY_BUSINESS_DIALOGUE.md](INDUSTRY_BUSINESS_DIALOGUE.md) ved endring av bransjer, verdikjedeproblemer, effekter eller kundespørsmål. Bransjer (\`sales.json.industrySectors\`), caser (\`industryUseCases\`) og metode (\`industryJourney\`) eies av \`sales.json\`, mens \`pages.json.industryUi\` kun eier visningsetiketter. Case refererer sektor og eksisterende \`plays[].id\`; referanser skal valideres. Søk, bransjeruter og Presenter skal bruke samme ID. Ingen påstand om Webstep-caser, leveransekapasitet, gevinst eller norsk modenhetsgap uten dokumentert grunnlag.


## Kontekstuell begrepshjelp – varig regel

Faguttrykk og forkortelser som kan være ukjente for målgruppen, bør forklares ved behov gjennom én diskret, felles komponent fremfor gjentatte definisjoner i sidetekster. `docs/data/learning.json.glossary` er eneste autoritative eier av begrepsdefinisjoner og eksempler. Bruk eksisterende stabile ID-er og `$content`-referanser; aktiver inline-visning og alternative skrivemåter med `inline`-metadata på samme begrepsobjekt. Nye begreper legges til hos denne eieren. En separat kortvariant kan bare legges inn under samme ID dersom den faktisk trengs.

Gjenbruk `docs/assets/glossary.js` både i oversikt, detaljvisninger og dynamisk innhold etter hash-navigasjon. Marker selektivt; ikke alle forekomster, vanlige ord eller produktnavn. Bevar alltid det synlige begrepet og den opprinnelige faglige betydningen, kilder, forbehold og skillet mellom fakta, leverandørpåstander og vurderinger. Fjern kun overflødige parentesdefinisjoner hvis substansen beholdes.

Ikke endre lenker, knapper, redigerbare prompter eller kopierbare felt til interaktive begreper. Popupen skal fungere på mobil og desktop, kunne brukes med tastatur, lukkes via Escape og uteklikk, føre fokus hensiktsmessig og holdes innenfor skjermen. Oppdater eksisterende innholds- og nettlesertester ved endringer.


## Presenter- og Artifact-prinsipper

- Presenter har fast 16:9-visningsflate; ikke tilpass lysbildestørrelse etter innholdet. Flytt overløp til notater eller del det på flere lysbilder. Kontrast må verifiseres i både mørke og lyse flater.
- Presentasjonsløp, tekster, struktur og tilpasningsprompter eies av henholdsvis `pages.json` og `prompts.json` med kanoniske referanser; HTML/CSS/JS er kun visnings- og eksportlag.
- Skil demonstrasjon av selve portalen fra illustrative salgsworkshoper. Presenter kundecaser som hypoteser inntil dokumenterte og godkjente referanser foreligger.
- Eksporterte presentasjoner skal ha versjonsmarkering, fungere uten private data og ikke kreve ekstern LLM ved åpning. Test nedlasting og 16:9 på desktop/mobil i eksisterende nettlesertester.
- Uavklarte spørsmål om Webstep-repo, intern konfigurering, Artifacts-bygg og framtidig profilering styres i `backlog.json` og `INTERNAL_MIGRATION.md`. Ikke opprett interne filer eller Artifact-integrasjon i offentlig repo før sikkerhet og arkitektur er avklart.


- Fullskjermmodus i Presenter skal vise ett skalert 16:9-lysbilde uten portal-/redigeringskontroller, men med tilgjengelig frem/tilbake og tydelig vei ut. Bruk native Fullscreen API når tilgjengelig, med skjermtilpasset CSS-reserve der API mangler. Esc skal gå ut av fullskjerm først, ikke lukke hele Presenter-dialogen. Test også kort landskapsviewport, tastatur og retur til normal visning.


## Trendradar, verdiarkitektur og portabilitet (v0.9.7)

- `market.json.emergingSignals` eier tidlige signaler for siden Trendradar; ikke kopier signalene til `marketSignals`, presentasjoner eller `horizon.json`. `pages.json` eier sidetitler, etiketter og komposisjon. Trendradaren skal være kuratert og ha kilde, modenhet, usikkerhet, relevant kobling og dato.
- `learning.json.diagrams[id=ai-on-data]` har `direction: up` og semantisk rekkefølge fra datagrunnlag til organisasjonen. Visningskomponenter kan presentere trinnene nedenfra og opp, men aldri eie eller duplisere fagteksten.
- Datamodellen skal kunne leses av et helt annet grensesnitt i Webstep. Ingen innholdslogikk, databeslutninger, forbehold, kildegrunnlag eller sidetitler skal være avhengig av `site.js`, `learning.js` eller CSS. De er kun adaptere til den nåværende statiske portalen.
- Beslutning om å løfte et signal inn i kjerneinnholdet tas redaksjonelt og krever dokumentert relevans for kundens problem, prosess, arkitektur eller kompetanse. Flytt/oppdater hos kanonisk dataeier og fjern radaroppføringen ved overlapp.

## Redaksjonell standard for Presenter (v0.9.8)

- Hvert presentasjonsløp skal ha én tydelig målgruppe, ett hovedspørsmål og én sammenhengende fortelling: situasjon/spenning → konsekvens → undersøkelse og alternativer → beslutning/neste steg.
- La lysbildetitler formidle en påstand, konflikt eller innsikt, ikke bare navngi et tema. Hvert lysbilde skal flytte argumentasjonen framover; fjern lysbilder som bare demonstrerer at et diagram eller produkt finnes.
- Bruk ett gjennomgående, tydelig illustrativt eksempel i workshopløp framfor å hoppe mellom sektorer. Ikke fabrikkér effekttall eller kundereferanser.
- Arkitekturskisser skal bare brukes når de svarer på et konkret spørsmål i fortellingen. De er ikke selvforklarende og skal ha faglige begrensninger i presentatørnotatene. Bevar 16:9-format og eksisterende teknisk presentasjonsflate.
- Hvert lysbilde skal ha et nyttig presentatørnotat: konkret muntlig forklaring, relevant eksempel, faglig forbehold ved behov og en overgang eller et diskusjonsspørsmål. «Oppsummer kort» og «spør kunden» er ikke tilstrekkelige notater.
- Hold synlige budskap korte nok for framføring, men behold substansen i notatene og i kanoniske fagkilder. Ikke bruk komprimering som visker ut usikkerhet, årsaksforhold eller konkrete beslutninger.
- Fortellingen, lysbildenes innhold og notater eies av `docs/data/pages.json`. Ikke flytt fagtekst inn i JS/CSS eller lag parallelle kopier av allerede kanonisk innhold.

## Historien før lysbildene – Presenter (v0.9.9)

- Før nye lysbilder skrives: fastsett faktisk målgruppe, bruksform, hva presentasjonen **ikke** er, det sentrale spørsmålet, en konflikt/usikkerhet, et vendepunkt og en avslutning. Dette lagres på presentasjonen i `pages.json.presentationDecks[...].narrative`, ikke bare i en prompt eller samtale.
- Skriv og kvalitetssikre dramaturgien som sekvensielle `narrative.beats` før du lager lysbilder. Hvert lysbilde skal peke på ett `beat`, ha en `delivery` (fortelling, øvelse, oppsummering eller verktøy) og en synlig, dataeid `cue` som tydelig skiller fiktivt case fra deltakeroppgaver.
- Et gjennomgående eksempel må introduseres med rolle, kontekst, observasjon og usikkerhet. Ikke presenter løsning, piloter eller hypoteser som faktiske funn i åpningsscenen. Opplysning som ikke er bekreftet i et fiktivt scenario, skal beskrives som antakelse.
- En intern fasilitert workshop er **ikke** en ferdig kundepresentasjon. På første lysbilde skal det fremgå hvem som er deltakere, hva de skal gjøre, om caset er fiktivt og hva det kan gjenbrukes til. Marker de faktiske deltakerøvelsene og krav til utbytte på egne lysbilder. Referanser til «kundecase» må aldri kunne mistolkes som reelle leveranser.
- Presentatørnotater må gi muntlig innledning, kontekst, veiledning for øvelser, tidsstyring ved behov, faglige forbehold og en meningsfull overgang til neste scene. Ikke la overgang bestå kun av et generisk spørsmål.
- `caseView: situation` på en `sector-case`-slide viser bare det kanoniske symptomgrunnlaget fra `sales.json`; spørsmål og foreslått pilot kommer senere hvis historien krever det. Visningskoden skal aldri eie innholdet.
- Behold fast 16:9 og den eksisterende visningsarkitekturen. Test faktisk lysbildevisning, også eksport, mobil, desktop og at verken sceneskiller eller caseinnhold klippes.

## Presenter – gjeldende redaksjonell beslutning (v0.10.0)

Presenter skal ha **to separate og supplerende fortellinger**, ikke en katalog over portalfunksjoner eller et repeterende fagkurs: `portal` forklarer løsningen, og `sales` demonstrerer kort ett reelt innholdselement i et tydelig fiktivt eksempel. Eldre regler og historiske beskrivelser av fire løp og fasilitert workshop gjelder ikke den aktive presentasjonen. Ikke gjeninnfør egne teknologipresentasjoner eller lange workshoper bare fordi data finnes tilgjengelig.

Skriv først den selvstendige historien i `presentationDecks[id].narrative.story`, med målgruppe, starttilstand, hvorfor den skal bry seg, utvikling, vendepunkt og avslutning. Først etter gjennomlesning alene (uten slides) deles den i scener og lysbilder. Hvert bilde må følge av forrige. En innholdsside, statistikk eller arkitekturskisse er ikke et argument for et lysbilde i seg selv. Vis tekniske prinsipper på Arkitektur-siden når de ikke er nødvendige for fortellingen.

Notatene skal være **et faktisk sammenhengende talemanus**, med naturlig overgang og konkrete demonstrasjonsvalg – ikke bare en detaljert liste med presentatørinstruksjoner. Presentasjonens JSON gir tekst, scenerekkefølge, datakoblinger og manus. Visningskode må aldri overta redaksjonell autoritet. Gjenbruk kanoniske data der faglig innhold allerede er definert, og la kontrolltester verifisere aktuell historiekobling fremfor å kreve et bestemt tilfeldig begrep på en tilfeldig slide.
