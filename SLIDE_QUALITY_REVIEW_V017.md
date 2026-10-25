# Presentasjonskvalitet – oppfølging v0.17.0 (24.10.2026)

## Grunnlag og prioritering

Denne runden viderefører [kritisk gjennomgang i v0.16.0](SLIDE_QUALITY_REVIEW_V016.md), men valgene er validert mot gjeldende `main`, de fem historiene og faktiske 16:9-skjermbilder. Hele biblioteket med 39 lysbilder er rendret i nettleser; de fire endrede lysbildene er også manuelt inspisert enkeltvis i både lys og mørk palett.

Faglig designprinsipp: Tegn sammenhengen som betyr noe. En klikkoppskrift skal ikke se ut som et resultat, og tre fagområder skal ikke framstå som tre uavhengige produkter hvis poenget er samspillet. Illustrative data er merket som eksempler. Ingen nye historier, oppdiktede effekttall, eksterne bilder eller falske kundereferanser er innført.

## Lysbildene som ble omarbeidet

| Slide-ID | Svakhet ved forrige rendering | Ny forklaringsform | Sjekk i historien |
|---|---|---|---|
| `portal-meeting-brief` | Tre like trinn fortalte hvor man klikker, men ikke hvilket resultat som blir nyttig. | Illustrativ portalvisning med redigerbar kontekst ved siden av et eksempel på kontrollert møtebrief. Overgangen går eksplisitt via godkjent ekstern KI – portalen kjører ikke modellen. | Samme rapporteringssignal som i åpningen; etterfølges av alternativet for selgere uten booket møte. |
| `portal-outcome` | Tretrinnslisten gjentok arbeidsprosessen uten å vise hva selgeren tar med videre. | Ett stort, konkret kundespørsmål utledet av et fiktivt signal, med en realistisk neste handling og tydelig forbehold om uavklart årsak. | Avslutter portalhistorien med en muntlig nyttig oppgave, ikke enda en produktomvisning. |
| `insight-three-disciplines` | Tre likestilte fagkort skjulte relasjoner og ga inntrykk av separate siloer. | Avklart data → analyse → ansvarlig beslutning; valgfri KI-støtte nedenfor hovedløpet. Illustrasjonen viser én mulig arbeidsmåte, ikke et obligatorisk arkitekturmønster. | Åpningen til markedshistorien gjør balansen mellom data, analyse og KI eksplisitt før markedssignalene introduseres. |
| `sales-next-step` | Generisk tretrinnsprosess viste ingen reell avgrensning. | Sammenlign samme nøkkeltall i to illustrative avdelinger, undersøker definisjon og dataflyt, med tydelig «innenfor nå» og «utsettes». | Gjør det fiktive kundecasets neste møte konkret uten å foregripe diagnose eller plattformvalg. |

## Teknisk og visuell kontroll

- Nye komposisjoner er separate `layout`-valg i eksisterende `slide-story-scenes.js` og CSS; ingen ny abstraksjon eller løsrevet figursamling.
- Tekst, spørsmål og eksempler ligger i `slides.json`. Historieoverganger og notater ligger i `pages.json`; stabile ID-er, kilde-ID-er og eksportløp består.
- Egen layout kan fungere uten ikoner. Kvalitetskontrakten sjekker nested `stages[].assetId` når ikoner brukes, og krever ikke meningsløse `figureAssetId`-referanser på tekst/diagram-scener.
- Etter første mørke rendering var tre originale ikoner for mørke. De følger nå lys/mørk forgrunnsrolle, og ny rendering ble inspisert. Denne feiltypen fanges ikke nødvendigvis opp av DOM-bundethetstest.
- Releasekrav: `node scripts/check.mjs`, 39 lysbilder i lys/mørk, eksportparitet, navigasjon, mobil og alle eksisterende nettleserkontroller.

## Neste prioritering – behold et snevert omfang

