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
