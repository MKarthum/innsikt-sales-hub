# Innsikt – nattplan og demokvalitet, 25.–26.10.2026

**Mål:** Gjøre portalen demonstrerbart nyttig for en selger før mandag morgen, ikke bare mer dekorativ. Denne prioriteringen bygger på gjennomgang av fersk main v0.18.13, 21 navigasjonspunkter, kanoniske JSON-data, eksisterende sidekomponenter, sider som nylig er forbedret, issues #26 og #48 og åpen PR #57. Dette er **kode-, struktur- og redaksjonell vurdering**, ikke brukerobservasjon av hver side.

Bindende før arbeid: START_HERE.md, AGENTS.md, CONTENT_CONTRACT.md, OPEN_DATA_POLICY.md, CORE_ORG_BOUNDARY.md og STORY_EDITORIAL_CONTRACT.md. Fersk main og siste faktiske PR/CI overstyrer denne daterte arbeidskøen.

## Hva det må være mulig å demonstrere

En ny selger kan starte på forsiden, velge et **merket fiktivt** kundesignal, få to relevante spørsmål, forstå databehov og kompetanse som kan være aktuelle, og ta et konkret neste steg uten å lese 20 generiske kort. Eksempel på sammenhengende flyt: oversikt → forretningsbehov / salgsinngang → samtalestøtte / kompetanse → en kopierbar møtebrief eller mal. En kort Presenter-historie skal kunne vise dette uten døde lenker. Ingen interne kundeopplysninger eller ikke-dokumenterte leveranseløfter.

## Dekning og vurdert forbedringsbehov

