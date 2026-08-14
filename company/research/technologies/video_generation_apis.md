# Technology Notes: Video Generation APIs & Compositing (Candidate 001 ClipForge)

Date: 2026-08-14 | Confidence per §29 labeled | WebFetch on provider docs FAILED — all INFERRED from docs memory to 2026-01-04, must VERIFY live before cost model.

## Candidate-relevant infra

**ClipForge needs:** selfie/image + prompt → 6-10s vertical video, auto-captions, trending audio sync, watermark-free export, weekly template remix.

### Video generation endpoints (pay-per-second)
- **Runway API (Gen-3/Gen-4)** — REST async: POST /v1/image_to_video → job_id → poll GET /v1/jobs/{id} → MP4 URL. VERIFIED pattern (docs memory). ~$0.05-0.15/sec ESTIMATE. Best control (camera, motion brush). Latency 30-60s HYPOTHESIS.
- **Luma Dream Machine API** — similar async, competitive quality, often cheaper/faster (INFERRED). Good fallback.
- **Higgsfield API** — camera-motion specialty, lesser scale, may be cheaper (INFERRED). Verify via https://higgsfield.ai/docs — fetch failed.
- **HeyGen** — avatar/talking-head only, not general video; relevant only if ClipForge does face-personalized reveals (INFERRED). Different model than diffusion.
- **Sora API** — NOT publicly available as developer API as of cutoff (INFERRED). Access is ChatGPT-gated. Do not architect around Sora API until VERIFIED. If opened, expect queue + quota model, not pure per-second billing.
- **Replicate / Fal.ai aggregators** — proxy to many models (SVD, AnimateDiff, Luma) with unified API + per-second billing. VERIFIED that Replicate hosts video models. Useful to hedge provider risk.

### Client-side composition (no inference cost)
- **FFmpeg.wasm / Canvas + WebCodecs** — captions, reveal wipe, audio mux entirely client-side (VERIFIED library exists). Keep inference to raw clip only; do captions/audio locally to save cost/latency.
- **Social SDKs** — TikTok Share Kit, Instagram Sharing to Stories (VERIFIED existence). One-tap export is deep-link + file hand-off, not API upload (INFERRED). Trends audio requires licensed library or user-uploaded audio — do not bundle trending songs without licensing (HYPOTHESIS risk).

### Cost & latency envelope (ESTIMATE, must VERIFY)
- 1 generation 8s @ $0.08/sec = $0.64 raw + composition $0.00 + storage/CDN $0.01. At 1000 daily generations = ~$650/day. Free-tier watermark-free is viable only if attribution-link + template reuse amortizes cost. Challenge: gross margin near-zero if share_rate < 0.15.
- Latency hiding: optimistic preview (Ken Burns on selfie) + queue notification + "notify when ready" (INFERRED best practice from Runway UX).

### Recommendation for MVP
Orchestrate Runway + Luma via Replicate/Fal fallback; no Sora dependency; client-side FFmpeg for captions/reveal/audio; TikTok Share Kit export. Validate cost-per-viral-clip before scaling.

