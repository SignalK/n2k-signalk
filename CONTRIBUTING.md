This project formats its code with [Prettier](https://prettier.io) and checks it with [ESLint](https://eslint.org), using signalk-server's settings (no semicolons, single quotes, no trailing commas).

The easiest way to make sure your code is formatted properly is to run `npm run format`; CI runs `npm run ci-format`.

Whenever possible additions should have tests. Tests should use sample data captured from real world, actual equipment.

CI also runs [canboat's sample logs](https://github.com/canboat/canboat/tree/master/samples) through the mapper and validates the output against the Signal K schema. Failures that are already known are listed in `test/schema-report/baseline.json`. CI fails on a failure that isn't listed, and on a listed one that no longer happens, so the list can only shrink. To run it, with a canboat checkout next to this one:

    npm run build
    npm run schema-report -- ../canboat/samples

When a change fixes a listed failure, remove it from the list (`--update` rewrites the list with the current failures). Don't add a new failure to the list to make CI pass; fix the mapping, or open an issue and say why it has to stay.
