# Evaluation Plan

Do not publish invented metrics. Run a benchmark and report the measured values.

## Suggested benchmark dimensions

- Goal understanding accuracy
- Evidence grounding accuracy
- Plan correctness
- Blocker detection precision/recall
- State transition correctness
- Follow-up correctness
- Resolution verification accuracy
- Unsupported-action rate
- Human-approval compliance
- End-to-end completion rate

## Test cases

Include cases where:

1. Evidence is complete.
2. Evidence is missing.
3. A response is overdue.
4. A response arrives but does not prove resolution.
5. A final document proves resolution.
6. A user rejects a recommended action.
7. An action requires escalation.
8. The agent must say "insufficient evidence".
