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
- **Presenter:** tre gjennomarbeidede løp for introduksjon, salgsworkshop og dataplattform/KI. Med presentatørnotater og kildehenvisninger.

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

Bransjeinformasjon og caser eies av \`sales.json.industrySectors\`, \`sales.json.industryUseCases\` og \`sales.json.industryJourney\`; felles presentasjons- og sideord eies av \`pages.json.industryUi\`. \`sources.json\` er kanonisk kilderegister. Se [bransjeanalyse og innholdsmodell](INDUSTRY_BUSINESS_DIALOGUE.md) for utvalg, eksempler, metoden, kildekritikk, begrensninger og videre testing. Nye ruter \`#forretning/sektor-ID\` og \`#forretning/case-ID\` er inkludert i søk og Presenter.
