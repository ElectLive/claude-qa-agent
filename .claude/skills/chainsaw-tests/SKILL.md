---
name: chainsaw-tests
description: WAY 18 — write Kyverno Chainsaw tests for Kubernetes custom resources from their CRDs, admission policies (Kyverno, ValidatingAdmissionPolicy), RBAC and a test spec, no run by default. Also audits a repo's existing Chainsaw tests against its CRDs, webhooks, controllers, policies and RBAC, and writes only the missing ones. Use when the user says "chainsaw it", "write chainsaw tests", "chainsaw tests", "crd tests", "test the crd", "operator tests", "kubernetes conformance tests", "chainsaw gaps", "chainsaw gap it", "missing chainsaw tests", "audit chainsaw tests" — CRDs + policies + RBAC + spec (or a repo + its tests) → rule map → coverage / gaps → one chainsaw-test.yaml per rule (schema, CEL, immutability, defaults, webhooks, admission deny/warn, RBAC, status, finalizers, deletion) → lint.
---

# WAY 18 — Chainsaw Tests from CRDs + Spec (write only)

WAY 17 tests an HTTP API from its OpenAPI spec. This WAY tests a **Kubernetes API**: does the cluster accept, reject, warn, default, authorize and reconcile custom resources the way their CRDs, policies and spec say? It writes [Chainsaw](https://kyverno.github.io/chainsaw/) tests and lints them. It runs them only when asked, on a cluster the user confirms.

Two entry points:

| Mode | Input | Phase 1 | Phase 2 writes |
|---|---|---|---|
| **New tests** | CRDs (+ policies, RBAC, spec) | rule map + plan | a full suite |
| **Gaps** | `Repo:` (+ `Existing:`, spec) | coverage of the existing tests + gap plan | only the missing tests |

## Step 1: Gather inputs
**Required (ask if missing):** either
- the CRDs, as files/URLs, or `CRDs: cluster <crd names>` to read them with `kubectl get crd <names> -o yaml` (read-only; show `kubectl config current-context` first and wait for OK), or
- `Repo:` a local path or a Git URL (GitHub → attach it to the session, then clone; other hosts → `git clone --depth 1`, or ask for a zip if the network can't reach it). `Existing:` the test folders, if they aren't discoverable (default: every `chainsaw-test.yaml` in the repo). Gap mode starts when the repo has Chainsaw tests or the user asks for gaps

**Optional, one line each:**
- `Spec:` a test spec / requirements doc (file, URL, text) or `Issue:` a tracker ref (`issue.get`, per `tracker`). Apply `requirements-analysis` (§1–3) and put its gate questions in the Phase 1 message. If the spec numbers its own cases (`VAL-01`, `IMG-07`), those are the IDs (§1)
- `Policies:` Kyverno `ClusterPolicy`/`Policy`, `ValidatingAdmissionPolicy` + bindings (files, or `cluster` → `kubectl get clusterpolicy,policy -A -o yaml` / `kubectl get validatingadmissionpolicy,validatingadmissionpolicybinding -o yaml`). Without them, policy messages come from the spec and are `(inferred)`
- `RBAC:` Roles/ClusterRoles/bindings and the subjects to check (`as: system:serviceaccount:tenant-a:deployer`)
- `Scope:` kinds or spec IDs to limit to (`Scope: HostClaim, VAL-01..16`)
- `run: true` run after writing (Phase 4). `file: true` file a `test-plan` issue with the index. `MR:`/`PR:` comment the plan on it (`change.comment`)

Never write the inputs' secrets into tests. Strip `Secret` data if a cluster dump contains any.

## Phase 1: Map (new tests) or Gap (existing tests)
**New tests:** start `chainsaw-test-writer` with `mode: map`, the input paths, the requirements model (if any) and `Scope:`. It returns resources, the rule map, the spec cross-check, the planned tests and the `$values` keys.

**Gaps:** start it with `mode: gap`, `repo`, `existing`, the spec / requirements model (if any), `Scope:` and `out: qa-artifacts/chainsaw/<repo>-gaps-<YYYY-MM-DD>/`. It writes `gap-report.md` and returns it with the plan of missing tests. Show the user:
- the Summary table (rules / covered / weak / wrong / missing per source) and the sources it couldn't find
- every **P1** gap and every `wrong` test, one line each with `file:line`; then the P2/P3 counts
- the plan of missing tests, and ask which to write: `all`, `P1`, `P1+P2`, or a list of `Test#`s
- the fixes for `weak`/`wrong` existing tests stay suggestions in the report: this WAY never edits them

For new tests, show in one message:

- the rule map and planned `Test#<nn>` list (one line each), with `(inferred)` guesses marked
- the spec cross-check: requirements no rule enforces, rules no requirement mentions (tested as `untraced`), and **conflicts** (a policy denying what the schema and spec allow, a "set once" field CEL still lets you add later). Each conflict is a question: is the spec or the cluster wrong?
- the `$values` keys the tests need (existing image URLs, class names, tenant namespaces…)
- the gate questions, if any

Ask once: "Anything wrong or missing?" Proceed on OK or after corrections.

## Phase 2: Write
Start `chainsaw-test-writer` with `mode: write`, the confirmed plan (gaps: only the tests the user picked, with `style: existing`) and `out: qa-artifacts/chainsaw/<slug>-<YYYY-MM-DD>/`. It writes `.chainsaw.yaml`, `index.md`, `values.example.yaml` (if needed) and one `Test#<nn>-<slug>/chainsaw-test.yaml` per planned test, then runs `chainsaw lint`.

If it reports `NOT IMPLEMENTED` steps (a value the spec doesn't give), list them. Don't fill them in by guessing.

## Phase 3: Hand off
Reply with:
- the folder, and a table: `Test# | Category | Kind | Rules | Covers`
- gaps: where each new test goes in the repo (`cp -r qa-artifacts/chainsaw/<folder>/<test> <repo>/test/chainsaw/`); copying, committing and pushing are the user's
- the lint result (`not linted` if Chainsaw isn't installed: `go install github.com/kyverno/chainsaw@latest` or `brew install kyverno/chainsaw/chainsaw`)
- what the target cluster needs: the CRDs, the policy engine and policies, the controllers for `status` tests, and `impersonate` rights for the runner identity if there are `rbac` tests
- how to run them:
  ```bash
  cp values.example.yaml values.yaml   # fill in, if present
  chainsaw test --test-dir qa-artifacts/chainsaw/<folder> --config qa-artifacts/chainsaw/<folder>/.chainsaw.yaml [--values values.yaml]
  ```
- for CI, a job on a **test cluster**, never production:
  ```yaml
  chainsaw:
    image: {name: ghcr.io/kyverno/chainsaw:v0.2.15, entrypoint: [""]}  # has sh + kubectl
    script:
      - chainsaw test --test-dir chainsaw/ --config chainsaw/.chainsaw.yaml --values chainsaw/values.yaml
    artifacts:
      when: always
      reports: {junit: chainsaw-report.xml}
  ```
  The kubeconfig comes from a masked/file CI variable of a service account limited to the test namespaces
- if `file: true`: file the `test-plan` issue (`issue.create`), and with `MR:`/`PR:` comment the summary (`change.comment`). Otherwise offer it in one line

## Phase 4 (only with `run: true`): Run
1. `kubectl config current-context` and `kubectl cluster-info`. **Refuse** when the context or server matches `prod`/`production` or `PROD_URL`'s host. Otherwise show them and wait for the user's OK: the tests create and delete objects there
2. Check the needed CRDs and policies exist (`kubectl get crd <names>`, `kubectl get clusterpolicy …`). A missing one is a setup error, not a test failure
3. From the folder: `chainsaw test --test-dir . --config .chainsaw.yaml [--values values.yaml]`. Report pass/fail per `Test#<nn>` with the failing operation's error
4. A failure is filed only via `bug-report`'s rules and with the user's OK. A test whose message assertion was `(inferred)` is checked against the real message first: if only the wording differs, fix the test, not the product

## Rules
- No cluster writes except Phase 4 after OK. Map and write read files and, with OK, `kubectl get` only
- One rule per test step, one invalid field per rejected object
- Tests clean up after themselves (Chainsaw ephemeral namespaces), and never depend on another test having run
- Gap mode reads the repo and writes only under `qa-artifacts/`. It never edits the repo's tests or code
- Out of scope: load on the API server (WAY 15), the controller's internal logic beyond what the resource's status exposes, and Helm/manifest linting
