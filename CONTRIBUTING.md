This project formats its code with [Prettier](https://prettier.io) and checks it with [ESLint](https://eslint.org), using signalk-server's settings (no semicolons, single quotes, no trailing commas).

The easiest way to make sure your code is formatted properly is to run `npm run format`; CI runs `npm run ci-format`.

Whenever possible additions should have tests. Tests should use sample data captured from real world, actual equipment.

CI also runs [canboat's sample logs](https://github.com/canboat/canboat/tree/master/samples) through the mapper. It checks that every path the mapper writes is defined in [`@signalk/path-metadata`](https://github.com/SignalK/signalk-server/tree/master/packages/path-metadata), other than `notifications.*` paths, which are named after the alert or alarm, and validates the values against the Signal K schema. A new path goes into `path-metadata`, through a pull request to signalk-server, not into the specification. Failures that are already known are listed in `test/schema-report/baseline.json`. CI fails on a failure that isn't listed, and on a listed one that no longer happens, so the list can only shrink. To run it, with a canboat checkout next to this one:

    npm run build
    npm run schema-report -- ../canboat/samples

When a change fixes a listed failure, remove it from the list (`--update` rewrites the list with the current failures). Don't add a new failure to the list to make CI pass; fix the mapping, or open an issue and say why it has to stay.
