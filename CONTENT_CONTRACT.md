# Innholdskontrakt – én autoritativ kilde (v3, 14.10.2026)

Gjelder alle endringer i Innsikt. Les sammen med `START_HERE.md`, `AGENTS.md`, `OPEN_DATA_POLICY.md` og `REFACTOR_REVIEW.md`. v0.9.0 innførte referansemodellen; v0.9.1 samler identifiserte eldre tverrgående budskap med dokumenterte varianter. Kontrakten gjelder også nytt innhold. Se `NORMALIZATION_AUDIT.md` for hvilke overlapp som er konsolidert og hva som er vurdert som selvstendig tekst.

## Autoritet og visningsvalg

- Ett semantisk innholdselement har én dataeier og stabil ID. Det gjelder også når teksten er omskrevet eller kortet ned.
- Et objekt kan ha `variants.short`, `variants.normal` og `variants.long`, under **samme ID og eier**. Opprett bare varianter med et faktisk formål.
- En side, et lysbilde eller en prompt velger ID og variant, ikke en tekstkopi. Eksisterende sidetilpassede spørsmål, titler og pedagogiske eksempler kan fortsatt være sideeide dersom de ikke gjengir en annen dataeiers faktapåstand.
- `pages.json` eier rekkefølge, komposisjon, sidetitler og unike presentasjonsnotater. `horizon.json` eier original analyse og hypoteser, ikke nye kopier av ordliste, produktegenskaper eller markedsfakta.
- Alt i dette offentlige repoet og Git-historikken er offentlig; `visibility: "not-presented"` hindrer bare visning, ikke innsyn. Ikke lagre noe konfidensielt der.

## Autoritet for variabler i prompter

`prompts.json.variables` er kanonisk variabelregister, `variableGroups` eier gruppering, og `page.variableUi` eier brukerrettet UI-tekst. De brukes på promptdetaljer og oversikten «Alle variabler», uavhengig av visningsadapter. `items[].placeholders` beskriver hvilke aliaser fra registeret som brukes av den aktuelle prompten. `items[].contextVariables` binder valgfri felles kundekontekst. `choiceGroups` og `outputSettings` er autoritative for valgbaserte instruksjonsblokker, overskrifter og markører, `items[].formats` begrenser formatvalg, og `page.primaryIds` styrer hvilke oppgaver som fremheves først. Ingen dupliserte navn, ubrukte register-ID-er eller semantisk tvetydige aliaser. Personopplysninger og interne kundedata skal ikke lagres i offentlig portal. Test og utvidelsesregler finnes i [PROMPT_VARIABLES.md](PROMPT_VARIABLES.md).

## Referanser som faktisk er implementert

En referanse er et JSON-objekt: `{ "$content": "glossary:dataplattform", "variant": "normal" }`.

`docs/assets/content.js` løser referanser ved oppstart og returnerer ordinære tekstfelt til visningskomponentene. Den feiler eksplisitt ved manglende eier/ID/variant, duplisert ID og ugyldige referansefelt. Registrerte samlinger er `glossary` (`learning.json.glossary`), `risk` (`learning.json.risks`), `guidance` (`sales.json.sharedGuidance`), `market-guidance` (`market.json.metricGuidance`), `ai-overview` (`technologies.json.aiOverview`) og `prompt-rule` (`prompts.json.rules`), samt `value` (`sales.json.valueThemes`), `value-overview` (`sales.json.valueOverview`) og `notice` (`pages.json.sharedNotices`). Utvid registeret og kontrakttestene sammen ved nye referansetyper; ikke innfør parallelle lookups.

Kopierbare prompter kan lagre `promptParts` med veksling mellom strengtekst og `$content`-referanser. Resolveren setter sammen delene **uten ekstra tegn** til ett selvstendig promptfelt før visning, redigering og kopiering. En prompt har enten `prompt` eller `promptParts`, aldri begge. Felles regler eies av `prompts.json.rules`.

Fordi dette fortsatt er et gradvis normalisert prosjekt, brukes eksisterende domenefelter (`source`, `sources`, `sourceIds`, `meaning`, `description` osv.) der de allerede er kanoniske. Ikke introduser en ny `sourceIds`-kopi bare for å standardisere navnet på et felt.

## Kilder, datoer og kunnskapsstatus

Bruk `evidence` for `documented` (dokumentert fakta), `vendor` (leverandørens beskrivelser/veikart), `assessment` eller `hypothesis` (egen vurdering/hypotese), og `open-question` (ikke avklart). Knytt tidsfølsomt innhold til `reviewed`, og fakta/leverandørinformasjon til faktisk kildereferanse. `sources.json.checked` er siste kontroll av kildelenken, mens `sources.json.published` er kildens publiseringsdato; ingen av dem erstatter innholdets `reviewed` eller produktets `status`/preview-angivelse.

