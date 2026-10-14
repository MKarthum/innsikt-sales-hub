# Refaktorering – plan og kartlegging (14.10.2026)

Utgangspunkt: `main` på `9844c6f`, v0.8.0. Egen gren, ingen endringer i produksjon før kontrollene består.

## Observerte utfordringer

- Ufullstendige ID-er i ordlisten, ingen ID-er i teknologikartets `tech`-liste.
- Overlappende faglige forklaringer i `pages.presentationDecks`, ordliste, diagrammer og marked.
- Gjentatte kilde-, usikkerhets- og personverninstruksjoner i 14 prompter.
- Fagtekst hardkodet i `site.js`; søkevisningen har egen manuell indeksering.
- Ikke alle fakta og leverandørpåstander har tydelig faglig kontrolltid og evidensstatus.
- Rene visningsetiketter, sideunike spørsmål og pedagogiske eksempler er ikke automatisk duplikater.

## Implementering

1. Referansebaserte innholdselementer i dagens JSON-domener; stabile ID-er, tekstvarianter og resolusjon ved lasting.
2. Flytt påviste duplikater fra slides, prompter og visningskode til riktig autoritativ eier.
3. Styrk kilder og status for dokumenterte fakta, leverandørbeskrivelser, hypoteser og åpne spørsmål.
4. Kontroller manglende ID-er, referanser, kopier, foreldreløse visninger, kildegrunnlag og syntaks.
5. Verifiser minst tre visninger etter én kanonisk endring, samt samtlige sider, slides og prompter.
6. Behold statisk nettside, brukerflyt og hovedfortelling. Oppdater dokumentasjon, versjon og tester samlet.

Arbeidet lagres fortløpende i GitHub. PR gjennomgås før eventuell merge.
