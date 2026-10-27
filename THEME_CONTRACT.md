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

**17 grunnroller og 10 lysbilderoller** er offentlig kontrakt; historiske nyanser beregnes relativt via `hsl(from var(...) ...)`, `rgb(from ...)` eller `color-mix()`. Dermed følger de endringer av paletten. `--teal`, `--lime` og `--surface-secondary` er bakoverkompatible aliaser til `--accent`, `--accent-soft` og `--surface-alt`; ikke overstyr dem. `--arch-muted` er en privat, avledet komponentvariant. Fonter, radius og skyggestørrelse ligger utenfor fargekontrakten.

## Organisasjonsstilark

Legg `organization/theme.css` etter samtlige kjernefiler:

```html
<link rel="stylesheet" href="./organization/theme.css">
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
