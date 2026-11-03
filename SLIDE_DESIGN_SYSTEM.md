# Designsystemet for lysbildebiblioteket

Gjeldende kontrakt for alle selvstendige lysbilder i Innsikt. Les sammen med \`CONTENT_CONTRACT.md\`, \`PRESENTATION_ARCHITECTURE.md\`, \`THEME_CONTRACT.md\` og \`STORY_EDITORIAL_CONTRACT.md\`. Dette er en **bindende kvalitetsport**, ikke en liste med pynteregler.

## Mål

Lysbildene skal oppleves som en serie bevisste, redaksjonelle komposisjoner, ikke en samling like kort. Hvert lysbilde skal kunne deles eller settes inn i en annen historie uten å forutsette foregående lysbilder. Innholdet skal kunne få en annen organisasjons visuelle identitet ved å endre **kun CSS-skinet**. Det må aldri kreve omskriving av JSON, kopiering av visningskomponenter eller endring av SVG-illustrasjoner.

## Obligatoriske regler

1. **Ett hovedpoeng.** Tittelen er en påstand eller et eksplisitt spørsmål, ikke bare et emne. Svaret på «Hva skal publikum forstå eller gjøre etter dette?» skal være tydelig. Gi eventuelle forbehold i lysbildet eller notatene; ingen påstand skal bli sterkere av designet enn den kan dokumenteres.
2. **Ett selvstendig objekt.** Behold stabil ID, tittel, scope, topic, eventuelle datakoblinger, \`speakerBase\` og \`sourceIds\`. Historier eier bare rekkefølge, dramaturgi, overgang og eventuelle plasseringsnotater. Ikke kopier et lysbilde for å få en annen stil.
3. **Design ut fra budskapet.** Hvert objekt i \`slides.json.items[]\` må ha \`design: { archetype, focus, version: 2 }\`. \`archetype\` er en av \`hero\`, \`workbench\`, \`choice\`, \`journey\`, \`dialogue\`, \`evidence\`, \`system\`, \`decision\`, \`contrast\`, \`blueprint\`. \`focus\` peker på den faglige hovedrollen: for eksempel \`quote\`, \`metric\`, \`flow\`, \`question\`, \`artifact\`, \`comparison\` eller \`platform\`. Kombinasjonen velges bevisst per lysbilde, aldri tilfeldig.
4. **Gjenbruk strukturer, varier uttrykket.** Eksisterende scenefamilie eier den semantiske figuren. Den nye \`slide-editorial-system.css\` eier redaksjonell tone og kontrast. Én scene kan få forskjellig uttrykk uten at fagtekst eller grafikk dupliseres. Tre kort er bare riktig når innholdet faktisk er tre sammenliknbare alternativer.
5. **Et tydelig visuelt fokus.** Fremhev det som betyr noe: det store tallet, kundens utsagn, det avgjørende spørsmålet, beslutningen, sammenhengen eller plattformens rolle. Unngå lik styrke på alle deler av figuren. Farger, skygger og ringformer skal bidra til hierarki, ikke bare dekor.
6. **Tekst skal være lesbar.** Prioriter en tydelig tittel, en avgrenset figur og eventuelt én konklusjon. Flytt utredning til notatene. Kontroller 16:9 i vanlig visning, bibliotek, fullskjerm og nedlastede filer. Ingen klippet tekst, kolliderende elementer eller dekor over tekst. Arkitekturdiagrammer kan ha større informasjonsmengde, men krever lesbar progresjon.
7. **Én kilde til farge.** Ingen organisasjonsspesifikke hexfarger eller produktfarger i redaksjonell CSS/SVG. Bruk bare \`--pres-bg\`, \`--pres-fg\`, \`--pres-muted\`, \`--pres-accent\`, \`--pres-warning\` og uttrykk som er avledet fra disse (\`color-mix\`). Disse følger de dokumenterte \`--slide-strong-*\` og \`--slide-light-*\`. Ekte produktlogoer beholder sine rettmessige merkevarefarger på nøytral flate. Enhver kopi kan erstatte paletten med et CSS-skin uten å miste illustrasjonen.
8. **Ingen informasjon i bildepiksler.** Diagrammer bygges med tekst/HTML/SVG og innhold fra kanonisk JSON; ikon-ID-er tilhører assetregisteret. Et dekorativt bilde kan aldri være eneste bærer av fakta. Ingen eksterne fonter, tidsstyrte nettverkskall eller tredjepartsbilder er nødvendig for å vise lysbildet.
9. **Bevegelse er frivillig.** Oppbyggingsanimasjoner gir rytme, men aldri nødvendig informasjon. \`Bevegelse: På/Av\` er uavhengig av lyst/mørkt tema. \`prefers-reduced-motion\`, statisk bibliotek, nedlastet PNG/JPG/PDF/PPTX og utskrift viser sluttbildet uten å kreve animasjon. Historienes overganger kan være \`fade\` eller \`reveal\`.
10. **Teknisk portabilitet.** \`slideWithDesign\` merker scene-roten med \`data-editorial\` og \`data-design-focus\`. Innholdet oppgis aldri som CSS \`content:\`, og CSS behøver ikke kjenne objekt-ID-en. Bibliotek, Presenter, HTML-eksport og enkeltlysbilde-eksport bruker samme renderer. Organisasjonens egen CSS lastes etter kjernens stilark og følger eksisterende \`data-innsikt-skin\`-kontrakt.
11. **Tilgjengelighet og relevans.** Kontrast for normal/stor tekst, tydelig fokus, bokmål og korrekt fortelling står over effekter. Ingen flimmer eller påtvunget animasjon. Leverandørpåstander må fortsatt være kildebelagt og skilt fra vår tolkning.
12. **Revisjon av faktisk resultat.** Sammenlign skjermbilder før/etter for hele biblioteket. Kjør syntetisk og nøytralt skin, lys/mørk, begge mobilretninger, kontroller av kilde/tekst, offline-presentasjon, PNG/JPG/PDF/PPTX og alle historier. Visualisering må vurderes redaksjonelt; grønn CI er nødvendig, ikke tilstrekkelig. Før publisering: \`node scripts/check.mjs\`, \`node scripts/check-slide-editorial-browser.mjs\`, øvrige nettlesertester samt en gjennomgang av 40 skjermbilder.

## Sammenhengen mellom data og visning

| Nivå | Eier | Ansvar |
| --- | --- | --- |
| Budskap og bevis | \`slides.json\`, relevante domenefiler, \`sources.json\` | Én autoritativ fagtekst, noter og kilde |
| Visuell intensjon | \`slides.json.items[].design\` | Rolle og fokus for hvert lysbilde |
| Figur / domenerenderer | \`slide-visuals.js\`, \`slide-story-scenes.js\`, \`architecture-visuals.js\`, \`vendor-architectures.js\` | Form og semantisk sammenheng, ikke organisasjonspalett |
| Redaksjonelt uttrykk | \`slide-editorial-system.css\` | Typografi, hierarki, flater og valgfri bevegelse |
| Organisasjonsidentitet | Organisasjonens eget CSS-skin | Offentlige tema- og fargeroller, uten datakopiering |
| Fortelling | \`pages.json.presentationDecks\` | Kontekst, sekvens, overgang og plasseringsnotat |

## Særlig om de ti designrollene

**Hero** samler oppmerksomheten om én stor påstand, ett sitat eller en illustrert metafor. **Workbench** viser fra input til et faktisk artefakt. **Choice** lar alternativene sammenlignes på like premisser. **Journey** tegner en progresjon og gjør endepunktet tydelig. **Dialogue** skiller kundens stemme fra spørsmål/svar/faglig slutning. **Evidence** løfter dokumenterte observasjoner med kontekst og forbehold. **System** viser hvordan kapabiliteter virker sammen, ikke løsrevne kort. **Decision** gjør neste valg eller avgrensning til høydepunktet. **Contrast** viser to ulike utfall/premisser uten falsk likeverdighet. **Blueprint** er en teknisk modell med tydelig dataflyt, men ikke et generisk dashboardskall.

Hvert enkelt objekt må begrunnes gjennom klassifiseringen i \`slides.json\`. Nye designroller krever en ny semantisk behovsbeskrivelse, implementasjon og en test. Ikke innfør tilfeldige varianter eller spesialfarger bare for å unngå gjentakelse.

## Regresjonstester

\`scripts/check-slide-design-system.mjs\` håndhever alle aktive lysbilders metadata, gyldige rollenavn, original kilde- og note-autoritet, styling uten faste merkefarger, innlasting i web/HTML-eksport og at en ny scene ikke ligger utenfor kontrakten. \`scripts/check-slide-editorial-browser.mjs\` kontrollerer per lysbilde at klassifiseringen faktisk er overført til scenen, at lys/mørk og alternativt skin virker, at figurer ikke klippes, og at bevegelse kan slås helt av. \`check-library-v1-browser.mjs\` rendrer hele biblioteket i tillegg; \`check-presentation-motion-browser.mjs\` kontrollerer eksisterende animations-/overgangskontrakt og offline-eksport.

**Redaksjonell kvalitetsport:** Et objekt kan ikke godkjennes bare fordi det er pikselforskjellig fra forgjengeren. Det må være lettere å forstå budskapet på noen sekunder. Hvis et lysbilde er informasjonsrikt av faglige grunner, er tydelig lesbarhet viktigere enn dramatiske effekter.


## Skjerpet kontroll: faktisk komposisjon, ikke ny pynt (v0.18.53)

En ren endring i palett, lys/mørk, skygger, border-radius, aksentstreker eller `design.archetype` **kan ikke rapporteres som en fullført redesign**. Før en slide markeres ferdig må den viktigste faglige sammenhengen tegnes om der den gamle komposisjonen ikke formidler budskapet godt nok. Kontroller visuelt at den nye scenen er mer forklarende, ikke bare annerledes. Følg oversikten per lysbilde i `SLIDE_REDESIGN_AUDIT_2026-11-03.md`.

Nye dataeide scenevarianter må teste eksplisitt at den nye HTML/SVG-strukturen finnes, at den gamle generiske kortstrukturen ikke gjengis, at synlig tekst eies av JSON, og at lys/mørk, kopiskin, statisk eksport og mobil fullskjerm fungerer. `scripts/check-slide-narratives-browser.mjs` håndhever denne kontrakten for de første sju. Andre lysbilder forblir åpne arbeidsoppgaver til de faktisk har fått en redaksjonell vurdering og eventuell ny komposisjon.
