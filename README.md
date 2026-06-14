# ParaBank Cypress Test Suite

A production-style Cypress test framework targeting the [ParaBank](https://parabank.parasoft.com) public demo banking application. Demonstrates UI automation, API testing, CSV data-driven testing, CI/CD with GitHub Actions, and containerised execution via Docker.

---

## 1. Project Overview

| Capability | Description |
|---|---|
| **UI Automation** | 10+ tests across 5 spec files with multiple assertions each |
| **API Testing** | `cy.request()` tests running independently of the UI suite |
| **Data-Driven Testing** | CSV fixture read via PapaParse, iterated with `cy.wrap().each()` |
| **Hooks** | `beforeEach`, `before`, `afterEach`, and a shared `cy.login()` custom command |
| **Reporting** | Mochawesome HTML reports + embedded screenshots |
| **CI/CD** | GitHub Actions — UI and API jobs run in parallel on every push/PR |
| **Docker** | Official `cypress/included` image for zero-install containerised runs |

---

## 2. Tech Stack

| Tool | Version / Notes |
|---|---|
| Cypress | ^13 |
| PapaParse | CSV parsing in data-driven tests |
| cypress-mochawesome-reporter | HTML reports with embedded screenshots |
| GitHub Actions | `cypress-io/github-action@v6` |
| Docker | `cypress/included:13.6.4` base image |
| Node.js | 20 LTS (CI) |

---

## 3. Architecture (Folder Structure)

```
cypress-demo/
├── .github/
│   └── workflows/
│       └── cypress-ci.yml          # CI: UI tests + API tests + Docker job
├── cypress/
│   ├── e2e/
│   │   ├── ui/                     # UI spec files
│   │   │   ├── login.cy.js         # 3 tests: login, invalid creds, logout
│   │   │   ├── account-overview.cy.js  # 2 tests: list + transaction history
│   │   │   ├── fund-transfer.cy.js     # 2 tests: success + over-limit
│   │   │   ├── bill-pay.cy.js          # 1 test: full form submission
│   │   │   ├── csv-upload.cy.js        # 2 tests: upload + no-file validation
│   │   │   └── bulk-transfer.cy.js     # CSV-driven: 5 rows, 1 test definition
│   │   └── api/                    # API spec files (cy.request only)
│   │       ├── accounts.api.cy.js  # GET account details + invalid ID
│   │       └── transactions.api.cy.js  # GET transactions + POST deposit
│   ├── fixtures/
│   │   └── bulk-transfer-data.csv  # 5 rows: fromAccount, toAccount, amount, expectedResult
│   └── support/
│       ├── commands.js             # cy.login() + cy.logout() custom commands
│       └── e2e.js                  # Global imports (commands + reporter)
├── cypress.config.js               # baseUrl, video, reporter, env vars
├── cypress.env.json                # Secrets — gitignored
├── Dockerfile                      # cypress/included base image
├── docker-compose.yml              # Services: cypress, cypress-ui, cypress-api
└── package.json                    # Scripts: cy:open, cy:run, test:ui, test:api, test:all
```

---

## 4. How to Run Locally

### Prerequisites
- Node.js 18+ installed
- `npm install` completed

### Scripts

| Command | What it does |
|---|---|
| `npm run cy:open` | Opens Cypress GUI for interactive development |
| `npm run cy:run` | Headless run of all specs |
| `npm run test:ui` | UI suite only: `cypress/e2e/ui/**/*.cy.js` |
| `npm run test:api` | API suite only: `cypress/e2e/api/**/*.cy.js` |
| `npm run test:all` | Full suite (UI + API) headless |

### Environment Variables

Create `cypress.env.json` (already gitignored) in the project root:

```json
{
  "validUser": "john",
  "validPassword": "demo",
  "apiUrl": "https://parabank.parasoft.com/parabank/services/bank"
}
```

The default ParaBank demo credentials are `john` / `demo`. You can override via CI environment variables (`CYPRESS_validUser`, `CYPRESS_validPassword`).

---

## 5. CI/CD — GitHub Actions

The pipeline (`cypress-ci.yml`) triggers on every `push` and `pull_request` to any branch.

### Jobs

| Job | Runner | What it does |
|---|---|---|
| `ui-tests` | `ubuntu-latest` | Runs `npm run test:ui` via `cypress-io/github-action@v6` |
| `api-tests` | `ubuntu-latest` | Runs `npm run test:api` — completely independent |
| `docker-tests` | `ubuntu-latest` | Builds the Docker image, runs `npm run test:all` inside the container |

UI and API jobs run **in parallel** — neither depends on the other. Docker runs as a third independent job that demonstrates containerised execution.

On failure, screenshots and videos are uploaded as GitHub Actions artifacts. Mochawesome HTML reports are always uploaded.

> **Why `cypress-io/github-action` instead of plain `npm run`?**  
> The official action handles browser binary caching, retries on flaky installs, and is maintained by the Cypress team. It wraps `npm run` under the hood so both approaches produce identical test behaviour.

---

## 6. Docker

```bash
# Build the image
docker build -t parabank-cypress .

# Run all tests
docker run --rm parabank-cypress

# Run UI tests only
docker-compose --profile ui up cypress-ui

# Run API tests only
docker-compose --profile api up cypress-api
```

The `Dockerfile` uses `cypress/included:13.6.4` — the official Cypress image that bundles Chrome, Firefox, and the Cypress binary. This means **no browser installation step** is needed in CI, which removes the most common flaky failure mode in containerised test pipelines.

Screenshots and videos are written to bind-mounted host directories so they persist after the container exits.

---

## 7. Real-World Context

This repository was built to mirror the kind of test infrastructure I designed from scratch across **8 frameworks** at PayPoint, where I led QA automation efforts resulting in a **70% reduction in manual regression time**.

Key parallels:

- **Custom commands** (`cy.login()`) replace repetitive setup steps — same pattern as shared utilities I built for PayPoint's checkout and payment flows.
- **CSV data-driven testing** mirrors the parameterised data tables I used for bulk payment processing scenarios, where a single test definition covers dozens of transaction combinations without code duplication.
- **Independent API and UI suites** reflect the separation I maintained between integration-level API contracts and end-to-end UI journeys — critical when backend and frontend teams deploy independently.
- **GitHub Actions with Docker** replicates the containerised pipeline I set up to ensure consistent browser versions across local dev, staging, and production CI environments.

---

## 8. CSV Data-Driven Test

The file `cypress/fixtures/bulk-transfer-data.csv` contains:

```
fromAccount,toAccount,amount,expectedResult
12345,67890,50,success
12345,67890,100,success
12345,67890,250,success
12345,67890,0,error
12345,67890,9999999,error
```

**How it works (`bulk-transfer.cy.js`):**

1. `cy.readFile()` reads the CSV fixture before any test runs.
2. `Papa.parse()` converts the text into an array of row objects.
3. A single `it()` block uses `cy.wrap(rows).each(row => { ... })` to iterate — Cypress queues each iteration as a command, so the async/sync boundary is handled correctly.
4. For each row, the test logs in, navigates to the transfer page, fills the form, and asserts the outcome matches the `expectedResult` column (`success` → confirmation message visible; `error` → error or over-limit message visible).

This demonstrates **one test definition covering multiple data sets** — the idiomatic Cypress data-driven pattern equivalent to JUnit `@ParameterizedTest` or pytest `@pytest.mark.parametrize`.

---

## Hooks Reference

| Hook | File(s) | Purpose |
|---|---|---|
| `beforeEach` | `login.cy.js`, `account-overview.cy.js` | Visit base URL and/or call `cy.login()` before every test |
| `before` | `fund-transfer.cy.js`, `bulk-transfer.cy.js` | One-time setup: fetch account IDs or parse CSV (expensive shared state) |
| `afterEach` | Built into Cypress + Mochawesome reporter | Auto-captures screenshot on test failure; documented here for completeness |

Screenshot-on-failure is enabled globally via `screenshotOnRunFailure: true` in `cypress.config.js` — no per-test `afterEach` hook is needed.
