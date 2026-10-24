# Vedlikeholdsrevisjon – Innsikt Sales Hub (24.10.2026)

## Vurdering

Løsningen har allerede et godt dataorientert fundament, og bør ikke bygges om til et tungt CMS. Hovedmanglene var redaksjonell styring av presentasjoner, komplett navigasjonskontroll og et ryddig kvalitetskriterium for gjenbruk av figurer. Dette er forbedret i v0.13.0.

## Gjennomgåtte områder

| Område | Status | Mekanisme og neste fokus |
|---|---|---|
| Innholdseierskap | God | Kanoniske datafiler og materialisering skiller innhold fra layout. Ikke skriv markedsfakta i visningskode. |
| Kilder | God, krever redaksjonell kontroll | Kilderegister og side-/slide-ID-er. Nye 2026-trender er kildebelagt på relevante bilder; kilder bekrefter ikke automatisk våre vurderinger. Revider volatile påstander jevnlig. |
| Lysbilder og figurer | Forbedret | Stabil slide-ID, gjenbruk gjennom visuell asset-ID, originalfigur, sentral rettighetsinformasjon og distinkte vendor-scener. |
| Historier | Forbedret | Fra åtte til fem med forskjellig jobb. Ny historie krever egen målgruppe, spørsmål, vending og ønsket handling. Ikke lag en variant som nytt kanonisk deck. |
| Navigasjon | Forbedret | Enhver detaljrute skal ha ekte foreldrelenke, riktig tittel, ARIA og test. Pensjonerte ID-er har redirect. |
| Tema og responsivitet | God | Semantiske fargetokens, samme lys/mørk-innstilling i bibliotek og Presenter, mobil/fullskjerm-tester. Fortsatt manuell visuell inspeksjon ved nye scener. |
| Prompt- og variabelstate | God | Eksisterende kontrakttester dekker lagringsgrenser, alias, reset, orphan-opprydding og escaping. Ikke utvid med persondata i offentlig distribusjon. |
| Offentlig/intern grense | Godt prinsipp, intern drift gjenstår | Public deploy avviser intern datakilde; intern tilgang krever virkelig autentisering, autorisasjon og serverbeskyttelse. Se INTERNAL_CONTENT_CONTRACT.md. |
| Sikkerhet og lisens | Godt utgangspunkt | Ingen interne kundedata, assetregister med opphav, logo-vilkår, MIT-lisens og hashkontroll. Sjekk lisens ved hver ny ekstern ressurs. |
| Testing og release | Forbedret | Version bump og assetversjoner, statisk kontrakt, dynamisk narrativtest, Chromium for alle aktive slides samt detaljnavigasjon i desktop/mobil. Testtellinger hentes fra datakilder fremfor faste tall. |

## Åpne, avgrensede forbedringspunkter

1. Portalpresentasjonen er en støtte til en live demonstrasjon, ikke en erstatning for faktisk gjennomgang av appen. En fremtidig snapshot-/interaktiv demoscene kan vurderes med vedlikehold og skjermbildeoppdatering i tankene.
2. site.js er fortsatt et relativt stort visnings-/ruteansvar. Det er ikke grunn til total omskriving nå, men nye domener bør legges i egne mindre renderer-moduler og ikke utvide en global switch ubegrenset.
3. Ikke la biblioteksøk bli synonymt med aktive presentasjonsløp: delte lysbilder kan stå uten historie, men bør ha bevisst faglig formål.
4. Neste utvidelse av interne kundecaser må legge på innholdsansvar, godkjenning, klassifisering og tilbakekall på serversiden før ekte data vises.
5. PowerPoint-nedlasting og redigering i eksterne verktøy er fremdeles separat funksjonalitet; den nettbaserte scenevisningen er primær. Ikke lov full PPTX-paritet uten egen eksporttest.

## Utført denne runden

Fem redaksjonelt forskjellige historier, fem nye markedsslides, ti originale SVG-ressurser, 29 assetforbedrede scener, to dupliserte konklusjoner faset ut med redirect, oppdatert route-/story-/assetregler og dokumentert per-slide-review av alle aktive objekter. Gjenbruk skjer på riktig nivå, uten å tvinge alle leverandørarkitekturer eller historier inn i samme mal.

Arbeidsinstruks: Les AGENTS.md, START_HERE.md, NAVIGATION_CONTRACT.md, STORY_EDITORIAL_CONTRACT.md og PRESENTATION_ARCHITECTURE.md før større endringer. Kjør node scripts/check.mjs samt Chromium-suitene og se skjermbilder før publisering.
