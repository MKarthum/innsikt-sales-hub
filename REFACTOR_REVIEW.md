# Historisk implementasjon og revisjon – Innsikt v0.9.0 (14.10.2026)

**Historisk v0.9.0-vurdering.** Refaktoreringen ble senere slått sammen og publisert på `main`. Oppfølgingen i v0.9.1 er dokumentert i [`NORMALIZATION_AUDIT.md`](NORMALIZATION_AUDIT.md). Utestående punkter nedenfor beskriver situasjonen ved v0.9.0, ikke nødvendigvis dagens status.

## Grunnlag og metode

Basis var autoritativ `main` ved `9844c6f` (v0.8.0). Arbeidet er isolert på `refactor/canonical-content-20261014`. `REFACTOR_AUDIT.md` beskriver før-situasjonen, `REFACTOR_PLAN.md` beskriver planen, og `CONTENT_CONTRACT.md` beskriver gjeldende kontrakt. Arkitekturprinsippene i `MKarthum/japan-2027` er vurdert: domeneeierskap, ID-referanser, atomisk release, offentlige data og automatiske kontroller. Innsikt beholder sine eksisterende domener, enkelt HTML-skall og vanlige JSON-filer.

## Observerte overlapp og gjennomførte endringer

| Før: vedlikeholdskobling | Etter: autoritativ eier og visning |
|---|---|
| Samme kildeinstruks gjentatt i fire prompter | `prompts.json.rules[verified-public]`; `promptParts` komponeres ved lasting, uten å endre den kopierte teksten |
| Begreper brukt i Start her, fordypning og Presenter | Stabile `learning.json.glossary[].id`; valgt `$content`-variant, og eksisterende `horizon.conceptIds` |
| Forklaring av KI for utviklere og forretningsbrukere gjentatt i grunnkurs og teknologidelen | `technologies.json.aiOverview` eier `short`, `normal` og `long`; grunnkurset viser lang, teknologi kort, KI-siden normal |
| KI-statistikkens metodiske forbehold i marked/presentasjoner | `market.json.metricGuidance` eier variantene; Presenter refererer til kort og normal, markedet til lang |
| Data-/KI-risiko i forklaringer og Presenter | `learning.json.risks[].variants` og referanser på tekniske lysbilder |
| Generiske salgsadvarsler og introduksjoner i JS | `sales.json.sharedGuidance`, sideunike `pages.json.copy` og faglig `marketUi`/`techUi`, samt `learning.json.diagrams` |
| Manglende ID-er på teknologier, enkelte ordbegreper, risiko, kompetanse m.m. | Stabile ID-er i eksisterende domeneposter; innholdstype og faglig kontrolldato på utvalgte faktabærende objekter |

Kildeoppføringer eies fortsatt av `sources.json`. Eksisterende `source`, `sources` og `sourceIds` beholdes der de allerede er kanoniske, uten nye kopier av kilde-ID-listene. `published`, `checked`, `reviewed`, `status` og `evidence` har ulike formål; dato på kildeoppføringen er ikke automatisk kontroll av påstanden.

## Redaksjonell gjennomgang av overlapp

- Samme skille mellom KI-støtte til utviklere og KI-spørsmål fra forretningsbrukere fantes i to filer. Valg: én eier i `technologies.json.aiOverview`; behold den pedagogiske originalteksten som `long` for grunnkurset, og de kortere formuleringene der plass og formål krever det. Dette er ulik lengde, ikke uavhengig fagautoritet.
- Markedsteksten «Fivetran og dbt Labs blir ett selskap» var utdatert framtidsform. Valg: «Fivetran og dbt Labs er slått sammen» hos `market.marketEvents[fivetran-dbt]`, etter bekreftelse av fullføring 1. juni 2026 hos Fivetran og dbt Labs. Den samme postens tittel brukes på teknologisiden; ingen separat variant der.
- Øvrige bransje-, kundespørsmål- og casetekster er beholdt når de har et eget kvalifiseringsformål. For eksempel kan både en diagramforklaring og et kundespørsmål omtale datakvalitet uten å være samme innholdselement. Maskinelt like ord er ikke tilstrekkelig grunnlag for å slå sammen semantikk.

