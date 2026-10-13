# Innsikt – marked og salg

En lett, datadrevet salgsportal for fagområdet Innsikt, utviklet på offentlig kildegrunnlag. **Dette er en arbeidsversjon (v0.3.0), ikke godkjent internt salgsmateriell.**

## Mål

En selger skal kunne oppdage relevante databehov, stille gode spørsmål, kvalifisere en mulighet og forstå når en fagekspert bør kobles inn – uten å bli spesialist selv.

## Kjør lokalt

Ingen installasjon eller byggsteg er nødvendig.

```sh
python3 -m http.server 8000
```

Åpne `http://localhost:8000/docs/`.

## GitHub Pages

Bruk Pages fra `main` og mappen `/docs`. VIKTIG: En nettside på personlig GitHub Pages er normalt **offentlig selv om repositoryet er privat**. Denne utgaven er konstruert uten interne opplysninger. Kontroller innholdet før hver publisering. Privat Pages krever organisasjonseid prosjekt under GitHub Enterprise Cloud.

## Struktur

- `docs/index.html` – nettsidens strukturelle skall.
- `docs/assets/site.css` – design og responsiv layout.
- `docs/assets/site.js` – generiske visninger, søk, interaksjoner.
- `docs/data/content.json` – **kanonisk kilde** for salgsinnganger, trender, leverandører, kilder, scenarioer, backlog og publiseringsmetadata.
- `START_HERE.md` – startpunkt for videre utvikling med KI-agenter.
- `AGENTS.md` – arbeidsregler for agenter.
- `OPEN_DATA_POLICY.md` – datagrense før flytting til Webstep.
- `scripts/check.mjs` – datakontroll.
- `.github/workflows/check.yml` – kontroller ved push/PR.

## Det som virker nå

- Oversikt med offentlig norsk KI-statistikk, trender og kilder.
- Teknologikart med 12 områder, åtte KI-funksjoner og dokumenterte oppkjøp og markedstrender.
- Åtte salgsinnganger med kundesignaler, spørsmål, kompetanse og neste steg.
- Egen inngang for seks forretningsområder, med problem → mulige databehov → leveranse → neste steg.
- Filtrering, globalt søk (også i forretningssignalene), enkel kvalifiseringssjekkliste og samtaleøvelser.
- Enkel presentasjonsmodus, utskrift og kopiering av samtaleguide.
- Backlog og en enkel «Gi innspill»-funksjon.

**Viktig om innspill:** Innspill lagres bare i nettleserens lokale lagring. Bruk eksportfunksjonen under «Videreutvikling» for å bevare innspillene. De synkroniseres **ikke** til repo, andre enheter eller Webstep. Ikke skriv kundespesifikk informasjon i denne åpne arbeidsversjonen.

## Flytte til Webstep

1. Avklar organisasjonens sikkerhetspolicy, kilde-/kodeeierskap og publisering.
2. Gjør overføringsreview for sensitiv informasjon, rettigheter og innhold.
3. Flytt/importer repoets historie til et **organisasjonseid prosjekt-repo**. Overfør ikke automatisk private nettlesernotater.
4. Aktiver Pages (eller annen godkjent hosting) med privat tilgang før innhold med intern klassifisering legges inn.
5. Bekreft faktisk tilgang fra en bruker i salg som bare skal ha lesetilgang.
6. Sett opp kontaktpersoner, godkjente referanser, partnerprogrammer og tilbakemeldingsflyt i godkjente interne systemer.

## Kilde- og innholdspolitikk

Se `OPEN_DATA_POLICY.md` og lenkene i `docs/data/content.json`. Hypoteser er ikke fakta. Pedagogiske kundescenarioer er oppdiktede. Websteps offentlige tjenester brukes som referanse, ikke som garanti for bemanning eller omfang.

## Bidra

Oppdater først kanoniske data, kjør `node scripts/check.mjs`, og test visningen på desktop og mobil. Hold både innhold og arbeidshistorikk sporbar. Dokumenter beslutninger i repoet, ikke bare i en chat.
## Produktlogoer

Logoer for Snowflake, Databricks, dbt, Airbyte, BigQuery, Qlik, Informatica og Airflow er fra Simple Icons. Fabric, Power BI og Copilot kommer fra Microsofts ikonressurser/FabricTools og følger Microsofts vilkår. Se [deres disclaimer](https://github.com/simple-icons/simple-icons/blob/develop/DISCLAIMER.md). Ikonene brukes kun for å identifisere leverandørprodukter, ikke som støtte eller godkjenning. Øvrige teknologier har nøytrale initialer inntil offisielt ikon og bruksrett er verifisert. Se `logoAssets` i datamodellen.
