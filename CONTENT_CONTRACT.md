# Innholdskontrakt – én autoritativ kilde (v1, 14.10.2026)

Dette dokumentet er en **bindende arkitektur- og redaksjonell regel** for Innsikt, også ved videreutvikling i Claude Code, Gemini eller andre KI-verktøy. Leses sammen med `START_HERE.md`, `AGENTS.md` og `OPEN_DATA_POLICY.md`.

## 1. Absolutt krav: ingen uavhengige kopier av samme innhold

- Et **semantisk innholdselement** (begrepsdefinisjon, faktapåstand, hendelse, statistikk, produktstatus, beskrivelse, kilde, leveransepåstand eller veiledning) skal ha **én kanonisk eier**, uavhengig av hvor mange steder det vises.
- «Samme» gjelder **betydning**, ikke bare identisk ordlyd. Omskrivning og forkorting i en annen JSON-fil eller JavaScript er ikke en løsning.
- Innhold kan ha **kort, normal og utdypet tekstvariant** når de faktisk har ulike formål. Disse variantene skal være under **samme ID og dataeier**, ikke to frikoblede elementer.
- En visning velger **hvilke ID-er og hvilke varianter** den trenger. Sidene eier sammensetning, rekkefølge, navigasjon og sideunike spørsmål – ikke egne faktaversjoner.
- Fakta (f.eks. prosentandel, produktstatus, dato eller oppkjøp) lagres én gang som typede felt med kilde. Alle tekstlige gjengivelser bruker den samme autoritative posten.
- Eksempler og spørsmål som bare gir mening på én side, kan være sideeide. De skal likevel **referere** til kanoniske begreper/fakta og aldri duplisere eller påstå en alternativ versjon av dem.
- Navn i navigasjon, menykort og linker kan naturligvis forekomme flere steder som referanser til samme ID. Det er ikke duplisering av faglig innhold.

## 2. Innhold og layout er separate lag

- `docs/data/*.json`: innhold og autoritative metadata, organisert etter **eieransvar**, ikke etter antall visninger.
- `docs/index.html`, `docs/assets/*.js`, `docs/assets/site.css`: struktur, interaksjon og presentasjon. Ingen selvstendige faglige fakta, definisjoner eller salgsbudskap.
- Ikke opprett en ny kopi bare fordi en ny side, lysbildemodus, en prompt eller et kort trenger samme informasjon.
- **Ingen database eller tungt CMS er nødvendig per nå.** Et lite, validert referansesystem med ID-er mellom JSON-filer er førstevalg. Foreslå større tekniske endringer bare ved dokumentert behov.

## 3. Et innholdselement kan være skjult eller gjenbrukt

- Det er lov å lagre et åpent innholdselement som foreløpig ikke vises (for eksempel en kandidat til senere fordypning).
- Publiseringsstatus og bruk i en bestemt visning må være **eksplisitt**, ikke en utilsiktet følge av at noe finnes i en fil.
- Et element kan brukes på forsiden, i ordlisten, i fordypning, i søk, i presentasjoner og i salgs-prompter.
- En side skal ikke kopiere innholdet; den peker til det med ID og ønsket visningsvariant.
- **Viktig:** «Ikke vist på nettsiden» er **ikke** privat. Alle JSON-filer og gamle Git-committer i det personlige offentlige repoet må tåle full offentlig innsyn.

## 4. Kunnskapsstatus og kildegrunnlag

Skille alltid mellom:
1. **Dokumentert forhold**: hva som kan underbygges, og hvilken dato/versjon det gjelder.
2. **Leverandørpåstand eller veikart**: hva leverandøren faktisk hevder, med produktmodenhet (for eksempel preview vs. generell tilgjengelighet).
3. **Faglig vurdering/hypotese**: mulig utviklingsretning, med usikkerhet, alternativer og hva som kunne motbevist den.
4. **Åpent spørsmål**: hva vi ennå ikke vet.

For tidsfølsomme opplysninger skal eieren angi relevante `sourceIds`, `reviewed` eller `checked`, og ved behov `published`, `asOf`, `maturity` og usikkerhet. En leverandørkilde bekrefter leverandørens beskrivelse, ikke uavhengig kundeverdi.

**Lakehouse-analogien:** Lakehouse kombinerer sider ved data lake og warehouse. At plattformer, ontologi/kunnskapsgrafer og KI-kontekst kan få mer overlapp, er en plausibel hypotese – **ikke et dokumentert historisk parallellforløp med bestemt sluttresultat**.

**Company Brain:** uformell markedsbetegnelse, ikke én standardisert arkitektur eller nødvendigvis en kunnskapsgraf. Ikke anta at all KI må ha strukturerte tabeller, egen graf eller datavarehus; dokumentbasert søk og RAG kan ha et annet utgangspunkt.

## 5. Gjeldende domeneeiere og midlertidige begrensninger

- `site.json`: versjon og publiseringsmetadata.
- `sources.json`: kilderegister.
- `learning.json`: ordliste, generiske skisser og grunnforklaringer.
- `technologies.json`: leverandører, produktfunksjoner, logoer og statuser.
- `market.json`: dokumenterte markedsdata, hendelser og markedsvurderinger.
- `sales.json`: salgsinnganger, kundesignaler og salgsmetodikk.
- `prompts.json`: arbeidsinstruksjoner for salg og kvalitetskrav.
- `horizon.json`: **fordypningens originale analyse, hypoteser, tverrfaglige spørsmål og referanser**. Skal ikke bli en parallell ordbok eller en ny produktdatabase.
- `pages.json`: sidenes komposisjon, sideunike tekst og presentasjonsdisposisjoner – ikke faktaautoriteter.
- `backlog.json`: planlagte forbedringer og redaksjonelle behov.

**Status 14.10.2026:** Reglene er nå strengere enn dagens implementering. Flere eldre felter, slides og hardkodede JS-tekster bryter fremdeles den langsiktige innholdskontrakten. Dette er **kjent teknisk gjeld**, dokumentert i `REFACTOR_AUDIT.md`. Ikke beskriv alt som ferdig refaktorert.

## 6. Endringsprosedyre

1. Finn kanonisk innholdselement eller opprett ett nytt med stabil ID, eier og kilder.
2. Finn alle visninger og avhengigheter gjennom ID-/referansesøk.
3. Oppdater innholdselementet **én gang**; bruk variant ved behov, ikke kopierte tekster.
4. Verifiser at kort, detaljsider, søk og presentasjon nå er konsistente.
5. Kjør datavalidering, referanseintegritet, innholdstest og utvalgt visuell kontroll.
6. Oppdater versjon og faglig kontrolldato; publiser atomisk.

Den neste store refaktoreringen skal lage automatiske kontroller som tester denne kontrakten, ikke bare beskriver den.
