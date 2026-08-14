---
description: 'Runs an experiment-first validation cycle for a specific hypothesis: states why it matters, defines the test, runs or specifies it, records the actual result, and states a conclusion and next action. Use whenever a claim like "people want this" or "the algorithm will work" or "this will be fast enough" hasn''t actually been tested yet.'
argument-hint: '[the hypothesis to test, stated as a falsifiable claim]'
---

Apply master protocol §20 and §21 to the hypothesis: $ARGUMENTS

1. Decide which log this belongs in: `company/validation/` for "does anyone want this" / business-facing hypotheses, or `company/experiments/` for technical feasibility hypotheses ("can the algorithm achieve X accuracy," "can latency meet the target," "can the architecture survive this failure mode"). Don't conflate "it works" with "people want it" — they need different tests.
2. Write the hypothesis entry with: HYPOTHESIS / WHY IT MATTERS / TEST / EXPECTED RESULT.
3. Design the smallest test that could actually falsify the hypothesis in the least time — master protocol §21 is explicit: never spend weeks building something that could be falsified in a day. Prefer a spike, a small experiment, a synthetic benchmark, or a handful of real user conversations over building the full feature first.
4. Run the test, or if it requires something outside this session's tools (e.g. real user interviews), specify exactly how to run it and who should.
5. Record the ACTUAL RESULT — including if the test couldn't be run yet, in which case say so rather than leaving the field blank or guessing.
6. Write a CONCLUSION and a concrete NEXT ACTION. "Inconclusive, need more data" is an acceptable conclusion if it's true — don't force a confident conclusion the evidence doesn't support.
7. Append the entry to `company/validation/hypotheses.md` + `company/validation/experiments.md` + `company/validation/results.md`, or the equivalent `company/experiments/` files, keeping the three in sync.
