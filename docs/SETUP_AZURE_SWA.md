# Setup Azure Static Web Apps + Aruba DNS (gargiolastech.com)

## 1) Crea la Static Web App
Azure Portal → Static Web Apps → Create

- Deployment: GitHub
- Repo: questo progetto
- Branch: main
- Build preset: Custom
- App location: `/`
- Output location: `/`

## 2) Secrets in GitHub
Repo → Settings → Secrets and variables → Actions

- `AZURE_STATIC_WEB_APPS_API_TOKEN`
  - prendi il deployment token da Azure SWA → “Manage deployment token”
- `GH_TOKEN` (consigliato)
  - PAT per evitare rate limit e leggere topics
  - permessi minimi: read public repos + topics

## 3) DNS Aruba (dominio root)
Per usare `gargiolastech.com` (root / apex) spesso serve un record A/ALIAS/ANAME o una validazione TXT, a seconda del provider.
Aruba non supporta sempre ALIAS/ANAME in tutti i piani, quindi l’approccio più semplice è:

✅ usare `www.gargiolastech.com` come CNAME verso Azure SWA  
e poi reindirizzare `gargiolastech.com` → `www.gargiolastech.com` dal pannello Aruba (se disponibile).

### Opzione consigliata (robusta)
- CNAME: `www` → `<your-swa>.azurestaticapps.net`
- Redirect: root → www (se Aruba lo consente)

## 4) Custom domain su Azure
Azure SWA → Custom domains → Add
- aggiungi `www.gargiolastech.com` (e/o root se supportato)
- completa la verifica DNS richiesta
- attendi provisioning certificato SSL

## 5) Verifica
- Apri `https://www.gargiolastech.com`
- Apri `https://www.gargiolastech.com/repos`
- Se i repo sono vuoti: lancia il workflow “Update repo catalog” manualmente.
