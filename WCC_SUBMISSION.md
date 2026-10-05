# WCC Launchpad 30 — Submission Draft

## Theme

Agentic AI

## Project Name

AFTERCARE — The AI Completion Agent

## What problem are you solving?

Important real-world processes often get stuck after submission, leaving people to manually track, follow up, and resolve incomplete outcomes.

## Explain the problem in detail

People regularly start important processes such as scholarship applications, insurance claims, refunds, reimbursements, service requests, and government applications, but completion often depends on multiple steps, documents, responses, deadlines, and different parties. Existing systems typically confirm that a request was submitted but do not continuously manage what happens afterward. Users must remember deadlines, search for missing documents, monitor responses, send follow-ups, and decide when to escalate. A missed response or missing piece of evidence can leave a process unresolved for days or months, creating financial loss, wasted time, uncertainty, and repeated manual effort.

## What is your solution?

AFTERCARE is an agentic AI completion system that manages an unresolved process from goal to verified outcome. It understands the user's goal, analyzes supporting documents, builds an evidence-grounded action plan, executes approved actions, maintains persistent case state, monitors deadlines and responses, detects blockers, replans and prepares follow-ups, escalates when necessary, and verifies whether the original goal has actually been achieved. Consequential actions remain under human approval, while every major decision is supported by evidence and recorded in an auditable case timeline.

## Prompt architecture and AI workflow

AFTERCARE uses focused Intake, Evidence, Planning, Action, Monitoring/Recovery and Verification modules. Each module receives the current case state, relevant evidence, previous actions, constraints and desired outcome. Prompts are structured as ROLE → OBJECTIVE → CURRENT STATE → EVIDENCE → CONSTRAINTS → DECISION RULES → OUTPUT SCHEMA. Agent outputs are structured and persisted to case state. State changes can trigger replanning rather than restarting the conversation.

Core workflow:

```text
User Goal
  ↓
Understand
  ↓
Evidence Retrieval
  ↓
Plan
  ↓
Human Approval
  ↓
Action
  ↓
Monitor
  ↓
Blocker Detection
  ↓
Recovery / Replanning
  ↓
Follow-up / Escalation
  ↓
Resolution Verification
  ↓
Complete
```

## Agents, chains or evaluation methods

The system uses focused agent modules rather than a single general-purpose chatbot. Evaluation should measure goal understanding, evidence grounding, plan correctness, blocker detection, state-transition correctness, follow-up decisions, resolution verification, unsupported-action rate, and human-approval compliance. The repository includes an evaluation plan and a dedicated evaluation UI. Publish measured numbers only after running the benchmark.

## Tech stack, models and APIs used

Frontend: HTML/CSS/JavaScript in the zero-build MVP; designed for a straightforward upgrade to React/Next.js.
Backend: Node.js + Express.
Persistence: JSON-backed case store for the hackathon MVP.
Uploads: Multer + local upload storage.
AI integration: optional OpenAI API via environment variables; Demo Mode works without an API key.
Deployment: any Node-compatible host such as Render, Railway, Fly.io or a VPS.

If you upgrade the deployment to Supabase/PostgreSQL, pgvector, OCR, or a specific model, update this section to match what was actually used.

## What makes it distinctive or original?

AFTERCARE is built around a gap that ordinary AI assistants often stop short of solving: ensuring that an important real-world process actually reaches completion. Instead of generating a response and ending the interaction, AFTERCARE maintains persistent case state across time, connects evidence to actions, tracks dependencies and deadlines, detects blockers, replans when conditions change, requests human approval for consequential actions, and verifies the final outcome. Its core closed loop is: Understand → Act → Monitor → Recover → Verify → Complete.

A useful distinction is: **ChatGPT can answer a problem; AFTERCARE manages the problem until it is resolved.**

## Who are your target users?

Primary users are students, employees, customers, and individuals managing important multi-step processes such as scholarships, reimbursements, refunds, claims, applications and service requests. The architecture can extend to organizations that need automated case follow-up and resolution management across customer support, operations, finance, HR, healthcare administration and public services.

## What did YOU personally build?

Replace this section with the exact work you personally completed. Example if accurate:

I built the AFTERCARE case-management interface and core agent workflow, including the case creation flow, document/evidence interface, live agent workflow visualization, case timeline, human-approval interface, blocker/recovery experience, resolution-verification screen, and backend state transitions connecting the AI workflow to persistent case data.

Do not claim features, models, APIs or screens that you did not personally build.
