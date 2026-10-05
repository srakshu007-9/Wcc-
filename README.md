# AFTERCARE

### Finish what matters.

AFTERCARE is a stateful AI completion-agent prototype. It takes an unresolved real-world goal, builds a persistent case, connects evidence to the case, prepares actions, waits for human approval when needed, monitors progress, detects blockers, prepares recovery, and verifies the final outcome.

## What changed in this build

- Premium editorial landing page inspired by the supplied coral/cream visual reference
- Real sign-in and account creation flow
- Private demo workspace with bearer-token sessions
- User-scoped cases
- Interactive case search and filters
- Inbox for approvals and blockers
- Profile/settings screen
- Notifications shortcut
- Case creation with document uploads
- Live case timeline and agent activity
- Human approval gate
- Demo delay/blocker/recovery controls
- Resolution verification
- Honest Demo Mode: external actions are simulated and labeled
- Optional OpenAI integration can be added later without changing the product shell

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:3000`.

### Demo login

- Email: `demo@aftercare.app`
- Password: `aftercare123`

You can also create a new account from the sign-up screen.

## Main demo

1. Sign in.
2. Click **Start a case**.
3. Enter:

   `My college scholarship was approved two months ago, but I still haven't received the scholarship amount. I want to get the payment resolved.`

4. Add supporting PDFs if available.
5. Open the case.
6. Use **Advance case** to move through the state machine.
7. Use **Simulate delay** to demonstrate blocker detection.
8. Approve the recovery action.
9. Use **Verify resolution** to show the final state.

## Important honesty rule

Demo Mode executes the real backend case-state transitions, but external organizations, emails, government systems, banks, and institutions are **not** contacted unless a real integration is added. The interface explicitly labels simulated external actions.

## Optional AI

Copy `.env.example` to `.env` and add a real model key only if you implement the optional LLM adapter. The core demo is deterministic and works without an AI API key so the product remains demoable offline.

## Files

- `server.js` — Express API, auth, case state and demo workflow
- `public/index.html` — landing page, auth and application shell
- `public/styles.css` — visual system and responsive UI
- `public/app.js` — interactions and API client
- `data/cases.json` — local case persistence
- `data/users.json` — local demo users (created automatically)
- `WCC_SUBMISSION.md` — draft WCC form answers
- `ARCHITECTURE.md` — system architecture
- `EVALUATION.md` — evaluation plan
- `DEPLOYMENT.md` — deployment notes
- `docs/visual-reference.png` — supplied visual reference used for design direction


## v3 product features

- Premium editorial landing page with Solutions and Contact sections
- Login, signup and demo account
- Private case workspace
- Case search, status filters and category filters
- Inbox for approvals and blockers
- Deadline calendar
- Case health and progress insights
- Reusable case templates
- Case duplication
- Private case notes
- Editable priority and finish-line date
- Persistent case state and audit events
- Interactive blocker/recovery demo controls
- Keyboard shortcut: `/` opens case search
- Responsive mobile workspace

The product deliberately avoids a public "How it works" explainer. The technical agent workflow appears inside the actual product experience where it is useful.
