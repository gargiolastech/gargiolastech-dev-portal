# GargiolasTech Public Site (Futuristic • Dev-centric)

- Home: `/`
- Repo Hub: `/repos` (auto via GitHub Actions → `data/repos.json`)
- About: `/about` (config in `data/profile.json`)
- Vision: `/vision` (text in `data/vision.md`)

Generated: 2026-02-22 12:38 UTC

## Quickstart
1) Push to GitHub
2) Add secrets:
   - `AZURE_STATIC_WEB_APPS_API_TOKEN` (Azure SWA deployment token)
   - `GH_TOKEN` (recommended for repo catalog updates)
3) Create Azure Static Web App (Custom build, app_location `/`, output `/`)
4) Point domain `www.gargiolastech.com` to SWA via CNAME (see `docs/SETUP_AZURE_SWA.md`)

## Automation
- `.github/workflows/update-data.yml` updates `data/repos.json` every 6 hours.
- `.github/workflows/deploy-swa.yml` deploys the site to Azure SWA on push to main.