## Bevis og kontroller

`node scripts/check.mjs` omfatter offentlighet, dataintegritet, stil, innholdskontrakt, innholdspropagering, HTML-rendering og release. Kontroller validerer 16 sider, fire arkitekturskisser, fire maler, 43 kilder, 14 prompter, tre Presenter-løp og totalt 76 genererte side-/detalj-/presentasjonsvisninger. Referansetest dekker 61 ID-er og 12 eksplisitte `$content`-referanser, og kontrollerer kildegrunnlag, synlighet og lange eksakte JSON-tekstkopier.

**Endring på ett sted:** `check-content-propagation.mjs` endrer kun betydningen i `learning.glossary[dataplattform]` i en testkopi. Oppdatert tekst finnes deretter i Start her, fordypning, Presenter og søk; en irrelevant visning er uendret. Alle 14 kopierbare promptstrenger ble også sammenlignet med `main` og var byte-for-byte like etter sammensetting ved revisjonen.

## Hva som fortsatt krever arbeid eller kontroll

- Dette er **en betydelig, men ikke total semantisk normalisering**: lengre, ulikt formulerte tekster om datakvalitet, styring og KI kan fortsatt overlappe mellom `pages.home`, `learning.diagrams`, `market.trends`, `sales.plays` og `horizon.chapters`. Disse er ofte pedagogisk eller kommersielt kontekstavhengige og kan ikke automatisk slås sammen; redaksjonell fagrevisjon kreves.
- Flere legacy-felter bruker fortsatt egne ID-/linkkonvensjoner, og søk bygges fra en manuell liste over domenesamlinger. En ny sidetype kan kreve endring av søkeindeksen og routing. Kontraktstesten er sterk på migrerte eiere, men garanterer ikke at **alle** eldre fagobjekter har gjennomgått full kilde- og ID-normalisering.
- Noen korte UI-etiketter og generelle råd ligger fortsatt i JavaScript, særlig Presenter-modalen og tilbakemeldingsfunksjoner. Det er ikke grunnlag for å hevde at all fagtekst er utenfor JS. Resterende tekst må vurderes mot faktiske kanoniske eiere, ikke fjernes mekanisk.
- CSS-arket er bevart for ikke å introdusere redesign/regresjon, men større konsolidering av eldre CSS-overstyringer kan fortsatt være aktuelt.
- Automatiske kontroller fanger eksakt like lange tekststrenger og brutte referanser, men **ikke** semantisk like parafraser. Ingen automatisk kilde-URL-livekontroll eller manuell uavhengig faktarevisjon av alle produktpåstander er gjort i denne implementasjonskjøringen.
- Første lokale nettleserforsøk på tilkoblet testnode stoppet fordi `libglib-2.0.so.0` manglet og systempakker ikke kunne installeres. Det er derfor lagt til en **egen, reproduserbar Chromium-testjobb i GitHub Actions** (`scripts/check-browser.mjs`) som installerer testavhengigheter på GitHub-runner og tester desktop (1440 px) og mobil (390 px) inkludert alle sider, viktige detaljer, søk, Presenter, promptkopiering/-reset og horisontal overflyt. GitHub Actions-kjøring `38548362859` og tilsvarende PR-kjøring besto 14.10.2026: 16 sider, fem detaljvisninger, søk, promptkopiering og tilbakestilling, Presenter og ingen horisontal overflyt på mobil eller desktop. Dette er funksjonell Chromium-verifikasjon, ikke en manuell piksel-for-piksel-designgodkjenning.
- Ved denne vurderingen var produksjon på `main` fortsatt v0.8.0. **Senere publisert** som v0.9.0 etter grønne CI-kontroller og desktop-/mobiltest. Det er ikke tilkoblet CRM, HubSpot, Drive, ansatte eller andre interne data.

## Publiseringsport

Før merge: kontroller både `validate` og `browser` i GitHub Actions; kjør `node scripts/check.mjs`, sjekk sidene og den reelle interaksjonstesten for 390 px og 1440 px. Kjør manuell visuell prøve ved større designendringer. Bekreft publiseringsstatus på Pages etter merge. Ikke skriv at v0.9.0 er publisert før faktisk kontroll.
