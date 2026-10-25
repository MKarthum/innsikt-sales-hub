# «Company Brain», kunnskapsgraf og virksomhetskontekst – kildevurdering 25.10.2026

## Konklusjon

«Company Brain» er ikke en entydig teknisk standard eller en dokumentert arkitektur. Bruk det kun som et **uformelt målbilde**: KI skal kunne finne, forstå og – der det er tillatt – anvende relevant virksomhetskontekst på tvers av arbeidsprosesser. Begrepet er videre enn dokumentbasert virksomhetssøk og videre enn en kunnskapsgraf.

**Glean er et relevant, men avgrenset eksempel.** Gleans Knowledge Graph knytter sammen innhold, personer og aktivitet; Enterprise Graph beskrives som en utvidelse som gir også personlig arbeidskontekst. Glean bruker dette sammen med indeksering/søk, RAG, tilgangsstyring, assistenter og agenter. Gleans graf alene er derfor ikke synonymt med en Company Brain-løsning. Gleans egne beskrivelser dokumenterer produktets tilnærming, ikke universelle arkitekturkrav eller dokumentert kundegevinst.

## Beslektet terminologi: Second Brain

Tiago Fortes *Building a Second Brain* beskriver først og fremst en personlig metode for å samle, organisere og gjenbruke kunnskap. Den forutsetter ikke KI eller kunnskapsgraf. «AI Second Brain» brukes ofte om den samme personlige kunnskapsbasen brukt sammen med KI. Begrepet har også fått organisatorisk bruk: Metas [An Organizational Second Brain](https://engineering.fb.com/2026/09/02/ml-applications/organizational-second-brain-ai-learns-from-experts/) (02.09.2026) dokumenterer en agent som bevarer ekspertvurderinger, rutingregler og korrigeringer i ett bestemt compliance-fagområde. Dette overlapper med Company Brain, men er ikke dokumentasjon av en helhetlig virksomhetsplattform.

**Redaksjonell beslutning:** Én kanonisk definisjon i ordlisten, og én kontekstuell kobling i fordypningen. Ikke et nytt hovedkapittel, produktkategori eller arkitekturkrav. Kilder: [Tiago Forte](https://www.buildingasecondbrain.com/) og [Meta Engineering](https://engineering.fb.com/2026/09/02/ml-applications/organizational-second-brain-ai-learns-from-experts/).

## Tre spørsmål som må holdes fra hverandre

1. **Hva må KI kunne?** Finne informasjon, forklare godkjente tall, følge avhengigheter, anbefale eller handle. Dette er ulike oppgaver med ulike krav.
2. **Hvordan får KI virksomhetskontekst?** Søk og RAG, semantiske modeller, ontologier/kunnskapsgrafer, API-er mot operative systemer og eksplisitt minne kan kombineres. Ikke alle komponenter er nødvendige.
3. **Hvordan blir det forsvarlig?** Autoritative kilder, datakvalitet og ferskhet, tilgang etter bruker/rolle, kildebevis, test av svar, styring av verktøy/handlinger og revisjonsspor er viktigere enn valget av metafor.

## Ulike produktretninger – ikke fire eksempler på den samme arkitekturen

| Tilnærming | Hva leverandøren dokumenterer | Hva dette **ikke** beviser |
|---|---|---|
| **Glean – Enterprise Graph og søk** | Indeksering av tilkoblede arbeidsverktøy, innhold/personer/aktivitet, grafkontekst, Search, Chat/Assistant og Agents | At alle virksomheter trenger kunnskapsgraf; at en graf alene gir korrekt beslutning eller utfører en prosess |
| **Microsoft IQ / Fabric IQ** | Flere kontekstlag: Work IQ (arbeidsmåter), Foundry IQ (kurert dokumentkunnskap), Fabric IQ (forretningsdata, semantiske modeller og ontologi, der ontologi er preview) | At disse allerede utgjør én ferdig og universell «Company Brain»; at alle delene trengs |
| **Snowflake Cortex Agents** | Agentorkestrering med SQL/semantiske visninger mot strukturerte data og søk mot dokumenter, i tillegg til verktøy | At en kunnskapsgraf er nødvendig eller at semantisk søk alene gir virksomhetsforståelse |
| **Palantir Ontology** | Modeller av virksomhetsobjekter, relasjoner, regler og handlinger for operative beslutninger | At ontologi/kunnskapsgraf erstatter transaksjonssystemer, datastyring eller menneskelig kontroll |

Gartner beskriver *AI Context Platforms* som løsninger for styrt, maskinlesbar virksomhetskontekst for agenter. Det er en **beslektet analytikerkategori**, ikke en offisiell definisjon av «Company Brain» eller en konklusjon om at én arkitektur vinner.

## Konsekvens for Innsikt

- Kanonisk begrepsdefinisjon ligger **bare** i `docs/data/learning.json` (`company-brain`); fordypningen i `horizon.json` bruker ordliste-ID-en og beskriver leverandørforskjellene.
- Bruk Glean som **eksempel på grafstøttet kunnskaps-/søkekontekst**, Snowflake som **analyse og søk i agenter**, Microsoft IQ som **separate kontekstlag**, Palantir som **operativt objekt-/handlingslag**. Ikke presenter leverandørene som direkte substitutter.
- Start hos kunden: mål/brukeroppgave, kildedata, eksisterende teknologi, ansvar og sikkerhet. Ikke konkluder med anskaffelse av ny graf, plattform eller agenter før disse er kjent.
- Et realistisk eksempel kombinerer dokumentasjon og ansvar med autoritative statusdata og kilder; handling krever egne tillatelser. Ikke bruk et rent «finn dokumentet»-eksempel som definisjon av hele konseptet.

## Primærkilder og vurderingsgrunnlag

- [Glean Knowledge Graph](https://docs.glean.com/security/knowledge-graph): knytter innhold, personer og aktivitet. Leverandørdokumentasjon.
- [Glean – How connectors power the Glean experience](https://docs.glean.com/connectors/connectors-power-glean): indeksering, graf, rettigheter, RAG/Assistant/Agents. Leverandørdokumentasjon.
- [Glean Enterprise Graph](https://www.glean.com/enterprise-context/enterprise-graph) og [produktnyhet 25.09.2025](https://www.glean.com/press/glean-introduces-third-generation-ai-assistant-new-enterprise-graph-to-enable-the-superintelligent-enterprise): utvidelse fra Knowledge Graph til bredere virksomhetskontekst. Produktpåstander, ikke uavhengig effektbevis.
- [Microsoft IQ](https://learn.microsoft.com/en-us/microsoft-iq/) og [What is Fabric IQ?](https://learn.microsoft.com/en-us/fabric/iq/overview): lagdeling og status for ontologi. Leverandørdokumentasjon, funksjoner/status må kontrolleres ved bruk.
- [Snowflake Cortex Agents](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents): strukturerte og ustrukturerte data og verktøy. Leverandørdokumentasjon.
- [Palantir – The Ontology system](https://www.palantir.com/docs/foundry/architecture-center/ontology-system): data, logikk, handling og sikkerhet. Leverandørdokumentasjon.
- [Gartner – AI Context Platforms, 16.10.2026](https://www.gartner.com/en/documents/8475745): offentlig sammendrag av bredere markedskategori. Full rapport ikke evaluert; ikke bruk som primærbevis for enkelte produktegenskaper.

Kildene er vurdert per 25.10.2026. Dette er et redaksjonelt beslutningsgrunnlag, **ikke** en leverandørsammenligning med score, innkjøpsanbefaling eller dokumentasjon av kundeeffekt.
