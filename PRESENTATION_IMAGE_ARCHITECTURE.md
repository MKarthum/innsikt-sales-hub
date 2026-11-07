# Bildebaserte presentasjoner

## Prinsipp

Det faglige innholdet eies av docs/data/slides.json. Den samme sliden kan vises som native diagram, nøktern illustrasjon og rik illustrasjon. En bildebasert illustrasjon er et godkjent visuelt snapshot, aldri en alternativ kilde til fagdata. Native diagram kan overta hele mottakerens CSS-skin; et godkjent bilde kan ikke forventes å endre innhold og farger gjennom CSS.

Denne implementasjonen er begrenset til benchmarken ai-context-platforms-2027. Tidligere sceneobjekter beholdes midlertidig for å unngå regresjoner i andre presentasjoner.

## Modell, manifest og statuser

docs/assets/presentation-illustrations.js normaliserer synlige faglige tekstfelt og semantiske fra/til-relasjoner. Denne modellen hashes med SHA-256. Logo, dekorasjon, kilde-ID-er for overlegg og kildefiler inngår ikke i modellhashen. Endringer i faglige tekster og relasjoner påvirker hash og gjør godkjente bilder utdaterte.

docs/data/presentation-illustrations.json registrerer sourceSlideId, styleId, renderRecipeVersion, contentHash, fileSha256, approvalStatus, approvedAt og reviewedBy.

Statusene er awaiting-asset, in-review, approved og rejected. Bare approved med samsvarende modell- og bildefilhash får vises. Bildet krever en faktisk faglig og visuell godkjenning før status endres. En KI-generering er ikke en slik godkjenning.

## Lage og godkjenne en illustrasjon

De tre alternativene er nå eksakt: Enkel diagramvisning (native HTML/CSS/SVG), Nøktern illustrasjon (native diagram og et eksisterende, separat landskapsbilde), og Rik illustrasjon (ett godkjent, ferdigrendret WebP-bilde). De gamle modusene er ikke valg i brukergrensesnittet.

En ferdigrendret bildevariant er allerede publisert fra den kanoniske modellen. Originalen er beholdt under media/illustrations/masters. Kilden til landskapsbakgrunnen er den tidligere godkjente bakgrunnsressursen. Eksisterende eldre renderer kan beholdes som teknisk overgang, men skal ikke eksponeres som et konkurrerende valg i menyen.

Ved en senere faglig endring eller nytt bilde: Legg kildebildet på en autorisert maskin med repoet. Bildet må vise riktig antall kilder, kontekstfacetter, konsumenter og verdipunkter. Kontroller pilretninger og de logiske sammenhengene.

For rik illustrasjon:

    node scripts/presentation-illustrations.mjs import ai-context-platforms-2027 rich-image /sti/til/bilde.png

Import lagrer kildeoriginalen i media/illustrations/masters, og et optimalisert WebP-utkast i media/illustrations/drafts. Utkast blir ikke distribuert. ImageMagick eller kompleks runtime-rendering er ikke nødvendig. Pillow optimaliserer til maks 1600 piksler bredde, normalt 250 KB, og oppskalerer aldri et lite bilde.

Etter manuell visuell og faglig kontroll:

    node scripts/presentation-illustrations.mjs approve ai-context-platforms-2027 rich-image GODKJENNER --faglig-ok --visuelt-ok

Godkjenner skal være en reell, dokumenterbar reviewer. Kommandoen publiserer den godkjente derivatfilen i docs/assets/illustrations, og registrerer hash og godkjenningsdato.

For å trekke en variant tilbake:

    node scripts/presentation-illustrations.mjs revoke ai-context-platforms-2027 rich-image

Kontroller med:

    node scripts/presentation-illustrations.mjs check

## Faglig kontroll av benchmarken

Dataplattformer, operative systemer og eksterne kilder kan bidra med relevant tilstand og kunnskap. Virksomhetskontekst organiserer betydning, situasjon og rammer; mennesker, applikasjoner og KI-agenter benytter dette i ulike arbeidsoppgaver. Beslutninger kan føre til autoriserte handlinger; resultater og endret tilstand kan informere konteksten igjen. Grafen viser logiske relasjoner, ikke én tvungen dataflyt eller en sekvens alle prosesser må følge.

Styring og tillit må omfatte datakvalitet, eierskap, passende tilganger, sporbarhet og menneskelig ansvar. Ingen pil eller illustrasjon må implisere at en KI-agent har ubegrenset handlingsrett.

## Portabilitet, eksport og ressursbudsjett

Native diagram er CSS-skinbart. Et bilde er et selvstendig verk som kan gjenbrukes, erstattes med annen godkjent bildestil eller genereres på nytt. Mottakerens logo holdes som eget overlegg, inkludert i eksport. Bildefiler lastes behovsstyrt og bygges bare inn som data-URI i den midlertidige eksportkopien. Kildeoriginaler under media distribueres ikke.

Sikt mot 100 til 150 KB per bilde og bruk 250 KB som normal maksgrense. Vurder alltid skarphet og lesbarhet visuelt. Faglig godkjenning kan ikke erstattes av hash, størrelse eller en vellykket PNG-eksport.

Claude Artifacts' faktiske begrensninger er ikke verifisert gjennom en import i målplattformen her. En slik ende-til-ende-test må gjennomføres før portabiliteten kan regnes som dokumentert. 20 MB skal ikke brukes som antatt universell grense.

## Stilinndeling og kvalitetsstatus

* Enkel diagramvisning følger skinet og er fullt dataeid. Korrekt faglig graf valideres automatisk.
* Nøktern illustrasjon gjenbruker den eksisterende fotoillustrasjonen, men all faglig tekst og alle relasjoner er fortsatt native. Den må derfor ikke tillegges uavhengig semantikk.
* Rik illustrasjon er et faktisk 1600 × 900-bilde, komprimert til omtrent 123 KB. Import og godkjenning er registrert med kildehash, filhash og tidspunkt i manifestet. Godkjenningen er gjennomført som assistentens faglige/visuelle kontroll, ikke som brukerens endelige designgodkjenning.

Det er ikke lenger en automatisk anbefaling eller flere gamle alternativer i menyen. Lagrede eldre valg migreres til en av tre gyldige varianter. Nye valgmuligheter skal kreve en faktisk visuell variant og en relevant faglig begrunnelse.
