# Rettigheter i organisasjonens interne Innsikt-utgave – mal

> **Mal, ikke inngått avtale eller gjeldende rettighetstildeling.** Kopier og tilpass denne til et autorisert internt repo når partenes rettigheter og publiseringsgrunnlaget er avklart. Dette dokumentet hører ikke til den offentlige kjernens gjeldende lisens.

## Grunnlag

Den interne løsningen bygger på Innsikt-kjernen fra [repository], versjon [tag/commit SHA], innhentet [dato]. Bruk, endring og intern videreutvikling av denne versjonen følger de lisensvilkårene som faktisk gjelder den aktuelle kildeversjonen. Bevar kildehenvisninger, lisensfiler og nødvendige attribusjoner.

## Bruksrett og videre utvikling

Virksomheten kan fortsette å bruke, drifte, vedlikeholde, videreutvikle og tilpasse den mottatte versjonen uavhengig av om det offentlige prosjektet senere endres, flyttes, slutter å bli vedlikeholdt eller blir utilgjengelig. Dette forutsetter at en slik bruksrett følger av den mottatte versjonens lisens eller annen dokumentert tillatelse. Virksomheten har ikke krav på fremtidige versjoner, vedlikehold, support eller tilgjengelighet fra leverandøren av den åpne kjernen.

Eventuelle senere kjerneoppdateringer krever en separat teknisk importbeslutning og at oppdateringens lisens er forenlig med virksomhetens bruk. Ingen automatisk rett til levering eller distribusjon av oppdateringer etableres.

## Interne komponenter og informasjon

Virksomheten forvalter rettigheter og tilganger til organisasjonsspesifikke utvidelser og sitt interne materiale. Eierskap til egenutviklede programtillegg og tekster følger relevante avtaler og lovregler. Kundedata, partnerinformasjon, personopplysninger, tredjepartskomponenter og annet rettighetsbelagt materiale tilhører eller kontrolleres av respektive rettighetshavere og behandlingsansvarlige. De kan ikke kategorisk omtales som virksomhetens eiendom.

Innholdspakken, interne kundehistorier, reelle case, tilbud, medarbeideropplysninger, interne verktøy og tilgangsnøkler inngår **ikke** i den åpne kjernelisensen. Ingen lisens eller tilgang til slikt materiale gis til den åpne kjernens vedlikeholder bare fordi det brukes i samme applikasjon. Ingen automatisert synkronisering fra intern utgave til åpen kjerne.

## Samspill og leverandøruavhengighet

- Hold `vendor/innsikt-core/` låst til valgt og verifisert kildeversjon.
- Hold organisasjonens egne konfigurasjoner, data og kode under `organization/`.
- Oppgrader kjernen etter eksplisitt godkjenning og regresjons-/sikkerhetstest; interne data og endringer skal ikke overskrives.
- En organisasjon kan bytte vedlikeholder uten at videre bruk av en lovlig mottatt versjon avhenger av én persons fortsatte medvirkning.

## Særlig for Webstep

Den interne løsningen kan omtales som «Innsikt for Webstep». Websteps egne medarbeidere, godkjente leverandører og interne verktøy kan videreutvikle løsningen innenfor relevante lisens- og avtalebetingelser. Websteps interne innhold og eventuelle rettigheter til interne tilpasninger skal beskrives uten å tildele Webstep opphavsrett til den opprinnelige, åpne kjernen eller å tildele den åpne kjernens vedlikeholder rettigheter til Websteps beskyttede materiale.

**Må godkjennes av relevante rettighetshavere og Webstep før bruk i intern avtale eller policy.**
