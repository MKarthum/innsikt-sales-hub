# Implementasjon og revisjon – Innsikt v0.9.0 (14.10.2026)

## Grunnlag og metode

Basis var autoritativ `main` ved `9844c6f` (v0.8.0). Arbeidet er isolert på `refactor/canonical-content-20261014`. `REFACTOR_AUDIT.md` beskriver før-situasjonen, `REFACTOR_PLAN.md` beskriver planen, og `CONTENT_CONTRACT.md` beskriver gjeldende kontrakt. Arkitekturprinsippene i `MKarthum/japan-2027` er vurdert: domeneeierskap, ID-referanser, atomisk release, offentlige data og automatiske kontroller. Innsikt beholder sine eksisterende domener, enkelt HTML-skall og vanlige JSON-filer.

## Observerte overlapp og gjennomførte endringer

| Før: vedlikeholdskobling | Etter: autoritativ eier og visning |
|---|---|
| Samme kildeinstruks gjentatt i fire prompter | `prompts.json.rules[verified-public]`; `promptParts` komponeres ved lasting, uten å endre den kopierte teksten |
| Begreper brukt i Start her, fordypning og Presenter | Stabile `learning.json.glossary[].id`; valgt `$content`-variant, og eksisterende `horizon.conceptIds` |
| Produktoversiktens forklaring gjentatt på teknologiside og KI-side | `technologies.json.aiOverview` har varianter `short`, `normal`, `long`; header peker til normal, kartvisningen bruker kort |
| KI-statistikkens metodiske forbehold i marked/presentasjoner | `market.json.metricGuidance` eier variantene; Presenter refererer til kort og normal, markedet til lang |
| Data-/KI-risiko i forklaringer og Presenter | `learning.json.risks[].variants` og referanser på tekniske lysbilder |
| Generiske salgsadvarsler og introduksjoner i JS | `sales.json.sharedGuidance`, sideunike `pages.json.copy` og faglig `marketUi`/`techUi`, samt `learning.json.diagrams` |
| Manglende ID-er på teknologier, enkelte ordbegreper, risiko, kompetanse m.m. | Stabile ID-er i eksisterende domeneposter; innholdstype og faglig kontrolldato på utvalgte faktabærende objekter |

Kildeoppføringer eies fortsatt av `sources.json`. Eksisterende `source`, `sources` og `sourceIds` beholdes der de allerede er kanoniske, uten nye kopier av kilde-ID-listene. `published`, `checked`, `reviewed`, `status` og `evidence` har ulike formål; dato på kildeoppføringen er ikke automatisk kontroll av påstanden.

## Bevis og kontroller

`node scripts/check.mjs` omfatter offentlighet, dataintegritet, stil, innholdskontrakt, innholdspropagering, HTML-rendering og release. Kontroller validerer 16 sider, fire arkitekturskisser, fire maler, 43 kilder, 14 prompter, tre Presenter-løp og totalt 76 genererte side-/detalj-/presentasjonsvisninger. Referansetest dekker 61 ID-er og 11 eksplisitte `$content`-referanser, og kontrollerer kildegrunnlag, synlighet og lange eksakte JSON-tekstkopier.

**Endring på ett sted:** `check-content-propagation.mjs` endrer kun betydningen i `learning.glossary[dataplattform]` i en testkopi. Oppdatert tekst finnes deretter i Start her, fordypning, Presenter og søk; en irrelevant visning er uendret. Alle 14 kopierbare promptstrenger ble også sammenlignet med `main` og var byte-for-byte like etter sammensetting ved revisjonen.

## Hva som fortsatt krever arbeid eller kontroll

- Dette er **en betydelig, men ikke total semantisk normalisering**: lengre, ulikt formulerte tekster om datakvalitet, styring og KI kan fortsatt overlappe mellom `pages.home`, `learning.diagrams`, `market.trends`, `sales.plays` og `horizon.chapters`. Disse er ofte pedagogisk eller kommersielt kontekstavhengige og kan ikke automatisk slås sammen; redaksjonell fagrevisjon kreves.
- Flere legacy-felter bruker fortsatt egne ID-/linkkonvensjoner, og søk bygges fra en manuell liste over domenesamlinger. En ny sidetype kan kreve endring av søkeindeksen og routing. Kontraktstesten er sterk på migrerte eiere, men garanterer ikke at **alle** eldre fagobjekter har gjennomgått full kilde- og ID-normalisering.
- Noen korte UI-etiketter og generelle råd ligger fortsatt i JavaScript, særlig Presenter-modalen og tilbakemeldingsfunksjoner. Det er ikke grunnlag for å hevde at all fagtekst er utenfor JS. Resterende tekst må vurderes mot faktiske kanoniske eiere, ikke fjernes mekanisk.
- CSS-arket er bevart for ikke å introdusere redesign/regresjon, men større konsolidering av eldre CSS-overstyringer kan fortsatt være aktuelt.
- Automatiske kontroller fanger eksakt like lange tekststrenger og brutte referanser, men **ikke** semantisk like parafraser. Ingen automatisk kilde-URL-livekontroll eller manuell uavhengig faktarevisjon av alle produktpåstander er gjort i denne implementasjonskjøringen.
- **Nettlesertesting er ikke bestått / ikke gjennomført.** Headless Chromium ble hentet til isolert testområde, men oppstart stoppet med manglende `libglib-2.0.so.0` (samt øvrige systembiblioteker). Installasjon av systemavhengigheter feilet fordi apt-katalogen er skrivebeskyttet. Det er derfor ikke verifisert visuell responsivitet eller reell klikkflyt i 390 px/1440 px. Dette er en konkret PR-publiseringssperre, ikke en grønn test.
- Produksjon på `main` blir stående på v0.8.0 frem til PR er vurdert, nødvendige sjekker er grønne og faktisk desktop-/mobiltest er gjennomført. Det er ikke tilkoblet CRM, HubSpot, Drive, ansatte eller andre interne data.

## Publiseringsport

Før merge: sjekk GitHub Actions på PR; kjør lokalt `node scripts/check.mjs`, sjekk alle nav-lenker, søk, Presenter, promptkopier/tilbakestill, og responsiv visning med faktisk nettleser (for eksempel 390 px og 1440 px). Bekreft publiseringsstatus på Pages etter merge. Ikke skriv at v0.9.0 er publisert før faktisk kontroll.
