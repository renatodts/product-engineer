# @product-engineer/eslint-config

Shared ESLint flat configs.

| Config      | Use for                |
| ----------- | ---------------------- |
| `base.js`   | Any TypeScript package |
| `react.js`  | React libraries        |
| `nextjs.js` | Next.js apps           |
| `nestjs.js` | NestJS apps            |

## Usage

```js
// eslint.config.js
import config from '@product-engineer/eslint-config/nextjs.js';
export default config;
```