1. **`ai-pragmatic` (middels–høy):** Generisk «velg–test–lær». Dersom en ny revisjon gir et reelt eksempel på beslutningspunkt og verdikriterium, kan den være nyttig. Ikke kopier forgreiningen fra `market-next-moves` ukritisk.
2. **`seller-better-questions` (middels):** Tre klare spørsmål fungerer muntlig, men bildet forklarer lite ut over ordene. Test ett konkret kundescenario som viser hva svarene endrer.
3. **`portal-learning` (utført v0.17.8):** Tre menykort erstattet med ett reelt, kanonisk RAG-oppslag og to kildeeide kundespørsmål. Kontroll av visuell kvalitet og eksport dokumenteres i PR/issue #26.
4. **`market-customer-pressure` (utført v0.17.9, venter uavhengig visuell godkjenning):** Illustrative kundereplikker erstattet av Deloittes globale, selvrapporterte beredskapskontrast (42 % strategi; fire kvalitative operative områder). `market-priorities` beholder de illustrative kundesignalene. Tall er ikke en målt prosentdifferanse eller norsk kundediagnose.
5. **Leverandørarkitekturer (varierende):** Noe liten skrift i et møterom, men faglig distinkte diagrammer. Kontroller på storskjerm før du forenkler; fjern ikke reell teknisk substans for estetikkens skyld.

`portal-three-ways` kan fortsatt bruke tre like inngangskort: det er faktisk en meny med tre alternativer. `ai-thousand-analysts`, `ai-two-directions` og leverandørarkitekturene er ikke endret i denne runden. Ikke innfør nye lysbilder/decks bare for å øke variasjon. Gjør nye valg fra rendret 16:9 og historie, ikke fra en testscore.

## Metodiske referanser

Retningslinjene fra [Harvard Catalyst](https://catalyst.harvard.edu/writing-communication-center/visualize-science/slides/), [Carnegie Mellon](https://www.cmu.edu/student-success/other-resources/resource-descriptions/powerpoint-design.html) og [Microsofts veiledning om tilgjengelige presentasjoner](https://support.microsoft.com/en-us/accessibility/powerpoint/make-your-powerpoint-presentations-accessible-to-people-with-disabilities) er brukt som vurderingskriterier, ikke som en universell komposisjonsmal. De nye figurene inneholder illustrative eksempler, ikke forskningsbaserte årsakspåstander.

## Oppfølging v0.17.5 – `ai-pragmatic` (24.10.2026)

Før: Tre like steg («Velg ett behov», «Test med riktige data», «Lær – og bygg videre») uten eksplisitt sammenligningsgrunnlag, målemetode eller kontrollgrense. Etter: Fiktiv kundeservicesortering viser manuell arbeidsmåte ved siden av KI-forslag med menneskelig godkjenning, to sammenlignbare arbeidsflyter (henvendelse → menneskelig valg versus henvendelse → KI-forslag → menneskelig valg), felles mål (treff mot avtalt fasit og tid per henvendelse), avgrensede testdata og beslutningsport. Ingen effekt er påstått. ID, historieplassering og kildeautoritet beholdes; NIST AI RMF er kun rammeverkskilde for risikovurdering. Visuell godkjenning krever særskilt dokumentasjon fra faktisk rendering.


## Oppfølging v0.17.10 – `architecture-snowflake` (25.10.2026)

Før: Seks sentrale produktbokser stablet ikon, navn og forklaring vertikalt, med små forklaringer. «Shares / Openflow» blandet datadeling og kildeintegrasjon i samme inntaksboks. Etter (planlagt og implementert for separat C-review): De seks boksene har horisontal ikon–navn–kortforklaring, og inntak er presisert til Snowpipe (filer), Snowpipe Streaming (hendelser) og Openflow (koblinger). Modellering er kortet ned uten å fjerne dbt, Dynamic Tables eller Snowpark. Leverandørspesifikk tredeling, støttefunksjoner, logoer og varemerkeopplysning beholdes. Faggrunnlag: Snowflakes offisielle Snowpipe/Openflow/Dynamic Tables-dokumentasjon. **Visuell godkjenning og eventuell merge må dokumenteres separat med faktiske skjermbilder og tester.**

## v0.17.11 – salgsdekkets spørsmålspause

`sales-questions` (4/7) er en muntlig pause, ikke en kopi av `seller-better-questions`. Ett synlig fiktivt svar avklarer at godkjenning av månedsrapporten forsinkes; to åpne spørsmål og en tydelig begrensning hindrer at årsaken fremstilles som kjent. Scene `guided-question-pause` har tekst i `slides.json`, deck-notat i `pages.json`, semantisk CSS og eksisterende eksportvei. Kilder støtter intervjumetoden, ikke det fiktive caset. Visuell og teknisk kontroll dokumenteres i PR og issue #26.
