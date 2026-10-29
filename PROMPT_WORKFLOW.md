# Oppgavebasert promptbibliotek

Oppdatert 22. oktober 2026. Bindende sammen med [PROMPT_VARIABLES.md](PROMPT_VARIABLES.md), [CONTENT_CONTRACT.md](CONTENT_CONTRACT.md) og [OPEN_DATA_POLICY.md](OPEN_DATA_POLICY.md).

## Formål

Portalen støtter salg, kundedialog og løpende kundeoppfølging med særlig fokus på Innsikt: dataplattform, data engineering, analyse, BI og KI. Den er ikke CRM, kundearkiv, KI-motor, dokumentgenerator eller obligatorisk salgstrakt. Selgeren skal kunne finne én oppgave og kopiere en nyttig prompt på kort tid.

Kontakt omfatter første henvendelse, nye personer hos eksisterende kunder, referanser, tidligere dialog og gjenopptatt kontakt. Ikke bruk «cold calling» som overordnet begrep.

## Oppgaver fremfor mange promptkort

På `#prompter` vises åtte prioriterte oppgaver samlet under «Velg en oppgave», uten en kunstig intern rangering. Forsiden kan vise tre snarveier til disse. Øvrige oppgaver ligger under «Vis flere oppgaver» og via kategorifilter. Antall oppgaver er ikke et kvalitetsmål. Lag en ny oppgave først når det er forskjellig formål eller resultat, ikke bare ny situasjon; tilføy ellers en redaksjonelt vedlikeholdt variant.

Prioriterte innganger: Innsikt-rettet kundeanalyse, markedsprospektering med prioritert ringeliste, kundekontakt, møteforberedelse, behovssamtale, mulighetskvalifisering, kundeoppfølging og kompetanseavklaring. Spesialiserte prompter (pilot, workshop, presentasjon, notat, partnerdialog, kritisk vurdering) finnes fortsatt.

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

## Synlig komposisjon, ikke parallelt innhold

Alle oppgaver viser en kompakt, levende oversikt over faktisk valgte instruksjonsblokker før full prompttekst må åpnes. På desktop står den ved siden av feltene; på mobil før feltene. Radiovalg skal oppdatere oversikten og instruksjonsteksten under hvert valg. Dette er bare visning, ikke en ny datakilde: InnsiktPromptContext.selectedBlocks() og composeTask() bruker de samme blokkene i prompts.json.

Alle nye brukervendte tekster — hjelpetekster, meldinger ved kopiering, labels, komposisjonsoverskrifter og markører — skal eies av docs/data/prompts.json. Ikke hardkod formuleringer i prompts.js, site.js eller CSS. Dersom full prompttekst er manuelt endret, skal den synlige forhåndsvisningen varsle at radiovalg ikke styrer teksten som kopieres før tilbakestilling.

Kundeanalyse krever ikke møteformål; presentasjon trenger formidlingsformål; oppfølging kan skje uten et møte. Ved navneendring kontroller alle henvisninger i pages.json, Presenter og søk. Gjennomgangen er dokumentert i PROMPT_EDITORIAL_AUDIT_2026-10-22.md.

## Regresjonsregel for handlinger (v0.11.3)

Den levende forhåndsvisningen skal vise **instruksjonene som endres**, ikke kopierhandling, utfyllingsteller eller ekstra statuser som allerede vises i skjemafeltene. Det skal være én kopierknapp per oppgave, plassert **etter** valgene og den valgfrie redigerbare fullteksten, slik at brukeren først konfigurerer og eventuelt redigerer, og deretter kopierer. Test både den reelle rekkefølgen i DOM og at kopiering fortsatt følger manuelt redigert tekst.

## Klikkflate og naturlig samspill (v0.11.4)

Radiovalg må ha en reell fokus- og klikkflate som dekker hele den synlige etiketten. Testene skal bruke vanlig check() uten tvang av skjulte elementer, på både mobil og desktop. Dette forhindrer at visuelt synlige filtervalg er vanskelige å aktivere fra tastatur eller automatisering.


## Betingede variabelfelt og firmamaler (v0.11.5)

