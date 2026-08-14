# Technology Notes: SRS & AI Deck Generation (Candidate 005 StudyStreak)

Date: 2026-08-14 | Confidence per §29.

**StudyStreak needs:** photo/notes → AI flashcard deck → sharing link → SRS-driven streak battles + leaderboard for class (15-40 students).

### Spaced Repetition algorithms
- **SM-2 (Anki classic)** — open algorithm (VERIFIED, OSS https://github.com/ankitects/anki). Simple, proven. Implementation trivial. Weak on long-term calibration (INFERRED).
- **FSRS (Free Spaced Repetition Scheduler)** — modern, open (VERIFIED via https://github.com/open-spaced-repetition/fsrs4anki). ML-tuned intervals, 10-20% better retention vs SM-2 in benchmarks (INFERRED from FSRS docs/papers). Best choice for StudyStreak — drop-in Rust/Python lib, parameters fit per user.
- **Quizlet Learn algorithm** — proprietary, not OSS (INFERRED). Not available to reuse.

### AI deck generation stack
- **LLM (GPT-4o / Claude / Gemini)** — notes/image → structured Q/A JSON. VERIFIED capability. Prompt: "Extract N cards, front/back, tags." Cost ~$0.002-0.01 per deck (ESTIMATE, token-dependant). Quality is HYPOTHESIS for dense lecture images — needs experiment (validate-hypothesis on photo quality).
- **OCR + Vision** — GPT-4o vision / Gemini vision handles handwritten/whiteboard photos directly (VERIFIED). No separate OCR step needed for MVP. Fallback: Tesseract OSS (VERIFIED) if LLM vision fails.
- **Import from Quizlet/Anki** — Quizlet export is CSV/sets via unofficial APIs (INFERRED, check ToS). Anki .apkg is SQLite zip (VERIFIED). Needed for cold-start mitigation vs Quizlet library moat.

### Social layer infra
- Stack is CRUD + streak counters + daily push: no special infra. Leaderboard is Redis sorted-set or DB query (VERIFIED pattern). Challenge 1v1 is match record + SRS duel scoring.
- Notifications: FCM/APNs for streak pull (VERIFIED). High K-factor is semester-driven — push cadence must be careful not to spam (INFERRED risk).

### Recommendation for MVP
FSRS OSS library + GPT-4o vision for photo→deck (fallback Tesseract) + Anki/Quizlet import + streak/leaderboard CRUD. Validate joins_per_deck and D7 retention before investing in deep FSRS tuning.

