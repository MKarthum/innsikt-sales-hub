# Navigasjonskontrakt

Feilen 24.10.2026 var at lysbildedetaljer var gyldige ruter, men manglet entitetsoppslag i navigasjonsstiens felles render-funksjon. En ny detaljtype må derfor alltid registreres både som rute og som navigerbar foreldrerelasjon.

For seksjon/id må navigasjonsstien vise Innsikt / (lenke til seksjon) / (korrekt datatittel). Foreldreleddet må ha faktisk href, fungere med tastatur og mobil, og bladnoden må alene ha aria-current=page. Gammelt aria-current må ryddes ved navigering.

En ugyldig ID må gi forståelig tilbakevei, ikke en falsk detaljsti.

Ny detaljtype må ha Chromium-test for detalj -> foreldreside -> hjem. scripts/check-navigation-browser.mjs går gjennom samtlige lysbildedetaljer og utvalgte andre detaljtyper; scripts/check-browser.mjs beholder regresjonstesten.

Utgåtte lysbilde-ID-er er eksplisitt registrert i pages.json.retiredSlideRedirects. Et objekt som er erstattet eller trukket tilbake må enten ha gyldig redirect eller en bevisst tombstone. Test gamle direktelenker; ikke la de falle ned i generell ikke-funnet-visning uten vurdering.
