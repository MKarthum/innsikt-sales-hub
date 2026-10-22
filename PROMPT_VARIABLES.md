# Promptbibliotek: variabler og videreutvikling

Dette dokumentet er bindende ved endring av prompter, plassholdere, variabler og prompt-UI. Les også `PROMPT_WORKFLOW.md`, `START_HERE.md`, `AGENTS.md`, `CONTENT_CONTRACT.md` og `OPEN_DATA_POLICY.md`.

## Én eier og én betydning

- `docs/data/prompts.json` eier hele promptbiblioteket: `items`, `rules`, `variables`, `variableGroups`, `choiceGroups`, `outputSettings` og `page.variableUi`. Det skal ikke finnes en parallell variabelliste eller brukerrettede etiketter i JavaScript, HTML eller CSS.
- Hver semantiske variabel har stabil, unik `id` med store bokstaver, for eksempel `KUNDENAVN`. `aliases` kan omfatte `KUNDE`, men bare når de faktisk betyr det samme. Ikke slå sammen nærliggende begreper som `TIDSVINDU` og `VARIGHET`, eller `PROBLEM` og `SYMTOM`, uten en eksplisitt faglig begrunnelse.
- Alle plassholdere i `items[].prompt` eller sammensatt `promptParts` må forekomme **én gang** i `items[].placeholders` og kunne løses via `variables[].id` eller et entydig alias. Det er bare felter deklarert for den aktuelle prompten som erstattes.
- `variables[].label`, `group`, `hint`, `multiline`, `retention` og `maxLength` gjør det mulig å rendere både promptfelt og samlet oversikt uten spesialtilfeller.
- `items[].contextVariables` brukes for valgfri felles kundekontekst uten plassholder i hovedinstruksjonen. `choiceGroups` og `outputSettings` eier alle valgbaserte instruksjonsblokker. `prompts.rules` og `promptParts` bevarer tidligere komposisjonskontrakt. Malen skal være selvstendig også når ingen felt er fylt ut. Den ferdige promptteksten må ikke antas å være resultat av en KI-kjøring.

## Livsløp og opprydding

1. Før en ny prompt legges til: kontroller om tilsvarende oppgave allerede finnes, og forbedre den eksisterende før ny opprettes. Kontroller rolle, tiltenkt anvendelse, nødvendig input, konkret output, kontrollpunkter, faglig nøkternhet og kildedisiplin. Lag et radiovalg i eksisterende oppgave når bare vinkelen varierer. Antall prompter er ikke et kvalitetsmål.
2. Definer eller gjenbruk kanoniske variable **før** nye plassholdere introduseres. Legg kun til alias når lik betydning er dokumenterbar. Bruk alltid stabile ID-er i lagring og koblinger, aldri sidetittel eller plassholderens tekst som lagringsnøkkel.
3. Kontroller at hver definert variabel brukes av minst én aktiv prompt. Bygget skal stoppe ved ukjente plassholdere, kolliderende aliaser, dupliserte ID-er eller variabler uten aktive brukere.
4. Ved sletting av en prompt: sjekk alle tilhørende variabler. Fjern de som ikke brukes andre steder. Hvis en bruker fortsatt har en verdi lagret under en eldre ID, skal denne vises som foreldreløs på «Alle variabler», med mulighet for sletting. Ikke slett ukjente lagrede nøkler automatisk uten at brukeren kan se dem.
5. Ved endring av ID: vurder om dette er en faktisk semantisk endring eller kun endring av stavemåte. Behold ID ved lik betydning; ellers lag nytt felt og dokumenter migrering/tilbakestilling. Aldri gjenbruk en gammel ID med ny betydning.
6. Hold «Tilbakestill tekst» adskilt fra «Nullstill variabel» og «Nullstill alle variabler». Bevar endringer i fritekst ved feltoppdatering; hvis editoren er endret, krev eksplisitt bekreftelse før malen gjenoppbygges.

## Lagring og informasjonssikkerhet

- Offentlig GitHub Pages har ingen server, login, CRM eller sikker datalagring. Bruk **aldri** interne kundedata, møtereferater, identifiserende personopplysninger, tilbud, kapasitetsinformasjon eller konfidensielle dokumenter i denne offentlige portalen.
- `retention: "session"` er kun tillatt for generelle, offentlig delbare felt (f.eks. generisk bransje eller et offentlig kundenavn). Disse lagres i nettleserfanens `sessionStorage` og fjernes ved fanens slutt; de er ikke kryptert eller egnet for fortrolige opplysninger.
- `retention: "memory"` brukes for rikere kontekst, anonymiserte utsagn, behov og andre felt med større risiko for utilsiktede opplysninger. De eksisterer bare i sidens JavaScript-minne og forsvinner ved oppfriskning.
- Lagringsfeil skal degraderes uten brudd i editoren. Ingen synkronisering mellom enheter, eksport av kontekst, URL-parametere med verdier, telemetri eller oppkobling mot server.
- Promptmaler og variabelverdier blandes aldri inn i `docs/data` eller Git-historikken. Input må escapes ved visning. Kopiert prompt er en lokal brukerhandling.

