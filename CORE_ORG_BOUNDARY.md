# Innsikt: Åpen kjerne og organisasjonsutvidelser

## Prinsipp

Innsikt utvikles som en offentlig, selvstendig kjerne. En organisasjon kan bruke kjernen i et separat tilgangsstyrt repository uten at egne data, kundehistorier, verktøy, kilder, menypunkter eller fremtidige tilpasninger inngår i den åpne kildekoden.

Anbefalt layout i det separate organisasjonsrepoet:

    vendor/innsikt-core/       # låst offentlig kildeversjon (tag/commit SHA)
    organization/content/      # kun interne opplysninger
    organization/config/       # merkevare, private menypunkter, deploy-konfig
    organization/tests/        # sikkerhets- og integrasjonstester
    dist/                      # generert output, aldri autoritativ kilde

Oppdatering av kjernen skjer kun i vendor/innsikt-core fra en verifisert upstream SHA. Organisasjonens egne filer under organization/ endres aldri ved kopiering fra den åpne kjernen. Ikke kopier en ny kjerneversjon over roten av organisasjonsrepoet eller opprett en langvarig fork der private endringer gjøres direkte i kjernefilene.

Organisasjonsrepoet bygger en intern distribusjon ved å kombinere den låste kjernen og en separat tilgangsstyrt innholdspakke. Følg den eksplisitte importlisten fra åpen kjerne; verifiser SHA, innholdskontrakter, tester og at ingen interne filer ender i en offentlig distribusjon. Ved problem rull tilbake til forrige kjerne-SHA uten å rulle tilbake organisasjonens innhold.

## Distribusjons- og sikkerhetsgrense

Offentlig deployment.json forblir offentlig modus uten intern kilde. Bare den beskyttede interne byggepipelinen genererer intern modus, med endepunkt for eksempel /internal/innsikt-content.json. Beskyttet pakke lastes fra samme origin med virksomhetens innlogging, serverstyrt tilgang per forespørsel og Cache-Control: private, no-store. Ingen klientrute, skjult JSON, private Artifact eller nettleserfilter regnes som tilgangskontroll.

Innholdspakke schemaVersion 2 viderefører intern støtte for slides og presentationDecks, og legger til: customerStories, solutions, tools, vilkårlige navngitte collections og deklarativ navigation med groups og views. Hver intern oppføring må ha unik stabil id, title og classification internal. V1-pakker fungerer fortsatt og får standardvisninger for samlinger med innhold.

Eksempel med bare syntetiske data:

    {
      "schemaVersion": 2,
      "classification": "internal",
      "customerStories": [{"id":"org-demo-001","title":"Fiktiv historie","classification":"internal","summary":"Ingen ekte kunde"}],
      "tools": [{"id":"org-tool-001","title":"Internt testverktøy","classification":"internal","href":"/internal/tools/example"}],
      "solutions": [],
      "navigation": {
        "groups": [{"id":"organization","label":"VIRKSOMHETENS RESSURSER","collapsible":true}],
        "views": [
          {"id":"customer-reference","groupId":"organization","collection":"customerStories","label":"Kundehistorier"},
          {"id":"internal-tools","groupId":"organization","collection":"tools","label":"Interne verktøy"}
        ]
      }
    }

Den åpne navigasjonen eies av pages.json.navigationSections. Interne grupper og visninger fra internpakken legges bare til i den autoriserte klientvisningen. De får ruter under #intern/<view-id> og #intern/<view-id>~<item-id>, uten å overstyre åpne ruter. Dermed kan kjernen endres og importeres uten at interne menypunkter kopieres eller skrives over.

For samlinger er det en delt, trygg kort-/detaljvisning med eskapert tekst, validerte kildehenvisninger og kontrollerte lenker. Organisasjonsspesifikk kjørbar logikk, apper, HubSpot-koblinger og tilsvarende bygges i det interne miljøet bak egne adgangskontroller; ingen JS/HTML injiseres gjennom innholdspakken.

## Testkrav før oppgradering

1. Test alle offentlige kontrakter på eksakt importert SHA og organisasjonens egne innholds-/sikkerhetstester.
2. Avvis ugyldige klassifiseringer, ukjente kilder, ID-konflikter, ugyldige menyer og utrygge verktøylenker.
3. Verifiser server-side 401/403 for uautoriserte brukere, korrekte rettigheter for autoriserte, og ingen offentlig CDN-cache for interne data.
4. Verifiser at interne samlinger, direkte lenker, menyer, fortellinger og verktøy overlever kjerneoppdatering uten manuell rekonstruering.
5. Verifiser at private opplysninger ikke finnes i åpen bygg-artefakt, offentlig Pages, Git-historikk eller eksport uten godkjenning.
6. Behold forrige kjerne-SHA som rollback, uten å endre organisasjonens private data eller versjonshistorikk.

Ingen data eller endringer skal automatisk synkroniseres fra organisasjonsrepo tilbake til den offentlige kjernen. Ved ny funksjon som kan være allmenn, legg den til den åpne kjernen med syntetisk testinnhold og et nytt bakoverkompatibelt kontraktsnivå – ikke med kundedata.


## Virksomhetsprofil i beskyttet pakke (schemaVersion 2)

En organisasjon kan legge til `organizationProfile` bare i den autentiserte innholdspakken. Den åpne kjernen inneholder ingen profil for en konkret arbeidsgiver. Profilen kan angi `name`, `brandSubtitle`, `home` (feltene `eyebrow`, `titleLine1`, `titleLine2`, `intro`), `competenceHeader` (`title`, `intro`), `competences` (liste med `id`, `label`, `description`), `competenceSourceIds` og `focusSectorIds` (eksisterende, stabile bransje-ID-er). Ingen felt kan inneholde kjørbar HTML. Alle refererte kilder må finnes i felles eller beskyttet kilderegister.

I intern modus tilpasses startbudskap, kompetansebeskrivelser og visning av prioriterte bransjer; øvrige generiske sider og fakta forblir eid av offentlig kjerne. Webgrensesnittet er fremdeles produktet Innsikt, med organisasjonsprofil som tillegg. Den generiske utgaven må kunne kjøres uten profil, uten ekstra nettverkskall og uten at interne strenger havner i offentlige artefakter.

Videre arbeid: erstatt arbeidsgiverspesifikke kildehenvisninger og tidligere bransjeprioritering i den åpne datahistorien med nøytralt kildegrunnlag. Flytt eksisterende virksomhetsinnhold til et separat, tilgangsstyrt organisasjonsrepo **før** det slettes eller endres vesentlig i offentlig kjerne. Oppbevar bekreftede rettigheter, gjeldende lisenser, historikk og proveniens; ingen slik overføring skjer automatisk herfra. Offentlig Git-historikk vil fortsatt være offentlig tilgjengelig.
