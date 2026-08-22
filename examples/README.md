# Examples

Three reskins of `template/`. Each has its own `config.js` and frame ladder.
`src/motion.js` is identical across all three. If building the second one took
as long as the first, something leaked out of config.

| Demo | Vertical | Serve locally |
|---|---|---|
| `saas/` | SaaS landing (Ledgerline) | `python3 -m http.server 8081 --directory examples/saas` |
| `commerce/` | Single-product shop (Kiln Carry) | `python3 -m http.server 8082 --directory examples/commerce` |
| `local/` | Local business (Harbor Oven) | `python3 -m http.server 8083 --directory examples/local` |

Live deploys are still pending. Frames under `examples/*/frames/` are gitignored;
the copies in this working tree came from the same verification clip as `docs/`.
Swap in a real source clip per demo and re-run `optimize_frames.py --out examples/<name>/frames`.
