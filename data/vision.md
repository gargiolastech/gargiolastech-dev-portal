# Architecture Vision

## Boundaries are a feature
- Bounded Contexts espliciti e misurabili
- Dipendenze “verso l’interno” (Clean Architecture)
- Moduli deployati insieme, ma evolvibili indipendentemente

## Delivery is non-negotiable
- Pipeline CI/CD come prodotto (templates riutilizzabili)
- Pre-commit/pre-push policy + branch protection
- Automation first: scripts e workflow standardizzati

## Operability from day 1
- Telemetria, logging e health check come default
- Rilascio sicuro: feature flags quando serve
- Backups e DR plan ragionati (non “dopo”)

## Keep it boring in production
- Scelte conservative per runtime e infrastruttura
- Tradeoff espliciti (ADR)
- Misura → ottimizza
