# sample-app

See the root [AGENTS.md](../AGENTS.md) for polyrepo build/link/review/release instructions.

## Quirks

- **Private** — consumer validation only; do not publish to npm.
- May still use **Vitest 3** while library packages use Vitest 4.
- Leave unrelated `main` merge conflicts alone unless they block pulling `working` or validating published APIs.
