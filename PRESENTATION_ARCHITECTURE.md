# Presentasjonsarkitektur – gjeldende kontrakt v0.13.0

Dette dokumentet beskriver **nåværende** implementasjon. Historiske iterasjoner er erstattet av denne kontrakten. Bruk også STORY_EDITORIAL_CONTRACT.md, NAVIGATION_CONTRACT.md og SLIDE_EDITORIAL_AUDIT_2026-10-24.md.

## Kanoniske nivåer

- docs/data/slides.json: Ett lysbilde per stabil ID. Eier fagtekst, sceneparametere, speakerBase, kilde-ID-er og eventuelle figur-ID-er.
- docs/data/pages.json.presentationDecks: Kuraterte historier med egen målgruppe, dramaturgi, beats, rekkefølge, overgangsnotater og fargeplan. Ikke dupliser lysbildeinnhold her.
- docs/data/visual-assets.json og docs/assets/library/: Ett sentralt register over leverandørlogoer, lisensierte eksterne bilder og egne SVG-figurer. Ett asset kan oppdateres uten å redigere alle lysbilder.
- docs/data/architecture-profiles.json: Konkrete generiske og leverandørspesifikke arkitekturprofiler.
- docs/assets/slide-model.js: Ren logikk for oppslag, bruk i historier, notes-komposisjon og temavalg.
- docs/assets/slide-visuals.js og docs/assets/slide-visuals.css: Scenefamilier og elementplassering for redaksjonelle lysbilder. Motivet kommer fra asset-ID.
- docs/assets/architecture-visuals.js og vendor-architectures.js: Ulike arkitekturscener. Del komponenter der de faktisk er like, men ikke tving leverandørene inn i samme layout.
- docs/assets/site.js: Library, Presenter, navigasjon og route-handling. Tekster og kilder skal komme fra datafiler.
- docs/assets/presenter-export.js: HTML/PDF, med lokale figurer innebygd i portable filer.

## Fem distinkte historier

1. Hvorfor Innsikt? – overordnet faglig sammenheng og motivasjon.
2. Innsikt, marked og veien videre – markedstrender, behov og strategisk fokus.
3. Vis løsningen – konkret oppgaveorientert demonstrasjon av portalens verdi.
4. Kundeeksempel – ett fiktivt problem og kvalifisering før teknologivalg.
5. Dataarkitektur – valgfri teknisk fordypning, ikke generisk salgsforedrag.

De tidligere fire overlappende kortversjonene/pilotene er ikke lenger separate dekk. De gode lysbildene er beholdt som frittstående objekter.

## Innhold og visuell kvalitet

En story er ikke et løp som opprettes fordi biblioteket tilbyr komposisjon. Målgruppe, spørsmål, vendepunkt, effekt og kilder skal begrunne hvert presentasjonsløp. Ikke legg på et nytt løp hvis det bare er en kortere eller omstokket versjon av samme historie.

Ett lysbilde skal ha ett hovedbudskap, lettlest komposisjon og relevante notater. Bruk egne SVG-figurer for å løse faktiske forklaringsbehov, ikke bare for å fylle tomrom. For felleslister kan itemAssetIds brukes, for prosesskjeder stepAssetIds, og for sentrale åpninger figureAssetId. Disse må referere et kanonisk objekt med dokumentert opphav og rettigheter.

Bilder og leverandørlogoer lagres lokalt med rettighetsinformasjon. Eksterne illustrasjoner må ha en gyldig lisens. Leverandørens logo kan identifisere produktet, men bruk betyr ikke partnerskap eller godkjenning. Kilder legges på relevante lysbilder; vises på selve bildet bare om en sitat-/figurkontrakt krever det.

## Visningskontekst er ikke lysbildeinnhold

