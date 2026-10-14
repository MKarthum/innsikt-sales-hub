# Innsikt – marked og salg

Responsiv, statisk salgs- og kunnskapsportal for Innsikt, basert på åpent dokumenterbart innhold. **Arbeidsversjon v0.6.0 – ikke godkjent som offisielt internt salgsmateriell.**

[Åpne nettsiden](https://mkarthum.github.io/innsikt-sales-hub/)

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
| `docs/data/pages.json` | Sidetitler, tekster, presentasjon og kvalifiseringscopy |
| `docs/data/sources.json` | Felles kildebibliotek |
| `docs/data/market.json` | Statistikk, markedsutvikling, oppkjøp |
| `docs/data/sales.json` | Salgsinnganger, forretningsbehov, samtaleøvelser og kompetanse |
| `docs/data/technologies.json` | Produktinformasjon, KI-funksjoner, logoattributter |
| `docs/data/backlog.json` | Forbedringsoversikt |
| `docs/data/learning.json` | Grunnkurs, begreper, arkitekturskisser, risiko og maler |
| `docs/assets/learning.js` | Generisk visning for grunnkurs, arkitektur og verktøykasse |
| `docs/assets/site.js` | Generiske visninger og interaksjoner – ingen egen faglig faktaautoritet |
| `docs/assets/site.css` | Design og responsive komponenter |
| `docs/index.html` | Strukturelt skall og navigasjon |
| `scripts/check-*.mjs` | Kontroller for innhold, integritet, stil og release |

**Hovedregel:** Én kanonisk kilde per felt. HTML/JS bestemmer visning og henter faginnhold fra JSON. Ingen nye hardkodede sidetekster, statistikk eller kundepåstander i visningslaget.

## Bruk og begrensninger

- Teknologikart og innebygd KI, salgsinnganger og samtaler, marked og kilder.
- Pedagogiske scenarioer er fiktive; intern leveranseevne og partnerordninger er ikke kvalitetssikret.
- Tilbakemeldinger lagres kun i nettleseren; eksporter dem for å bevare dem.
- Produktlogoer har separat rettighets-/kildeinformasjon i `technologies.json.logoAssets`; merkevarer tilhører eierne.
- Pages fra `main` og `/docs` er offentlig tilgjengelig. Et privat personlig repo betyr ikke privat Pages.
- Ikke legg inn kundenavn, intern pipeline, lisenser, tilbud, personopplysninger eller andre ikke-offentlige opplysninger.

## Publisering

```sh
node --check docs/assets/site.js
node --check docs/assets/learning.js
node scripts/check.mjs
```

CI kjører de samme kontrollene. Bump `docs/data/site.json.version` og CSS/JS-referanser i `docs/index.html` per publisert versjon. Relevante filer oppdateres **atomisk**. Følg `START_HERE.md` og `AGENTS.md`.

## Overføring til Webstep

Kontroller sikkerhet og rettigheter, overfør repoets kode og åpne innhold til godkjent enterprise-repo, og publiser først bak dokumentert tilgangskontroll. Deretter kan interne referanser og kontaktpunkter eventuelt kvalitetssikres og legges inn.