Prompter skal ikke sende uutfylte felt som rå plassholdere eller formuleringer som «Ikke valgt». Alle 15 oppgavene har betingede tekstbiter i docs/data/prompts.json: {{?VARIABEL}}Etikett: [VARIABEL].{{/VARIABEL}}. Motoren tar med hele tekstbiten bare når verdien finnes. Ingen spesialtilfeller eller formuleringsregler i frontend-JavaScript. optionalPlaceholders er den dataeide kontrakten. essentialPlaceholders angir felt som trengs for konkret analyse; ved tomt felt brukes missingEssentialInstruction fra datakilden for å be om nødvendig input uten gjetning.

«Bruk firmamaler» er et subvalg under svarformat, ikke en selvstendig innstilling. Det vises bare for slides, word og pdf (fra outputSettings.organizationTemplates.formats), er aktivt som standard når passende format velges, og kan slås av per oppgave. En eksplisitt avhaking skal respekteres også etter formatbytte, men malinstruksjonen skal kun legges inn når både filformat og avkrysning gjelder. Ren tekst og Markdown skal aldri inneholde instruksjonen. Instruksjonen nevner ikke interne navn eller hemmelige detaljer; den ber eksternt KI-verktøy se etter og bruke tilgjengelige organisasjonsmaler, designressurser og ferdigheter (skills). En prompt kan ikke garantere at et eksternt KI-verktøy har eller aktiverer en ferdighet.

Innhold/visning er strengt separert: etikettnavn, hjelpetekst, formater, betingelser og instruksjoner eies av prompts.json; prompt-context.js utfører generiske betingelser og komposisjon; prompts.js og site.js viser subvalg, mens CSS styrer plassering. Enhetstester kontrollerer betingede felter. Nettlesertester kontrollerer formatvalg, standardavkrysning, avhaking, formatbytte, kopitekst og mobil/desktop.


## Konsolidert veiledning (v0.11.6)

Hver oppgaveside viser valgenes faktiske instruksjonstekster kun ett sted, i en felles forhåndsvisning. Radioknappene har korte etiketter og eventuelle hints om hva som velges, men **ingen gjentagelse av de fulle instruksjonene**. Det er fortsatt selectedBlocks() som leverer innholdet som faktisk havner i den kopierte prompten. Avansert fulltekst er et eget, lukket redigeringsfelt og skal ikke brukes som ekstra «forklaring» i standardvisningen.

På desktop er forhåndsvisningen og valgfri hjelp til oppgaven **samlet i én høyrekolonne**. Den skal ikke være sticky eller ha egen vertikal scrollbar; hele siden ruller naturlig, og veiledning får ikke scrolle under et annet panel. På mobil står forhåndsvisningen før skjemaet, og «Tips og kvalitetssjekk» finnes rett nedenfor som lukket hjelpeseksjon. Dette bevarer plass til den egentlige arbeidsflyten. En skjemavalgforklaring vises aldri både under en radioknapp og i forhåndsvisningen.

Oppgavens bruksøyeblikk forklares allerede av tittel og ingress, derfor skal detaljsiden ikke ha egen «Når er denne nyttig?»-boks. «Tips og kvalitetssjekk» inneholder én eller to konkrete forberedelsestips og få, oppgavespesifikke kontrollpunkter. Generelle personvernmeldinger vises én gang i hovedflyten; særlig varsomhet med interne profiler, partnersamarbeid og oppfølging bevares i den utvidbare hjelpen. Alle tekster forblir dataeid i prompts.json. Endringer testes i DOM og i reell desktop-/mobilnettleser for visningsrekkefølge, overlapp, scrollbar og at valg fortsatt endrer prompten.


## CV mot kundeforespørsel – tydelig oppgave (v0.11.7)

