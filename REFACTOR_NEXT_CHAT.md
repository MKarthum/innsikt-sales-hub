# Oppdrag for ny chat – Innsikt: helhetlig refaktorering av innhold og visning

Du skal arbeide selvstendig i GitHub-repoet **MKarthum/innsikt-sales-hub**. Oppdraget er å gjøre innholdsarkitekturen like robust og konsistent som brukerens Japan-prosjekt, **uten å miste dagens nettside, funksjonalitet eller faglig innhold**. Ikke bare foreslå en plan: undersøk, planlegg kort, gjennomfør og test refaktoreringen.

## 1. Rehydrer, forstå og respekter autoritet

1. Hent **siste `main`** – ikke baser arbeidet på hva du tror tidligere samtaler bestemte.
2. Les `START_HERE.md`, `AGENTS.md`, `OPEN_DATA_POLICY.md`, `CONTENT_CONTRACT.md`, `REFACTOR_AUDIT.md`, `README.md` og `INTERNAL_MIGRATION.md`.
3. Les eksisterende `docs/data/*.json`, `docs/assets/*.js`, HTML/CSS, `scripts/check-*.mjs` og workflowene.
4. Studer gjerne prinsippene i `MKarthum/japan-2027` (`START_HERE.md`, `AGENTS.md`, data-/releasekontrollene), men tilpass dem til salgsportalens behov. Japan er en **referanse**, ikke en mal som kopieres blindt.
5. Bekreft faktisk GitHub Pages-adresse, siste versjon og teststatus før du endrer noe. Ingen interne Webstep-data skal inn i dette åpne personlige repoet.

## 2. Det absolutte arkitekturkravet

**Ett semantisk innholdselement har nøyaktig én kanonisk eier.** Dette gjelder fakta, definisjoner, kildeopplysninger, produktstatus, statistikk, markedsvurderinger, salgsbudskap og promptinstruksjoner – også dersom ordlyden varierer.

- Samme innhold skal kunne presenteres i kort, mellomlang eller utdypet form **uten at variantene vedlikeholdes uavhengig**. Variantene ligger under samme stabile ID.
- Noe innhold kan være lagret, men ikke vist. Noe kan vises bare ett sted, annet på mange steder. **Synlighet er ikke konfidensialitet** – alt som finnes i offentlig repo/JSON er offentlig.
- Sidene bestemmer rekkefølge, kontekst, komponent og ønsket variant. Faglige påstander, begreper og referanser eies av domenefiler.
- En side kan ha egne unike spørsmål og eksempler, men skal ikke kopiere en definisjon, statistikk eller påstand fra andre dataeiere.
- All statisk HTML/JS/CSS er visning/interaksjon. Ingen selvstendige faglige sannheter i markup, script, slides eller prompt-eksempler.
- Skille tydelig mellom **dokumentert faktum**, **leverandørbeskrivelse/roadmap/preview**, **egen faglig hypotese** og **åpent spørsmål**, med kilde, datostatus og usikkerhet.
- Ikke gi «Company Brain» status som standardisert arkitektur. Ikke hev at kunnskapsgrafer og dataplattformer nødvendigvis smelter sammen som lakehouse gjorde – det er en hypotese med alternativer.

## 3. Kartlegg før migrering av modell

Lag en konkret oversikt over:
- nåværende dataeiere, ID-er og felter;
- faktiske/semantiske duplikater og hardkodet fagtekst (JS, HTML, sider, slides, prompter);
- hvilke tekster og fakta som vises på hvilke sider, inklusive søk og Presenter;
- hva som må være et felles innholdselement vs. legitimt sideunikt innhold;
- hvilken risiko hver endring har for URL-er, mobilvisning, brukerflyt, kopierbare prompter og publisering.

**Prioriter konkrete bevis fremfor et teoretisk CMS-design.** Start gjerne med en maskinlesbar rapport over eksisterende elementer og referanser.

## 4. Gjennomfør en minimal og robust normalisering

Foreslå og implementer et lite JSON-basert referansesystem med stabile ID-er, dataeiere og typede referanser – ikke database, tungt CMS, nytt front-end-rammeverk eller unødvendige lag.

