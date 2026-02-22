# Repo Hub (auto)

## Come funziona
- Workflow schedulato (ogni 6 ore) genera `data/repos.json` interrogando GitHub REST API.
- Il sito legge solo `data/repos.json` (statico) → nessun token nel browser.

## Filtro per topic
Le “chips” applicano un filtro AND:
- selezioni `devops` + `dotnet` → mostra repo che hanno entrambi.

## Badge
Per ogni repo:
- stars (shields.io)
- top language
- updated (data da JSON)

## Personalizzazione
- Org di default: `data/repos.json` key e `Update repo catalog` workflow (env ORG)
- Featured: `data/featured.json`