Biblioteket viser alltid et selvstendig lysbilde uten nummer. Historier eier sekvens og beregner nummer fra gjeldende plassering; presentatøren kan slå nummer av/på for visning og HTML/PDF-eksport. Paginering i navigasjonskontrollene vises uavhengig av denne innstillingen. Nummerering **inne i** figurer, arbeidsflyter og spørsmål er faglig innhold og skal ikke påvirkes. Fortellingsstyrt tema, placement-notater og historieoverganger eies av deck, ikke av det felles lysbildet. Ikke utled bibliotekets nummer eller historietilhørighet fra første forekomst i en historie. Test bibliotek, detaljside, fullskjerm, Presenter, tema og offline-eksport sammen.

## Tema og portabilitet

Lys visning er standard. Presenter og biblioteket bruker ett delt tema-valg, med Mørk eller Fortellingsstyrt som alternativer. Fargene styres med kontrast-par for --pres-* og --slide-*; grafikk og tekst følger de semantiske rollene. Logoer beholder offisielle farger på nøytral flate. Test begge visninger, også i nedlastet HTML/PDF og på mobil.

Alt offentlig innhold skal være på GitHub Pages uten autentiseringspåstander. Internt materiale hentes kun via separat tilgangsbeskyttet distribusjon i henhold til INTERNAL_CONTENT_CONTRACT.md.

## Forvaltning og automatiske kvalitetsporter

- AGENTS.md og START_HERE.md beskriver arbeidsmåte og ansvar.
- NAVIGATION_CONTRACT.md er obligatorisk for detaljruter; ingen ny seksjon/id uten klikkbar forelder og nettlesertest.
- STORY_EDITORIAL_CONTRACT.md beskriver inntakskriteriet for nye historier og kriterier for å avvikle overlapp.
- SLIDE_EDITORIAL_AUDIT_2026-10-24.md dokumenterer gjennomgang av alle 39 aktive slideobjekter, tilhørende figurer og historietilhørighet.
- scripts/check-editorial-governance.mjs krever distinkte historier, kildekoblinger, gyldige bilder og oppdatert audit.
- scripts/check-navigation-browser.mjs tester samtlige lysbildedetaljer på desktop og mobil, pluss andre detaljtyper.
- scripts/check-library-v1-browser.mjs rendrer alle lysbilder, sjekker tekst- og scenebundethet og beholder bilder til manuell gjennomgang. Nye scener skal tas inn i samme test.
- scripts/check-architecture-assets.mjs verifiserer opprinnelse, SHA256 og lisens. scripts/check-presentation-mode-browser.mjs tester tema- og eksportlogikken.
- node scripts/check.mjs er et obligatorisk statisk trinn, men ikke erstatning for Chromium og visuell inspeksjon.

Nye lysbilder: endre datafil først, velg eksisterende scene og figur før du legger til ny scene, legg relevante kilder på objektet, dokumenter bruk, kjør tester og se faktisk skjermbilde. Endringer i delte bilder skal testes mot **alle** brukende historier. 

## Visuell revisjon v0.14.0

Se SLIDE_VISUAL_REVIEW_2026-10-24.md for individuell evaluering og begrunnelse for 39 lysbilder. Det visuelle oppsettet velges etter budskap (valg, spørsmål, kundestemmer, trinn eller hovedresonnement), mens kilde-, tema-, scene- og objektsystemene beholdes.
## 0.15.0: spesialiserte forklaringsscener

Åtte svake lysbilder bruker slide-story-scenes.js med egen modul og CSS. Komposisjonene har dataeid forklaringsinnhold, samme semantiske temaroller og samme eksportvei som de øvrige lysbildene. Se individuell vurdering i SLIDE_VISUAL_REVIEW_2026-10-24.md.

## 0.17.0: konkretisering av gjenstående generiske kort

Fire lysbilder fikk spesialiserte, dataeide forklaringsscener for møtebrief, konkret kundespørsmål, fagsamspill og avgrenset avklaring. Figurreferanser skal bare eksistere når figuren brukes. Kontrakttesten tillater meningsbærende typografi/diagram uten dekorative ikoner og verifiserer også `stages[].assetId`. Se SLIDE_QUALITY_REVIEW_V017.md.