Minstekrav:
- Kanoniske definisjoner, markedsfakta, produktinformasjon, statuser og gjenbrukbare salgsbudskap.
- `short`, `normal`, `long` eller tilsvarende når ulike lengder faktisk er nødvendige, under **samme** objekt/ID.
- Kilde-/review-metadata på riktig nivå (`sourceIds`, `published`, `reviewed/checked`, `maturity`, `evidenceType` ved behov).
- Datadrevne sidekomposisjoner som peker til ID + valgt variant.
- Felles referanser også i Presenter, søk, arkitektur, fordypningssiden «I grenselandet», teknologikart og salgs-prompter. For kopierte prompter må gjenbrukbare sikkerhets- og kvalitetsinstruksjoner kunne **komponeres** uten duplisert vedlikehold.
- Eksplisitt støtte for lagrede, ikke-viste elementer, med tydelig offentlighetspolicy.
- Der samme idé er formulert forskjellig med **reelt forskjellig formål**, bruk en bevisst tekstvariant eller dokumenter hvorfor elementene er separate.

Behold en lett statisk nettside, fortsatt mulig å flytte internt til Webstep. Ingen antatt integrasjon til HubSpot/Drive/CRM. Ingen hemmeligheter eller kundedata.

## 5. Bevar og kvalitetssikre produktet

Behold dagens visuelle identitet og arbeidsflyter, med:
- tre hovedspor: **datagrunnlag og plattform → analyse/beslutninger → KI**;
- frivillig «Start her», forretningsbehov, salgsinnganger og samtaleøvelser;
- teknologikart, marked/oppslag, KI-funksjoner, fire arkitekturskisser;
- «I grenselandet mellom data og KI» med dokumentert/leverandør/hypotese-skillet;
- fire kopierbare maler, 14 redigerbare salgs-prompter, tre Presenter-løp;
- navigasjon, søk, mobil, kopiering, reset og kildelenker.
Ikke legg til ny funksjonalitet bare fordi du kan. Bruker ønsker nå særlig **bedre innhold, ikke teknisk utbygging for sin egen skyld**.

## 6. Test arkitekturkravet – ikke bare at JavaScript virker

Utvid og reparer eksisterende automatiske tester:
- Alle ID-er og referanser må finnes, alle dataeiere må være entydige, ingen sirkulære referanser eller foreldreløse synlige komponenter.
- Alle sider, detaljer, Presenter-slides, søkeresultater, promptmaler og links skal rendres uten rå `$\{...\}`-uttrykk og uten feil.
- Test at **én oppdatering i ett kanonisk element** slår gjennom i minst tre forskjellige visninger/varianter, uten andre manuelle tekstendringer.
- Detecter eksakte duplikater og lag en **rapport om mulige semantiske duplikater** som kan vurderes redaksjonelt. Ikke påstå at et regex alene garanterer semantisk entydighet.
- Skille dato for lenkekontroll fra kildepublisering og innholdsgjennomgang. Kontroller lenker så langt praktisk mulig.
- Kontroller offentlig innhold / hemmeligheter, tilgjengelighet, enkel desktop- og mobilbruk, og releaseversjon.
- Ikke si at full browser-/visuell testing er gjort hvis du kun har kjørt syntaks/DOM-test.

## 7. Arbeidsform og leveranser

- Lag en kort, testbar refaktoreringsplan og registrer den i repoet. Arbeid i egen branch eller tilsvarende sikker arbeidsform. **Lagre fungerende delresultater fortløpende i GitHub**, ikke bare i en lang chat-kjøring.
- Ikke bryt offentlig produksjon med ufullstendig migrering. Håndter sammenfallende endringer på `main` eksplisitt.
- Kjør alle eksisterende og nye tester før du publiserer atomisk til `main` eller oppretter PR. Sjekk Pages-status og versjon hvis du faktisk publiserer.
- Oppdater `START_HERE.md`, `AGENTS.md`, `CONTENT_CONTRACT.md`, `README.md` og relevante data-/kvalitetsdokumenter i samme leveranse.
- Avslutt med et **kort, konkret svar**: hva var duplisert, hva er nå autoritativt hvor, hvilke tester beviser gjenbruk, hva gjenstår, og lenke til commit/PR og nettside.
- Hvis adgang eller utstyr blokkerer videre arbeid: lag det som er mulig, dokumenter presist hvor og hvorfor du stoppet, og spør kun om nødvendige tilganger.

Dette er en **refaktorering av eksisterende løsning**, ikke en ny portal, ikke en innholdsrevolusjon og ikke et arbeid med interne Webstep-kilder.
