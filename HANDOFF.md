# Handoff

Senast uppdaterad: 2026-07-08 (sen kväll). Läget för nästa session (människa eller agent). Arkitektur i PROJECT.md, v2-planen i ARKITEKTUR.md, öppna punkter i TODO.md.

## Läget just nu
- **Fas 1 (Firebase Auth) är DEPLOYAD och live-verifierad.** Worker version `c4b35064` på recept-api.orgutveckling.se, frontend pushad (`70c93ad`). Patrik testade i produktion: konto med e-post+lösenord, koppling av Google-inloggning. Funkar.
- Auth-modellen: Firebase ID-token (JWT, verifieras i workern mot Googles JWKS) eller legacy uuid-token under övergången. Nya Firebase-inloggningar auto-skapar D1-rad (namn från displayName/e-postens lokaldel). Legacy-konton uppgraderas automatiskt vid Firebase-inloggning med kvarvarande PIN-session, eller manuellt via "Hämta hit det"-formen (namn+PIN) under Konto. julia + hans är ännu INTE uppgraderade (`SELECT name FROM users WHERE firebase_uid IS NULL`).
- Lokal e2e-verifiering gjord med wrangler dev + lokal D1 + riktiga Firebase-tokens (detaljer i git-loggen för `70c93ad`). `node test.js` grönt.

## Nästa steg
1. **Deploy av namnbytet** (byggt 2026-07-08, ej deployat): PUT /name i workern + Namn-fält överst under Konto (bara Firebase-vyn, legacy-namn är egenvalda). Lokalt e2e-verifierat mot wrangler dev + lokal D1: byte ok, 409 vid krock, 400 vid ogiltigt namn, 401 utan token, självbyte ok. UI-formen följer pwForm/linkForm-mönstret men är INTE testad med riktig Firebase-inloggning, testa i prod efter deploy. Kräver `npx wrangler deploy` + git push (Patriks godkännande).
2. **Fas 2 i ARKITEKTUR.md**: publik flik + sparräknare (saves-tabell, recipes_index deriverad vid PUT /state, paginerad feed, hemlig-toggle, starter.json → systemkonto).
3. Julia loggar in på delade kontot: Patrik trycker "Skapa lösenord" under Konto (syns när kontot saknar lösenordsinloggning), sen loggar hon in med samma e-post + lösenordet.
4. Mobilverifieringen i butik (checklista i git-historiken för HANDOFF, förmiddagens version) står kvar.

## Bra att veta
- **Agentrutin**: D1-export till `backups/` FÖRE riskabla ändringar/D1-migreringar/deploy (kommando i PROJECT.md). Senast 2026-07-08 15:52 (`recept-2026-07-08-fas1.sql`).
- **Deploy/push kräver Patriks godkännande** i det här permission-läget, planera inte in det som eget agentsteg.
- **Cloudflare-edgecache på frontenden**: orgutveckling.se ligger bakom Cloudflare med `max-age=14400`, app.js kan serveras GAMMAL i upp till 4 h efter push. Botemedel: purge i Cloudflare-dashboarden (exakt URL) eller vänta. Långsiktig fix när deployerna blir tätare: versionsquery (`app.js?v=N`).
- **Google-consentskärmen** visar `grammat-78450.firebaseapp.com`: normalt för overifierad OAuth-branding, fixas i lanseringsfasen (se ARKITEKTUR.md risker).
- **Lokal verifiering**: `python -m http.server 8123` i REPO-ROTEN (cwd:t kan stå kvar i worker/ efter wrangler-kommandon) + `cd worker && npx wrangler dev --port 8787` + peka om `const API` i app.js tillfälligt (återställ före commit!). Hård omladdning (ignoreCache) efter app.js-ändringar. Lokal D1 seedas med `npx wrangler d1 execute recept --local --file schema.sql`.
- **PowerShell 5.1**: citattecken i `git commit -m`-here-strings mangalas till pathspecs, undvik `"` eller använd `-F fil`.
- **Dataobservation 2026-07-08**: julia/hans state krympte mellan 2026-07-07 14:57 och 2026-07-08 (12→0 resp. 11→1 recept), troligen avsiktligt. Återställning vid behov: `backups/recept-2026-07-07-145724.sql`.
- Fyra recept saknar steg (salsiccia, räkpasta, chili con carne, gazpacho).
