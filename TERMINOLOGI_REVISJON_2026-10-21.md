# Faglig og pedagogisk revisjon – 21. oktober 2026

## Omfang

Alle 21 opprinnelige ordlistebegreper ble vurdert for faglig korrekthet, pedagogisk klarhet, avgrensning fra beslektede begreper og konkrete eksempler. De er oppdatert; «Datavarehus / lakehouse» er skilt i to oppslag, og «Red teaming» er lagt til som eget begrep. Kildestatus er redaksjonell vurdering, ikke ekstern fagfellevurdering.

## Gjennomgående funn

1. Flere beskrivelser var generelle nok til å passe ulike teknologier. dbt-eksemplet viste konsistens, men ikke transformasjonsarbeidet; kunnskapsgraf-eksemplet viste relasjoner, men ikke navigasjon gjennom flere ledd.
2. Datavarehus og lakehouse ble forklart som ett begrep. Datamodell, semantisk modell, ontologi og kunnskapsgraf trengte tydeligere skiller.
3. Syv sentrale forkortelser manglet fullstendige engelske navn: CRM, ERP, BI, SQL, dbt, LLM og RAG. Eget datafelt `fullName` vises nå i grunnkurs og popup.
4. Noen definisjoner var for snevre: datapipelines kan være mer enn flytting; RAG kan hente informasjon fra flere kildetyper, ikke bare dokumentutdrag.
5. KI-agent, Company Brain og suverenitet krevde avgrensning mot henholdsvis assistenter, uformell markedsterminologi og ren geografisk lagring.
6. «Red-team forslag» i promptbiblioteket ga unødvendig fagsjargong. Oppgaven beskriver nå konkret kritisk gjennomgang, mens ordlisten forklarer det etablerte sikkerhetsbegrepet.
7. Datasuverenitet fantes i ordlisten uten en egen kundesamtale. Ny salgsinngang og et hypotetisk scenario avklarer klassifisering, lagring, behandling, tilgang, KI-bruk, kryptering og leverandørbytte.

## Kilder og metode

Se `docs/data/sources.json`: dbt Developer Hub (modellering), IBM (kunnskapsgraf og ontologi), NIST (red teaming) og Europakommisjonens Cloud Sovereignty Framework (jurisdiksjon, data/KI, drift og avhengigheter). Eksisterende kilder beholdes der de er relevante. Eksemplene er pedagogisk konstruerte, ikke dokumenterte kundeleveranser.

## Vedlikeholdsregel

Ved nye begreper: Kontroller hva det er, hva det gjør, når det er nyttig, hva det ikke er, og om eksemplet viser det spesifikke begrepet. Gjennomgå aliaser, kilder, kontrolltid, inline-hjelp, søk, oppslagsvisning og tester. Fagtekst ligger i datafilen, ikke i layout.
