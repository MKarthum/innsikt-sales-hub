# Arbeidsregler for KI-agenter

Les `START_HERE.md` først.

## Formål og mottaker

- Primærmottaker: selgere i førstelinjen som ikke nødvendigvis kjenner dataplattformer.
- Sekundærmottaker: fagansvarlig som bruker nettsiden for kvalitetssikring, videreutvikling og opplæring.
- Start med kundens problem, kjøpsutløsere og gode spørsmål – ikke teknologien.
- Bruk nøktern norsk og norske regler for store forbokstaver.

## Faglig kvalitet

- Skill eksplisitt mellom statistiske fakta, leverandørpåstander, redaksjonell vurdering og hypotese.
- Ethvert tall skal ha kilde, tidsangivelse, relevant populasjon og riktig enhet.
- Ikke påstå eller antyd at SSBs KI-bruksstatistikk måler konsulentetterspørsel eller oppnådde gevinster.
- Ikke konstruer Webstep-kundecaser, partnerfordeler, referanser eller tilgjengelighet.
- Innhold som bruker enkeltleverandører skal være plattformnøytralt og vise overlapp der relevant.
- Gi en klar vei fra observasjon til kvalifiseringsspørsmål og neste steg.
- Kilder for eksterne fakta i `sources`; salgsinnganger peker til relevante source-IDs.

## Datasikkerhet

`OPEN_DATA_POLICY.md` gjelder selv om repoet er privat. Ikke lagre kundelister, personopplysninger, interne salgsnotater, ikke-offentlige avtaler eller partnerdata i denne utgaven. Ikke legg til ekstern autentisering, innsamling av persondata eller skjulte trackere.

## Implementering

- Hold visningskode lett og flyttbar. Ingen eksterne backend-avhengigheter.
- Foretrekk enkle statiske løsninger. Ikke introduser rammeverk uten dokumentert behov.
- Rediger felles komponent ett sted. Ikke legg lag på lag av CSS-overstyringer.
- Bruk relative stier for GitHub Pages-prosjektnettsteder.
- Behold tastaturnavigasjon, kontrast, responsive visninger, redusert bevegelse og semantisk HTML.
- Datanøkkel `id` skal være unik og stabil. Ved navneendring skal lenker med ID fortsatt virke.
- Unngå at synlig innhold blir en kronologisk logg over endringer; bruk oppdatert versjon og en egen backlog.

## Innspill og forbedringsløkke

- «Gi innspill» lagrer lokalt i nettleseren. Ikke fremstill det som en synkronisert eller permanent løsning.
- Oppdater `backlog` ved vesentlige funn. Når en backlogpost fullføres, merk den lukket med grunnlag, ikke slett all sporbarhet.
- Før flytting: sørg for enkel overføring til en organisasjonseid GitHub-organisasjon og kontrollert intern drift.

## Før publisering

1. `node --check docs/assets/site.js`
2. `node scripts/check.mjs`
3. Server nettsiden lokalt og test: oversikt, markedsgraf, filter, salgsinngang, søk, scenario, innspill, eksport, mobil og presentasjon.
4. Kontroller nytt innhold opp mot `OPEN_DATA_POLICY.md`.
5. Oppdater `meta.version`, `released` og eventuelle `checked`-datoer når de faktisk er kontrollert.