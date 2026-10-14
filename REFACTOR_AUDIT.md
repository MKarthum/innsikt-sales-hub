# Kartlegging før større innholdsrefaktorering

Dato: 14.10.2026. Basert på `main` v0.7.0 og den avgrensede fordypningsutvidelsen v0.8.0. Dette er **relevante, observerte svakheter og kontrolloppgaver**, ikke en full semantisk diff av alle tekster.

## Hva fungerer allerede

- Statisk HTML/CSS/JS uten unødvendig framework eller backend.
- Fagdomener er i separate JSON-filer, inkludert `sources.json`.
- Sideheaders og deler av presentasjonsinnholdet eies av `pages.json`.
- Noen visninger gjenbruker faktiske statistikkfelt og refererer til arkitekturskisser med ID.
- GitHub Actions, versjonskrav, lenkekontroller, enkel integritetstest og generert-HTML-røyktest finnes.
- Fordypningssiden v0.8.0 refererer til felles glossary-begreper, eksisterende diagrams og `sources.json`. Dette er et mønster å videreutvikle.

## Mangler og risikopunkter som må kartlegges grundigere

1. **Mangler stabile ID-er flere steder**: `learning.glossary` hadde tidligere ingen ID-er. v0.8.0 legger ID til noen begreper, mens resten ennå mangler. `technologies.tech` mangler stabile ID-er og kobles tidvis gjennom produktnavn. Sideoverskrifter bruker frie strenger som nøkler.
2. **Semantisk duplisering på tvers av dataeiere**: `pages.home`, `market.trends`, `learning.diagrams`, `technologies` og `pages.presentationDecks` har beslektede eller overlappende beskrivelser av KI, dataplattform, analyse og sikkerhet. Det er ikke identisk tekst overalt, men endringer kan likevel gi ulike versjoner av samme påstand.
3. **Faglig tekst i visningskoden**: `docs/assets/site.js` inneholder fortsatt tekstlige vurderinger, forklaringer, begrensninger og knappe-/seksjonstekster. `docs/assets/prompts.js` og `docs/assets/learning.js` har også en blanding av generiske UI-strenger og innholdsmessige forklaringer. Skillet er ufullstendig.
4. **Prompter gjentar generelle instruksjoner**: `prompts.json` eier de 14 promptene, men mye sikkerhets-, kilde- og kvalitetstekst er kopiert inn i flere prompter i stedet for å komponeres fra et felles, versjonert grunnlag. Gjentakelse kan være tilsiktet i en kopiert prompt, men **lagringen** skal være kanonisk.
5. **Slides kan drive bort fra faktagrunnlaget**: presentasjonsløpene refererer til diagram-ID-er og noen dynamiske data, men har også selvstendige oppsummeringer av produkter, markedsutvikling og risiko i `pages.json`.
6. **Kildeproveniens er knyttet til enkelte objekter, ikke alle påstander**. Skill source checked fra content reviewed og provider published. Skill særlig leverandørpåstander, faktiske markedsdata og våre hypoteser.
7. **Sidene og søk bygges delvis med manuelle lister**. En ny seksjon må legges til i meny, routing, data-loader, search index og tester. Det gir risiko for at en visning glemmes.
8. **Ikke-presentert innhold er mulig, men ikke systematisert**. Avklar synlighet vs. publisering vs. faktisk tilgang. All JSON i offentlig repo er offentlig, også når UI ignorerer felt.
9. **Automatiske kontroller fanger syntaks og enkle referanser, ikke semantisk duplisering**. Bygg statiske referansetester, ID-kontrakter, avhengighetskart og en rapport for potensiell semantisk overlapp til manuell redaksjonell gjennomgang.
10. **CSS vokser ved å legge på versjonsvise lag**. Designsystem, komponenter og responsive regler trenger kontrollert konsolidering – uten redesign eller endring av etablert UX.

## Ikke gjør dette i den avgrensede v0.8.0-utvidelsen

- Ikke flytt alt innhold til ny modell nå.
- Ikke introduser database, CMS, backend eller nytt rammeverk uten dokumentert nødvendighet.
- Ikke skriv om en historisk kilde eller produktpåstand bare for å få alt til å passe inn i en ny skjemaform.
- Ikke publiser en stor oppgradering i flere inkompatible delsteg.
- Ikke migrer intern informasjon eller skru av den offentlige nettsiden uten at brukeren har tatt beslutningen og målmiljøet er verifisert.

## Refaktoreringens mål

Et autoritativt og refererbart innholdslag med stabile ID-er, kort-/langform-varianter, kilde-/statusmetadata og eksplisitt presentasjonsbruk, der vi kan oppdatere én forklaring og få konsistent resultat i alle relevante visninger. Behold dagens statiske løsning og gode salgs-UX.
