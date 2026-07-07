# TODO: receptsajten

Byggt och live 2026-07-07: sajt, worker, D1, konton, kvittolista, 17 startrecept, näringsvärde per portion, receptkategorier, hel-state backup/återställning. Se PROJECT.md för arkitektur.

## Kvar / idéer
- [ ] Stående agentrutin: före riskabla ändringar, D1-migreringar eller deploy ska Codex/Claude köra D1-export till lokal `backups/` (`npx wrangler d1 export recept --remote --output backups/recept-YYYY-MM-DD-HHMMSS.sql`). `backups/` är git-ignored och får inte pushas/publiceras.
- [ ] Fler recept ur `recept 2.mht` konverterade till starter.json-format. 11 importerade 2026-07-07 (bl.a. salsiccia med fänkål, marockansk kyckling, räkpasta, chili con carne, kycklingsallad tex mex, teriyaki biff, gazpacho, sommarsmörgåstårta, grillsåsen, pastasås med kräftstjärtar, fläskfilé). Kandidat kvar bl.a.: Höstgryta Irland. Fullständig titellista på ~90 sidor i mht-filen finns inte sparad någonstans, kör om extraktionen i PROJECT.md om fler ska plockas ut. OBS: nya starter-recept når bara NYA konton; befintliga användare får lägga in dem via UI:t eller importfunktion (saknas).
- [ ] Riktig verifiering i mobil/butik: registrera, välj recept, bocka av, ladda om, andra enheten.
- [ ] Karls loomisar, samt fyra av de nyimporterade recepten (salsiccia, räkpasta, chili con carne, gazpacho), saknar steg ("Inga steg nedskrivna") eftersom källan bara var video/länk — fråga Karl om loomisar, fyll på övriga vid tillfälle.
- [ ] Ev. PWA-manifest så sajten kan läggas på hemskärmen och funka offline i butiken.
- [ ] Ev. "dela recept till kompis"-funktion (export/import av ett enskilt recept som JSON eller länk; hel backup finns redan under Konto).

## Kända begränsningar (medvetna)
- Sista skrivning vinner vid sync; ok eftersom varje lista har en ägare.
- Summering kräver identisk stavning av ingrediensnamn mellan recept.
- Ingen e-post, ingen självservice-PIN-återställning.
