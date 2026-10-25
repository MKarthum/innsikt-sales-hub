# Lisens og rettigheter – vurderingsutkast

> **Ikke en gjeldende lisens eller et rettighetstilbud.** Dette dokumentet beskriver en mulig lisensordning for Innsikt og en fremtidig intern organisasjonsutgave. Inntil en rettighetshaver har godkjent og publisert en faktisk lisens, gjelder ikke de foreslåtte tillatelsene. Det finnes foreløpig ingen `LICENSE` i repoets rot.

## Formål

Innsikt videreføres som et offentlig tilgjengelig, personlig initiert utviklings- og læringsprosjekt som organisasjoner kan bruke. Et personlig prosjekt og et prosjekt på privat GitHub-konto er imidlertid ikke i seg selv bevis for at alle økonomiske opphavsrettigheter til kode, tekst, figurer eller andre komponenter tilhører én person. Særlig må rettigheter til dataprogrammer skapt i arbeidsforhold vurderes etter åndsverkloven § 71 og relevante avtaler.

## Foreslått ordning for offentlig kjerne

Når rettighetshaverne har bekreftet at innholdet kan lisensieres, anbefales **standard MIT-lisens**, uten egen omskriving av lisensvilkårene, for prosjektets originalutviklede kode og annet materiale som rettighetshaveren faktisk kan lisensiere. Bruk ordinær `LICENSE`-fil, med korrekt(e) rettighetshaver(e) og år, og en enkel redegjørelse for lisensens rekkevidde i `README.md` eller `THIRD_PARTY_NOTICES.md`.

Det innebærer:
- Virksomheter og andre kan bruke, kopiere, endre, distribuere og videreutvikle den lisensierte versjonen, også kommersielt, mot å bevare relevante lisens- og opphavsrettsmerknader.
- Løsningen leveres som den er, uten garanti, plikt til brukerstøtte, vedlikehold, driftskontinuitet eller sikkerhetsoppdateringer.
- Det følger **ingen rett til å kreve fremtidige utgivelser**, bestemte funksjoner, fremtidig lisensiering eller fortsatt drift av kildekoderepo og nettjeneste.
- **Rettigheter til allerede MIT-lisensiert materiale består.** Retten til å bruke en utgitt versjon kan ikke oppheves ensidig ved å endre lisens på senere versjoner.
- Hvis en senere versjon likevel publiseres under MIT, kan enhver som mottar den bruke den på lisensens vilkår. Ingen tekst her kan gjøre et offentlig tilgjengelig, MIT-lisensiert senere slipp eksklusivt for enkelte.
- Standard MIT innebærer mer enn intern bruksrett: også redistribusjon, underlisensiering og salg av kopier av MIT-lisensiert materiale er tillatt. Dette må være tilsiktet før publisering.

## Hvilke deler kan lisensieres?

| Del | Foreslått behandling |
|---|---|
| Original programkode, HTML, CSS og tilhørende egne data/tekster | MIT bare for materialet som rettighetshaver har anledning til å lisensiere |
| Egne generiske SVG-illustrasjoner under `docs/assets/library/original/` | Behold i åpen kjerne. Vurder å inkludere i MIT når opphav og rettigheter er kontrollert |
| Leverandørlogoer, tredjepartsillustrasjoner, offisielle varemerker | Ikke omfattes av Innsikts egen rettighetstildeling; originalt opphav og lisens-/varemerkeregler gjelder |
| Tabler-ikon med egen MIT-lisens | Behold tilhørende lisensfil og attribusjon |
| Sitater, kildetekster, eksterne dokumenter, personopplysninger, kundemateriale | Ingen nye rettigheter gis gjennom en Innsikt-lisens; følg gjeldende rett og eventuelle avtaler |
| Organisasjonens beskyttede innholdspakke | Er ikke del av åpen kjerne og lisensieres/forvaltes separat |

Ikke anta at plassering under `original/` alene fastslår opphavsrettslig eierskap. Det er en teknisk ressurskategori.

## Foreslått korttekst til offentlig README – tas i bruk først etter godkjenning

> Innsikt er et offentlig tilgjengelig, personlig initiert utviklings- og læringsprosjekt. De delene rettighetshaverne har lisensiert under MIT, kan brukes og videreutvikles av enkeltpersoner og virksomheter på vilkårene i LICENSE. Programvaren leveres som den er, uten garanti eller løfte om fremtidige oppdateringer, brukerstøtte eller fortsatt tilgjengelighet. Rettighetene til en allerede lisensiert versjon består. Leverandørlogoer og annet tredjepartsmateriale er underlagt egne rettigheter.

Beskrivelsen «personlig initiert» sier noe om prosjektets karakter, men avgjør ikke juridisk eierskap. Uttrykket «hobbyprosjekt» kan brukes i presentasjonstekst dersom det faktisk beskriver arbeidsformen, men gir ingen særskilt rettslig status.

## Forslag for en fremtidig intern organisasjonsutgave

Se `ORGANIZATION_RIGHTS_TEMPLATE.md`. Den interne løsningen skal peke til en konkret offentlig kildeversjon (SHA/tag), bevare åpen lisens og tredjepartsattribusjoner, og la virksomheten videreutvikle sin mottatte versjon uavhengig av senere upstream-publisering. Virksomhetens interne innhold og bidrag skal lagres separat og ikke få åpen MIT-lisens ved uhell.

## Må avklares før LICENSE publiseres

1. Rettighetsgrunnlag for kode, redaksjonelle tekster og SVG-illustrasjoner i lys av arbeidsavtale, faktisk utviklingshistorikk, arbeidsgivers anvisninger og eventuelle bidragsytere. Åndsverkloven § 71 er særlig relevant for programkode.
2. Hvem som korrekt skal oppgis som opphavsrettshaver(e). Ikke bruk et personlig copyright-felt basert bare på kontoens navn.
3. At lisensen gjelder **kun** originale, lisensierbare komponenter; fullstendig oversikt over eksterne varemerker, ikoner og kildefiler.
4. At den som publiserer, faktisk ønsker de brede rettighetene MIT gir, ikke bare en begrenset intern bedriftslisens.
5. Avklart informasjon om viderebruk og databehandling i en separat intern distribusjon.

## Kilder

- Åndsverkloven § 71: https://lovdata.no/lov/2018-06-15-40/%C2%A771
- Åndsverkloven § 67: https://lovdata.no/lov/2018-06-15-40/%C2%A767
- MIT-lisensen: https://opensource.org/license/mit
- GitHubs veiledning: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository
- GitHubs juridiske open-source-veiledning: https://opensource.guide/legal/
- Eksternressurser: `ARCHITECTURE_ASSETS.md` og `docs/data/visual-assets.json`
