# Redaksjonell og teknisk gjennomgang av promptbiblioteket
22. oktober 2026 — versjon 0.11.2

## Vurderingskriterier

Alle 15 oppgaver er vurdert for: korrekt bruksøyeblikk, forståelig tittel og beskrivelse, de riktige inndataene, relevante tilpasningsvalg, nytte i salg og oppfølging, konkrete og etterprøvbare utdata, sikker databruk og risiko for dobbeltkommunikasjon. Antallet prompter er **ikke** et mål i seg selv.

## Resultat per oppgave

| Oppgave | Justering |
| --- | --- |
| Analyser en kunde – Innsikt | Fjernet antakelsen om møte. Erstattet møteformål med valgfritt analysespørsmål. Gjort kilde- og teknologikontroll eksplisitt og skilt mellom signaler og oppdrag. |
| Forbered kundekontakt | Tydeliggjort at kontakten kan være varm, kald eller videreført, via flere kanaler. Fokuserer på en naturlig samtaleinngang. |
| Forbered et kundemøte | Endret fra «Møtebrief på én side». Mindre rigid antall spørsmål og tydeligere skille mellom samtaleguide og grad av fordypning. |
| Utforsk behov i en bransje | «Kjøpssignaler» var for sterkt når innholdet er hypotetiske bransjebehov. Tydeligere faktaskille og fleksibelt omfang. |
| Forbered en behovssamtale | Beskrivelsen starter med kundens signal og hva vi vil avklare. Færre obligatoriske spørsmål. |
| Avklar kompetansebehov | Ikke lov matching mot navngitte konsulenter eller kapasitet når vi mangler godkjente profiler. |
| Vurder en mulig Innsikt-leveranse | Flyttet under muligheter, forenklet navn, kvalifisering før teknologi. |
| Skisser en avgrenset pilot | Skilt mellom pilot, forutsetninger og bindende tilbud. Tydeligere stoppkriterier. |
| Planlegg en kartleggingsworkshop | Kortere tittel, tydeligere aktiviteter, deltakere og beslutningspunkt. |
| Lag et presentasjonsutkast | Erstattet «møtets formål» med «hva materialet skal oppnå»; presentasjoner kan også brukes uten møte. |
| Lag et kort beslutningsnotat | Unngått fast 300-ordsbegrensning som kolliderte med svarnivå. Tydelig beslutningsverdi. |
| Følg opp en kunde | Ikke begrenset til møtereferat. «Oppfølgingsgrunnlag» erstatter møtespesifikt felt. Valg for både kontaktsituasjon og kanal. |
| Forbered deg på kundens innvendinger | Naturlig oppklaring før motargument. Lavere krav til kunstig antall eksempler. |
| Avklar en mulig partnerdialog | Plassert under muligheter fremfor all oppfølging; understreker at vilkår/fordeler ikke skal antas. |
| Utfordre en salgsidé | Prioriterer faktasjekk, alternative forklaringer og mulighet til å si nei til oppdrag. |

De fem filterkategoriene er nå: **Forstå kunden**, **Kontakt og møter**, **Behov og muligheter**, **Materiell og formidling** og **Oppfølging**.

## Viktigste endring i brukeropplevelsen

Full prompttekst ligger fortsatt under «Se og rediger hele prompten» for avanserte brukere. Den er ikke nødvendigvis det beste utgangspunktet for de øvrige.

En levende **«Slik påvirker valgene prompten»**-oversikt viser instruksjoner hentet fra samme JSON-alternativer som brukes i den kopierbare prompten. Den står ved siden av feltene på desktop og foran feltene på mobil. Samme instruksjonsutdrag vises lokalt under radiovalgene. Brukeren får synlig tilbakemelding uten at hele, lange promptteksten må vises som standard. Knappene for å kopiere og vise fullteksten er tilgjengelige direkte i oversikten. En synlig advarsel forklarer at manuelt redigert prompttekst ikke oppdateres av radiovalg før den tilbakestilles.

## Datakontrakt og separasjon

- `docs/data/prompts.json` eier **alle prompttekster, titler, beskrivelser, valg, outputregler, hjelpetekster, forhåndsvisningstekster og brukerrettede kopimeldinger**.
- `docs/assets/prompt-context.js` håndterer variabler, tilstand og komposisjon. `selectedBlocks()` leverer de samme valgte instruksjonsblokkene til både prompt og forhåndsvisning — ingen parallell «forklart» tekst.
- `docs/assets/prompts.js` konstruerer HTML fra data. `docs/assets/site.js` reagerer på endringer og kopiering. `docs/assets/site.css` eier plassering og utforming. Ingen promptformuleringer skal ligge her.
- `docs/data/pages.json` eier de redaksjonelle presentasjonsløpene; henvisninger til reviderte prompttitler er oppdatert der, ikke kodet inn i Presenter.
- Offentlige/enkle input kan ligge i tab-sesjon; rik kundekontekst er fortsatt kun i nettleserminnet. Ingen CRM- eller KI-integrasjon er etablert.

## Gjenværende spørsmål for reell brukertest

Er den levende forhåndsvisningen tilstrekkelig forståelig og rask? Blir det for mye å velge mellom på mobil? Gir analysen bedre kunde- og teknologiinnsikt med tilgjengelige kilder? Er de spesialiserte oppgavene reelt nyttige? Dette kan ikke avgjøres kun av tekniske tester og bør testes med selgere med offentlig eller anonymisert grunnlag.
