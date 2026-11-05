# Temakontrakt for Innsikt-kjernen

Organisasjoner overstyrer bare offentlig deklarerte fargeroller i et **eget stilark lastet sist**, uten å endre kjernens CSS, klasser, ID-er eller ruter. Standardverdiene finnes i den ene `:root`-blokken i `docs/assets/site.css`. Dette gjelder vanlige sider, arkitektur, Presenter og HTML-eksport.

## Offentlige fargeroller

| Roller | Bruk |
| --- | --- |
| `--ink`, `--muted`, `--faint` | Primær, sekundær og svak tekst |
| `--paper`, `--surface`, `--surface-alt` | Side-, kort- og alternativ bakgrunn |
| `--border` | Linjer og avgrensninger |
| `--accent`, `--accent-soft` | Handling, lenker og mild aksentflate |
| `--navy`, `--navy2` | Mørke paneler, sidefelt og knapper |
| `--blue` | Sekundær aksent |
| `--ok`, `--warn` | Positiv status og varsel |
| `--on-dark`, `--on-accent` | Tekst/ikoner oppå mørke eller aksentsterke flater |
| `--focus` | Tastaturfokus |

Presenter har egne roller `--slide-{strong,light}-{bg,fg,muted,accent,warning}` (10 totalt). I standardpaletten arves `--slide-strong-bg` fra `--navy` og `--slide-light-bg` fra `--surface`. Rollene kan også overstyres selvstendig.

**17 grunnroller og 10 lysbilderoller** er offentlig kontrakt; historiske nyanser beregnes relativt via `hsl(from var(...) ...)`, `rgb(from ...)` eller `color-mix()`. Dermed følger de endringer av paletten. Nøytrale roller (metning 0) gir også nøytrale avledede nyanser, uten utilsiktet fargestikk. `--teal`, `--lime` og `--surface-secondary` er bakoverkompatible aliaser til `--accent`, `--accent-soft` og `--surface-alt`; ikke overstyr dem. `--arch-muted` er en privat, avledet komponentvariant. Fonter, radius og skyggestørrelse ligger utenfor fargekontrakten.

## Organisasjonsstilark

Legg organisasjonens theme.css etter samtlige kjernefiler. Merk lenken med data-innsikt-skin for at Presenter skal inkludere temaet i nedlastet HTML. Eksisterende organization/-lenker støttes også:

```html
<link rel="stylesheet" href="./organization/theme.css" data-innsikt-skin>
```

```css
:root {
  --navy: #172d51;
  --accent: #265e97;
  --accent-soft: #d8e8fc;
  --paper: #f7faff;
  --surface-alt: #e9f1ff;
}
```

Fullstendig syntetisk palett ligger i `scripts/fixtures/theme-synthetic.css` (testdata, ikke en bedriftsprofil). Velg tekst-/bakgrunnsroller samlet. Ingen automatikk kan garantere WCAG AA for vilkårlige fargevalg.

## Kvalitet og vedlikehold

`node scripts/check-theme-contract.mjs` stanser nye bokstavelige hex-/rgb-/hsl-farger utenfor `:root` i alle seks CSS-filer og eksportens ekstra CSS. Unntakslisten er tom; separate SVG-er med dokumenterte leverandørfarger er utenfor CSS-kontrakten. `node scripts/check-theme-browser.mjs` tester syntetisk palett og skjermbilder fra alle hovedsider, mobil/desktop og begge presentatørtoner. Sett `INNSIKT_THEME_BASE_URL` for pikselvis sammenligning mot forrige release.

WCAG AA krever normalt 4,5:1 for vanlig tekst og 3:1 for stor/fet tekst. Nye komponenter skal bruke eksisterende roller og relative nyanser, ikke kopiere fargekonstanter. Nye offentlige tokens må begrunnes i nye semantiske roller.


## Design og bevegelse på tvers av kopiløsninger

De tre redaksjonelle pilotene (analytiker-metaforen, KI-utbredelse og kvalitetsutfall) bruker bare --pres-* som peker til de offentlige --slide-*-rollene. Lys, mørk og syntetisk/organisasjonsspesifikk palett skal fungere uten å endre scenene. Stiler og innhold er atskilt. Organisasjonen skal kunne overstyre temaet, ikke duplisere lysbildene.