## Bibliotekskort i skjermdekkende visning (v0.17.1)

Et vanlig klikk på et lysbildekort viser det eksisterende kanoniske 16:9-lysbildeobjektet i en skjermdekkende dialog, uten å endre URL eller bibliotekets filtre. Knappen «Lukk», Escape og klikk på bakgrunnen returnerer fokus til det valgte kortet. «Notater og kilder» åpner den eksisterende detaljruten for direkte lenking. Kortets opprinnelige `href` beholdes som semantisk fallback, samt for åpning i ny fane med modifikasjonstaster. Ingen innholdskopi eller egen renderer.

## 0.17.2 – mobil lukking

Bibliotekets skjermdekkende visning lukkes på touch-`pointerup` ved trykk utenfor 16:9-flaten eller på «Lukk», med `click` og Escape som alternativer. Det gir én entydig lukkemekanisme selv der mobil Safari ikke leverer forventet syntetisk click. Dette påvirker ikke lenken til notater/kilder. Mobilens hovedmeny har egen tilgjengelig lukkeknapp, et backdrop med trykk-utenfor og Escape, med fokus tilbake til menyknappen.

## v0.17.3 – berøringssekvens og lukking i iOS

Et mobiltrykk på «Lukk» eller utenfor 16:9-lysbildeflaten fullføres nå via en ikke-passiv `touchend` før dialogen fjernes. Det forhindrer at den etterfølgende syntetiske `click`-hendelsen treffer kortet eller kontroller bak dialogen. En ekstra posisjonsspesifikk guard stopper uventede kompatibilitetsklikk i WebViews som ikke respekterer kansellering. Vanlige `click`- og tastaturhandlinger er uendret. Test med ekte berøringshendelser og kontroller at visningen fortsatt er lukket etter at klikksekvensen er ferdig.

## v0.17.3 – totrinns navigasjon er autoritativ

Korrekt flyt er **kort i bibliotek → lysbildets detaljside med notater/kilder/gjenbruk → trykk på lysbildet → fullskjerm**. Kort er vanlige lenker, og data/notes beholdes i detaljsiden. Fullskjerm er en frivillig ekstra visning, ikke en erstatning for detaljsiden. Trykk på selve lysbildet eller Enter/Mellomrom ved tastaturfokus åpner; Lukk/berøring utenfor/Escape returnerer til samme detaljside uten ruteendring.

**Gjeldende regel:** Avsnittene fra v0.17.1 om fullskjerm direkte fra kort, og v0.17.2 om `pointerup`, er historiske og erstattes av v0.17.3. Kortet leder alltid først til detaljsiden.

## v0.17.4 – enkel og robust fullskjermlukking

Gjeldende implementering for detaljsidens lysbildefullskjerm bruker dedikerte hendelseslyttere på dialogens lukkeknapp og på området utenfor selve lysbildet. Den tidligere globale `pointerup`-/`touchend`-håndteringen er fjernet. En `touchend` på lukkekontroll eller bakgrunn kansellerer kompatibilitetsklikk og lar dialogen bli stående til neste hendelsessyklus før den fjernes. En kort gjenåpningsbeskyttelse hindrer at sent leverte mobilklikk åpner forhåndsvisningen på nytt. Lukking via tastatur eller mus følger vanlige klikk-/Escape-hendelser. Lukkeknappen ligger nederst i mobilvisningen, utenfor lysbildet og med et større trykkfelt.

**Behold totrinnsflyten:** bibliotekskort → detaljside med notater og kilder → trykk på lysbildet → fullskjerm → tilbake til samme detaljside. Nytt lyd-/touchregime må ha en regresjonstest som simulerer sent kompatibilitetsklikk etter lukking.
