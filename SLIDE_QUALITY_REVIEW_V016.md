# Kritisk presentasjonsrevisjon v0.16.0 – 24. oktober 2026

## Metode

- Oppdaterte `main` ble lest, inkludert kontrakter, hele `slides.json` og alle fem historiene i `pages.json`.
- Samtlige 39 lysbilder ble rendret som 16:9 i Chromium, samlet i kontaktark og vurdert med hensyn til 3–5-sekunders forståelse, sammenheng og variasjon. I tillegg ble objektene kjørt gjennom lyse og mørke layoutkontroller.
- Prioriteringen nedenfor er en egen vurdering, ikke videreføring av grønn test eller tidligere AI-audit. Rekkefølgen bygger på svakhet, historisk betydning, forbedringspotensial og endringsrisiko. En teknisk test dokumenterer ikke at et bilde er godt.
- Presentasjonene ble lest som historier: «Hvorfor Innsikt?» beholder det sterke tankeeksperimentet og en tydelig vei videre; «Marked og retning» hadde flest generiske gjentakelser; «Vis løsningen» var for ofte en omvisning med tre kort; «Kundeeksempel» manglet et eksempel på selve promptutbyttet; dataarkitektur hadde mer relevante forskjeller mellom figurene.

## Prioriterte svakheter og utførte valg

| Prioritet | Lysbilde | Observasjon ved rendring | Beslutning |
|---|---|---|---|
| 1 | `sales-discovery-prompt` | Tre prosesskort gjentok en oppskrift, men viste ikke hva prompten tilfører i det fiktive caset. | **Omarbeidet:** Konkret kundesignal → godkjent KI-verktøy → tre mulige møtespørsmål. Et menneske kvalitetssikrer; ingen diagnose. |
| 2 | `risk-and-trust` | Tre sidestilte oppgaver sa ingenting om den proporsjonale kontrollen som tittelen lovet. | **Omarbeidet:** Stigende konsekvens og tilhørende kontroll i tre illustrative situasjoner. Ikke formell risikoklassifisering. |
| 3 | `market-priorities` | Nesten identisk tre-kort-design som åpningsbildet om fagområdene. | **Omarbeidet:** Tre illustrative kundesignaler koblet til første faglige inngang; eksplisitt at kompetansene ikke er siloer. |
| 4 | `portal-market` | Tre spørsmål i like bokser forklarte ikke forskjellen på trend og kunderelevans. | **Omarbeidet:** To motstilte forhold: markedsobservasjon og behovet for avklaring med kunden. Eksisterende scene gjenbrukt. |
| 5 | `market-next-moves` | Samme tretrinnsmetode som andre lysbilder, uten et reelt beslutningspunkt. | **Omarbeidet:** Resultat av en avgrenset test leder til enten vurdering av utvidelse eller justering/stopp. Eksisterende forgreiningsscene gjenbrukt. |
| 6 | `portal-meeting-brief` | Klart men generisk tretrinnsforløp. | **Beholdt foreløpig.** En framtidig versjon bør bruke et kontrollert, oppdatert eksempel fra den reelle portalen; bør ikke lage en falsk skjermdump. |
| 7 | `portal-outcome` | Fornuftig konklusjon, men repeterer tidligere tretrinnsbudskap. | **Beholdt.** Kan senere gjøre neste møtesituasjon til et enkelt, konkret resultat; krever samordnet endring av portalhistorien. |
| 8 | `portal-learning` | Tre like kort er en navigasjonsmeny, ikke en forklaring. | **Beholdt.** Funksjonen er likevel tydelig: tre frivillige fordypningsnivåer. Ikke prioritert foran feiltolkbare faglige lysbilder. |
| 9 | `ai-pragmatic` | Et generelt «velg–test–lær»-forløp med lite eksempel. | **Beholdt.** Dets plass i «Hvorfor Innsikt?» er riktig, mens en bedre figur bør vise en testbar beslutning før eventuell endring. |
| 10 | `insight-three-disciplines` | Tre like fagkort viser ikke samspillet særlig godt. | **Beholdt.** Den åpner markedshistorien ryddig; revisjon bør bygge et mer faglig treffende samspill, ikke bare dekorative overlappende sirkler. |
| 11 | `seller-better-questions` | Tre kort er lettleste, men den logiske rekkefølgen er implisitt. | **Beholdt.** Spørsmålene kan presenteres direkte. Lavere gevinst av omtegning nå. |
| 12 | `sales-next-step` | Avklaringen presenteres som et standard prosessløp. | **Beholdt.** Kan forbedres ved å vise det konkrete minimumsmandatet for møtet, men det krever mer presis avgrensning i historien. |

## Resultat og redaksjonell disiplin

- Fem eksisterende lysbilder er reelt endret, ingen nye IDs, historier eller eksterne figurer. `sales-discovery-prompt`, `risk-and-trust` og `market-priorities` fikk egne, dataeide komposisjoner. `portal-market` og `market-next-moves` bruker eksisterende komposisjoner til nye forklaringsformer.
- Nødvendig tekst og eksempler ligger i `slides.json`, ikke i JS/CSS. Historienes overgangsnotater er justert i `pages.json` for å bevare dramaturgien. Det fiktive eksemplet framstår som fiktivt, og portalen påstås ikke å kjøre KI selv.
- Sterk åpning med tusen analytikere, todelt mulighet/feil, begrepsforklaringen for «kunde» og de tre distinkte leverandørarkitekturene er bevisst ikke redesignet. De er mer spesifikke enn de generiske bildene som ble prioritert.
- Videreføring: Prioriter særlig `portal-meeting-brief`, `portal-outcome` og `insight-three-disciplines` før antall presentasjoner eller komponenter utvides. Ved en senere iterasjon bør hvert enkelt forslag prøves visuelt i aktuell fortelling før det aksepteres.

## Prinsipper og kilder

- Garner & Alley (2013), *How the design of presentation slides affects audience comprehension*, Penn State: https://pure.psu.edu/en/publications/how-the-design-of-presentation-slides-affects-audience-comprehens/
- Fiorella & Mayer (2021), *Principles for Reducing Extraneous Processing in Multimedia Learning*, Cambridge University Press: https://doi.org/10.1017/9781108894333.019
- Harvard Catalyst, *Slides*: https://catalyst.harvard.edu/writing-communication-center/visualize-science/slides/
- De enkelte tekniske påstandene fortsetter å eie relevante kilde-ID-er gjennom `slides.json` og `sources.json`. Diagrammene er redaksjonelle illustrasjoner, ikke empiriske datasett.