En leverandørkilde dokumenterer hva leverandøren beskriver, ikke kundens realiserte gevinst. Beskriv «Company Brain» som uformell markedsterminologi, ikke standardarkitektur. Konvergens mellom dataplattform og kunnskapsgraf er en mulighet, ikke et bevist utfall. Kunnskapsgraf (for eksempel Gleans Knowledge Graph/Enterprise Graph) er en mulig byggestein, ikke synonymt med begrepet. Skill dokumentbasert virksomhetssøk, semantiske data og operative handlinger; se COMPANY_BRAIN_RESEARCH_2026-10-25.md for kildevurdering.

## Automatisk verifikasjon og begrensninger

Kjør `node scripts/check.mjs` ved enhver endring. Kontroller omfatter referanser, ID-er, kildefelter, skjult innhold, promptkomposisjon, lange **eksakte** tekstduplikater, 76 genererte visninger, 20 bindende semantiske konsumentreferanser, 11 simulerte variantediteringer og metamorfisk spredning av én begrepsendring til Start her, fordypning, Presenter og søk. Test også i nettleser med mobil og desktop før publisering.

Eksakttest garanterer ikke at to ulikt formulerte tekster har samme semantikk. Ikke alt innhold skal referansebaseres: sidetitler, oppgaveformuleringer, sitater og pedagogiske eksempler har ofte eget formål. Generiske UI-etiketter ligger fortsatt delvis i JavaScript, og søkeindeksen kan kreve oppdatering for nye innholdstyper. Maskinelle tester kan ikke garantere at alle framtidige omskrivinger er semantisk ulike; vurder delte tema redaksjonelt. Se `NORMALIZATION_AUDIT.md`.

## Endringsrekkefølge

1. Finn eller opprett kanonisk eier/ID og dokumenter kilder og status.
2. Finn alle forbrukere av ID-en og sørg for eksplisitte referanser/varianter.
3. Kjør alle kontroller og test virkning på aktuelle sider, søk, Presenter og kopierbare prompter.
4. Gjennomgå offentlighet, mobil, desktop, CSS, lenker og kildegrunnlag før atomisk publisering.
5. Oppdater `site.json` og alle JS/CSS-versjoner ved samlet release. Ingen database, CMS eller ny frontend-stakk uten dokumentert behov.

## Bransje og verdikjedecaser – autoritet v0.9.2

