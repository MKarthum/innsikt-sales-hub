# Fra åpent arbeidsgrunnlag til Webstep-intern portal

Dette er en arkitekturnotat / sjekkliste, ikke en gjennomført migrering. Offentlig repo, kode og Pages må behandles som offentlige til alt annet er dokumentert.

## 1. Godkjent målmiljø

- Opprett en Webstep-eid kildekodebase med godkjent tilgang og eierskap. Avklar om Enterprise Pages kan publiseres privat for den faktiske organisasjonen. Et privat repo på personlig GitHub er ikke nødvendigvis en privat nettside.
- Avklar hvem i salg og fagledelse som skal bruke portalen, og hvordan SSO/rollegrupper styres. Velg alternativ vert (f.eks. en statisk app bak virksomhetens identitetskontroll) hvis GitHub-lisenser/Pages-tilgang ikke fungerer.
- Sørg for at test- og produksjonsmiljøer, eierskap, backups og vedlikehold er beskrevet.

## 2. Migrering og nedstengning av offentlig side

1. Overfør kun åpent, kontrollert kildeinnhold og portabel statisk kode. Inspiser commit-historikk og skann etter sensitive data før overgang.
2. Test at tilgang til intern nettside er avvist for en ikke-autorisert konto.
3. Test mobil, navigasjon, promptkopiering, søk, kildevisning og CI før publisering.
4. Deaktiver offentlig GitHub Pages-publisering og kontroller at URL ikke lenger gir tilgang når dere har en sikker erstatning. Vurder å gjøre personlig repo privat/arkivert; eldre offentlige kopier og cache kan ikke garanteres slettet.
5. Bekreft at alle lenker og brukerveiledninger peker på intern adresse.

## 3. Sikker integrasjon med HubSpot og Google Drive

- En statisk nettside kan vise godkjent innhold og kopierbare maler, men skal ikke inneholde tilgangsnøkler, refresh tokens, passord eller direkte ukontrollerte CRM-eksporter.
- Hvis innhold fra CRM/Drive skal vises eller brukes som KI-kontekst, bruk en godkjent tjeneste på server-/appnivå med virksomhetens identitet, tilgangssjekk per bruker, minste privilegium, audit-logg og dataklassifisering.
- Velg om første leveranse bare skal LENKE til data i eksisterende HubSpot/Drive og la KI-jobben utføres i allerede godkjente verktøy. Det er enklere og kan være tryggere enn å bygge full dataintegrasjon.
- Skill offentlig faginnhold i eksisterende JSON-filer fra interne oppslag, kundecaser og medarbeiderprofiler. Ikke skriv interne data eller logger tilbake til det personlige repoet.
- Personopplysninger, kundedata, møtehistorikk og konsulentprofiler behandles i tråd med Websteps interne krav og avtaler.
- Kontroller at KI-leverandør og den enkelte datakilde er godkjent for behandlingen. Be modellen om å sitere konkrete interne kilder og å tydelig vise manglende grunnlag.

## 4. Første mulige interne utvidelser

- **Kundebrief:** offentlige fakta + tilgangsstyrt CRM-kontekst + dokumenterte møtenotater, med kilde og dato.
- **Kompetansematch:** oppdragskrav mot godkjente konsulentprofiler og faktisk bekreftet kapasitet. Modellen foreslår; fag- og bemanningsansvarlig beslutter.
- **Møter og presentasjoner:** gjenbruk promptbibliotek og godkjente maler, uten å generere udokumenterte kundereferanser eller resultater.
- **Oppfølging:** forslag til e-post og oppgaver, med brukerens eksplisitte godkjenning før sending eller CRM-oppdatering.
- **Partnerdialog:** bruk reell og godkjent informasjon om partnerprogram og registreringsprosess, ikke antakelser.

## 5. Endringsregler

Behold `START_HERE.md`, `AGENTS.md` og kanonisk JSON per domene. Legg til intern innholdsautoritet separat, med tilgangsregler og godkjenning. Ikke legg på kjappe, ukontrollerte integrasjoner. Prioriter løpende innholdskvalitet og nytte for selgerne.


## Framtidig kilde-/publiseringsmodell (ikke implementert)

Behovet er to forskjellige leveranser: et offentlig godkjent, vedlikeholdt kunnskapsgrunnlag og en eventuell Webstep-eid, tilgangsstyrt utgave med særskilt profil og interne tillegg. Førstnevnte kan forbli en offentlig kilde eller fases ut; begge muligheter er åpne.

Foreløpig teknisk retning (skal valideres før gjennomføring):

1. **Enveis import av godkjent åpent innhold:** Internt repo kan hente eksplisitt tillatte filer/ID-er fra en versjon/tag i offentlig kilde, ikke ukontrollert hele historikken. Spor kilde-SHA og test semantiske konflikter.
2. **Intern overstyring uten kopiert vedlikehold:** Et internt konfigurasjons-/temalag velger logo, layout og publisering. Egne interne innholdsmoduler holdes utenfor den offentlige kilden og merges på stabile ID-er etter definerte konfliktregler. Ikke kopier kanoniske definisjoner.
3. **Kildegrense:** Ingen automatisk synk motsatt vei. Ingenting internt eller konfidensielt sendes til offentlig repo eller tredjeparts Artifact-tjenester uten eksplisitt sikkerhetsgodkjenning.
4. **Reproduserbart Artifact-bygg:** Eksporter kun autorisert statisk innhold fra kildeversjonen. Bygg uten LLM ved gjentatt kjøring, og identifiser både kildeversjon, intern release og eksakt Artifact-versjon i brukergrensesnittet. Må først verifisere publiserings- og tilgangsmodell på den valgte Artifact-plattformen.
5. **Visuell forhåndsvisning:** Den eksisterende statiske appen kan forhåndsvises lokalt med webserver og Playwright før bygg. Internt temalag bør ha egen preview; en Artifact-bygging skal ikke være eneste måte å se layoutendringer på.
6. **Designmal:** Vent med Webstep/DevStep-branding. Når riktig mal og eierskap er avklart, implementeres den som eget tema, ikke som endringer i det offentlige innholdsgrunnlaget.

Arbeidet er registrert i `backlog.json` B-21 til B-25. Ingen interne filer, legitimasjon, CI-nøkler eller data er opprettet i denne offentlige utgaven.
