# Start her – Innsikt

Dette er inngangen for mennesker, ChatGPT, Claude Code og Gemini som skal utvikle Innsikt-portalen videre.

## Rehydreringsrekkefølge

1. Hent siste `main`. Repoet er autoritativ tilstand; tidligere samtaler gir bare kontekst.
2. Les `START_HERE.md`, `AGENTS.md` og `OPEN_DATA_POLICY.md`.
3. Les `README.md` for struktur og mål.
4. Les `docs/data/content.json` for siste versjon, kilder, salgsinnganger og backlog.
5. Åpne `docs/` i lokal webserver og inspiser relevant side før du foreslår større endringer.
6. Kjør `node scripts/check.mjs` etter endringer.
7. Kontroller på desktop og mobil. Dokumenter hva som faktisk ble endret, og noter videre arbeid i `backlog`.

## Produktmålet

Hjelpe selgere å oppdage og kvalifisere data-, analyse- og KI-relaterte kundebehov uten å måtte være tekniske eksperter. Kombiner helhetlig markedskunnskap med praktisk samtalestøtte. Siden må også støtte fagansvarliges iterative forbedringsarbeid.

## Kanoniske dataeiere

Alt kuratert faginnhold ligger foreløpig i `docs/data/content.json`:

- `businessSignals`: forretningsutfordringer, symptomer, spørsmål, mulige Innsiktsleveranser og neste steg.
- `trends`: markedstall, fakta, kildehenvisninger, og egen kommersiell tolkning.
- `plays`: salgsinnganger, signaler, spørsmål, roller, kompetanse og neste steg.
- `scenarios`: **tydelig fiktive** øvelser for førstelinjedialog.
- `aiProducts`: produktspesifikke KI-tilbud med salgsinngang og forbehold.
- `marketEvents`, `marketSignals`: hendelser, markedsperspektiver og relevante spørsmål.
- `logoAssets`: kilde og bruksregler for produktikoner.
- `tech`: plattformforklaringer, salgssignaler og avgrensninger.
- `competences`, `audiences`: kategorier og målgrupper.
- `sources`: kildebibliotek med stabile lenker.
- `backlog`: konkret forbedringsliste med status og prioritet.
- `meta`: versjon og sist verifisert dato.

Visningslaget skal **ikke** være alternativ autoritet for domenedata. Flytt faglig innhold ut av CSS/HTML/JS dersom det begynner å bli hardkodet i visningskode (se teknisk gjeld i dokumentet).

## Første oppgaver

1. Test med noen selgere: finner de relevante innganger, og fungerer spørsmålene?
2. Innhent godkjente offentlige kundecaser (helst Webstep-caser som allerede er publisert).
3. Valider salgsinnganger mot faktisk fagkompetanse og etterspørsel.
4. Verifiser partnerordninger når Webstep-repoet er etablert.
5. Avklar publisering i Webstep Enterprise eller annen godkjent løsning.

## Viktig ved overgang til Webstep

Dette repoet er **åpent innhold i et privat repo**, ikke et lager for intern bedriftsinformasjon. Selv om repositoryet er privat kan en personlig Pages-side bli offentlig. Først etter godkjent intern tilgangsstyring kan eventuelle interne data vurderes, og da under Websteps egne retningslinjer.

## Eksempel på startinstruks for ny KI-assistent

> Arbeid videre i `MKarthum/innsikt-sales-hub`. Hent siste `main`, les `START_HERE.md`, `AGENTS.md` og `OPEN_DATA_POLICY.md`. Siste repo er autoritativt, ikke tidligere chat. Kontroller siden visuelt og kjør tester før endring publiseres. Ikke legg inn ikke-offentlig Webstep-informasjon.

**Obs:** Repoets eksakte navn må oppdateres dersom du velger et annet navn ved opprettelse.