- \`sales.json.industrySectors\` eier én beskrivelse og kildekontekst per sektor-ID.
- \`sales.json.industryUseCases\` eier ett samlet case per case-ID med sektor- og \`playIds\`-koblinger. Ikke kopier caseinnhold som separate generiske \`businessSignals\` eller \`plays\`.
- \`sales.json.industryJourney\` eier delte metodiske trinn. \`pages.json.industryUi\` eier kun etiketter og sidekomposisjon; Presenter peker til case-ID. Søk/HTML viser samme autoritative objekt.
- \`sources.json\` eier kildeinformasjon; \`sourceIds\` på sektor beskriver bransjepraksis, ikke dokumentert effekt av hvert hypotetiske case. Faglig innhold er \`assessment\` med \`reviewed\` dato. Ingen sammenblanding av publisering/kildekontroll og faglig validering.
- Se \`INDUSTRY_BUSINESS_DIALOGUE.md\` for prinsipper og test av faktisk forretningsverdi. \`scripts/check-render-output.mjs\` skal dekke hver sektor og hvert case, også ved ny kobling til Presenter.


## Kontekstuell begrepshjelp – varig regel

Faguttrykk og forkortelser som kan være ukjente for målgruppen, bør forklares ved behov gjennom én diskret, felles komponent fremfor gjentatte definisjoner i sidetekster. `docs/data/learning.json.glossary` er eneste autoritative eier av begrepsdefinisjoner og eksempler. Bruk eksisterende stabile ID-er og `$content`-referanser; aktiver inline-visning og alternative skrivemåter med `inline`-metadata på samme begrepsobjekt. Nye begreper legges til hos denne eieren. En separat kortvariant kan bare legges inn under samme ID dersom den faktisk trengs.

Gjenbruk `docs/assets/glossary.js` både i oversikt, detaljvisninger og dynamisk innhold etter hash-navigasjon. Marker selektivt; ikke alle forekomster, vanlige ord eller produktnavn. Bevar alltid det synlige begrepet og den opprinnelige faglige betydningen, kilder, forbehold og skillet mellom fakta, leverandørpåstander og vurderinger. Fjern kun overflødige parentesdefinisjoner hvis substansen beholdes.

Ikke endre lenker, knapper, redigerbare prompter eller kopierbare felt til interaktive begreper. Popupen skal fungere på mobil og desktop, kunne brukes med tastatur, lukkes via Escape og uteklikk, føre fokus hensiktsmessig og holdes innenfor skjermen. Oppdater eksisterende innholds- og nettlesertester ved endringer.


## Trendradar og flerkanals publisering – v0.9.7

- `market.json.emergingSignals[]` er en selvstendig, kanonisk samling for usikre og tidlige signaler. Hvert objekt har stabil ID, redaksjonell vurdering, modenhet, begrunnelse, usikkerhet, observasjonspunkt, `relatedRoute`, `sources[]` og `reviewed`. Ingen radarsignaler skal kopieres til `marketSignals[]` eller `horizon.chapters[]`.
- `pages.json` eier radarens header, etiketter og sidetekst. Visningskode velger bare hvilke felter som vises. Dette er ikke redaksjonell eller semantisk autoritet.
- `learning.json.diagrams[].steps[]` er ordnet fra datagrunnlag mot organisasjon; `direction: up` uttrykker den tilsiktede faglige avhengigheten. En Webstep-artefakt trenger ikke den eksisterende HTML/CSS/JS-layouten for å vise eller omforme modellen.
- Nye grensesnitt skal konsumere autoritative JSON-filer, bevare ID-er, datoer, kildehenvisninger, kunnskapsstatus og `$content`-oppløsning der slike referanser brukes. Presentasjonslogikk er fritt utskiftbar; innholdet er ikke det.

## Presenter – semantisk gjenbruk etter v0.10.0

Gjeldende Presenter inneholder ett løp som forklarer løsningen og ett kort illustrativt forretningsbehov. `pages.json` eier manus, rekkefølge, situasjonsramme og forklarende lysbildetekst; `sales.json` eier det kanoniske økonomieksempelet, og `sales.json.sharedGuidance` eier gjenbrukt kundedialogveiledning. Å endre et begrep i ordlisten skal oppdatere de visningene som faktisk bruker begrepet, men skal ikke tvinge det inn i Presenter av hensyn til en foreldet test. Referanser og felles fakta kontrolleres fortsatt ved endring.

## Begrepspresisjon og forkortelser (v0.10.3)

`learning.json.glossary` eier kanonisk `term`, `meaning`, `example` og valgfri `fullName` for forkortelser. `fullName` viser hva bokstavene står for og erstatter ikke den norske forklaringen. Bruk begreps-ID-er i alle visninger; ikke legg parallelle tekststrenger i popup eller grunnkurs. Eksempler skal vise begrepets spesifikke funksjon og avgrense det fra beslektede arkitekturbegreper. Nye fagkilder legges til i `sources.json`.

## Promptvisning (v0.11.2)

InnsiktPromptContext.composeTask() bygger den faktiske prompten. selectedBlocks() leverer de samme valgte instruksjonene strukturert til levende forhåndsvisning og hjelp under radioknappene. Visningsmodulene får ingen egen tekstkilde. Alle labels og meldinger eies av prompts.json. Endringer må testes for komposisjon, kopiering, manuelle overstyringer, mobil og desktop. Se PROMPT_EDITORIAL_AUDIT_2026-10-22.md.


## Valgfrie firmamaler og felter (v0.11.5)

prompts.json eier outputSettings.organizationTemplates: etikett, hjelpetekst, gyldige formater og hele malinstruksjonen. Checkboxen vises bare for disse formatene, og instruksjonen blir utelatt når den ikke er relevant eller velges bort. optionalPlaceholders og betinget inline-tekst eier tomfelt-policyen. Separasjonen mellom data, komposisjonsmotor og presentasjon er uendret. En malinstruksjon er en forespørsel til et eksternt KI-verktøy, ikke en garanti for intern maltilgang.


## Unngå duplisert promptveiledning (v0.11.6)

Valgbeskrivelsene vises samlet i én forhåndsvisning, ikke i tillegg under hvert radiovalg. prompts.json er fortsatt eneste eier av instruksjonstekst, UI-etiketter, oppgavespesifikke tips og kontrollpunkter. Frontend viser data uten å lagre en kopi av teksten. Den sekundære veiledningen er en lukket details-seksjon i samme naturlig scrollende høyrekolonne; ikke sticky og uten interne rullefelt.


## Betinget CV-produksjon i promptbiblioteket (v0.11.7)

prompts.json kan definere et cvOutput-objekt på en oppgave: modeGroup/draftValue, reviewFormats/draftFormats, lengthGroup og datastyrt template.label/hint/instruction. Renderermodulene skal aldri eie den redaksjonelle matchprompten eller malinstruksjonen. En analyse gir bare ren tekst/Markdown. CV-utkast åpner Word/PDF, lengde og eventuell påkrevd kundemal; påkrevd kundemal overstyrer general firmamal. Manglende kildefiler håndteres av instruksen til KI, ikke ved fiktiv innlesning i portalen.
