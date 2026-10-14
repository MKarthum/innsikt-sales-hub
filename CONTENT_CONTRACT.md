# Innholdskontrakt – én autoritativ kilde (v2, 14.10.2026)

Gjelder alle endringer i Innsikt. Les sammen med `START_HERE.md`, `AGENTS.md`, `OPEN_DATA_POLICY.md` og `REFACTOR_REVIEW.md`. Versjon 0.9.0 innfører en **delvis implementert, maskinelt kontrollert** referansemodell. Kontrakten gjelder også eldre innhold som ennå ikke er fullt normalisert.

## Autoritet og visningsvalg

- Ett semantisk innholdselement har én dataeier og stabil ID. Det gjelder også når teksten er omskrevet eller kortet ned.
- Et objekt kan ha `variants.short`, `variants.normal` og `variants.long`, under **samme ID og eier**. Opprett bare varianter med et faktisk formål.
- En side, et lysbilde eller en prompt velger ID og variant, ikke en tekstkopi. Eksisterende sidetilpassede spørsmål, titler og pedagogiske eksempler kan fortsatt være sideeide dersom de ikke gjengir en annen dataeiers faktapåstand.
- `pages.json` eier rekkefølge, komposisjon, sidetitler og unike presentasjonsnotater. `horizon.json` eier original analyse og hypoteser, ikke nye kopier av ordliste, produktegenskaper eller markedsfakta.
- Alt i dette offentlige repoet og Git-historikken er offentlig; `visibility: "not-presented"` hindrer bare visning, ikke innsyn. Ikke lagre noe konfidensielt der.

## Referanser som faktisk er implementert

En referanse er et JSON-objekt: `{ "$content": "glossary:dataplattform", "variant": "normal" }`.

`docs/assets/content.js` løser referanser ved oppstart og returnerer ordinære tekstfelt til visningskomponentene. Den feiler eksplisitt ved manglende eier/ID/variant, duplisert ID og ugyldige referansefelt. Registrerte samlinger er `glossary` (`learning.json.glossary`), `risk` (`learning.json.risks`), `guidance` (`sales.json.sharedGuidance`), `market-guidance` (`market.json.metricGuidance`), `ai-overview` (`technologies.json.aiOverview`) og `prompt-rule` (`prompts.json.rules`). Utvid registeret og kontrakttestene sammen ved nye referansetyper; ikke innfør parallelle lookups.

Kopierbare prompter kan lagre `promptParts` med veksling mellom strengtekst og `$content`-referanser. Resolveren setter sammen delene **uten ekstra tegn** til ett selvstendig promptfelt før visning, redigering og kopiering. En prompt har enten `prompt` eller `promptParts`, aldri begge. Felles regler eies av `prompts.json.rules`.

Fordi dette fortsatt er et gradvis normalisert prosjekt, brukes eksisterende domenefelter (`source`, `sources`, `sourceIds`, `meaning`, `description` osv.) der de allerede er kanoniske. Ikke introduser en ny `sourceIds`-kopi bare for å standardisere navnet på et felt.

## Kilder, datoer og kunnskapsstatus

Bruk `evidence` for `documented` (dokumentert fakta), `vendor` (leverandørens beskrivelser/veikart), `assessment` eller `hypothesis` (egen vurdering/hypotese), og `open-question` (ikke avklart). Knytt tidsfølsomt innhold til `reviewed`, og fakta/leverandørinformasjon til faktisk kildereferanse. `sources.json.checked` er siste kontroll av kildelenken, mens `sources.json.published` er kildens publiseringsdato; ingen av dem erstatter innholdets `reviewed` eller produktets `status`/preview-angivelse.

En leverandørkilde dokumenterer hva leverandøren beskriver, ikke kundens realiserte gevinst. Beskriv «Company Brain» som uformell markedsterminologi, ikke standardarkitektur. Konvergens mellom dataplattform og kunnskapsgraf er en mulighet, ikke et bevist utfall.

## Automatisk verifikasjon og begrensninger

Kjør `node scripts/check.mjs` ved enhver endring. Kontroller omfatter referanser, ID-er, kildefelter, skjult innhold, promptkomposisjon, lange **eksakte** tekstduplikater, 76 genererte visninger og metamorfisk spredning av én begrepsendring til Start her, fordypning, Presenter og søk. Test også i nettleser med mobil og desktop før publisering.

Eksakttest garanterer ikke at to ulikt formulerte tekster har samme semantikk. Ikke alle eldre felt er referansebaserte, en del generiske UI-etiketter ligger fortsatt i JavaScript, og den manuelt kuraterte søkeindeksen kan kreve oppdatering ved nye typer innhold. Se `REFACTOR_REVIEW.md`. Dette er kjente restanser, ikke grunnlag for å hevde fullstendig semantisk normalisering.

## Endringsrekkefølge

1. Finn eller opprett kanonisk eier/ID og dokumenter kilder og status.
2. Finn alle forbrukere av ID-en og sørg for eksplisitte referanser/varianter.
3. Kjør alle kontroller og test virkning på aktuelle sider, søk, Presenter og kopierbare prompter.
4. Gjennomgå offentlighet, mobil, desktop, CSS, lenker og kildegrunnlag før atomisk publisering.
5. Oppdater `site.json` og alle JS/CSS-versjoner ved samlet release. Ingen database, CMS eller ny frontend-stakk uten dokumentert behov.
