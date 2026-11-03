# Strukturell lysbilderevisjon – 3. november 2026

## Korrigering av forrige leveranse

Versjon 0.18.52 la designroller, farger, skygger og stil på alle 40 objekter. Det **endret ikke komposisjonene vesentlig** og var feilaktig omtalt som redesign av alle lysbilder. En pikselforskjell er ikke et redaksjonelt kvalitetsbevis.

I denne runden har sju lysbilder fått nye HTML/SVG-komposisjoner som faktisk viser den faglige sammenhengen på en annen måte. De beholder stabil ID, innholdseierskap, kilder, notater, nedlasting og CSS-skin-kontrakt. De øvrige 33 er **ikke** gitt en ny komposisjon i denne runden. Noen har allerede meningsbærende spesialscener; resten er prioritert for videre redaksjonelt arbeid.

## Individuell status

| Lysbilde | Status | Vurdering og konkret neste forbedring |
| --- | --- | --- |
| portal-opening | Gjenstår – middels prioritet | Mer prominent kundesignal og tydeligere nytte av portalen |
| portal-three-ways | Ny komposisjon | Tre selvstendige innganger som redaksjonell oppgaveliste |
| portal-meeting-brief | Gjenstår – høy prioritet | For mye minitekst; løft innholdet i møtebriefen |
| portal-customer-signal | Ny komposisjon | Kontinuerlig prosess fra symptom til neste spørsmål |
| portal-learning | Gjenstår – høy prioritet | Ett viktig kundespørsmål trenger større visuell plass |
| portal-market | Ny komposisjon | Fra markedsobservasjon til kundespørsmål |
| portal-outcome | Gjenstår – middels prioritet | Det viktigste spørsmålet bør få en større hovedflate |
| sales-opening | Gjenstår – middels prioritet | Kundens utsagn og konsekvens må dominere |
| sales-finance-case | Behold eksisterende scene | Tydelig illustrativt kundesitat |
| sales-hypotheses | Gjenstår – høy prioritet | Bytt tre like kort med faktisk årsakskart |
| sales-questions | Gjenstår – høy prioritet | Vis kundesvar og oppfølgingsspørsmål i en lesbar samtale |
| sales-discovery-prompt | Gjenstår – høy prioritet | Færre mikroelementer, tydeligere kvalitetskontroll |
| sales-next-step | Gjenstår – høy prioritet | Avgrenset undersøkelse og beslutning fremfor tre kort |
| ai-thousand-analysts | Behold eksisterende scene | Stor kapasitetsmetafor og vektorfigur |
| ai-two-directions | Ny komposisjon | Felles kapasitetsforsterker med to ulike premisser og utfall |
| ai-value-in-context | Behold eksisterende scene | Behov–Data–Kontroll i relasjonsfigur |
| ai-capacity-now | Gjenstår – høy prioritet | Vis kapasitetsøkningen opp mot faglig ansvar |
| data-meaning-customer | Behold eksisterende scene | Konkret eksempel på forskjellige definisjoner |
| ai-good-vs-fast | Ny komposisjon | Visuell ulikhet mellom velformulert svar og etterprøvbar kvalitet |
| ai-two-extremes | Ny komposisjon | To ytterpunkter rundt kontrollert læring |
| ai-pragmatic | Gjenstår – høy prioritet | Reell arbeidsprosess og kontrollsløyfe, ikke tre kort |
| ai-improve-data | Gjenstår – høy prioritet | La feilsignalet og faglig vurdering bli hovedhistorie |
| insight-value-chain | Gjenstår – høy prioritet | Vis gjensidige avhengigheter i stedet for fire bokser |
| insight-three-disciplines | Gjenstår – høy prioritet | Gå fra tre fagsøyler til ett konkret beslutningsbehov |
| risk-and-trust | Gjenstår – høy prioritet | En mer lesbar risikostige uten mikrotekst |
| seller-signals | Gjenstår – middels prioritet | Vis mer naturlig kundedialog |
| seller-better-questions | Gjenstår – høy prioritet | Samtaleprogresjon i stedet for tettskrevet tabell |
| seller-specialist | Gjenstår – høy prioritet | Vis reell overlevering mellom selger og fagmiljø |
| portal-purpose | Gjenstår – middels prioritet | Vis praktisk nytte, mindre pseudo-skjermbilde |
| architecture-conceptual | Behold eksisterende scene | Teknisk illustrasjon av dataflyt |
| architecture-modern | Behold eksisterende scene | Teknisk fordypning |
| architecture-ai | Behold eksisterende scene | Arkitektur for data og KI |
| architecture-snowflake | Behold eksisterende scene | Særegen Snowflake-arkitektur |
| architecture-fabric | Behold eksisterende scene | Særegen Fabric-arkitektur |
| architecture-databricks | Behold eksisterende scene | Særegen Databricks-arkitektur |
| market-why-now | Ny komposisjon | Nytt tempo må knyttes til vedvarende behov og forståelse |
| market-three-forces | Behold eksisterende scene | Dokumentert hovedtall og trender |
| market-customer-pressure | Behold eksisterende scene | Kildebasert kontrast med forbehold |
| market-priorities | Gjenstår – høy prioritet | Koble kundesignal og mulig faglig respons sterkere |
| market-next-moves | Gjenstår – middels prioritet | Beslutningsgren virker, men kan forenkles og forstørres |

## Varige krav til reell redesign

1. CSS-klasser, fargejusteringer, skygger, tynnere linjer og metadata teller ikke som strukturell redesign.
2. Beskriv ett hovedbudskap og hvorfor ny komposisjon gjør det enklere å forstå på noen sekunder. Behold sammenhengen mellom informasjonselementene, ikke bare dekorer dem.
3. Kontroller faktiske før- og etterbilder i 16:9, lys og mørk visning, mobil, vanlig Presenter og offline/nedlastet versjon. Visuelle tester supplerer, men erstatter ikke, redaksjonell vurdering.
4. Fagtekst og kilder skal fortsatt komme fra kanoniske data. Visningslaget tegner med HTML/SVG og semantiske CSS-roller, uten faste organisasjonsfarger eller kildetekst i SVG.
5. Ingen vesentlig informasjon må kreve animasjon. Alle eksportformater og bevegelse av gir identisk faglig innhold.
6. Endrede scener skal ha strukturtester som eksplisitt verifiserer ny visualisering og fravær av tidligere generisk kortoppsett.

Testene omfatter scripts/check-slide-narratives-browser.mjs og eksisterende bibliotek-, tema-, eksport-, navigasjons- og innholdskontroller.

## Gjenbruk fra fagpresentasjon – 0.18.55

Tre nye, selvstendige bibliotekobjekter (`ai-context-for-agents`, `ai-development-workflow`, `ai-natural-language-bi`) er laget ut fra fagbudskapene, ikke kopiert fra Google Slides. Ingen presseutklipp, konferansefoto, kundedata eller nye tredjepartsbilder er tatt inn. Eksisterende 40 lysbilder og fem kuraterte historier er beholdt siden de nye scenene dekker egne forklaringsbehov. Original HTML/CSS, autoritative JSON-felt, kilder og tidligere godkjente logoassets følger designkontrakten. Scenene må vurderes i faktisk 16:9-rendering, lys/mørk og eksport før endelig publisering.