Bevegelse (på/av) er en selvstendig Presenter-innstilling, lagret lokalt i nettleseren. Lysbildet eier innholdsanimasjon; fortellingen eier overgangstype per plassering. Statisk bibliotek, bevegelse av, prefers-reduced-motion og utskrift viser alltid alt viktig innhold. Eksporterte HTML-filer inneholder både valgt palett, skinn-CSS og en bryter for bevegelse. Ikke overstyr transform på den skalerte 16:9-rammen.


### Ny verdimodell-slide (0.18.51)

`ai-value-in-context` er en gjenbrukbar SVG/HTML-scene, **ikke et bakgrunnsbilde**. Visningen henter alle fagtekster fra JSON. Linjer, ikoner og glød følger `--pres-accent`, `--pres-fg`, `--pres-muted` og `--pres-bg` fra de eksisterende tema-rollene. Når en kopiløsning endrer kun de dokumenterte `--slide-strong-*`/`--slide-light-*`-rollene, følger hele figuren med, inkludert SVG-strekene. Ingen ny CSS-skin-kontrakt er nødvendig.


### Redaksjonelt designsystem, v0.18.52

`slide-editorial-system.css` har ingen bokstavelige merkefarger og avleder alle flater, linjer, fokus og skygger fra allerede dokumenterte `--pres-*`-roller. Nye lysbildeklasser kommer fra kanonisk metadata, ikke en privat organisasjonsskin-fil. Et eget CSS-skin kan fortsatt overstyre kun `--slide-strong-*` og `--slide-light-*`; fargeendringen går gjennom i alle 40 lysbilder, HTML-eksport og bildebasert enkeltslideeksport uten at figuren må gjenskapes.


### Nye komposisjoner uten skin-binding (0.18.53)

`slide-visual-narratives.css` er et nytt, strukturelt stilark for sju dataeide scenevarianter. Det ligger etter alle kjerne-CSS-filer, men før enhver organisasjons CSS-skin, både på nettstedet og i portable HTML-eksporter. Alle synlige farger, SVG-streker, ikonbakgrunner og skygger er definert via semantiske `--pres-*`-roller, avledet fra offentlige `--slide-strong-*` og `--slide-light-*`-roller. Ingen egen tokenkontrakt eller bildebasert styling kreves for kopiløsninger.


### Illustrert art direction (0.18.57)

«Illustrert» er et valgfritt uttrykk for lysbilder med `visual.artDirections: ["illustrated"]`. Det er ikke et nytt offentlig fargetema: visningen gjenbruker `--slide-strong-*` og avledede `--pres-*`-roller. Landskap, himmel, snø, sti og flagg er dekorativ SVG uten fagtekst. Andre lysbilder vises i mørk standard ved dette valget. CSS-skins trenger ingen endringer. Det valgte uttrykket skal følge med eksport uten å duplisere lysbildeinnhold.


### Scenegrafikk som egne objekter – v0.18.58

Fagtekst, tabeller og kontroller fortsetter å følge selskapets CSS-skin fullt ut. Illustrerte objekter kan ha egen, bevisst kunstnerisk palett og trenger ikke treffe organisasjonens profilfarger nøyaktig. Et valgfritt skin kan likevel overstyre **kun** `--scene-art-saturation`, `--scene-art-brightness`, `--scene-art-hue`, `--scene-art-veil` og `--scene-art-glow` i `.scene-art`, uten å duplisere scene eller endre illustrasjonens faktainnhold. Disse variablene gjelder dekorative objekter, ikke tekst eller sikkerhetsrelevant informasjon. Illustrasjonslagene er egne SVG/PNG/WebP/JPG-filer oppført i ressurssamlingen. Konkrete posisjoner og layer-rekkefølge eies av `slides.json`. HTML-eksport må inkludere CSS og alle lokale illustrasjonsressurser.


### Rik illustrasjon med eget bildeobjekt – v0.18.59

Kjernens selskapsprofil er obligatorisk for alle tekster, kort, piler, typografi og andre meningsbærende objekter. Den rike scenen har et separat katalogført, KI-generert bakgrunnsbilde og tillater moderat avvik i natur- og illustrasjonsfarger. Begrenset overstyring av dekorative flater skjer via eksisterende `--scene-art-*`-roller. «Rik illustrasjon» er ikke et alternativ til selskapets designkontrakt, men en art direction med kontrollerte frihetsgrader. I alternativ lys/mørk/fortellingsstyrt brukes bare native visning, uten kopiering av faginnhold.