Det finnes én egen prioritert oppgave for vurdering av en konkret konsulent-CV mot en kundeforespørsel. Den er forskjellig fra «Avklar kompetansebehov», som fortsatt finnes for generell rolle-/kompetanseplanlegging under «Vis flere oppgaver». Oppgaven er ment brukt i **godkjent KI-verktøy** med dokumenter som brukeren selv vedlegger der, eller som KI-verktøyet har godkjent tilgang til. Den offentlige portalen laster ikke opp eller henter CV-er, forespørsler eller interne dokumenter. Konsulentnavn (til identifisering/oppslag) og anonymisert forespørselstekst er valgfrie, memory-only og aldri persistert.

Standard er **«Kun vurdering»**, med kvalitativ, etterprøvbar konklusjon og konsis punktform. KI må lese både forespørsel og CV før den konkluderer. Den skal skille «må»-krav og «bør»-krav, finne bevis på faktisk prosjektarbeid, vurdere formelle betingelser og vesentlige hull, og kunne fraråde innsending. Ingen poengsummer eller fabrikkerte profiler. Historiefortelling betyr å forklare sammenhengen mellom kundens behov og konsulentens reelt dokumenterte erfaring, ikke å overselge.

Valget **«Vurdering + spisset CV»** aktiverer kun da omfanget på CV (etter relevans, ca. 2–3 eller 4–5 sider), en valgfri hake for en **påkrevd kundemal** og formatene Word/PDF. Kun vurdering bruker ren tekst/Markdown. Kundens mal går foran firmamal og undertrykker derfor denne instruksjonen og visningen mens haken står på. Kundens mal må faktisk være vedlagt/tilgjengelig i KI-verktøyet; den offentlige portalen har ingen innsendingsfunksjon. Hvis kildegrunnlag eller mal mangler, skal verktøyet etterspørre dette og ikke skrive en oppdiktet CV.

Brukeren kan fremdeles velge globalt Hurtig/Praktisk/Grundig, men dette bestemmer **lengden på vurderingen**, ikke sidetallet på CV-utkastet. Motstridende formater skal ikke vises. Full prompttekst, kopierknapp etter valg, konseptuell personverngense, dataeierskap i prompts.json og mobiltilpasning skal bevares. Browserregresjonene skal teste modusbytte, formatbytte, malprioritet, lengdevalg, kopiering og at memory-only-variabler ikke lagres.

## CV-modus og formater (v0.11.8)

CV-vurdering har standardvalget choiceDefaults.handoff=false for kort og relevant vurdering. Dynamiske Word/PDF-formater må være rendret i DOM fra starten, men skjult når kun vurdering er valgt. Ved bytte til CV-utkast skal formatene vises og automatisk velges uten full ny rendering; ved bytte tilbake gjenopprettes tekst- og Markdown-valgene. Browserregresjonene verifiserer begge retninger.

## Utvidbare regresjonstester (v0.11.9)

Antall oppgavekort i den fullstendige oversikten kontrolleres mot faktiske oppgaver i prompts.json, ikke mot et hardkodet antall. Dette skal fremdeles oppdage utilsiktede duplikater, men godta nye bevisst publiserte oppgaver. Nettleserkjøringen kontrollerer både promptbiblioteket og alle øvrige sider på mobil og desktop.

## Bransjeanalyse og salgsprospektering (v0.18.39)

«Kartlegg markedet og finn nye kunder» er en egen oppgave med et annet sluttprodukt enn «Utforsk behov i en bransje» (typiske problemer) og «Analyser en kunde – Innsikt» (enkeltvirksomhet). Den gir et prioritert utvalg og en midlertidig ringeliste i KI-svaret. Bransje er eneste nødvendige felt; Norge er standard, mens geografi, segment, kundetype og faglig fokus er valgfrie felles variabler i `prompts.json`.

Malen må fungere med offentlig nettsøk alene. Kun en faktisk tilgjengelig, godkjent CRM-lesekobling i KI-verktøyet kan berike funn med relasjonsstatus. «Ikke undersøkt», «delvis undersøkt» og «ingen oppføring funnet i undersøkt CRM» må holdes fra hverandre. Ingen persistert kontaktbase, CRM-skriving, integrasjon eller sending inngår. Offentlig repo inneholder bare generisk metodikk, aldri CRM-uttrekk eller reelle ringelister.

## Markedskartlegging og valgfri ringeliste (v0.18.40)

