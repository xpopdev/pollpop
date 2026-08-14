---
description: Checks the current product against the master protocol's MVP-complete checklist item by item, citing real evidence for each item rather than assuming, and refuses to mark the product MVP-complete based on vibes like "it runs" or "it looks good." Use before declaring an MVP or requesting the MVP-declaration approval gate.
---

Walk the master protocol §33 checklist against the actual current state of the product. For each item, mark it done only with a specific piece of evidence — a file, a test run, a review record — not an assertion.

```
[ ] Core problem clearly defined              -> company/product/problem.md
[ ] Target user defined                       -> company/product/users.md
[ ] Competitive research completed            -> company/research/competitors/
[ ] Product requirements complete             -> company/product/requirements.md
[ ] Architecture documented                   -> company/product/architecture.md
[ ] Core implementation complete              -> company/engineering/implementation/
[ ] Unit tests passing                        -> company/engineering/tests/ (actually run this session)
[ ] Integration tests passing                 -> company/engineering/tests/ (actually run this session)
[ ] End-to-end tests passing                  -> company/engineering/tests/ (actually run this session)
[ ] Security review complete                  -> company/engineering/security/
[ ] Performance reviewed                      -> company/engineering/performance/
[ ] Major failure modes tested                -> red-team-review output
[ ] Documentation complete                    -> ask technical-writer to confirm
[ ] Metrics defined                           -> company/metrics/
[ ] Known limitations documented              -> company/product/product_spec.md
[ ] Validation experiment completed           -> company/validation/results.md
[ ] CEO review completed                      -> delegate to the ceo agent
```

Master protocol §34 is explicit that "the app runs," "it looks good," "the code compiles," "the AI works," and "the benchmark looks promising" are never sufficient on their own — match the evidence to the size of the claim.

If any item is unchecked, say so plainly and name what's missing — do not round up to "basically done." What happens next depends on autonomy mode (`company/company_state.md`):

- **Supervised**: only once every item is genuinely checked should you recommend the ceo agent proceed to `gate-check` for the MVP-declaration approval.
- **Unattended**: an unchecked item is not one of the six stop-conditions in `CLAUDE.md` by itself. Log the result honestly in `company/product/product_spec.md`'s known-limitations section and hand the gaps back into `run-autonomous` Phase B to keep building — unless what's missing independently triggers a real stop-condition (for example, a security review surfaces a genuine legal/safety concern, or finishing requires a credential the company doesn't have). Once every item is genuinely checked, record the milestone in `company/history/milestones/` and continue into master protocol §40's continuous-improvement loop rather than stopping.
