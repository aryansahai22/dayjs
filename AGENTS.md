# AGENTS.md

Day.js is an immutable date library with a largely Moment.js-compatible API. The core has a hard 2.99 KB gzipped budget, so most features ship as opt-in plugins and each of the 143 locales is its own file.

## Layout

- `src/index.js`: the `Dayjs` class, the `dayjs()` factory, and `dayjs.extend()`. Unit names and parse/format regexes live in `src/constant.js`.
- `src/plugin/<name>/index.js`: one plugin per folder, `export default (o, c, d) => {}` (user option, `Dayjs` class, `dayjs` factory). Plugins patch `c.prototype` or attach statics to `d`.
- `src/locale/<code>.js`: one locale per file; only `en.js` is bundled into the core.
- `types/`: hand-written declarations. `types/plugin/<name>.d.ts` augments `declare module 'dayjs'`; locales need no type file.
- `build/`: Rollup scripts that discover plugin folders and locale files on their own. There is no registry to update.
- `test/`: Jest tests mirroring `src/`. `test/__mocks__/dayjs.js` points the bare `'dayjs'` import used by locales at `src/`.

## Commands

Install with `npm ci`. `npm install` rewrites ~1,300 lines of `package-lock.json`; don't commit that.

| Task | Command |
|---|---|
| One test file | `TZ=UTC npx jest test/plugin/utc.test.js --coverage=false` |
| Full suite (what CI runs) | `TZ=UTC npm test` (~50 s) |
| Lint | `npm run lint`, or `npx eslint <files>` |
| Build | `NODE_OPTIONS=--openssl-legacy-provider npm run build` (~2 min) |

- Always set `TZ=UTC`; CI runs in UTC and many expectations assume it. Without it, a Pacific-time machine fails 6 tests in `dayOfYear`, `localizedFormat`, and `timezone`. Those are not bugs; don't "fix" them.
- `npm test` also reruns both `timezone.test.js` files under five other zones (see `scripts.test`). Timezone or DST changes must pass in all of them.
- Use `--coverage=false` on focused runs; otherwise Jest prints a red partial-coverage table that means nothing.
- Testing never needs a build (Jest runs `src/` through Babel). Build only to check bundle size: the core is at 2.79 of 2.99 KB, and without `NODE_OPTIONS` the final `size-limit` step crashes with `ERR_OSSL_EVP_UNSUPPORTED`.
- A pre-commit hook runs `npm run lint`. Fix the error rather than committing with `--no-verify`.

## Conventions

- ESLint `airbnb-base`: no semicolons, no trailing commas, 2-space indent, extensionless imports. Prettier is only for `docs/**/*.md`; don't run it on code.
- Plugins get helpers from `this.$utils()` (`.p(unit)` normalizes unit aliases, `.u(x)` checks `undefined`) instead of importing `src/utils.js`, which Rollup would inline into every plugin bundle. Importing `../../constant` is fine.
- A new plugin needs three files: `src/plugin/<name>/index.js`, `types/plugin/<name>.d.ts` (`test/plugin/declarations.test.js` fails without it), and `test/plugin/<name>.test.js`.
- A new locale starts as a copy of the closest existing one. `test/locale/keys.test.js` enforces, with cryptic failures: line 1 is `// <English name> [<code>]` (the build parses it too); `name` equals the lowercase filename; `formats` holds only `LT LTS L LL LLL LLLL` and optionally `l ll lll llll`; the file ends with `dayjs.locale(locale, null, true)` and `export default locale`.
- Tests run on Jest 22, which has no `it.each`/`test.each`; loop over a `cases` array with `forEach`. Import from `../../src` and `../../src/plugin/<name>`, not `'dayjs'`. Pin "now" with `MockDate.set(new Date())` in `beforeEach` and `MockDate.reset()` in `afterEach`. Where Moment has the same API, assert against it: `expect(dayjs(s).format()).toBe(moment(s).format())`.
- `npm test` fails unless every line of `src/` is covered, new locales included.
- Bug-fix tests go in the area's existing test file, under a `// https://github.com/iamkun/dayjs/issues/<N>` comment.
- Conventional Commits, and new locales and plugins are `fix:` too (`fix: Add Kirundi (rn) locale`, `fix: add BigIntSupport plugin`). semantic-release turns `feat:` into a minor release; the project stays on patch releases. PRs target `dev`; `master` is the release branch.

## Don't touch

- Build output at the root: `dayjs.min.js`, `index.d.ts`, `locale.json`, `locale/`, `plugin/`, `esm/`. It's gitignored and regenerated; edit `src/` and `types/`.
- `CHANGELOG.md` and `version` in `package.json`: semantic-release writes both.
- `test/browser.spec.js`: a Jasmine smoke test for Sauce Labs; `npm run test:sauce` needs credentials you don't have.
- The pinned `moment` 2.29.2 and `moment-timezone` 0.5.31: tests use them as the oracle.
- `docs/`: only stubs and translated READMEs. API docs live on day.js.org, outside this repo.
- Type-checking: the installed TypeScript 2.9 can't parse `types/plugin/minMax.d.ts`, so `tsc` is a dead end. Mirror an existing `.d.ts`.
