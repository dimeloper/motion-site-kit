# Examples

Three reskins of `template/`. Each has its own `config.js`.
`src/motion.js` is identical across all three. If building the second one took
as long as the first, something leaked out of config.

| Demo | Vertical | Live | Serve locally |
|---|---|---|---|
| `saas/` | SaaS landing (Ledgerline) | [Pages](https://dimeloper.github.io/motion-site-kit/examples/saas/) | `python3 -m http.server 8081 --directory examples/saas` |
| `commerce/` | Single-product shop (Kiln Carry) | [Pages](https://dimeloper.github.io/motion-site-kit/examples/commerce/) | `python3 -m http.server 8082 --directory examples/commerce` |
| `local/` | Local business (Harbor Oven) | [Pages](https://dimeloper.github.io/motion-site-kit/examples/local/) | `python3 -m http.server 8083 --directory examples/local` |

The live copies under `docs/examples/` share `docs/frames` (`framesBase: '../../frames'`).
That is the reskin claim: same sequence, different `config.js`. Unique source clips
per vertical are still a swap away — copy a ladder into `examples/<name>/frames`
and re-run `optimize_frames.py --out examples/<name>/frames`. Frames under
`examples/*/frames/` stay gitignored.
