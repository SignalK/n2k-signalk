import { FromPgn, pgnToActisenseSerialFormat } from '@canboat/canboatjs'
import * as n2kMapper from '../dist/n2kMapper'
import { Delta, MapperState } from '../dist/n2kMapper'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const signalkSchema = require('@signalk/signalk-schema')

// pgnToActisenseSerialFormat writes whole messages, so tell the parser: an
// 8 byte fast-packet message would otherwise be taken as its first frame.
const parser = new FromPgn({ useCamel: true, format: 1 })

// A frame as a test writes it: canboat JSON, with field names or ids.
type TestFrame = any

/*
  By default we take the input canboat json and convert to actisense format,
  back to conboat json and then do the n2k conversion.
  This is done to expose any issues/changes with field names in canboat.

  Set the env variable NO_CANBOATJS=true to skip the back and forth conversion.
*/

function reparse(n2k: TestFrame) {
  return parser.parseString(pgnToActisenseSerialFormat(n2k)) as TestFrame
}

function nested(delta: Delta) {
  if (!delta.context) {
    delta.context = 'vessels.' + signalkSchema.fakeMmsiId
  }
  const contextParts = delta.context.split('.')
  return signalkSchema.deltaToFull(delta)[contextParts[0]][contextParts[1]]
}

function testToDelta(n2k: TestFrame, state?: MapperState): any {
  return n2kMapper.toDelta(reparse(n2k), state)
}

function doubleConvertWithCanboat(n2k: TestFrame, state?: MapperState): any {
  const parsed = reparse(n2k)
  parsed.src = n2k.src
  if (n2k.timestamp) {
    parsed.timestamp = n2k.timestamp
  }
  return nested(n2kMapper.toDelta(parsed, state)!)
}

function n2kToNested(n2k: TestFrame, state?: MapperState): any {
  return nested(n2kMapper.toDelta(n2k, state)!)
}

function toNested(n2k: TestFrame, state?: MapperState): any {
  return process.env.NO_CANBOATJS
    ? n2kToNested(n2k, state)
    : doubleConvertWithCanboat(n2k, state)
}

export = {
  ...n2kMapper,
  toNested,
  testToDelta,
  doubleConvertWithCanboat,
  n2kToNested
}