«Kartlegg markedet og finn nye kunder» starter i det åpne markedet, ikke med CRM som inklusjonsfilter. Standard er 12–15 prioriterte virksomheter etter et bredere bruttosøk, med konkrete kjeder fra dokumentert signal til forretningsprosess, behovshypotese, datakrav, bistandstype og åpningsspørsmål. Sluttantall, segment, geografi, størrelse, faglig fokus, behovsgrunnlag og kvalifikasjonsgrad for kontaktpersoner er konfigurerbare. Foreslåtte verdier i tekstfelt er redigerbare via datalist. Ingen spesifikk virksomhet, CRM eller internt innhold er hardkodet.

Ringeliste er valgfri og på som standard; CRM-lesing er frivillig og av som standard. Skru av ringeliste for kort, rimeligere behovskartlegging uten personresearch. Grundig research er et eksplisitt valg, men den offentlige statiske portalen kan ikke starte Work, nettleser eller tilgangsstyrte verktøy automatisk. Dette må brukeren velge i KI-verktøyet. CRM kan leses med godkjente tilgjengelige tilkoblinger, men data eller kontaktbase skal aldri lagres i offentlig repo. Verifiser kildekvalitet og alder separat, og oppgi uverifiserte profiler, søkelenker og uavklarte ansettelsesforhold ærlig. Ingen CRM-skriving, varsler eller planlagte oppgaver.

Gjenbrukbar modell: choiceGroups med `control: select` vises som nedtrekksvalg, øvrige som radio. `items[].toggles` legger til datastyrte avkryssinger, `dependsOn` skjuler irrelevante valg når tilhørende toggle er av, og `choiceDefaults` gir standardsvar for oppgaven. Alle instruksjoner eies av prompts.json. Test editor, forhåndsvisning, kopiering, mobil/desktop og eksisterende oppgaver ved endringer.

## Biblioteksrevisjon og fleksibel markedsanalyse (v0.18.41)

Gjennomgang av alle 17 oppgaver beholdt de kanoniske kontraktene for variabler, kildebehandling, format, detaljnivå og kontekst. Faglige valg er fortsatt oppgavespesifikke, mens kontaktkanal deles nå av førstekontakt og oppfølging. `MØTELENGDE` er kanonisk for møtetid og workshopvarighet, med `VARIGHET` som alias og migrering av eksisterende sesjonsverdi. Andre nærstående felt med forskjellig faktisk formål beholdes separat; semantisk gjenbruk er viktigere enn færrest mulig variabelnavn.

Forslagsverdier er frivillige `variables[].suggestions`, ikke låste lister: brukeren kan velge eller skrive selv i 15 gjenbrukte felter. Geografivalgene er Hele Norge og utvalgte markedsområder rundt Oslo, Bergen, Stavanger, Trondheim og Kristiansand, samt større regioner. En by betyr også naturlig nærområde; Oslo inkluderer relevante steder i Akershus. Ingen organisasjon eller kontorstruktur nevnes i offentlig UI.

`choiceGroups[].customInput` beskriver et tilknyttet, validert tallfelt og et spesifikt alternativ i nedtrekkslisten. Markedsprompten har «Eget antall …»: feltet er synlig kun ved dette valget, og gjelder bare når det er aktivt. Eldre innlagt antall påvirker ikke standardvalgene. Utvidet research er et eksplisitt avkryssingsvalg med nøytral beskrivelse av verktøyfunksjoner; det er ikke et KI-plattformvalg. CRM-berikelse, ringeliste, videre kontekst og ren tekst er aktive i standardoppsettet; alle unntatt ren tekst kan slås av, og Markdown kan fortsatt velges. CRM er betinget av faktisk godkjent lesetilgang.

Valgene for format, detaljnivå, kontekst, firmamaler, datalagring og individuell redigering bruker eksisterende motor for samtlige 17 prompter. Ingen kommersielt fortrolige data, spesifikt CRM, agentplattform, kundeeksempler eller sensitive personlister legges til i repoet. Sjekk komposisjon, import av eldre alias, mobil/desktop, kopiering og reset før publisering.
