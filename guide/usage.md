# Usage Guide

Comprehensive usage guidance for `@fjell/sample-app`.

## Installation

```bash
npm install @fjell/sample-app
```

## API Highlights

- `SampleApp` export from `src/index.ts`
- Next.js runtime setup and testing structure in `src` and `tests`
- Demonstration artifacts for two-layer cache and certification flows

## Quick Example

```ts
import SampleApp from "@fjell/sample-app";

export default function AppPage() {
  return <SampleApp />;
}
```

## Model Consumption Rules

1. Import from the package root (`@fjell/sample-app`) instead of deep-internal paths unless explicitly documented.
2. Keep usage aligned with exported public symbols listed in this guide.
3. Prefer explicit typing at package boundaries so generated code remains robust during upgrades.
4. Keep error handling deterministic and map infrastructure failures into domain-level errors.
5. Co-locate integration wrappers in your app so model-generated code has one canonical entry point.

## Best Practices

- Keep examples and abstractions consistent with existing Fjell package conventions.
- Favor composable wrappers over one-off inline integration logic.
- Add targeted tests around generated integration code paths.
