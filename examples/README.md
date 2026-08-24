# Examples

Three reskins of `template/`. Each has its own `config.js`.
`src/motion.js` is identical across all three. If building the second one took
as long as the first, something leaked out of config.

| Demo | Vertical | Live | Serve locally |
|---|---|---|---|
| `saas/` | SaaS landing (Ledgerline) | [Pages](https://dimeloper.github.io/motion-site-kit/examples/saas/) | `python3 -m http.server 8081 --directory examples/saas` |
| `commerce/` | Single-product shop (Kiln Carry) | [Pages](https://dimeloper.github.io/motion-site-kit/examples/commerce/) | `python3 -m http.server 8082 --directory examples/commerce` |
| `local/` | Local business (Harbor Oven) | [Pages](https://dimeloper.github.io/motion-site-kit/examples/local/) | `python3 -m http.server 8083 --directory examples/local` |

The live copies under `docs/examples/` each ship their own frame ladder.
`src/motion.js` is identical; `config.js` and the clip change per vertical.
Frames under `examples/*/frames/` stay gitignored.
