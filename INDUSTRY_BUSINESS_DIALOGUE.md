# Bransjedrevet kundedialog – analyse og redaksjonell modell

Oppdatert 14.10.2026 · offentlig arbeidsgrunnlag · innhold i versjon 0.9.2

## Hovedfunn

Den eksisterende portalen har verdifulle generiske innganger til økonomi, salg, HR, drift, kundeservice og ledelse, men disse er for lite koblet til beslutninger og arbeidsprosesser som er **spesifikke for hver bransje**. Det gjør at dialogen lett blir «hvordan fungerer rapportering eller dataplattform?» i stedet for «hvor taper dere tid, margin, kvalitet eller handlingsrom?». Begge spor trengs, men de har ulik funksjon.

Den nye inngangen bygger derfor på: **bransje → operativt problem → forretningseier → målt resultat → undersøkende spørsmål → mulig datagrunnlag → avgrenset pilot → tverrfaglig forbedring**. Teknologi og verktøy er mulige virkemidler, ikke premisser for samtalen. Ikke lov automatisk KI-prosjekt, dataplattform, gevinst eller leveransekapasitet.

## Bransjedekning og kildekritisk utvalg

Websteps egne offentlige beskrivelser av kundearbeid og kompetanse nevner særlig energi, olje og gass, bank/finans/forsikring, helse, offentlig sektor og industri/næringsliv. Se \`sources.json\`, \`webstep-sectors\`, og Websteps offentlige Q2-rapport 2026 (\`webstep-q2-2026\`). Disse seks områdene er merket **kjerne** i grensesnittet. Det er en bransjeklassifisering av offentlig omtale, ikke en rangering av inntekter eller pipeline.

Transport/luftfart og logistikk, handel/retail og havbruk/sjømat er **illustrative tillegg**. Disse er relevante norske verdikjeder og bidrar med konkrete innganger, men det hevdes ikke at Webstep har aktive oppdrag, prioritert satsing eller ferdige løsninger i alle disse bransjene.

| Bransje | Samtaler | Ulike innganger |
|---|---:|---|
| Kraft og nett | 4 | Transformerplassering og -størrelse, effekttopper, feilrisiko, nettilknytning |
| Olje, gass og offshore | 4 | Produksjonsstopp, energi, metanutslipp, offshore-logistikk |
| Bank, finans og forsikring | 4 | Hvitvaskingsovervåking, betalingssvindel, skadebehandling, porteføljelønnsomhet |
| Helse og omsorg | 4 | Pasientflyt, utskrivning, ventelister, bemanning |
| Offentlig sektor | 4 | Saksbehandling, tilsyn, feilutbetaling, tjenesteeffekt |
| Industri og produksjon | 4 | Stoppårsaker, kassasjon, vedlikehold, energibruk |
| Transport, luftfart og logistikk | 4 | Gate-tid, bagasje, catering, terminalbemanning |
| Handel og retail | 4 | Varetilgjengelighet og lager, kampanjelønnsomhet, svinn, omnikanal |
| Havbruk og sjømat | 4 | Lakselus, fôrutnyttelse, dødelighet, slakteplan |
| **Sum** | **36** | **9 bransjer** |

Eksemplene er **hypoteser for dialog og mulighetskvalifisering**. Internasjonale kilder viser at metodene brukes eller omtales, men ikke at de vil fungere hos en gitt norsk kunde. Særlig påstanden om at Norge «ligger bak» må forankres i sammenlignbare offentlige studier og konkret kundepraksis. Manglende lokal dokumentasjon innebærer at vi skal spørre, ikke konkludere.

## Samtalestruktur – slik selgeren bruker caset

1. **Forretningsresultatet.** «Hvilken beslutning eller operativ prosess skulle fungert bedre? Hvem har resultatansvaret?» Ikke begynn med dataarkitektur.
2. **Problemets størrelse.** «Hva betyr dette i ventetid, feil, kapasitet, pasientkvalitet, kroner eller risiko?» Etabler måleindikator og basislinje med kunden.
3. **Nåværende praksis.** «Hvordan prioriterer dere i dag, hvor oppstår friksjonen, og hvilke tiltak har dere allerede prøvd?»
4. **Data og beslutningsrom.** «Hva vet dere allerede? Kan data samles og brukes lovlig og meningsfullt? Hvem endrer prosessen når innsikten kommer?» Det kan være prosess- eller organisasjonsproblem uten et databehov.
5. **Minste gode neste steg.** Et begrenset felles arbeid, eksempelvis ett terminalledd, én kraftnettstasjon, én varekategori eller én type pasientforløp. Definer fagansvarlig, beslutningspunkt, arbeidsmengde og evaluering.
6. **Realisering og videre ansvar.** Dersom effekt er dokumentert, kan relevante Webstep-miljøer bidra med datagrunnlag, integrasjoner, modellering, analyse, prosess, UX, programvareutvikling, sikkerhet, KI og endringsarbeid. Fagkompetansen må bekreftes for det aktuelle oppdraget; dette er ingen ferdig leveransepakke.

### Eksempel: fra kortere flybakketid til mulig oppdrag

- **Dialoginngang:** «Hva forklarer forskjellen mellom planlagt og faktisk gate-tid?»
- **Driftsansvarlig:** operativ leder hos flyselskap, flyplass eller bakketjenesteleverandør; ikke automatisk CIO.
- **Konsekvens:** forsinket avgang, dårlig utnyttelse av fly/mannskap, økt omplanlegging.
- **Undersøk:** hendelsestidspunkter fra gate, mannskap, catering, renhold, tanking og bagasje, samt ansvar for koordinering.
- **Avgrenset leveranse:** samle og vurdere tidsstempler for én flytype eller rute, avdekke årsaker og teste hvordan bedre varsling påvirker beslutninger.
- **Videre løp:** beslutningsstøtte, operativ integrasjon og eventuelt prognoser – dersom datakvalitet og reell forbedring kan vises.
- **Sikkerhet:** ingen optimalisering som utfordrer sikkerhets- eller regulatoriske prosedyrer.

Lignende reiser kan beskrives fra lakselus til beslutningsstøtte for behandling, fra varetilgjengelighet til prognosebasert påfylling, og fra nettkapasitet til scenarioanalyse for investering. I alle tilfeller er det **kundens forretningsprosess og menneskelige fagansvar** som styrer.

## Kilder, hypoteser og kvalitet

- **Webstep / bransjer:** \`webstep-sectors\` og \`webstep-q2-2026\`; klassifisering av offentlig omtalte bransjer.
- **Transport:** IATA \`iata-ground\` og \`iata-future\`; digital bakkedrift/bagasje. Ikke dokumentasjon på en bestemt reduksjon av turnaround.
- **Kraft og nett:** NVE \`nve-grid\` og EU JRC \`jrc-energy\`; nettplanlegging og muligheter for datastøtte.
- **Olje, gass:** IEA \`iea-methane\`; metanmåling, ikke dokumentert utslippsreduksjon fra caset.
- **Finans:** Finanstilsynet \`fin-ros\`, \`fin-aml\`; krav, risiko og kontroll.
- **Helse:** NHS \`nhs-flow\`, \`nhs-discharge\`; eksempler fra engelsk helsetjeneste, ikke dokumentert norsk praksis.
- **Offentlig:** OECD \`oecd-fraud\`; muligheter og forvaltningsmessige begrensninger.
- **Industri:** EU JRC \`jrc-industry\`; muligheter for energi- og prosessforbedring.
- **Retail:** GS1 \`gs1-model\`; felles produktdata, ikke generell garanti for lageroptimalisering.
- **Havbruk:** Norges sjømatråd \`seafood-lice\`; problemområde og rammer for lusetiltak.

Alle kilde-ID-er eies av \`docs/data/sources.json\`. Kontroll- og publiseringsdato for kilden skal ikke brukes som dokumentasjon for at et foreslått case er bevist. Casenes \`evidence: "assessment"\` og \`reviewed\` angir redaksjonell vurdering, ikke validerte kundedata.

## Arkitektur, koblinger og gjenbruk

- \`docs/data/sales.json.industrySectors\` eier bransjebeskrivelse, kildehenvisninger, dialogåpning og sektor-ID.
- \`docs/data/sales.json.industryUseCases\` eier casets problem, rolle, spørsmål, mål, datahypotese, pilot, videre arbeid og forbehold. Hvert case peker til én eksisterende sektor og til eksisterende \`plays[].id\` gjennom \`playIds\`.
- \`docs/data/sales.json.industryJourney\` eier metodikken for samtaleløpet. Den brukes på tvers av bransjeoversikt og sektordetalj.
- \`docs/data/pages.json\` eier generiske sidetitler, etiketter og Presenter-komposisjon; Presenter peker til casets ID.
- \`docs/data/sources.json\` eier alle kilder. \`docs/assets/site.js\` og CSS eier utelukkende visning og navigasjon.
- \`#forretning\` blir inngangen til bransjer **og** beholder eksisterende generiske funksjonsbehov. \`#forretning/sektor-ID\` og \`#forretning/case-ID\` er stabile detaljer. Nye elementer er søkbare og deler Presenters kanoniske case.
- Ingen interne klientdata, faktiske kundecaser, tilbud, prisestimater eller udokumenterte partnerfordeler er lagt til.

## Faglige prioriteringer etter publisering

Test tre utvalgte caser per bransje med selgere og domeneeksperter; se om de kan gjennomføre samtalen uten en dataekspert. Skill svarene «kunden har problemet», «vi kan bidra» og «det foreligger budsjett og beslutning». Legg kun inn godkjente referansecaser med målt effekt og hjemmel i riktig internt miljø når portalen er flyttet. Deretter sammenlignes konkrete modenhetsindikatorer internasjonalt; dette skal ikke simuleres gjennom påstander om at Norge ligger etter.

## Teknisk verifikasjon

\`node scripts/check.mjs\` dekker stabil referansebruk, bransje-/case-ID-er, koblinger til salg, metadata, kilde- og sidekontrakter. \`scripts/check-browser.mjs\` utvides til sentrale sektor-/caseruter på desktop og mobil, samt Presenter, søk og kopiering. Manuell kontroll av faktiske kilder, tilgjengelighet og realisme kreves i tillegg; automatiserte tester beviser ikke at innholdet er bransjefaglig korrekt.
