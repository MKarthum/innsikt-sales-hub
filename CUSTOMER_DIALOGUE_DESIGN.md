# Kundedialog – produktbeslutning og kontroll (24.10.2026)

## Problemet og valget

Den gamle siden blandet en avkryssingsliste og ferdigforklarte scenarioer. To personer kunne lese svarene før de begynte, og antall avhukinger ga et skinn av kvalifisering. En statisk veiledningsside er ikke i seg selv en øvelse.

Tre vurderte alternativer:
- A: Én lang forbedret side ville være enkel å finne, men blandet oppgaver med svært forskjellig tempo og informasjon.
- B: To nye selvstendige toppnivåer gir hver oppgave klar retning, men utvider menyen og deler beslektet faginnhold.
- **C (valgt): Ett eksisterende menypunkt, to innganger med separate hash-ruter.** '#kundedialog' består, '#kundedialog/trening' og '#kundedialog/stotte' er tydelige selvstendige brukeroppgaver. Øvelser har direkte, delbare rollelenker.

## Øvelsens modell

1. Velg ett av åtte fiktive scenarioer. Vanskelighetsgrad og mål vises før start.
2. To rollekort deler nødvendig informasjon; selgerkortet viser ikke kundens kontekstuelle avsløringer eller eksempelspørsmål. Kunden får realistisk åpning, bakgrunn og mulige opplysninger som svar på utforskende spørsmål.
3. Rollekortene er separate ruter, ikke adgangsbeskyttet informasjon. Ved én skjerm leser kunden sitt kort før skjermen leveres tilbake. Ved to enheter kan kundelenken deles.
4. 2 minutter forberedelse + 8 minutter samtale + 5 minutter felles refleksjon. Ingen poengscore, timer, notatlagring eller backend. Det er samtalen som er aktiviteten.
5. Evalueringen ber selgeren reflektere først; de skjulte opplysningene og eksemplene vises først etter eksplisitt åpning. Repetisjon og rollebytte gjøres gjennom lenkene.

Åtte eksisterende stabile scenario-ID-er og koblinger til salgsinnganger er bevart. Ny pedagogisk modell eies av 'sales.json.scenarios[].training', mens side-UI og metode eies av 'pages.json.dialogueUi'. Åpne scenarioer er hypotetiske og aldri kundereferanser.

## Samtalestøtte

Ingen avhuking eller falsk kvalifiseringsscore. Seks sentrale forhold fra 'pages.json.qualification.items' presenteres med konkrete oppfølgingsspørsmål i 'qualification.followUps'. Møtebrief, salgsinnganger og forretningsbehov er lenker til eksisterende eiere; ingen parallelle prompt- eller fagmodeller.

## Prinsipper brukt

- Praktiske rolleoppgaver med forberedelse, avgrenset tid, samtale og strukturert etterarbeid: University of Glasgow, *Experiential Learning Guide: Roleplay*, https://www.gla.ac.uk/myglasgow/learningandteaching/studentskills/enhance/guides/experientiallearningguideroleplay/
- Gjentatt målrettet trening med oppgave og informativ tilbakemelding, uten løfte om at metoden automatisk gir effekt: Ericsson, Krampe og Tesch-Römer (1993), *The Role of Deliberate Practice*, https://doi.org/10.1037/0033-295X.100.3.363
- Unngå ledende spørsmål og en mekanisk behovsintervjuliste: Scott Edinger, *Sales Reps, Stop Asking Leading Questions*, Harvard Business Review (2017), https://hbr.org/2017/03/sales-reps-stop-asking-leading-questions

## Akseptanse og begrensninger

Automatisk test 'check-dialogue.mjs' verifiserer struktur og at selgeren ikke ser kundens skjulte opplysninger. Chromium-kontroll i 'check-browser.mjs' følger alle tre pålagte brukerreiser på mobil og desktop, og kontrollerer delbar lenke, evaluering og navigasjon. Fremtidige scenarioer trenger bare eksisterende treningsskjema. Ruter: tren-SCENARIO_ID, kunde-SCENARIO_ID, evaluer-SCENARIO_ID.

En reell ferdighetstest må fortsatt gjøres med nye og erfarne selgere, særlig for å vurdere troverdighet, forberedelsestid og om øvelsene faktisk gjentas. En browser-test kan ikke bevise læring. Ingen faktisk kundedata eller private notater brukes.