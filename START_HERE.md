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

Skriptet kjører offentlig-innhold, dataintegritet, innholdsstil og releasekontroll separat. GitHub Actions kjører de samme kontrollene ved push/PR. Test også filtrering, søk, redigering, kopiering og tilbakestilling av prompter, startkurset, arkitekturlenker, kopiering av maler, alle tre presentasjonsløp med notater, søk, filtrering, detaljsider, feedback, mobil og desktop.

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
