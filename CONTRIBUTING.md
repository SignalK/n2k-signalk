This project formats its code with [Prettier](https://prettier.io) and checks it with [ESLint](https://eslint.org), using signalk-server's settings (no semicolons, single quotes, no trailing commas).

The easiest way to make sure your code is formatted properly is to run `npm run format`; CI runs `npm run ci-format`.

Whenever possible additions should have tests. Tests should use sample data captured from real world, actual equipment.
