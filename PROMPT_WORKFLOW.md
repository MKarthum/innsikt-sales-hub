# Oppgavebasert promptbibliotek

Oppdatert 22. oktober 2026. Bindende sammen med [PROMPT_VARIABLES.md](PROMPT_VARIABLES.md), [CONTENT_CONTRACT.md](CONTENT_CONTRACT.md) og [OPEN_DATA_POLICY.md](OPEN_DATA_POLICY.md).

## Formål

Portalen støtter salg, kundedialog og løpende kundeoppfølging med særlig fokus på Innsikt: dataplattform, data engineering, analyse, BI og KI. Den er ikke CRM, kundearkiv, KI-motor, dokumentgenerator eller obligatorisk salgstrakt. Selgeren skal kunne finne én oppgave og kopiere en nyttig prompt på kort tid.

Kontakt omfatter første henvendelse, nye personer hos eksisterende kunder, referanser, tidligere dialog og gjenopptatt kontakt. Ikke bruk «cold calling» som overordnet begrep.

## Oppgaver fremfor mange promptkort

På `#prompter` vises syv prioriterte oppgaver, hvorav tre fremheves; øvrige oppgaver ligger under «Vis flere oppgaver» og via kategorifilter. Antall oppgaver er ikke et kvalitetsmål. Lag en ny oppgave først når det er forskjellig formål eller resultat, ikke bare ny situasjon; tilføy ellers en redaksjonelt vedlikeholdt variant.

Prioriterte innganger: Innsikt-rettet kundeanalyse, kundekontakt, møteforberedelse, behovssamtale, mulighetskvalifisering, kundeoppfølging og kompetanseavklaring. Spesialiserte prompter (pilot, workshop, presentasjon, notat, partnerdialog, kritisk vurdering) finnes fortsatt.

## Komposisjon og ansvar

`docs/data/prompts.json` er eneste kilde for brukervendt innhold:

- `items[].prompt` eller `promptParts` eier den grunnleggende oppgaveinstruksjonen.
- `items[].choiceGroups` peker på `choiceGroups`. Hvert radiovalg består av stabil ID, kort etikett og konkret, forskjellig instruksjon. Ingen kopierte parallelle prompter.
- `outputSettings.depth` eier **Hurtig / Praktisk / Grundig**. **Praktisk** er standard. Dybde skal ikke gå på bekostning av fakta, forbehold eller kildedisiplin.
- `outputSettings.format` eier **Ren tekst / Markdown / Presentasjon / Word / PDF**. `items[].formats` begrenser oppgaverelevante valg. Valget er en instruksjon til eksternt KI-verktøy, **ikke** et løfte om at portalen genererer filer. Hvis KI ikke kan generere en fil, skal den levere godt strukturert innhold til videre bruk.
- `outputSettings.handoff` er en valgfri avkryssing, på som standard, som legger til en egen kort tekstblokk i det genererte KI-svaret: **KONTEKST TIL NESTE PROMPT** (maks 100 ord). Brukeren kopierer dette selv. Portalen leser ikke svaret fra ekstern KI.
- `items[].contextVariables` deklarerer `KUNDEKONTEKST` som felles, valgfritt felt med inntil 4000 tegn. Konteksten skal merkes som *bakgrunnsdata*, ikke instruksjoner, og kan deaktiveres per oppgave. Den må aldri overstyre formål, sikkerhetskrav eller kildedisiplin.
- `docs/assets/prompt-context.js` setter sammen teksten. `docs/assets/prompts.js` viser kompakte radiovalg og gir tilgang til hele prompten i en avansert, redigerbar visning. Manuell redigering bevares til eksplisitt tilbakestilling.

## Kundeanalyse rettet mot Innsikt

«Analyser en kunde – Innsikt» skal undersøke forretningsmodell og organisering, offentlig dokumenterte digitale prioriteringer, data-/BI-/KI-teknologisignaler og mulige behov. Eksempler som Snowflake, Databricks, Fabric, Azure og Power BI er **søkehypoteser**, aldri tegn på faktisk bruk uten kilde. Krev kilder og datoer, skill kunngjort plan fra pilot og faktisk implementering, og identifiser motargumenter mot ekstern bistand.

Faglig fokus (helhet/teknologi/forretning) er forskjellig fra svarnivå (hurtig/praktisk/grundig). Oppgaven skal gi et kort, kildebevisst utdrag brukeren kan vurdere og eventuelt legge i felles kundekontekst.

## Sikkerhet og videreføring

Offentlig nettsted har ikke innlogging, CRM, KI-integrasjon eller serverlagring. Rik kundekontekst og andre narrative verdier holdes **kun i minnet** og fjernes ved oppfriskning. Generelle offentlige felt kan holdes i fanens `sessionStorage`. Ingen personopplysninger, fortrolige kundeopplysninger, interne profiler eller avtaler skal legges inn. Brukeren kan kopiere kontekstutdrag, men portalen akkumulerer ikke genererte KI-svar automatisk.

## Testing og faglig kvalitet

Test alle nye/reviderte oppgaver i Hurtig/Praktisk/Grundig, flere varianter, med og uten kundekontekst, med/uten handoff, med alle støttede svarformater, og på mobil/desktop. En manuelt redigert prompt må ikke overskrives stille når radiovalg endres. Kjør `node scripts/check.mjs` og nettlesertestene mot lokal HTTP-server eller gjennom CI.

Ut over grønne tester må selgere og fagmiljø validere navigasjonshastighet og om svarene faktisk er bedre enn en improvisert generell prompt. Ikke la teknisk fleksibilitet erstatte produktkvalitet.
