---
name: chainsaw-tests
description: WAY 18 — write Kyverno Chainsaw tests for Kubernetes custom resources from their CRDs, admission policies (Kyverno, ValidatingAdmissionPolicy), RBAC and a test spec, no run by default. Use when the user says "chainsaw it", "write chainsaw tests", "chainsaw tests", "crd tests", "test the crd", "operator tests", "kubernetes conformance tests" — CRDs + policies + RBAC + spec → rule map → one chainsaw-test.yaml per rule (schema, CEL, immutability, defaults, admission deny/warn, RBAC, status, deletion) → lint.
---

# WAY 18 — Chainsaw Tests from CRDs + Spec (write only)

WAY 17 tests an HTTP API from its OpenAPI spec. This WAY tests a **Kubernetes API**: does the cluster accept, reject, warn, default, authorize and reconcile custom resources the way their CRDs, policies and spec say? It writes [Chainsaw](https://kyverno.github.io/chainsaw/) tests and lints them. It runs them only when asked, on a cluster the user confirms.

## Step 1: Gather inputs
**Required (ask if missing):** the CRDs, as files/URLs, or `CRDs: cluster <crd names>` to read them with `kubectl get crd <names> -o yaml` (read-only; show `kubectl config current-context` first and wait for OK).

**Optional, one line each:**
- `Spec:` a test spec / requirements doc (file, URL, text) or `Issue:` a tracker ref (`issue.get`, per `tracker`). Apply `requirements-analysis` (§1–3) and put its gate questions in the Phase 1 message. If the spec numbers its own cases (`VAL-01`, `IMG-07`), those are the IDs (§1)
- `Policies:` Kyverno `ClusterPolicy`/`Policy`, `ValidatingAdmissionPolicy` + bindings (files, or `cluster` → `kubectl get clusterpolicy,policy -A -o yaml` / `kubectl get validatingadmissionpolicy,validatingadmissionpolicybinding -o yaml`). Without them, policy messages come from the spec and are `(inferred)`
- `RBAC:` Roles/ClusterRoles/bindings and the subjects to check (`as: system:serviceaccount:tenant-a:deployer`)
- `Scope:` kinds or spec IDs to limit to (`Scope: HostClaim, VAL-01..16`)
- `run: true` run after writing (Phase 4). `file: true` file a `test-plan` issue with the index. `MR:`/`PR:` comment the plan on it (`change.comment`)

Never write the inputs' secrets into tests. Strip `Secret` data if a cluster dump contains any.

## Phase 1: Map
Start `chainsaw-test-writer` with `mode: map`, the input paths, the requirements model (if any) and `Scope:`. It returns resources, the rule map, the spec cross-check, the planned tests and the `$values` keys.

Show the user, in **one** message:
- the rule map and planned `Test#<nn>` list (one line each), with `(inferred)` guesses marked
- the spec cross-check: requirements no rule enforces, and rules no requirement mentions
- the `$values` keys the tests need (existing image URLs, class names, tenant namespaces…)
- the gate questions, if any

Ask once: "Anything wrong or missing?" Proceed on OK or after corrections.

## Phase 2: Write
Start `chainsaw-test-writer` with `mode: write`, the confirmed plan and `out: qa-artifacts/chainsaw/<slug>-<YYYY-MM-DD>/`. It writes `.chainsaw.yaml`, `index.md`, `values.example.yaml` (if needed) and one `Test#<nn>-<slug>/chainsaw-test.yaml` per planned test, then runs `chainsaw lint`.

If it reports `NOT IMPLEMENTED` steps (a value the spec doesn't give), list them. Don't fill them in by guessing.

## Phase 3: Hand off
Reply with:
- the folder, and a table: `Test# | Category | Kind | Rules | Covers`
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
- Out of scope: load on the API server (WAY 15), the controller's internal logic beyond what the resource's status exposes, and Helm/manifest linting