| Route/område | Faktisk tilstand i data/kode | Brukerverdi og risiko | Prioritet |
|---|---|---|---|
| Forsiden (#oversikt) | Oppgavekort, 3 verdipilarer og 3 fremhevede prompter | Har mange dører, men trenger én enkel demonstrerbar ende-til-ende-brukerreise. Kontroller alle CTA-er | P0 kontroll |
| Salgsinnganger (#muligheter og detalj) | 9 innganger med signaler, 5–7 spørsmål, kvalifisering og neste steg | Rikt stoff, men kortrekke kan skjule første nyttige handling. Første nye funksjonelle forbedring | **P0.1** |
| Forretningsbehov (#forretning, sektor/case) | 9 sektorer, 36 **illustrative hypoteser**, dataantakelser, første pilot og play-koblinger | Et stort antall valg. Løft frem én sammenhengende case uten å presentere fiktive caser som reelle referanser | **P0.2** |
| Kundedialog – støtte (#kundedialog/stotte) | Seks generelle spørsmål og lenker | Svar på et konkret signal med 2–3 relevante spørsmål, ikke bare statisk liste | **P0.3** |
| Kundedialog – trening | 8 rollekort-scenarier og 15-minutters parøvelse/refleksjon | Potensielt nyttig allerede; valider mobil, at kortene er separate og at refleksjonen kan brukes | P0 kontroll |
| Presenter og lysbilder | 39 selvstendige slides, 5 historier; portal=6 slides, sales=7 | En demo i morgen må åpne, navigere, lukke, vise notater og fungere i 16:9/eksport. Rett kun svakeste observerte slide/lenke | **P0.4** |
| Kompetanse | 4 kompetanseområder, 8 rollebaserte innganger; nettopp forbedret via PR #50 | Behold gjennomført rolle→signal→spørsmål. Vurder ett konkret neste steg; ikke gjenta samme ombygging | P1 |
| Teknologikart | 12 teknologier/områder, behovsstyrt veiviser; nettopp forbedret via PR #55 | Kontroller nøktern kobling fra behov til produkt og kildebruk. Ingen flere parallelle søk/filter | P1 kontroll |
| Arkitektur | Fellesmodell, fire spørsmål, 3 leverandørdiagrammer, BI/RAG; nylig PR #56 | Kun P0-bug: «Trykk for å utforske» dekker figur. PR #58 fjerner merkingen, beholder tilgjengelig klikk/zoom. **Deretter frys nytt redesignet arbeid i natt** | P0-bug |
| Marked, bransje, trendradar | 4 hovedtrender, SSB KI-serie, 3 hendelser, 6 markedssignaler, 5 signaler under observasjon | Gjør et lite antall kildebelagte observasjoner relevante gjennom spørsmålet «hva betyr det for kunden?»; ikke tilfeldig KI-statistikk | P1 |
| Prompter | 16 maler, 39 variable definisjoner, kontekstgjenbruk og kopiering | Test 2–3 prioriterte oppgaver på fiktiv input og faktisk kopiert output før utvidelse. Ikke skriv sensitive verdier | P1 |
| Maler (#verktoy) | 4 generiske kopierbare maler | Kontroller ett møteeksempel og riktig neste steg, ikke legg til flere maler | P1 |
| Om Innsikt / fagintro | Produktintro + valgfritt 8-minutters fagkurs med gjennomgående eksempel | Forklar forskjellen på å lære løsningen og å lære faget; riktig CTA tilbake til oppgaven | P1/P2 |
| I grenselandet / #horisont | Grunnig nyansert Company Brain/data og KI fordypning | Valgfritt fagstoff, må ikke dominere demo; faktasjekk kun ved funn | P2 |
| KI i plattformer (#ai) | Produktspesifikk KI-informasjon fra teknologi-eier | Oppslag, ikke ny salgshistorie | P2 |
| Kilder | Kilderegister + åpen PR #57 for kilde-til-påstand | Behandle eksisterende PR #57, ikke opprett konkurrerende løsning | P1, egen PR-eier |
| Ordliste | 24 kanoniske begreper | Test begrepslenker, ingen bred utvidelse | P2 |
| Figurer/logoer | Ressursbibliotek og proveniens | Redaksjonelt oppslag, ikke en salgsside som må «pyntes» | P2 |
| Videreutvikling | Offentlig prioritert backlog | Status må være sann. Ikke bygg nye dashboards i natt | P2 |

**Prioritering:** P0 betyr både svakhet og viktighet for morgendagens demonstrasjon. Nylig løftede kompetanse, teknologi og arkitektur skal ikke ta all nattens kapasitet på nytt. Nattens hovedjobb er *ikke* å gjøre alle sider like visuelt, men at færre klikk gir en tydeligere samtale og neste handling.

## Sekvensiell arbeidskø

**Port 0 – Stabil demo og eksisterende PR-er (før ny produktjobb):**
1. Fullfør PR **#58** (arkitektur-overlay): alt figurinhold synlig på 320/390; hele bildet kan fortsatt trykkes, Enter/Space åpner 1:1 med lokal horisontal navigasjon, «Vis hele modellen» fungerer. Ingen ny grafikkmotor.
2. PR **#57** for kildespor finnes allerede. Gjør uavhengig exact-head review, rebase mot main etter #58, **løft release- og assetversjon fra 0.18.14 til neste frie 0.18.15** før merge, og ta bare inn hvis den faktisk er nyttig og fri for regressjoner. Dette er en kjent kollisjon; ikke merge gammel versjonsfil.
3. Smoke-test demostien fra #oversikt og portaldemopresentasjonen. Ved faktisk feil, lag kun én presis rettingspakke.

**P0.1 – Salgsinnganger som gir spørsmål og neste steg:**
Bruk kun eksisterende sales.plays som dataeier. Første synlige interaksjon bør kunne velge et eksisterende hørbart kundesignal og vise to relevante spørsmål, hva man ikke bør anta og neste steg. Behold alle 9 oppslag og dypelenker. Prøv eksempel «Vi bruker mye tid på å samle rapporter i Excel.» → rapportering → spørsmål → oppfølging. Start med screenshots av 320/390/900/1512 og faktiske brukerhandlinger, ikke et generisk designbibliotek.

**P0.2 – Forretningscaser i praksis:**
Gjenbruk sector/case + industryUseCases.playIds, pilot, caution og questions; ett valgt eksempel fra situasjon til mulig databehov, første avgrenset pilot og koblet salgsinngang. Behold alle 36 uten å overfylle forsiden. Ingen caser får status som kundereferanser. Aksept: én bransjecase kan følges til relevant spørsmål og tilbake uten døde lenker.

**P0.3 – Samtalestøtte følger situasjonen:**
Bygg én enkel inngang fra eksisterende sales.plays og scenarios til relevante spørsmål i #kundedialog/stotte. Hold generelle seks spørsmål tilgjengelige som oppslag. Koble valgfritt videre til 15-minutters partrening. Aksept: en selger har konkret samtalestøtte etter å ha valgt ett behov; ingen personopplysninger lagres.

**P0.4 – Presentasjonsløp klart i morgen:**
Kontroller portal-decket og sales-decket i faktisk Presentermodus, med notater, swipe, lukk, lenker og HTML/PDF-eksport. Kontroller 320/390 og 16:9 på desktop. Endre bare ett faktisk observert svakt lysbilde/ødelagt overgang per PR. Opprett ikke nye historier uten separat målgruppe, spørsmål og ønsket handling.

**P1 – Hvis P0 er godt kontrollert:** marked (én kildebelagt innsikt → tolkning → kundespørsmål), kompetanse (neste konkrete steg etter rollevalg), prompt (test kopiert prompt for 3 prioriterte oppgaver med anonymisert/offentlig data), første bruksinntrykk mellom løsningsintro og fagintro. Ikke bruk natten på #horisont, flere trender, tilfeldige nye objekter, kosmetisk omlegging eller påloggings-/internarkitektur.

## Pulsene har tre *ulike* jobber; eksisterende :00 / :20 / :40 er handoff

- **A (:00):** Les fersk main, åpne PR-er og siste varige handoff i issue #26. Velg **bare én** neste uførte pakke fra denne planen når forrige er merget/publisert eller en dokumentert uavhengig filpakke er ledig. Gi B en presis oppgave med route, filer, datasannhet, test og observerbar nytte. Ikke skriv samme analyse hver time.
- **B (:20):** Utfør én liten konkret forbedring i isolert branch/PR basert på frigitt pakke. Behold eksisterende ID-er, datakilder og offentlighetsgrense. Legg ved screenshots før/etter, konkrete klikk- og teksteffekter, CI på eksakt head. Bruk CAS/expected_sha. Ved feil: rett **samme PR**, ikke opprett ny. Hvis en annen har en åpen skrive-PR med fellesfiler, ikke skriv i dem.
- **C (:40):** Vurder uavhengig siste eksakte PR-head: sjekk validate/browser, bilder i 320/390/900/1512, innhold, kilder, ruter, Presenter/eksport der relevant, kontrakter/offentlig grense. Gi en konkret reparasjonsliste til B eller merge med expected_head_sha og verifiser Pages. Ikke påstå publisert før deploy-grønn. Ikke godkjenn automatisk ved grønn CI dersom produktnytten er svak.

**En forfatter om gangen i fellesfiler**: docs/assets/site.js, docs/assets/site.css, docs/data/pages.json, docs/data/site.json og docs/index.html. Ikke parallelle PR-er med samme releaseversjon. #57 er aktiv; håndter bevisst. Ikke opprett nye workflows, apper, plugins, nettjenester, tracking, interne data eller nye rettighetsgrenser.

**Idempotent handoff i issue #26:** Skriv kommentar bare ved faktisk ny pakke, commit/PR, ny blokkering, review eller merge/deploy. Format: NIGHT-ID, state=READY|BUILDING|REVIEW|FIX|MERGED|PUBLISHED|BLOCKED|NOOP, eier, main SHA, PR/head, ett observerbart resultat, neste handling, test-/screenshot-bevis. Før hver handling: kontroller om samme pakke allerede har samme status eller er fullført. Dersom kjent feil varer, finn en **annen ikke-overlappende** pakkeslice; ikke reanalyser samme problem uten ny evidens. Ingen ny PR bare fordi pulsen fyrer.

## Stopptid og morgenoverlevering

Kjør nattens tre pulser til omtrent **08:40–09:00 Europe/Oslo mandag 26.10.2026**, deretter stopp. Siste C rapporterer kort: nåværende main-versjon, hva som faktisk er merget og publisert, lenker til nyttige sider, hva som ligger i draft, og 1–3 gjenværende konkrete problemer. Fravær av fremdrift skal rapporteres nøkternt, ikke fylles med ny plan.

**Nytte over mengde:** En side er ferdig bedre når selgeren får et relevant spørsmål og et realistisk neste steg.
