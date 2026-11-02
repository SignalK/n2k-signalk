module.exports = {
  require: ['ts-node/register'],
  extensions: ['ts', 'js'],
  spec: ['test/*.ts', 'test/*.js'],
  ignore: ['test/*.d.ts'],
  exit: true
}
