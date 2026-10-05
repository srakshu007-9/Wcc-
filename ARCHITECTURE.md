# AFTERCARE Architecture

Browser → Express API → authenticated user session → case state → agent workflow → persisted events.

## Product loop

Goal → Evidence → Plan → Approval → Action → Monitor → Recover → Verify.

## Agent modules

1. Intake — structures the desired outcome.
2. Evidence — connects uploaded material and known facts to the case.
3. Planning — creates dependency-aware next actions.
4. Action — prepares/executes approved actions.
5. Monitoring & Recovery — watches state, detects blockers and prepares follow-ups.
6. Verification — checks whether the original goal is actually satisfied.

## Persistence

Local JSON is used for the GitHub-ready demo so it runs without a database setup. The API keeps cases user-scoped and records state transitions, approvals, evidence and events. For production, replace the persistence adapter with PostgreSQL/Supabase without changing the UI workflow.

## Safety

Consequential actions are approval-gated. Demo external actions are explicitly labeled as simulated. The product does not claim a real organization was contacted unless an actual integration is configured.
