# Mediearkiv og publisering av bilder

## Formål

Kun bilder som faktisk vises på nettstedet, skal distribueres i nettstedet eller i en eksportert Artifact-pakke.
Originaler kan ligge i repoet som grunnlag for senere ombygging, men aldri under docs/.
Alle kilder er offentlig tilgjengelige i et offentlig repo; lagre ikke konfidensielle eller rettighetsbegrensede bilder uten tillatelse.

## Én kildefil, én distribusjonsvariant

- media/masters/ inneholder den godkjente kildefilen for hvert aktivt, regenererbart bilde.
- media/images.json eier kildefil, distribuert sti, ønsket bredde, WebP-kvalitet, maksimal filstørrelse og SHA-256 for begge.
- docs/assets/library/ inneholder kun den komprimerte varianten som faktisk brukes.
- docs/data/visual-assets.json refererer kun distribuert fil, og eier fremdeles rettigheter, lisens og bruk.
- scripts/rebuild-media.py bygger derivater, uten å oppskalere originale bilder. Oppdaterer begge manifest og katalognøyaktig.
- scripts/check-media-assets.mjs feiler ved foreldet bilde, uregistrert bildefil, overskredet budsjett eller direkte bruk av arkivstien.
- npm run build:artifact oppretter dist/innsikt-artifact.zip fra en eksplisitt publiserbar rot (docs/), aldri fra repoets rot.

## Konkret bruk ved bildebytte

1. Legg godkjent høyoppløselig bilde i media/masters/ med den registrerte filstien, eller opprett et nytt objekt i manifestet og ressurskatalogen.
2. Installer ved behov bildeverktøy lokalt: python3 -m pip install -r media/requirements.txt
3. Kjør npm run build:media, deretter npm run check og npm run build:artifact. En allerede liten WebP-master kopieres tapsfritt; bruk python3 scripts/rebuild-media.py --rebuild --reencode bare hvis du bevisst vil rekomprimere.
4. Inspiser motiv, tekstfrihet, bildekvalitet og sliden i alle visningsretninger, både på skjerm og i nedlasting.
5. Publiser kilde og derivat i samme commit, slik at revisjon og rollback alltid kan gjøres konsistent.

Bildet som i dag heter context-rich-background, var bare 800 × 450 ved migreringen. Det er arkivert slik det eksisterte. Å oppskalere det til 1920 × 1080 skaper ingen reell detaljkvalitet. En godkjent, ekte høyoppløselig erstatning kan settes inn med prosessen over.

## Historiske originaler: bevar bare når det har et formål

Vi lager ikke en ny kopi av tidligere kildefil i mediearkivet hver gang den oppdateres.
Git-historikken gir allerede revisjoner av både kilde, derivat og manifest.
Ved vanlig reversering brukes git show for riktig fil og commit, etterfulgt av en rebuild.
En egen historisk original skal bare beholdes hvis den har en dokumentert grunn:
uavhengige, ikke-reproduserbare generative kilder; særskilte rettigheter; eller en klart annen komposisjon som kan bli et eget aktivt objekt.
Da får den en ny asset-ID og en eksplisitt eier, ikke et tilfeldig versjonsnavn.
Store originaler som samlet gjør repoet tungt, bør vurderes for separat, versjonert arkiv i stedet for Git-historikk.

## Størrelsesrammer

- Standard: maksimal bredde 1920 piksler uten oppskalering, WebP kvalitet 86.
- Maksimalt 250 KB for nye faglige bildeillustrasjoner (se PRESENTATION_IMAGE_ARCHITECTURE.md). For eksisterende dekorative objekter gjelder inntil videre 500 KiB per distribuert rasterbilde, og samlet høyst 600 KB for katalogførte bildeobjekter i ett lysbilde, med automatisk kvalitetsreduksjon ved rebuild.
- Hele nettsted-/Artifact-pakken har foreløpig en konservativ unkomprimert ramme på 12 MiB, kontrollert i CI.
- Et dekorativt bakgrunnsbilde skal ikke inneholde tekst, begreper, forbindelser eller organisasjonslogo.
- Genererte bilder kan variere. Bildeforbedring må godkjennes visuelt, selv når checksummene stemmer.

## Logoer og tredjepartsdesign

Den samme faglige modellen vises med mottakerens CSS-skin.
En kopi kan plassere sin godkjente logo som et separat overlegg ved å sette
--slide-brand-logo, --slide-brand-width, --slide-brand-height, --slide-brand-right og --slide-brand-top.
Logoen må leveres som lokalt tilgjengelig ressurs eller innbakt data-URI ved offline-eksport.
Bakgrunnsbildet skal ikke regenereres bare fordi virksomheten bytter logo.
Varemerker er underlagt sine respektive bruksvilkår.

## Konsistens mellom visninger

Relasjonene på benchmarksliden ligger i visual.graph under den kanoniske sliden i slides.json.
Alle stiler bruker samme strukturerte pilrenderer i slide-graph.js; den tegner forbindelser og pilhoder fra samme fra/til-data.
Ved feil pilretning rettes kun relasjonen. Bildet er et dekorativt lag og skal ikke tegne andre faglige piler.
Ved endringer av faglig informasjon skal alle native visninger og eksport oppdateres automatisk.
Et fremtidig *ferdigrasterisert* fagdiagram vil trenge versjonert dependency-hash og en publiseringsport for foreldede bildepiksler; dette er ikke del av dagens dekorative bildemodell.
