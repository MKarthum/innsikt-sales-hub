# Arkitektursiden – redaksjonell kontrakt (25.10.2026)

## Ett formål

Siden `#arkitektur` skal lære en selger eller rådgiver å skille **hvilke oppgaver en dataarkitektur må løse** fra **hvordan en gitt leverandør løser dem**, og kunne stille relevante spørsmål før ny teknologi velges. Den er ikke et produktoppslag, en fullstendig arkitekturstandard, en generell KI-risikoveileder eller en ny salgsmetodikk.

## Fast pedagogisk rekkefølge

1. **Felles dataplattformmodell, alltid synlig.** Start med mål/bruk, følg bakover til kilder og forklar tverrgående kvalitet/tilgang/drift. Fem kolonner er ansvar, ikke påkrevde separate systemer. Teknisk fordypning ekspanderer samme profil, ikke en ny arkitektur.
2. **Fire leverandøruavhengige vurderingsspørsmål** fra `horizon.json.questions`, umiddelbart etter grunnmodellen. Ikke legg inn en kopi i `pages.json` eller JS. Tydeliggjør eierskap, effekt, fullmakter og eksisterende investeringer.
3. **Tre forskjellige plattformeksempler.** Snowflake / Fabric / Databricks skal ikke være tre likt tegnede femtrinnslister. Gjenbruk scene og kildeautoritet fra `architecture-profiles.json` / `slides.json`. Vis ett faglig vesentlig poeng og ett kundespørsmål per profil. Begrens produktalternativer (som Snowflake BI) til frivillig detaljåpning. Illustrasjoner er ikke produktanbefalinger.
4. **To ulike anvendelser** fra `learning.json.diagrams`: strukturert BI og dokumentbasert RAG. Ikke presenter all KI som en obligatorisk del av dataplattformen.
5. **Kort og synlig vei til fordypning**, ikke en skjult liste med alt videre innhold.

## Ikke på hovedsiden

- Fem risiko-/kontrollkort: eies av `learning.json.risks` og vises i detaljruten `#arkitektur/ai-on-data`, tilgjengelig via synlig lenke.
- Full KI-utviklingsprosess: eksisterende `#arkitektur/ai-in-development` er fortsatt tilgjengelig, men dette er kompetanse/arbeidsmetode, ikke grunnarkitektur.
- Komplett produktkatalog: `#teknologi`. KI-kontekst, ontologi, company brain og hypoteser: `#horisont`. Begrepsintroduksjon: `#guide` og `#ordliste`.
- Ikke kopier faktapåstander fra `learning.json`, `horizon.json`, `technologies.json`, `sources.json` eller presentasjonene inn på siden.

## Kvalitetskriterier for endringer

- Leseren skal forstå forskjellen på **kapabilitet, anvendelse og leverandørimplementasjon** uten ekstra forklaringer fra utvikleren.
- Fellesmodellen skal ikke forsvinne når leverandør velges. Spørsmålene skal stå før leverandør-eksemplene.
- Mobil (320/390) viser ekte 16:9-arkitektur og tilgjengelig zoom/pan; desktop (900/1100/1512) uten tekstklipping eller global overflow.
- Alle fire eldre detaljruter `#arkitektur/bi`, `/rag`, `/ai-on-data`, `/ai-in-development` og alle seks stabile arkitektur-lysbildelenker fungerer, inklusive Presenter/eksport.
- Én faglig eier per opplysning. Sjekk propagasjon, kildeopphav, organisasjonsgrense, og kjør exact-head CI. Gjennomfør faktisk visuell inspeksjon før merge.
