# @product-engineer/typescript-config

Shared TypeScript configurations for the monorepo.

| Config        | Use for          | Module system   |
| ------------- | ---------------- | --------------- |
| `base.json`   | Library packages | ESM / Bundler   |
| `nextjs.json` | Next.js web apps | ESM / Bundler   |
| `nestjs.json` | NestJS APIs      | CommonJS / Node |
| `expo.json`   | Expo mobile apps | ESM / Bundler   |

## Usage

```jsonc
// tsconfig.json
{
  "extends": "@product-engineer/typescript-config/nextjs.json",
}
```
