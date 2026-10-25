# Internt innhold i Innsikt – distribusjons- og innholdskontrakt

## Prinsipp

Det offentlige GitHub Pages-repoet er fortsatt **100 % offentlig**. Interne kundehistorier, kundeidentiteter, løsningsbeskrivelser, arbeidsnotater eller annet konfidensielt innhold skal **aldri** legges inn i dette repoet, under \`docs/\`, i skjulte JSON-filer, som miljøvariabler i klientkoden eller i et offentlig JavaScript-bundle. Verken \`hidden\`-felter, UI-filter eller en hemmelig hash-rute er tilgangskontroll.

Den interne installasjonen skal kjøre **bak virksomhetens autentisering og autorisasjon**, og levere interne innholdspakker fra et autentisert endepunkt på samme origin. Alternativ privat pakkeløsning må tilfredsstille det samme kravet til reell server-/distribusjonskontroll. Ikke gjør en Claude-artefakt offentlig tilgjengelig dersom den inneholder intern informasjon.

### Nåværende offentlig deploy

\`docs/data/deployment.json\`:

\`\`\`json
{"mode":"public","protectedPresentationContent":null}
\`\`\`

Dette skal **ikke** endres i den offentlige branchen. Offentlig modus laster ingen interne endepunkter, og CI avviser utilsiktet interne lysbilder/historier og endring av denne konfigurasjonen.

### Intern deploy (i en egen beskyttet distribusjon)

Erstatt \`deployment.json\` bare i den interne bygg-/distribusjonspipelinen:

\`\`\`json
{"mode":"internal","protectedPresentationContent":"/internal/innsikt-content.json"}
\`\`\`

Endepunktet skal:
1. Kreve gyldig virksomhetsinnlogging **og** riktig autorisasjon for hver forespørsel. Kontroller begge på serveren; JavaScript-kontroll er ikke nok.
2. Returnere HTTP 401/403 uten data dersom tilgangen mangler. Bruk \`Cache-Control: private, no-store\`, korrekte CSP-/sikkerhetsheadere og ingen offentlig CDN-caching for privat innhold.
3. Være tilgjengelig under \`/internal/…json\` på samme origin. Klientkoden tillater ikke vilkårlig tredjeparts-URL.
4. Ikke inkludere internt JSON-innhold i GitHub Pages eller andre offentlige bygg-artefakter.
5. Registrere etter behov hvem som har tilgang. Ikke samle inn persondata uten formål, behandlingsgrunnlag, informasjon og tilgangsstyring.

Dersom den interne pakkefilen ikke kan lastes, avbryter klienten innlasting fremfor å late som den interne arbeidsflaten er tilgjengelig. Den offentlige løsningen påvirkes ikke.

## Datapakke, versjon 1

Objektet fra det beskyttede endepunktet inneholder følgende toppnivåer:

\`\`\`json
{
  "schemaVersion": 1,
  "classification": "internal",
  "sources": {},
  "slides": [],
  "presentationDecks": {},
  "customerStories": [],
  "solutions": []
}
\`\`\`

Dette er **et strukturelt eksempel uten interne data**. De fire samlingene og kilderegisteret forvaltes i interne datakilder med egne kontrakter, ikke i dette repoet.

- \`slides\`: de samme visuelle sceneformatene som i det offentlige biblioteket, med egne unike ID-er, \`classification:"internal"\`, \`scope:"shared"\` eller \`"story"\`, \`speakerBase\`, \`sourceIds\` og øvrig kanonisk lysbildeinnhold.
- \`presentationDecks\`: egne historier som refererer lysbilder via \`slideId\`, har \`classification:"internal"\`, narrativ/foredragsnotater og \`visualStyle\` (fortellerstyrt palett). En intern historie kan bruke delte offentlige lysbilder, men kan aldri bruke et historiespesifikt lysbilde som eies av en annen historie.
- \`customerStories\`: fremtidig register over autoriserte kundehistorier. Påkrevd minimum: egen \`id\`, \`title\`, \`classification:"internal"\`. Ytterligere felt (kundegodkjenning, bruksbegrensning, kontakt/eiere, kilder, anonymiseringsgrad, oppdateringsdato) skal defineres før faktiske data tas inn.
- \`solutions\`: fremtidig register over interne løsningsbeskrivelser, minimum egen \`id\`, \`title\`, \`classification:"internal"\`. Faglig eierskap, godkjent bruk og referanser skal defineres før realdata.
- \`sources\`: egne nøkkelbaserte referanser for intern bruk, bare HTTPS-lenker.

**Nåværende funksjonalitet:** Interne \`slides\` og \`presentationDecks\` samles automatisk med det offentlige biblioteket når en godkjent intern pakke leveres. \`customerStories\` og \`solutions\` har foreløpig en validert lagrings-/utvidelseskontrakt, men ingen egen side eller registreringsgrensesnitt. Dette skal utvikles i den interne applikasjonen når det finnes faktiske behov og data.

Objektnavn må være unike på tvers av offentlige og interne data. Interne pakker kan ikke overskrive offentlige tekster eller visninger. Klassifiseringen følger objektet, mens historier kan koble sammen felles lysbilder og interne lysbilder. Interne historier merkes tydelig i Presenter og lysbildebiblioteket.

## Eksport og viderebruk

Interne presentasjoner er merket **Internt** i Presenter. HTML- og PDF-eksport krever en eksplisitt advarsel/bekreftelse. Eksporterte HTML-filer er ikke beskyttet av innlogging etter nedlasting, og PDF er like lite teknisk beskyttet: eksport skal skje bare i tråd med virksomhetens rutiner.

Det er fortsatt ingen internt innhold i dette offentlige repoet. Å legge til nye felter eller en ny intern samling skal først få eget dataskjema, eier, klassifiseringsregel, visningsform og en test for at innhold ikke lekker inn i offentlig deploy.


## Oppdatering 25.10.2026 – kjerne og utvidelser

Utvidelse v2: schemaVersion 1 er fremdeles støttet. schemaVersion 2 gir tools, navngitte collections og navigation.groups/views med genererte #intern-ruter, uten å endre åpne sider. Kun deklarative felt og kontrollerte lenker; ingen kjørbar HTML/JS i internpakken. Se CORE_ORG_BOUNDARY.md for kildegrenser, oppgradering og sikkerhet.