## Samlet oversikt

- «Alle variabler» er en underside av promptbiblioteket, ikke en ny hovednavigasjon. Brukeren arbeider primært på den aktuelle prompten.
- Oversikten viser variablene gruppert, redigerbare felt, gjenbrukende prompter, hvor lenge verdiene beholdes, nullstilling per felt og samlet nullstilling.
- Oversikten viser også utgåtte lagrede ID-er og ubrukt definerte variabler. Maskinelle kontroller hindrer at sistnevnte blir publisert som normal tilstand; oversikten gir samtidig en tydelig tilbakemelding dersom en eldre eller framtidig datakilde avviker.
- Ingen verdier skal sendes til tjenere, legges i sideadresser eller blandes med søkeindeks og innholds-JSON.

## Obligatorisk test før publisering

- Kjør `node scripts/check.mjs`, inkludert `check-prompt-context.mjs` og dataintegritet. Kontroller samme ID på tvers av prompter, alias, tomme felt, enkeltreset, totalreset, sessionStorage-oppfriskning, memory-only, foreldreløse felt, HTML-escaping, og kopiering.
- Kjør `node scripts/check-prompt-browser.mjs` og `node scripts/check-browser.mjs` med lokal HTTP-server og kontroller mobil og desktop samt manuell editor-endring mot feltoppdatering.
- Inspiser at samlet oversikt ikke fører til unødig visuelt støy på vanlige promptdetaljer. Kontroller tastatur og fokus, mobil og ingen horisontal overflyt.
- Oppdater `docs/data/site.json.version`, assetversjoner i `docs/index.html`, faglige regler og eventuell backlog. Publiser kun én samlet, testet release.

## Valg og kontekstoverlevering

Se [PROMPT_WORKFLOW.md](PROMPT_WORKFLOW.md) for produktkontrakt. Alle radiovalg og tilhørende instruksjoner vedlikeholdes i `prompts.json`; de må ha reell semantisk betydning. Formater er bestillinger til eksternt KI-verktøy, ikke filgenerering i portalen. `KUNDEKONTEKST` er felles, memory-only og valgfri per oppgave. Kort kontekst til neste prompt følger alle maler som standard, men kan slås av. Full prompttekst er tilgjengelig bak en avansert, redigerbar visning. Test kopiering og bytte av valg uten å miste manuelle endringer.

## Oppgavesemantikk og synlig forhåndsvisning

MØTEFORMÅL brukes bare når oppgaven handler om et møte. ANALYSESPØRSMÅL brukes for kundeanalyse, FORMIDLINGSFORMÅL for presentasjon og OPPFØLGINGSGRUNNLAG for generell kundeoppfølging. Dette er forskjellige betydninger, ikke aliaser. Rike fritekstfelt er memory-only. Forhåndsvisningen skal vise de samme valgte instruksjonene som prompten, ikke egen markeds- eller hjelpetekst.


## Valgfrie felter (v0.11.5)

{{?VAR}}... [VAR] ...{{/VAR}} angir en dataeid valgfri frase, inkludert skilletegn og ledetekst. Komposisjonen fjerner hele frasen når VAR er tom; ikke bytt ut tomt felt med «Ikke valgt» eller en rå plassholder. Alle deklarerte variabler i en aktiv prompt skal ligge i nøyaktig én slik frase; datavalideringen stopper ved duplisering, feil id eller ubalanserte markører. Feltaliaset må være registrert. essentialPlaceholders kan brukes for å be om nødvendig input (f.eks. kundenavn i kildebasert analyse) uten å finne på identiteten.


## CV-sammenligning (v0.11.7)

CV_KONSULENTNAVN og CV_FORESPØRSEL er kun frivillige hjelpedata for eksternt, godkjent KI-verktøy og skal ha retention: memory. Den faktiske CV-en og fullstendig forespørsel legges ved i KI-samtalen eller leses fra de kildene verktøyet er autorisert for. Portalen utfører ingen opplasting, dokumentsøk, kandidatmatching eller lagring av CV. Ikke legg personidentifiserende opplysninger eller fortrolige kundekrav i en åpen KI-tjeneste.
