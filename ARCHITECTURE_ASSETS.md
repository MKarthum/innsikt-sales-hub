# Figurbibliotek og arkitekturprofiler

## Modell
Tre nivåer som kan videreutvikles separat:
- Lysbilder i docs/data/slides.json. Hvert arkitekturbilde refererer en profileId.
- Arkitekturprofiler i docs/data/architecture-profiles.json. De eier kilder, innhenting, mellomlag, konsum og støttekapabiliteter.
- Ressurser i docs/data/visual-assets.json og docs/assets/library/. Profilene refererer assetId; ingen kopier av logoer eller figurer i selve slidene.

Felles scene ligger i architecture-visuals.js og architecture-visuals.css. Ressursoppslag og «Brukes i» ligger i visual-assets.js. Biblioteket har egne faner Lysbilder og Ressurser.

## Ressurskategorier
1. vendor-logo (leverandørlogo): Offisielle uendrede varemerker. Ikke opphavsrettsfrie. Kilde, bruksregler og SHA256 følger hver fil.
2. licensed-external (eksterne figurer): Kun materiell med dokumenterte lisenser og attribusjon. MIT/CC er ikke det samme som ingen opphavsrett.
3. original-figure (egne figurer): SVG-er laget for løsningen, som kan forbedres sentralt og brukes i alle profiler.

Rettighetsnotat (25.10.2026): De 25 egne SVG-ene er laget som generiske Innsikt-illustrasjoner, uten Webstep-logo. Den tidligere etiketten «Webstep/Innsikt original work» var upresis som eierskapsangivelse og er erstattet med en nøytral kildebeskrivelse. Dette er **ikke** en rettighetsoverføring eller en bekreftelse av personlig eierskap. Før en lisens omfatter illustrasjonene må opphav og rettigheter kontrolleres. Se LICENSING_PROPOSAL.md.

## Leverandørbruk
- Microsoft Fabric, Power BI og Data Factory: Microsofts offisielle ikonsamling. Bare arkitektur, opplæring og dokumentasjon. Ikke beskjær, roter, omfarg eller la dem symbolisere eget produkt. https://learn.microsoft.com/en-us/fabric/fundamentals/icons
- Snowflake: Offisiell SVG fra Snowflake. Bruk blå logo på hvitt med luft rundt. https://www.snowflake.com/brand-guidelines/
- Databricks: Offisiell SVG fra Databricks. Behold originale farger og proporsjoner. https://brand.databricks.com/databricks-brand-guidelines/welcome
- dbt: Logo fra dbt Labs' offisielle GitHub-repo. Skal ha korrekt rolle i stack, samme visuelle status som øvrige merker, originalfarger og tilhørende varemerkeinformasjon. Ingen leverandørtilknytning. https://www.getdbt.com/dbt-assets/dbt-trademark-guidelines
- Tabler-database.svg: Importert, MIT-lisensiert kildeikon fra Tabler Icons. Se LICENSE-tabler-icons.txt. Dette er ikke «uten opphavsrett».

## Seks første arkitekturprofiler
- conceptual: teknologinøytral dataplattform
- modern: moderne modulær dataarkitektur
- ai-on-data: KI og rapportering på felles datagrunnlag
- snowflake: Snowflake + dbt (representativt eksempel, dbt er valgfritt)
- fabric: Microsoft Fabric / OneLake / Power BI (representativt eksempel)
- databricks: Delta/Lakehouse, Lakeflow, Databricks SQL og KI (representativt eksempel)

Leverandørarkitekturene er våre egne forenklede diagrammer og er ikke kopierte proprietære referansebilder. Kilder ligger på relevante lysbildeobjekter i biblioteket. Et arkitekturdiagram kan vises med mørkt og lyst tema, mens selve logoene beholdes uendret på hvit flate.

## Kvalitet og eksport
- scripts/check-architecture-assets.mjs validerer ID-er, referanser, bildefiler, SHA256 og rettigheter.
- scripts/check-architecture-browser.mjs tester bibliotek, alle seks diagrammer, mobil, temavalg, bildeinnlasting og at HTML-eksport inneholder alt lokalt.
- Eksport pakker vedlagte visuelle ressurser og stilark inn i nedlastet HTML. For PDF benyttes utskrift av eksportert presentasjon.

## Fremtidige utvidelser
Legg til ny ressurs med unik ID, en dokumentert origin, rights, termsUrl/license og sha256. Lokal sti kan være SVG, PNG, JPG eller WebP i en godkjent ressurstype. Lag ny profil før du vurderer ny renderer. Nye figurelementer oppdateres i originalfilen, ikke i hvert lysbilde.

Kilde- og varemerkerettigheter må kontrolleres ved bruk av nye ressurser. Interne ressurser må fortsatt distribueres kun via beskyttet intern løsning.

## Andre iterasjon: tre selvstendige leverandørscener

- Snowflake: datamiljø med inntak, delt datagrunnlag, modellering med dbt, Dynamic Tables eller Snowpark og tre forskjellige bruksflater, inkludert Streamlit in Snowflake.
- Fabric: ulike arbeidsflater over OneLake – Data Factory, sanntidsintelligens, Lakehouse og Warehouse – med Power BI, data agents og Activator som mulige anvendelser.
- Databricks: Lakeflow-innhenting, Delta med Bronze–Silver–Gold og separate løp til Databricks SQL og Mosaic AI, forbruk gjennom Genie, BI og Apps.

Dette er tre separate komposisjoner i `vendor-architectures.js`/`.css`. De gjenbruker små byggesteiner, men ikke en felles femkolonners layout. Underproduktikoner fra leverandørenes egne kilder ligger som egne registrerte assets. Ikke alle tjenester er obligatoriske, og eksemplene er ikke uttømmende.

**Fargeprinsipp:** Lys er standard for hele biblioteket, Presenter og eksport. Valget kan endres til Mørk eller Fortellingsstyrt både fra biblioteket og Presenter, og lagres som en lokal visningspreferanse. Fortellingsstyrt følger historiens kapittelfarger; delbare lysbilder har derfor ikke én universell historie-tone. Alle renderer-komponenter bruker semantiske fargetokens; ekte logoer beholder originalfarge.
